import { ImprovedIslamicChat } from '@/components/ai/improved-islamic-chat'
import { getChatSessions } from '@/lib/actions/ai-chat'

export const dynamic = 'force-dynamic'

export default async function AIPage() {
  const hasOpenAIKey = !!process.env.OPENAI_API_KEY
  let initialSessions: any[] = []

  if (hasOpenAIKey) {
    try {
      initialSessions = await getChatSessions()
    } catch (error) {
      console.error('Failed to load chat sessions:', error)
      initialSessions = []
    }
  }

  return (
    <div className="h-full">
      <ImprovedIslamicChat initialSessions={initialSessions} hasOpenAIKey={hasOpenAIKey} />
    </div>
  )
}
