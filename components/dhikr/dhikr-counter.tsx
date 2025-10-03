"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Maximize2, Minimize2, RotateCcw, Minus, Plus } from "lucide-react"
import type { DhikrPreset } from "@/lib/types/database"

export function DhikrCounter({ preset }: { preset: DhikrPreset }) {
  const [count, setCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const progress = (count / preset.target_count) * 100
  const isComplete = count >= preset.target_count

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  function increment() {
    setCount((c) => c + 1)
  }

  function decrement() {
    setCount((c) => Math.max(0, c - 1))
  }

  function reset() {
    setCount(0)
  }

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-8">
        <div className="flex w-full max-w-4xl flex-col items-center gap-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold">{preset.name_bn}</h2>
            <p className="arabic-text text-4xl">{preset.arabic_text}</p>
          </div>

          {/* Counter Display */}
          <div className="flex flex-col items-center gap-4">
            <div className="text-9xl font-bold tabular-nums text-primary">{count}</div>
            <div className="text-2xl text-muted-foreground">
              of {preset.target_count} {isComplete && "✓"}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md">
            <Progress value={progress} className="h-4" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <Button size="lg" variant="outline" onClick={decrement} disabled={count === 0}>
              <Minus className="h-6 w-6" />
            </Button>
            <Button
              size="lg"
              className="h-32 w-32 rounded-full text-2xl"
              onClick={increment}
              disabled={count >= preset.target_count}
            >
              Tap
            </Button>
            <Button size="lg" variant="outline" onClick={increment} disabled={count >= preset.target_count}>
              <Plus className="h-6 w-6" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button variant="outline" onClick={toggleFullscreen}>
              <Minimize2 className="mr-2 h-4 w-4" />
              Exit Fullscreen
            </Button>
          </div>

          {/* Translation */}
          <p className="bangla-text max-w-2xl text-center text-lg text-muted-foreground">{preset.translation_bn}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="mb-2 text-2xl">{preset.name_bn}</CardTitle>
              {preset.name_ar && <p className="text-lg text-muted-foreground">{preset.name_ar}</p>}
            </div>
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              <Maximize2 className="h-5 w-5" />
              <span className="sr-only">Enter fullscreen</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Arabic Text */}
          <div className="arabic-text rounded-lg bg-accent/50 p-8 text-center text-4xl">{preset.arabic_text}</div>

          {/* Transliteration */}
          {preset.transliteration_bn && (
            <div className="text-center">
              <p className="bangla-text text-xl text-muted-foreground">{preset.transliteration_bn}</p>
            </div>
          )}

          {/* Translation */}
          <div className="text-center">
            <p className="bangla-text text-lg">{preset.translation_bn}</p>
          </div>

          {/* Counter Display */}
          <div className="flex flex-col items-center gap-4 py-8">
            <div className="text-8xl font-bold tabular-nums text-primary">{count}</div>
            <div className="text-xl text-muted-foreground">
              of {preset.target_count} {isComplete && "✓"}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <Progress value={progress} className="h-3" />
            <p className="mt-2 text-center text-sm text-muted-foreground">{Math.round(progress)}% Complete</p>
          </div>

          {/* Counter Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" variant="outline" onClick={decrement} disabled={count === 0}>
              <Minus className="h-5 w-5" />
            </Button>
            <Button
              size="lg"
              className="h-24 w-24 rounded-full text-xl"
              onClick={increment}
              disabled={count >= preset.target_count}
            >
              Tap
            </Button>
            <Button size="lg" variant="outline" onClick={increment} disabled={count >= preset.target_count}>
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <Button variant="outline" onClick={reset}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Counter
            </Button>
            <Button onClick={toggleFullscreen}>
              <Maximize2 className="mr-2 h-4 w-4" />
              Fullscreen Mode
            </Button>
          </div>

          {isComplete && (
            <div className="rounded-lg bg-primary/10 p-6 text-center">
              <p className="text-lg font-semibold text-primary">Alhamdulillah! You have completed your dhikr target.</p>
              <p className="mt-2 text-sm text-muted-foreground">May Allah accept your remembrance.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
