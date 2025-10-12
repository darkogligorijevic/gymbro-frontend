'use client';
import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/useTemplates';
import { useWorkout } from '@/hooks/useWorkout';
import Link from 'next/link';

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentTemplate, isLoading, fetchTemplate } = useTemplates();
  const { startWorkout, isLoading: starting } = useWorkout();

  useEffect(() => {
    if (params.id) {
      fetchTemplate(params.id as string);
    }
  }, [params.id]);

  const handleStartWorkout = async () => {
    if (!currentTemplate) return;
    try {
      await startWorkout(currentTemplate.id);
      router.push('/workout');
    } catch (error) {
      alert('Failed to start workout. You may have an active workout.');
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Loading template...</div>
      </div>
    );
  }

  if (!currentTemplate) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400">Template not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">
            {currentTemplate.name}
          </h1>
          <p className="text-gray-400">{currentTemplate.description}</p>
        </div>
        <button
          onClick={handleStartWorkout}
          disabled={starting}
          className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50"
        >
          {starting ? 'Starting...' : 'Start Workout'}
        </button>
      </div>

      <div className="space-y-4">
        {currentTemplate.exercises.map((exercise, index) => (
          <div key={exercise.id} className="bg-gray-800 p-6 rounded-lg">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {index + 1}. {exercise.exercise?.name}
                </h3>
                {exercise.notes && (
                  <p className="text-gray-400 mt-1">📝 {exercise.notes}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              {exercise.sets.map((set) => (
                <div
                  key={set.id}
                  className="flex items-center justify-between bg-gray-700 p-3 rounded"
                >
                  <span className="text-gray-300">Set {set.setNumber}</span>
                  <div className="flex gap-6">
                    <span className="text-white">
                      {set.targetWeight} kg
                    </span>
                    <span className="text-white">
                      {set.targetReps} reps
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Link
          href="/templates"
          className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
        >
          ← Back to Templates
        </Link>
      </div>
    </div>
  );
}
