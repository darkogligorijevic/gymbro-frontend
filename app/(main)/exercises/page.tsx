'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const router = useRouter();
  const searchParams = useSearchParams();
  const { exercises, isLoading, fetchExercises } = useExercises();
  const [filter, setFilter] = useState<MuscleGroup | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selection mode states
  const isSelectionMode = searchParams.get('mode') === 'select';
  const returnPath = searchParams.get('return') || '/templates/new';
  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([]);
  const [selectionOrder, setSelectionOrder] = useState<string[]>([]); // Prati redosled

  useEffect(() => {
    fetchExercises(filter);
  }, [filter]);

  const filteredExercises = exercises.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    exercise.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectionOrder(prev => {
      const isCurrentlySelected = prev.includes(exerciseId);
      
      if (isCurrentlySelected) {
        const newOrder = prev.filter(id => id !== exerciseId);
        setSelectedExerciseIds(newOrder);
        return newOrder;
      } else {
        const newOrder = [...prev, exerciseId];
        setSelectedExerciseIds(newOrder);
        return newOrder;
      }
    });
  };

  const handleConfirmSelection = () => {
    if (selectedExerciseIds.length === 0) {
      alert('Please select at least one exercise');
      return;
    }
    
    const idsParam = selectionOrder.join(',');
    router.push(`${returnPath}?selected=${idsParam}`);
  };

  const handleCancelSelection = () => {
    router.push(returnPath);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
              <Icons.Dumbbell className="w-10 h-10 text-primary-500" />
              {isSelectionMode ? 'Select Exercises' : 'Exercise Library'}
            </h1>
            <p className="text-gray-400 text-lg">
              {isSelectionMode 
                ? `Select exercises to add to your template (${selectedExerciseIds.length} selected)` 
                : 'Master your form, build your strength'}
            </p>
          </div>
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

      {/* Selection Mode Actions */}
      {isSelectionMode && (
        <div className="card bg-gradient-to-r from-primary-600 to-orange-600 sticky top-20 z-40">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                {selectedExerciseIds.length} exercise{selectedExerciseIds.length !== 1 ? 's' : ''} selected
              </h3>
              <p className="text-white/90 text-sm">Click exercises to select, then confirm to add them</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <button
                onClick={handleCancelSelection}
                className="flex-1 md:flex-none bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSelection}
                disabled={selectedExerciseIds.length === 0}
                className="flex-1 md:flex-none bg-white text-primary-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icons.Check className="w-5 h-5 inline mr-2" />
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}

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
        </div>
      ) : (
        /* Exercise Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => {
            const config = muscleGroupConfig[exercise.muscleGroup];
            const isSelected = selectedExerciseIds.includes(exercise.id);
            
            return (
              <div
                key={exercise.id}
                onClick={() => {
                  if (isSelectionMode) {
                    toggleExerciseSelection(exercise.id);
                  } else {
                    router.push(`/exercises/${exercise.id}`);
                  }
                }}
                className={`card-hover group rounded-2xl overflow-hidden border transition-all shadow-md ${
                  isSelectionMode 
                    ? `cursor-pointer ${
                        isSelected 
                          ? 'border-primary-500 bg-primary-500/10 shadow-primary-500/30' 
                          : 'border-gray-800 hover:border-primary-500/50'
                      }`
                    : 'border-gray-800 hover:border-primary-500 cursor-pointer'
                } hover:shadow-primary-500/20`}
              >
                {/* Selection Checkbox - samo u selection mode */}
                {isSelectionMode && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className={`w-8 h-8 rounded-lg border-2 flex items-center justify-center transition-all ${
                      isSelected 
                        ? 'bg-primary-500 border-primary-500' 
                        : 'bg-dark-400 border-gray-600 group-hover:border-primary-500'
                    }`}>
                      {isSelected && (
                        <Icons.Check className="w-5 h-5 text-white" />
                      )}
                    </div>
                  </div>
                )}

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
                        <h3 className={`text-xl font-bold transition-colors ${
                          isSelected ? 'text-primary-500' : 'text-white group-hover:text-primary-500'
                        }`}>
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