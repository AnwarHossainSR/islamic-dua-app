import { useActionState } from 'react'
import { challengesApi } from '@/api'
import { Input, Button } from '@/components/ui'

interface CompleteChallengeFormProps {
  progressId: string
  dayNumber: number
  targetCount: number
  onSuccess?: () => void
}

async function completeAction(_: any, formData: FormData) {
  try {
    const progressId = formData.get('progressId') as string
    const dayNumber = parseInt(formData.get('dayNumber') as string)
    const count = parseInt(formData.get('count') as string)

    await challengesApi.complete(progressId, dayNumber, count)
    return { success: true }
  } catch (error: any) {
    return { error: error.message }
  }
}

export function CompleteChallengeForm({ 
  progressId, 
  dayNumber, 
  targetCount,
  onSuccess 
}: CompleteChallengeFormProps) {
  const [state, formAction, isPending] = useActionState(completeAction, null)

  if (state?.success && onSuccess) {
    onSuccess()
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="progressId" value={progressId} />
      <input type="hidden" name="dayNumber" value={dayNumber} />
      
      {state?.error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">{state.error}</div>
      )}

      <Input
        id="count"
        name="count"
        type="number"
        label={`Count (Target: ${targetCount})`}
        min="0"
        defaultValue={targetCount}
        required
      />

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? 'Completing...' : 'Complete Day'}
      </Button>
    </form>
  )
}
