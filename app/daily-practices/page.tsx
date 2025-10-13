import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Clock } from "lucide-react"

const dailyPractices = [
  {
    id: 1,
    title: "After Isha Prayer",
    title_bn: "এশার নামাজের পর",
    dua: "Subhan Allah",
    dua_bn: "সুবহানাল্লাহ",
    count: 300,
    time: "After Isha",
    category: "Daily Dhikr",
  },
  {
    id: 2,
    title: "After Fajr Prayer",
    title_bn: "ফজরের নামাজের পর",
    dua: "Alhamdulillah",
    dua_bn: "আলহামদুলিল্লাহ",
    count: 100,
    time: "After Fajr",
    category: "Daily Dhikr",
  },
  {
    id: 3,
    title: "Before Sleep",
    title_bn: "ঘুমানোর আগে",
    dua: "Ayatul Kursi",
    dua_bn: "আয়াতুল কুরসি",
    count: 1,
    time: "Before Sleep",
    category: "Night Routine",
  },
  {
    id: 4,
    title: "Morning Dhikr",
    title_bn: "সকালের যিকির",
    dua: "La ilaha illallah",
    dua_bn: "লা ইলাহা ইল্লাল্লাহ",
    count: 100,
    time: "Morning",
    category: "Daily Dhikr",
  },
]

export default function DailyPracticesPage() {
  return (
    <div className="container py-6 sm:py-8">
      <div className="mb-6 sm:mb-8">
        <h1 className="mb-2 text-2xl font-bold sm:text-3xl">Daily Practices</h1>
        <p className="text-muted-foreground">Track your daily duas and dhikr routines with specific counts</p>
      </div>

      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {dailyPractices.map((practice) => (
          <Card key={practice.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg sm:text-xl">{practice.title}</CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">{practice.title_bn}</p>
                </div>
                <div className="ml-2 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-lg font-bold text-primary">{practice.count}</span>
                </div>
              </div>
              <CardDescription className="mt-2 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {practice.time}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-4 rounded-lg bg-muted p-4">
                <p className="text-center text-xl font-arabic text-primary">{practice.dua}</p>
                <p className="mt-2 text-center text-sm text-muted-foreground">{practice.dua_bn}</p>
              </div>
              <Button asChild className="w-full">
                <Link href={`/daily-practices/${practice.id}`}>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Start Practice
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
