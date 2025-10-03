import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { BookOpen, Clock, Heart, Sparkles } from "lucide-react"

export default function HomePage() {
  return (
    <div className="container py-8">
      {/* Hero Section */}
      <section className="mb-16 text-center">
        <div className="mx-auto max-w-3xl space-y-4">
          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl">
            Your Daily Companion for <span className="text-primary">Islamic Duas</span>
          </h1>
          <p className="text-lg text-muted-foreground text-pretty">
            Access authentic duas and dhikr with Bangla translations. Build your spiritual routine with our
            comprehensive collection.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Button size="lg" asChild>
              <Link href="/duas">Explore Duas</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/dhikr">Start Dhikr</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Features</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader>
              <BookOpen className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Comprehensive Collection</CardTitle>
              <CardDescription>Authentic duas from Quran and Sunnah with references</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Day-wise Recommendations</CardTitle>
              <CardDescription>Get daily dua suggestions based on the day of the week</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Heart className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Bookmark Favorites</CardTitle>
              <CardDescription>Save and organize your most-used duas for quick access</CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Digital Dhikr Counter</CardTitle>
              <CardDescription>Track your dhikr with our fullscreen counter feature</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Categories Preview */}
      <section>
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-3xl font-bold">Popular Categories</h2>
          <Button variant="ghost" asChild>
            <Link href="/categories">View All</Link>
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="text-lg">Morning & Evening</CardTitle>
              <CardDescription>Daily remembrance duas</CardDescription>
            </CardHeader>
          </Card>
          <Card className="transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="text-lg">Prayer Duas</CardTitle>
              <CardDescription>Supplications for salah</CardDescription>
            </CardHeader>
          </Card>
          <Card className="transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="text-lg">Quranic Duas</CardTitle>
              <CardDescription>Duas from the Holy Quran</CardDescription>
            </CardHeader>
          </Card>
          <Card className="transition-colors hover:bg-accent">
            <CardHeader>
              <CardTitle className="text-lg">Food & Drink</CardTitle>
              <CardDescription>Mealtime supplications</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>
    </div>
  )
}
