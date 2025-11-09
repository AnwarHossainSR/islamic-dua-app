import { ImprovedIslamicChat } from '@/components/ai/improved-islamic-chat'
import { getChatSessions } from '@/lib/actions/ai-chat'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AIPage() {
  const supabase = await getSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const hasOpenAIKey = !!process.env.OPENAI_API_KEY
  const initialSessions = hasOpenAIKey ? await getChatSessions() : []

  return (
    <div className="fixed inset-0 top-[113px] bottom-0">
      <ImprovedIslamicChat 
        initialSessions={initialSessions}
        hasOpenAIKey={hasOpenAIKey}
      />
    </div>
  )
}
