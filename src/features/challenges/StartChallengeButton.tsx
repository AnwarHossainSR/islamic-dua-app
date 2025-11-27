import { useActionState } from 'react'
import { challengesApi } from '@/api'
import { cn } from '@/lib/utils/cn'

interface StartChallengeButtonProps {
  challengeId: string
  userId: string
  onSuccess?: () => void
}

async function startAction(_: any, formData: FormData) {
  try {
    const challengeId = formData.get('challengeId') as string
    const userId = formData.get('userId') as string
    await challengesApi.start(challengeId, userId)
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export function StartChallengeButton({ challengeId, userId, onSuccess }: StartChallengeButtonProps) {
  const [state, formAction, isPending] = useActionState(startAction, null)

  if (state?.success && onSuccess) {
    onSuccess()
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="challengeId" value={challengeId} />
      <input type="hidden" name="userId" value={userId} />
      {state?.error && <p className="text-red-600 mb-4">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className={cn(
          'w-full py-3 bg-blue-600 text-white rounded-lg',
          'hover:bg-blue-700 disabled:opacity-50'
        )}
      >
        {isPending ? 'Starting...' : 'Start Challenge'}
      </button>
    </form>
  )
}
