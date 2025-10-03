export default function OfflinePage() {
  return (
    <div className="container flex min-h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">You're Offline</h1>
        <p className="mb-6 text-muted-foreground">
          It looks like you've lost your internet connection. Some features may not be available.
        </p>
        <p className="text-sm text-muted-foreground">Your bookmarked duas and dhikr counter will still work offline.</p>
      </div>
    </div>
  )
}
