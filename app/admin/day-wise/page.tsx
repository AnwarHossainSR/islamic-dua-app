import { getSupabaseServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Plus, Calendar } from "lucide-react"

const DAYS = [
  { value: "monday", label: "Monday", label_bn: "সোমবার" },
  { value: "tuesday", label: "Tuesday", label_bn: "মঙ্গলবার" },
  { value: "wednesday", label: "Wednesday", label_bn: "বুধবার" },
  { value: "thursday", label: "Thursday", label_bn: "বৃহস্পতিবার" },
  { value: "friday", label: "Friday", label_bn: "শুক্রবার" },
  { value: "saturday", label: "Saturday", label_bn: "শনিবার" },
  { value: "sunday", label: "Sunday", label_bn: "রবিবার" },
]

async function getDayWiseDuas() {
  const supabase = await getSupabaseServerClient()
  const { data } = await supabase
    .from("day_wise_duas")
    .select("*, dua:duas(title_bn, arabic_text)")
    .order("day_of_week", { ascending: true })
  return data || []
}

export default async function AdminDayWisePage() {
  const dayWiseDuas = await getDayWiseDuas()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="mb-2 text-4xl font-bold">Day-wise Duas</h1>
          <p className="text-muted-foreground">Manage duas for specific days of the week</p>
        </div>
        <Button asChild>
          <Link href="/admin/day-wise/new">
            <Plus className="mr-2 h-4 w-4" />
            Add Day-wise Dua
          </Link>
        </Button>
      </div>

      {/* Days Overview */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {DAYS.map((day) => {
          const count = dayWiseDuas.filter((d: any) => d.day_of_week === day.value).length
          return (
            <Card key={day.value}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <CardTitle className="text-lg">{day.label}</CardTitle>
                    <CardDescription>{day.label_bn}</CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="mt-2 w-fit">
                  {count} {count === 1 ? "Dua" : "Duas"}
                </Badge>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* All Day-wise Duas */}
      <Card>
        <CardHeader>
          <CardTitle>All Day-wise Duas</CardTitle>
          <CardDescription>Complete list of duas assigned to specific days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dayWiseDuas.map((item: any) => {
              const dayInfo = DAYS.find((d) => d.value === item.day_of_week)
              return (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 border-b border-border pb-4 last:border-0"
                >
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="outline">{dayInfo?.label}</Badge>
                      {item.is_featured && <Badge variant="secondary">Featured</Badge>}
                    </div>
                    <h3 className="font-medium">{item.dua?.title_bn}</h3>
                    {item.dua?.arabic_text && (
                      <p className="arabic-text mt-2 text-right text-sm text-muted-foreground">
                        {item.dua.arabic_text.substring(0, 100)}...
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/day-wise/${item.day_of_week}`}>View</Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/admin/day-wise/${item.id}`}>Edit</Link>
                    </Button>
                  </div>
                </div>
              )
            })}
            {dayWiseDuas.length === 0 && (
              <div className="flex min-h-[200px] items-center justify-center">
                <div className="text-center">
                  <p className="mb-4 text-muted-foreground">No day-wise duas yet</p>
                  <Button asChild>
                    <Link href="/admin/day-wise/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Day-wise Dua
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
