'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { DhikrPreset } from '@/lib/types/database'
import { Maximize2, Minimize2, Minus, Plus, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

export function DhikrCounter({ preset }: { preset: DhikrPreset }) {
  const [count, setCount] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const progress = (count / preset.target_count) * 100
  const isComplete = count >= preset.target_count

  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  function increment() {
    setCount(c => c + 1)
  }

  function decrement() {
    setCount(c => Math.max(0, c - 1))
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background overflow-auto">
        <div className="flex w-full max-w-4xl flex-col items-center gap-3 p-4 sm:gap-6 sm:p-8 min-h-screen justify-center">
          {/* Header */}
          <div className="text-center w-full px-2">
            <h2 className="mb-1 text-base font-bold sm:mb-2 sm:text-xl md:text-2xl line-clamp-2">
              {preset.name_bn}
            </h2>
            <p className="arabic-text text-xl sm:text-3xl md:text-4xl break-words px-2">
              {preset.arabic_text}
            </p>
          </div>

          {/* Counter Display */}
          <div className="flex flex-col items-center gap-1 sm:gap-3">
            <div className="text-5xl font-bold tabular-nums text-primary sm:text-7xl md:text-8xl">
              {count}
            </div>
            <div className="text-base text-muted-foreground sm:text-xl md:text-2xl">
              of {preset.target_count} {isComplete && '✓'}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full max-w-md px-4">
            <Progress value={progress} className="h-2 sm:h-3" />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button
              size="lg"
              variant="outline"
              onClick={decrement}
              disabled={count === 0}
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-transparent shrink-0"
            >
              <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              size="lg"
              className="h-20 w-20 rounded-full text-base sm:h-28 sm:w-28 sm:text-xl md:h-32 md:w-32 md:text-2xl shrink-0"
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
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 shrink-0"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-3 w-full max-w-sm">
            <Button
              variant="outline"
              onClick={reset}
              className="text-xs sm:text-sm bg-transparent w-full sm:w-auto"
            >
              <RotateCcw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Reset
            </Button>
            <Button
              variant="outline"
              onClick={toggleFullscreen}
              className="text-xs sm:text-sm bg-transparent w-full sm:w-auto"
            >
              <Minimize2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Exit
            </Button>
          </div>

          {/* Translation */}
          <p className="bangla-text max-w-2xl text-center text-xs text-muted-foreground sm:text-base md:text-lg px-4 line-clamp-3">
            {preset.translation_bn}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-2 sm:px-4">
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-2 sm:gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="mb-1 text-lg sm:mb-2 sm:text-xl md:text-2xl line-clamp-2">
                {preset.name_bn}
              </CardTitle>
              {preset.name_ar && (
                <p className="text-sm text-muted-foreground sm:text-base md:text-lg truncate">
                  {preset.name_ar}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={toggleFullscreen}
              className="shrink-0 h-9 w-9 sm:h-10 sm:w-10"
            >
              <Maximize2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="sr-only">Enter fullscreen</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-4 sm:space-y-6 sm:p-6">
          {/* Arabic Text */}
          <div className="arabic-text rounded-lg bg-accent/50 p-4 text-center text-xl sm:p-6 sm:text-3xl md:text-4xl break-words">
            {preset.arabic_text}
          </div>

          {/* Transliteration */}
          {preset.transliteration_bn && (
            <div className="text-center px-2">
              <p className="bangla-text text-base text-muted-foreground sm:text-lg md:text-xl break-words">
                {preset.transliteration_bn}
              </p>
            </div>
          )}

          {/* Translation */}
          <div className="text-center px-2">
            <p className="bangla-text text-sm sm:text-base md:text-lg break-words">
              {preset.translation_bn}
            </p>
          </div>

          {/* Counter Display */}
          <div className="flex flex-col items-center gap-2 py-4 sm:gap-3 sm:py-6">
            <div className="text-5xl font-bold tabular-nums text-primary sm:text-6xl md:text-7xl">
              {count}
            </div>
            <div className="text-base text-muted-foreground sm:text-lg md:text-xl">
              of {preset.target_count} {isComplete && '✓'}
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <Progress value={progress} className="h-2 sm:h-3" />
            <p className="mt-1 text-center text-xs text-muted-foreground sm:mt-2 sm:text-sm">
              {Math.round(progress)}% Complete
            </p>
          </div>

          {/* Counter Controls */}
          <div className="flex items-center justify-center gap-2 sm:gap-4">
            <Button
              size="lg"
              variant="outline"
              onClick={decrement}
              disabled={count === 0}
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 bg-transparent shrink-0"
            >
              <Minus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
            <Button
              size="lg"
              className="h-16 w-16 rounded-full text-base sm:h-20 sm:w-20 sm:text-lg md:h-24 md:w-24 md:text-xl shrink-0"
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
              className="h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 shrink-0"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col justify-center gap-2 sm:flex-row sm:gap-3">
            <Button
              variant="outline"
              onClick={reset}
              className="text-xs sm:text-sm md:text-base bg-transparent w-full sm:w-auto"
            >
              <RotateCcw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Reset Counter
            </Button>
            <Button
              onClick={toggleFullscreen}
              className="text-xs sm:text-sm md:text-base w-full sm:w-auto"
            >
              <Maximize2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Fullscreen Mode
            </Button>
          </div>

          {isComplete && (
            <div className="rounded-lg bg-primary/10 p-3 text-center sm:p-4 md:p-6">
              <p className="text-sm font-semibold text-primary sm:text-base md:text-lg">
                Alhamdulillah! You have completed your dhikr target.
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">
                May Allah accept your remembrance.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
