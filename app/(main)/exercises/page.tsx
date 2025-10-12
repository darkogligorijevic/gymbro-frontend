'use client';
import { useEffect, useState } from 'react';
import { useExercises } from '@/hooks/useExercises';
import { MuscleGroup } from '@/lib/types';
import { Icons } from '@/components/Icons';

const muscleGroupConfig: Record<MuscleGroup, { label: string; color: string }> = {
  [MuscleGroup.CHEST]: { label: 'Chest', color: 'from-red-500 to-pink-500' },
  [MuscleGroup.BACK]: { label: 'Back', color: 'from-blue-500 to-cyan-500' },
  [MuscleGroup.SHOULDERS]: { label: 'Shoulders', color: 'from-orange-500 to-yellow-500' },
  [MuscleGroup.BICEPS]: { label: 'Biceps', color: 'from-purple-500 to-pink-500' },
  [MuscleGroup.TRICEPS]: { label: 'Triceps', color: 'from-green-500 to-emerald-500' },
  [MuscleGroup.LEGS]: { label: 'Legs', color: 'from-indigo-500 to-purple-500' },
  [MuscleGroup.GLUTES]: { label: 'Glutes', color: 'from-pink-500 to-rose-500' },
  [MuscleGroup.CORE]: { label: 'Core', color: 'from-yellow-500 to-orange-500' },
  [MuscleGroup.CARDIO]: { label: 'Cardio', color: 'from-cyan-500 to-blue-500' },
  [MuscleGroup.FULL_BODY]: { label: 'Full Body', color: 'from-primary-500 to-orange-500' },
};

export default function ExercisesPage() {
  const { exercises, isLoading, fetchExercises, seedExercises } = useExercises();
  const [filter, setFilter] = useState<MuscleGroup | undefined>();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchExercises(filter);
  }, [filter]);

  const handleSeed = async () => {
    await seedExercises();
    fetchExercises(filter);
  };

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <Icons.Dumbbell className="w-10 h-10 text-primary-500" />
              Exercise Library
            </h1>
            <p className="text-gray-400 text-lg">Master your form, build your strength</p>
          </div>
          <button
            onClick={handleSeed}
            className="btn-primary"
          >
            <Icons.Plus className="w-5 h-5 inline mr-2" />
            Seed Exercises
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-search-field"
          />
          <svg className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div>
        <h3 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wider">Filter by Muscle Group</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setFilter(undefined)}
            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
              !filter
                ? 'bg-gradient-to-r from-primary-500 to-orange-500 text-white shadow-lg shadow-primary-500/50'
                : 'bg-dark-300 text-gray-400 hover:bg-dark-200 hover:text-white'
            }`}
          >
            All Exercises
          </button>
          {Object.entries(muscleGroupConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilter(key as MuscleGroup)}
              className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${
                filter === key
                  ? `bg-gradient-to-r ${config.color} text-white shadow-lg`
                  : 'bg-dark-300 text-gray-400 hover:bg-dark-200 hover:text-white'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center gap-2 text-gray-400">
        <Icons.Target className="w-5 h-5" />
        <span>{filteredExercises.length} exercises found</span>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card loading-shimmer h-48"></div>
          ))}
        </div>
      ) : filteredExercises.length === 0 ? (
        /* Empty State */
        <div className="card text-center py-16">
          <Icons.Dumbbell className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-2">No exercises found</h3>
          <p className="text-gray-400 mb-6">
            {searchQuery ? 'Try adjusting your search' : 'Add some exercises to get started'}
          </p>
          {!searchQuery && (
            <button onClick={handleSeed} className="btn-primary">
              <Icons.Plus className="w-5 h-5 inline mr-2" />
              Add Sample Exercises
            </button>
          )}
        </div>
      ) : (
        /* Exercise Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => {
            const config = muscleGroupConfig[exercise.muscleGroup];
            return (
              <div
                key={exercise.id}
                className="card-hover group rounded-2xl overflow-hidden border border-gray-800 hover:border-primary-500 transition-all shadow-md hover:shadow-primary-500/20"
              >
                {/* GIF ili video na vrhu */}
                {exercise.videoUrl && (
                  <div className="relative w-full overflow-hidden">
                    <img
                      src={exercise.videoUrl}
                      alt={exercise.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}

                {/* Sadržaj kartice */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-primary-500 transition-colors">
                          {exercise.name}
                        </h3>
                      </div>
                      <div className={`badge bg-gradient-to-r ${config.color} text-white border-0 mb-3`}>
                        {config.label}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-400 text-sm mb-2 line-clamp-2">
                    {exercise.description || 'No description available'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}