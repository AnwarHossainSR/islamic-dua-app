import { challengesApi } from '@/api';
import { Button, Loader } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { StartChallengeButton } from '@/features/challenges/StartChallengeButton';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export default function ChallengeDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<any>(null);

  useEffect(() => {
    if (id) {
      challengesApi.getById(id).then(setChallenge);
    }
  }, [id]);

  if (!challenge)
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 flex justify-center">
        <Loader size="lg" />
      </div>
    );

  const progress = challenge.user_challenge_progress?.[0];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Button onClick={() => navigate(-1)} variant="link" className="mb-4 p-0">
        ← Back
      </Button>

      <div className="bg-white rounded-lg shadow p-8">
        <div className="flex items-start gap-4 mb-6">
          <div className="text-5xl">{challenge.icon || '📿'}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{challenge.title_bn}</h1>
            <p className="text-gray-600">{challenge.description_bn}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 bg-blue-50 rounded">
            <p className="text-sm text-gray-600">Total Days</p>
            <p className="text-2xl font-bold">{challenge.total_days}</p>
          </div>
          <div className="p-4 bg-green-50 rounded">
            <p className="text-sm text-gray-600">Daily Target</p>
            <p className="text-2xl font-bold">{challenge.daily_target_count}x</p>
          </div>
          <div className="p-4 bg-purple-50 rounded">
            <p className="text-sm text-gray-600">Participants</p>
            <p className="text-2xl font-bold">{challenge.total_participants}</p>
          </div>
        </div>

        <div className="mb-6 p-6 bg-gray-50 rounded-lg">
          <h3 className="font-bold text-lg mb-2">Arabic Text</h3>
          <p className="text-2xl text-right mb-4" dir="rtl">
            {challenge.arabic_text}
          </p>
          <h3 className="font-bold mb-2">Translation</h3>
          <p className="text-gray-700">{challenge.translation_bn}</p>
        </div>

        {!progress ? (
          <StartChallengeButton
            challengeId={challenge.id}
            userId={user?.id || ''}
            onSuccess={() => navigate(ROUTES.CHALLENGES)}
          />
        ) : (
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="font-semibold text-green-800">
              Challenge Active - Day {progress.current_day}/{challenge.total_days}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
