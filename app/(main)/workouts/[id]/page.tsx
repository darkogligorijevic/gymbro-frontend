'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { workoutApi } from '@/lib/api';
import { WorkoutSession } from '@/lib/types';
import { format } from 'date-fns';
import { Icons } from '@/components/Icons';

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<WorkoutSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedExercises, setExpandedExercises] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWorkoutDetails();
  }, [params.id]);

  const fetchWorkoutDetails = async () => {
    try {
      setIsLoading(true);
      const response = await workoutApi.getOne(params.id as string);
      setWorkout(response.data);
    } catch (error) {
      console.error('Failed to fetch workout:', error);
      alert('Failed to load workout details');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExercise = (exerciseId: string) => {
    setExpandedExercises(prev => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const getSessionName = () => {
    if (!workout) return '';
    const templateName = workout.workoutTemplate?.name || 'Workout';
    const date = format(new Date(workout.clockIn), 'MMM dd, yyyy');
    return `${templateName} - ${date}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="card loading-shimmer h-64"></div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card loading-shimmer h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  if (!workout) {
    return (
      <div className="card text-center py-16">
        <Icons.AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Workout not found</h3>
        <button
          onClick={() => router.push('/workouts')}
          className="btn-primary mt-4"
        >
          Back to Workouts
        </button>
      </div>
    );
  }

  const completedSetsTotal = workout.exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.isCompleted).length,
    0
  );
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="bg-dark-300 hover:bg-dark-200 p-3 rounded-xl transition-all"
        >
          <Icons.ArrowLeft className="w-6 h-6 text-white" />
        </button>
        <h1 className="text-4xl md:text-5xl font-bold text-white flex items-center gap-3">
          <Icons.Calendar className="w-10 h-10 text-primary-500" />
          Workout Details
        </h1>
      </div>

      {/* Workout Summary Card */}
      <div className="card bg-gradient-to-br from-primary-600 via-primary-500 to-orange-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-gym-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            {workout.isWorkoutFinished ? (
              <div className="bg-green-500 p-3 rounded-xl">
                <Icons.Check className="w-8 h-8 text-white" />
              </div>
            ) : (
              <div className="bg-white/20 p-3 rounded-xl">
                <Icons.Clock className="w-8 h-8 text-white" />
              </div>
            )}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {getSessionName()}
              </h2>
              <p className="text-white/80 text-lg mt-1">
                {format(new Date(workout.clockIn), 'EEEE, h:mm a')}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Clock className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm uppercase tracking-wider">Duration</span>
              </div>
              <p className="text-3xl font-bold text-white">
                {workout.durationMinutes || 0}
                <span className="text-lg ml-1">min</span>
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Target className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm uppercase tracking-wider">Exercises</span>
              </div>
              <p className="text-3xl font-bold text-white">{workout.exercises.length}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Dumbbell className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm uppercase tracking-wider">Total Sets</span>
              </div>
              <p className="text-3xl font-bold text-white">{completedSetsTotal}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border-transparent">
              <div className="flex items-center gap-2 mb-2">
                <Icons.Trophy className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm uppercase tracking-wider">Status</span>
              </div>
              <p className="text-lg font-bold text-white">
                {workout.isWorkoutFinished ? '✓ Completed' : 'In Progress'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises Accordion */}
      <div className="space-y-3">
        <h3 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
          <Icons.Dumbbell className="w-6 h-6 text-primary-500" />
          Exercises Performed
        </h3>

        {workout.exercises.map((exercise, index) => {
          const isExpanded = expandedExercises.has(exercise.id);
          const completedSets = exercise.sets.filter(s => s.isCompleted).length;
          const totalExSets = exercise.sets.length;
          const progressPercent = (completedSets / totalExSets) * 100;

          return (
            <div
              key={exercise.id}
              className="card hover:border-primary-500/50 transition-all"
            >
              {/* Exercise Header - Clickable */}
              <button
                onClick={() => toggleExercise(exercise.id)}
                className="w-full text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                      exercise.status === 'finished'
                        ? 'bg-green-500 text-white'
                        : 'bg-primary-500/20 text-primary-500'
                    }`}>
                      {exercise.status === 'finished' ? (
                        <Icons.Check className="w-6 h-6" />
                      ) : (
                        index + 1
                      )}
                    </div>

                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-1">
                        {exercise.exercise?.name}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>{completedSets}/{totalExSets} sets completed</span>
                        {exercise.notes && (
                          <span className="flex items-center gap-1">
                            <Icons.FileText className="w-4 h-4" />
                            Notes
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-2 bg-dark-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-primary-500 to-orange-500 h-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {exercise.status === 'finished' && (
                      <div className="badge bg-green-500/20 text-green-500 border border-green-500/30">
                        <Icons.Check className="w-4 h-4 mr-1" />
                        Completed
                      </div>
                    )}
                    <Icons.ChevronDown
                      className={`w-6 h-6 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </div>
              </button>

              {/* Exercise Details - Expandable */}
              {isExpanded && (
                <div className="mt-6 pt-6 border-t border-dark-200 space-y-4">
                  {exercise.notes && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                      <div className="flex items-start gap-2">
                        <Icons.FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h5 className="text-blue-400 font-semibold mb-1">Notes</h5>
                          <p className="text-gray-300">{exercise.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sets Table */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                      Sets Performed
                    </h5>
                    {exercise.sets.map((set) => (
                      <div
                        key={set.id}
                        className={`rounded-xl p-4 transition-all ${
                          set.isCompleted
                            ? 'bg-green-500/10 border-2 border-green-500/30'
                            : 'bg-dark-300 border-2 border-dark-200'
                        }`}
                      >
                        <div className="flex items-center justify-between flex-wrap gap-4">
                          <div className="flex items-center gap-6 flex-wrap">
                            <span className={`font-bold text-lg ${
                              set.isCompleted ? 'text-green-500' : 'text-gray-400'
                            }`}>
                              Set {set.setNumber}
                            </span>

                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                  {set.targetWeight}
                                </div>
                                <div className="text-xs text-gray-400">kg (target)</div>
                              </div>

                              <div className="text-gray-500">×</div>

                              <div className="text-center">
                                <div className="text-2xl font-bold text-white">
                                  {set.targetReps}
                                </div>
                                <div className="text-xs text-gray-400">reps (target)</div>
                              </div>
                            </div>
                          </div>

                          {set.isCompleted && (
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-green-500">
                                    {set.actualWeight || set.targetWeight}
                                  </div>
                                  <div className="text-xs text-gray-400">kg (actual)</div>
                                </div>
                                <div className="text-gray-500">×</div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-green-500">
                                    {set.actualReps}
                                  </div>
                                  <div className="text-xs text-gray-400">reps (actual)</div>
                                </div>
                              </div>
                              <Icons.Check className="w-6 h-6 text-green-500" />
                            </div>
                          )}

                          {!set.isCompleted && (
                            <div className="badge bg-gray-500/20 text-gray-500">
                              Skipped
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => router.push('/workouts')}
          className="btn-secondary flex-1"
        >
          <Icons.ArrowLeft className="w-5 h-5 inline mr-2" />
          Back to Workouts
        </button>
        {workout.workoutTemplate && (
          <button
            onClick={() => router.push(`/templates/${workout.workoutTemplate?.id}`)}
            className="btn-primary flex-1"
          >
            <Icons.Target className="w-5 h-5 inline mr-2" />
            View Template
          </button>
        )}
      </div>
    </div>
  );
}