'use client';
import { useEffect, useState } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { MuscleGroup } from '@/lib/types';

const muscleGroupLabels: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: '💪 Chest',
  [MuscleGroup.BACK]: '🔙 Back',
  [MuscleGroup.SHOULDERS]: '🏋️ Shoulders',
  [MuscleGroup.BICEPS]: '💪 Biceps',
  [MuscleGroup.TRICEPS]: '💪 Triceps',
  [MuscleGroup.LEGS]: '🦵 Legs',
  [MuscleGroup.GLUTES]: '🍑 Glutes',
  [MuscleGroup.CORE]: '🔥 Core',
  [MuscleGroup.CARDIO]: '🏃 Cardio',
  [MuscleGroup.FULL_BODY]: '🤸 Full Body',
};

export default function ExercisesPage() {
  const { exercises, isLoading, fetchExercises, seedExercises } = useExercises();
  const [filter, setFilter] = useState<MuscleGroup | undefined>();

  useEffect(() => {
    fetchExercises(filter);
  }, [filter]);

  const handleSeed = async () => {
    await seedExercises();
    fetchExercises(filter);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">Exercise Library</h1>
        <button
          onClick={handleSeed}
          className="bg-secondary hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Seed Exercises
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter(undefined)}
          className={`px-4 py-2 rounded-lg transition ${
            !filter
              ? 'bg-primary text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All
        </button>
        {Object.entries(muscleGroupLabels).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key as MuscleGroup)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading exercises...</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-gray-800 p-5 rounded-lg hover:bg-gray-750 transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-xl font-semibold text-white">
                  {exercise.name}
                </h3>
                <span className="text-2xl">
                  {muscleGroupLabels[exercise.muscleGroup].split(' ')[0]}
                </span>
              </div>
              <p className="text-gray-400 text-sm mb-3">
                {exercise.description || 'No description'}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 bg-gray-700 px-3 py-1 rounded-full">
                  {muscleGroupLabels[exercise.muscleGroup]}
                </span>
                {exercise.videoUrl && (
                  <a
                    href={exercise.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-orange-600 text-sm"
                  >
                    Watch Video →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && exercises.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No exercises found</p>
          <button
            onClick={handleSeed}
            className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition"
          >
            Add Sample Exercises
          </button>
        </div>
      )}
    </div>
  );
}