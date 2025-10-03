"use client"

import { Button } from "@/components/ui/button"
import { Bookmark } from "lucide-react"
import { toggleBookmark, checkBookmark } from "@/lib/actions/duas"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function BookmarkButton({ duaId }: { duaId: string }) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    checkBookmark(duaId).then(setIsBookmarked)
  }, [duaId])

  async function handleToggle() {
    setLoading(true)
    const result = await toggleBookmark(duaId)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      setIsBookmarked(result.bookmarked!)
      toast({
        title: result.bookmarked ? "Bookmarked" : "Removed from bookmarks",
        description: result.bookmarked ? "Dua saved to your bookmarks" : "Dua removed from bookmarks",
      })
    }
    setLoading(false)
  }

  return (
    <Button variant={isBookmarked ? "default" : "outline"} size="icon" onClick={handleToggle} disabled={loading}>
      <Bookmark className={`h-5 w-5 ${isBookmarked ? "fill-current" : ""}`} />
      <span className="sr-only">{isBookmarked ? "Remove bookmark" : "Add bookmark"}</span>
    </Button>
  )
}
