import { useActionState } from "react";
import { challengesApi } from "@/api";
import { Button, Input } from "@/components/ui";

interface CompleteChallengeFormProps {
  progressId: string;
  userId: string;
  challengeId: string;
  dayNumber: number;
  targetCount: number;
  onSuccess?: () => void;
}

async function completeAction(_: any, formData: FormData) {
  try {
    const progressId = formData.get("progressId") as string;
    const userId = formData.get("userId") as string;
    const challengeId = formData.get("challengeId") as string;
    const dayNumber = parseInt(formData.get("dayNumber") as string, 10);
    const count = parseInt(formData.get("count") as string, 10);
    const targetCount = parseInt(formData.get("targetCount") as string, 10);

    await challengesApi.complete(progressId, userId, challengeId, dayNumber, count, targetCount);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export function CompleteChallengeForm({
  progressId,
  userId,
  challengeId,
  dayNumber,
  targetCount,
  onSuccess,
}: CompleteChallengeFormProps) {
  const [state, formAction, isPending] = useActionState(completeAction, null);

  if (state?.success && onSuccess) {
    onSuccess();
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="progressId" value={progressId} />
      <input type="hidden" name="userId" value={userId} />
      <input type="hidden" name="challengeId" value={challengeId} />
      <input type="hidden" name="dayNumber" value={dayNumber} />
      <input type="hidden" name="targetCount" value={targetCount} />

      {state?.error && <div className="bg-red-50 text-red-600 p-3 rounded">{state.error}</div>}

      <div>
        <label htmlFor="count" className="block text-sm font-medium mb-1">
          Count (Target: {targetCount})
        </label>
        <Input id="count" name="count" type="number" min="0" defaultValue={targetCount} required />
      </div>

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Completing..." : "Complete Day"}
      </Button>
    </form>
  );
}
