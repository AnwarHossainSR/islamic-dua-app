"use client"

import { useState, use } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, RotateCcw, Check } from "lucide-react"
import Link from "next/link"

const practices = {
  "1": {
    title: "After Isha Prayer",
    title_bn: "এশার নামাজের পর",
    dua: "سُبْحَانَ اللهِ",
    dua_bn: "সুবহানাল্লাহ",
    transliteration: "Subhan Allah",
    translation: "Glory be to Allah",
    translation_bn: "আল্লাহ পবিত্র",
    count: 300,
    time: "After Isha",
  },
  "2": {
    title: "After Fajr Prayer",
    title_bn: "ফজরের নামাজের পর",
    dua: "الْحَمْدُ لِلَّهِ",
    dua_bn: "আলহামদুলিল্লাহ",
    transliteration: "Alhamdulillah",
    translation: "All praise is due to Allah",
    translation_bn: "সমস্ত প্রশংসা আল্লাহর জন্য",
    count: 100,
    time: "After Fajr",
  },
}

export default function DailyPracticePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const practice = practices[id as keyof typeof practices]

  const [count, setCount] = useState(0)
  const progress = (count / practice.count) * 100

  const handleIncrement = () => {
    if (count < practice.count) {
      setCount(count + 1)
    }
  }

  const handleReset = () => {
    setCount(0)
  }

  const isComplete = count >= practice.count

  return (
    <div className="container max-w-2xl py-6 sm:py-8">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/daily-practices">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Practices
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl sm:text-2xl">{practice.title}</CardTitle>
          <CardDescription className="text-base">{practice.title_bn}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="rounded-lg bg-muted p-6 text-center sm:p-8">
            <p className="mb-4 text-3xl font-arabic text-primary sm:text-4xl">{practice.dua}</p>
            <p className="mb-2 text-lg font-medium">{practice.transliteration}</p>
            <p className="text-sm text-muted-foreground">{practice.translation}</p>
            <p className="mt-1 text-sm text-muted-foreground">{practice.translation_bn}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-2xl font-bold">
                {count} / {practice.count}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {isComplete ? (
            <div className="rounded-lg bg-primary/10 p-6 text-center">
              <Check className="mx-auto mb-2 h-12 w-12 text-primary" />
              <p className="text-lg font-semibold text-primary">Completed!</p>
              <p className="mt-1 text-sm text-muted-foreground">May Allah accept your dhikr</p>
            </div>
          ) : (
            <Button size="lg" className="h-32 w-full text-2xl sm:h-40 sm:text-3xl" onClick={handleIncrement}>
              Tap to Count
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 bg-transparent" onClick={handleReset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
