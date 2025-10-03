import { getUserBookmarks } from "@/lib/actions/duas"
import { DuaCard } from "@/components/duas/dua-card"
import { getUser } from "@/lib/actions/auth"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default async function BookmarksPage() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  const bookmarks = await getUserBookmarks()

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="mb-2 text-4xl font-bold">My Bookmarks</h1>
        <p className="text-muted-foreground">Your saved duas for quick access</p>
      </div>

      {bookmarks.length === 0 ? (
        <div className="py-12 text-center">
          <p className="mb-4 text-lg text-muted-foreground">You haven't bookmarked any duas yet.</p>
          <Button asChild>
            <Link href="/duas">Browse Duas</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookmarks.map((bookmark: any) => (
            <DuaCard key={bookmark.id} dua={bookmark.dua} />
          ))}
        </div>
      )}
    </div>
  )
}
