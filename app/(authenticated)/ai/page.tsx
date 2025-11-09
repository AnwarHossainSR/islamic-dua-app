import { AIStatusWarning } from '@/components/ai/ai-status-warning'
import { IslamicChat } from '@/components/ai/islamic-chat'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { Brain } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AIPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>Please log in to access AI features.</div>
  }

  const hasOpenAIKey = !!process.env.OPENAI_API_KEY

  return (
    <div className="h-[calc(100vh-9.4rem)] max-w-4xl mx-auto">
      {!hasOpenAIKey ? (
        <>
          <AIStatusWarning />
          <div className="text-center py-12">
            <Brain className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">AI Assistant Unavailable</h3>
            <p className="text-muted-foreground">Configure OpenAI API key to enable AI features</p>
          </div>
        </>
      ) : (
        <IslamicChat />
      )}
    </div>
  )
}
