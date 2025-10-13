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
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background p-4 sm:p-8">
        <div className="flex w-full max-w-4xl flex-col items-center gap-4 sm:gap-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="mb-2 text-lg font-bold sm:text-2xl">{preset.name_bn}</h2>
            <p className="arabic-text break-words text-2xl sm:text-4xl">{preset.arabic_text}</p>
          </div>

          {/* Counter Display */}
          <div className="flex flex-col items-center gap-2 sm:gap-4">
            <div className="text-6xl font-bold tabular-nums text-primary sm:text-8xl md:text-9xl">{count}</div>
            <div className="text-lg text-muted-foreground sm:text-2xl">
              of {preset.target_count} {isComplete && "✓"}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md px-4">
            <Progress value={progress} className="h-3 sm:h-4" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Button
              size="lg"
              variant="outline"
              onClick={decrement}
              disabled={count === 0}
              className="h-12 w-12 sm:h-14 sm:w-14 bg-transparent"
            >
              <Minus className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
            <Button
              size="lg"
              className="h-24 w-24 rounded-full text-xl sm:h-32 sm:w-32 sm:text-2xl"
              onClick={increment}
              disabled={count >= preset.target_count}
            >
              Tap
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={increment}
              disabled={count >= preset.target_count}
              className="h-12 w-12 sm:h-14 sm:w-14"
            >
              <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-4">
            <Button variant="outline" onClick={reset} className="text-sm sm:text-base bg-transparent">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button variant="outline" onClick={toggleFullscreen} className="text-sm sm:text-base bg-transparent">
              <Minimize2 className="mr-2 h-4 w-4" />
              Exit Fullscreen
            </Button>
          </div>

          {/* Translation */}
          <p className="bangla-text max-w-2xl break-words px-4 text-center text-sm text-muted-foreground sm:text-lg">
            {preset.translation_bn}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <CardTitle className="mb-2 text-xl sm:text-2xl">{preset.name_bn}</CardTitle>
              {preset.name_ar && <p className="text-base text-muted-foreground sm:text-lg">{preset.name_ar}</p>}
            </div>
            <Button variant="outline" size="icon" onClick={toggleFullscreen}>
              <Maximize2 className="h-5 w-5" />
              <span className="sr-only">Enter fullscreen</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 sm:space-y-8">
          {/* Arabic Text */}
          <div className="arabic-text break-words rounded-lg bg-accent/50 p-6 text-center text-2xl sm:p-8 sm:text-4xl">
            {preset.arabic_text}
          </div>

          {/* Transliteration */}
          {preset.transliteration_bn && (
            <div className="text-center">
              <p className="bangla-text break-words text-lg text-muted-foreground sm:text-xl">
                {preset.transliteration_bn}
              </p>
            </div>
          )}

          {/* Translation */}
          <div className="text-center">
            <p className="bangla-text break-words text-base sm:text-lg">{preset.translation_bn}</p>
          </div>

          {/* Counter Display */}
          <div className="flex flex-col items-center gap-3 py-6 sm:gap-4 sm:py-8">
            <div className="text-6xl font-bold tabular-nums text-primary sm:text-8xl">{count}</div>
            <div className="text-lg text-muted-foreground sm:text-xl">
              of {preset.target_count} {isComplete && "✓"}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <Progress value={progress} className="h-2 sm:h-3" />
            <p className="mt-2 text-center text-xs text-muted-foreground sm:text-sm">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Counter Controls */}
          <div className="flex items-center justify-center gap-3 sm:gap-4">
            <Button
              size="lg"
              variant="outline"
              onClick={decrement}
              disabled={count === 0}
              className="h-12 w-12 sm:h-14 sm:w-14 bg-transparent"
            >
              <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              size="lg"
              className="h-20 w-20 rounded-full text-lg sm:h-24 sm:w-24 sm:text-xl"
              onClick={increment}
              disabled={count >= preset.target_count}
            >
              Tap
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={increment}
              disabled={count >= preset.target_count}
              className="h-12 w-12 sm:h-14 sm:w-14"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-2 sm:flex-row sm:gap-4">
            <Button variant="outline" onClick={reset} className="text-sm sm:text-base bg-transparent">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset Counter
            </Button>
            <Button onClick={toggleFullscreen} className="text-sm sm:text-base">
              <Maximize2 className="mr-2 h-4 w-4" />
              Fullscreen Mode
            </Button>
          </div>

          {isComplete && (
            <div className="rounded-lg bg-primary/10 p-4 text-center sm:p-6">
              <p className="text-base font-semibold text-primary sm:text-lg">
                Alhamdulillah! You have completed your dhikr target.
              </p>
              <p className="mt-2 text-xs text-muted-foreground sm:text-sm">May Allah accept your remembrance.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
