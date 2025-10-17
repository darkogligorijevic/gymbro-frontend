'use client';
import { useEffect, useState } from 'react';
import { useWorkout } from '@/hooks/useWorkout';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { Icons } from '@/components/Icons';

export default function WorkoutPage() {
  const router = useRouter();
  const {
    activeWorkout,
    workoutHistory,
    getActiveWorkout,
    fetchHistory,
    completeSet,
    addSet,
    skipExercise,
    resumeExercise,
    finishWorkout,
    isLoading,
  } = useWorkout();
  
  const [repsInput, setRepsInput] = useState<{ [key: string]: number }>({});
  const [weightInput, setWeightInput] = useState<{ [key: string]: number }>({});
  const [wasActive, setWasActive] = useState(false);
  const [showAddSet, setShowAddSet] = useState<string | null>(null);
  const [newSetWeight, setNewSetWeight] = useState<number>(0);
  const [newSetReps, setNewSetReps] = useState<number>(8);

  useEffect(() => {
    getActiveWorkout();
    fetchHistory();
    
    const interval = setInterval(() => {
      if (activeWorkout && !activeWorkout.isWorkoutFinished) {
        getActiveWorkout();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeWorkout) {
      setWasActive(true);
    }
    if (wasActive && !activeWorkout) {
      alert('🎉 All exercises completed! Workout finished automatically. Great job! 💪');
      fetchHistory();
      router.push('/dashboard');
    }
  }, [activeWorkout]);

  const handleCompleteSet = async (setId: string, targetWeight: number) => {
    if (!activeWorkout) return;
    const reps = repsInput[setId] || 0;
    const weight = weightInput[setId] || targetWeight;
    
    if (reps <= 0) {
      alert('Please enter reps completed');
      return;
    }
    try {
      await completeSet(activeWorkout.id, setId, reps, weight !== targetWeight ? weight : undefined);
      setRepsInput({ ...repsInput, [setId]: 0 });
      setWeightInput({ ...weightInput, [setId]: 0 });
    } catch (error) {
      alert('Failed to complete set');
    }
  };

  const handleAddSet = async (exerciseId: string) => {
    if (!activeWorkout) return;
    if (newSetWeight <= 0 || newSetReps <= 0) {
      alert('Please enter valid weight and reps');
      return;
    }
    try {
      await addSet(activeWorkout.id, exerciseId, newSetWeight, newSetReps);
      setShowAddSet(null);
      setNewSetWeight(0);
      setNewSetReps(8);
    } catch (error) {
      alert('Failed to add set');
    }
  };

  const handleSkipExercise = async (exerciseId: string) => {
    if (!activeWorkout) return;
    if (confirm('Skip this exercise? You can resume it later.')) {
      try {
        await skipExercise(activeWorkout.id, exerciseId);
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to skip exercise');
      }
    }
  };

  const handleResumeExercise = async (exerciseId: string) => {
    if (!activeWorkout) return;
    try {
      await resumeExercise(activeWorkout.id, exerciseId);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to resume exercise');
    }
  };

  const handleFinishWorkout = async () => {
    if (!activeWorkout) return;
    
    if (activeWorkout.isWorkoutFinished) {
      alert('This workout is already finished!');
      await getActiveWorkout();
      return;
    }
    
    if (confirm('Are you sure you want to finish this workout?')) {
      try {
        await finishWorkout(activeWorkout.id);
        alert('Workout completed! Great job! 💪');
        await fetchHistory();
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Finish workout error:', error);
        const errorMsg = error.response?.data?.message || 'Failed to finish workout';
        alert(errorMsg);
        await getActiveWorkout();
      }
    }
  };

  const getElapsedTime = () => {
    if (!activeWorkout || !activeWorkout.clockIn) return { minutes: 0, seconds: 0 };
    const now = new Date();
    const start = new Date(activeWorkout.clockIn);
    const diff = Math.floor((now.getTime() - start.getTime()) / 1000);
    return {
      minutes: Math.floor(diff / 60),
      seconds: diff % 60
    };
  };

  const [elapsedTime, setElapsedTime] = useState(getElapsedTime());

  useEffect(() => {
    if (activeWorkout && !activeWorkout.isWorkoutFinished) {
      const timer = setInterval(() => {
        setElapsedTime(getElapsedTime());
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeWorkout]);

  const currentExercise = activeWorkout?.exercises?.find(
    (ex) => ex.status === 'in_progress'
  );

  const completedExercises = activeWorkout?.exercises?.filter(ex => ex.status === 'finished').length || 0;
  const totalExercises = activeWorkout?.exercises?.length || 0;
  const progress = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

  // Generate session name
  const getSessionName = () => {
    if (!activeWorkout) return '';
    const templateName = activeWorkout.workoutTemplate?.name || 'Workout';
    const date = format(new Date(activeWorkout.clockIn), 'MMM dd, yyyy');
    return `${templateName} - ${date}`;
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-3">
        <Icons.Lightning className="w-10 h-10 text-primary-500" />
        Workout Session
      </h1>

      {activeWorkout ? (
        <div className="space-y-6">
          {/* Active Workout Header */}
          <div className="card bg-gradient-to-r from-primary-600 via-primary-500 to-orange-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-gym-pattern opacity-10"></div>
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    {!activeWorkout.isWorkoutFinished && (
                      <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                    )}
                    <span className="text-white/90 font-semibold uppercase tracking-wider">
                      {activeWorkout.isWorkoutFinished ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                  
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    {getSessionName()}
                  </h2>
                  
                  <div className="flex flex-wrap items-center gap-4 text-white/90">
                    <div className="flex items-center gap-2">
                      <Icons.Clock className="w-5 h-5" />
                      <span>Started {format(new Date(activeWorkout.clockIn), 'h:mm a')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Icons.Target className="w-5 h-5" />
                      <span>{completedExercises}/{totalExercises} exercises</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4">
                    <div className="bg-white/20 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-white h-full transition-all duration-500 ease-out"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 lg:w-64">
                  {/* Timer */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20">
                    <div className="text-white/80 text-sm mb-1 uppercase tracking-wider">Time</div>
                    <div className="text-5xl font-bold text-white">
                      {elapsedTime.minutes}
                      <span className="text-3xl">:{elapsedTime.seconds.toString().padStart(2, '0')}</span>
                    </div>
                  </div>

                  {!activeWorkout.isWorkoutFinished && (
                    <button
                      onClick={handleFinishWorkout}
                      disabled={isLoading}
                      className="bg-white text-primary-600 px-6 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50"
                    >
                      Finish Workout
                    </button>
                  )}
                  
                  {activeWorkout.isWorkoutFinished && (
                    <div className="bg-green-500 text-white px-6 py-4 rounded-xl font-bold text-center">
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Current Exercise */}
          {currentExercise && (
            <div className="card border-2 border-primary-500 shadow-2xl shadow-primary-500/20 animate-glow">
              <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="bg-primary-500 p-3 rounded-xl">
                    <Icons.Fire className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-sm text-gray-400 uppercase tracking-wider font-semibold">Current Exercise</div>
                    <h3 className="text-3xl font-bold text-white">
                      {currentExercise?.exercise?.name || 'Exercise'}
                    </h3>
                  </div>
                </div>
                
                <button
                  onClick={() => handleSkipExercise(currentExercise.id)}
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-500 px-4 py-2 rounded-xl transition-all font-semibold"
                >
                  Skip →
                </button>
              </div>

              {currentExercise?.notes && (
                <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
                  <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <p className="text-blue-400">{currentExercise.notes}</p>
                </div>
              )}

              <div className="space-y-3">
                {currentExercise?.sets?.map((set) => (
                  <div
                    key={set.id}
                    className={`rounded-xl p-4 transition-all ${
                      set.isCompleted
                        ? 'bg-green-500/20 border-2 border-green-500'
                        : 'bg-dark-300 border-2 border-transparent hover:border-primary-500/50'
                    }`}
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex-shrink-0 w-20">
                        <span className={`font-bold text-lg ${set.isCompleted ? 'text-green-500' : 'text-gray-300'}`}>
                          Set {set.setNumber}
                        </span>
                      </div>
                      
                      <div className="flex-1 flex items-center gap-4 flex-wrap">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{set.targetWeight}</div>
                          <div className="text-xs text-gray-400">kg (target)</div>
                        </div>
                        <div className="text-gray-500">×</div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-white">{set.targetReps}</div>
                          <div className="text-xs text-gray-400">reps (target)</div>
                        </div>
                      </div>

                      {!set.isCompleted ? (
                        <div className="flex gap-3 items-center flex-wrap">
                          <div className="flex flex-col gap-2">
                            <input
                              type="number"
                              value={weightInput[set.id] || ''}
                              onChange={(e) =>
                                setWeightInput({
                                  ...weightInput,
                                  [set.id]: parseFloat(e.target.value) || 0,
                                })
                              }
                              className="w-24 px-4 py-2 rounded-xl bg-dark-200 text-white text-center font-bold border-2 border-dark-100 focus:border-primary-500 focus:outline-none"
                              placeholder={set.targetWeight.toString()}
                              step="0.5"
                              min="0"
                            />
                            <span className="text-xs text-gray-400 text-center">kg</span>
                          </div>
                          
                          <div className="text-gray-500">×</div>
                          
                          <div className="flex flex-col gap-2">
                            <input
                              type="number"
                              value={repsInput[set.id] || ''}
                              onChange={(e) =>
                                setRepsInput({
                                  ...repsInput,
                                  [set.id]: parseInt(e.target.value) || 0,
                                })
                              }
                              className="w-24 px-4 py-2 rounded-xl bg-dark-200 text-white text-center font-bold border-2 border-dark-100 focus:border-primary-500 focus:outline-none"
                              placeholder="Reps"
                              min="0"
                            />
                            <span className="text-xs text-gray-400 text-center">reps</span>
                          </div>
                          
                          <button
                            onClick={() => handleCompleteSet(set.id, set.targetWeight)}
                            disabled={isLoading}
                            className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:opacity-50"
                          >
                            <Icons.Check className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-green-500 font-bold">
                          <div className="text-center">
                            <div className="text-2xl">{set.actualWeight || set.targetWeight}</div>
                            <div className="text-xs text-gray-400">kg</div>
                          </div>
                          <div className="text-gray-500">×</div>
                          <div className="text-center">
                            <div className="text-2xl">{set.actualReps}</div>
                            <div className="text-xs text-gray-400">reps</div>
                          </div>
                          <Icons.Check className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button - TEMPORARILY DISABLED
              <div className="mt-4">
                {showAddSet === currentExercise.id ? (
                  <div className="bg-dark-300 rounded-xl p-4 space-y-3">
                    <h4 className="font-bold text-white">Add Extra Set</h4>
                    <div className="flex gap-3 items-end flex-wrap">
                      <div className="flex-1 min-w-[100px]">
                        <label className="text-sm text-gray-400 mb-1 block">Weight (kg)</label>
                        <input
                          type="number"
                          value={newSetWeight || ''}
                          onChange={(e) => setNewSetWeight(parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 rounded-xl bg-dark-200 text-white border-2 border-dark-100 focus:border-primary-500 focus:outline-none"
                          placeholder="80"
                          step="0.5"
                          min="0"
                        />
                      </div>
                      <div className="flex-1 min-w-[100px]">
                        <label className="text-sm text-gray-400 mb-1 block">Reps</label>
                        <input
                          type="number"
                          value={newSetReps || ''}
                          onChange={(e) => setNewSetReps(parseInt(e.target.value) || 0)}
                          className="w-full px-4 py-2 rounded-xl bg-dark-200 text-white border-2 border-dark-100 focus:border-primary-500 focus:outline-none"
                          placeholder="8"
                          min="1"
                        />
                      </div>
                      <button
                        onClick={() => handleAddSet(currentExercise.id)}
                        className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-xl font-semibold transition-all"
                      >
                        Add Set
                      </button>
                      <button
                        onClick={() => setShowAddSet(null)}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-xl font-semibold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      const lastSet = currentExercise.sets[currentExercise.sets.length - 1];
                      setNewSetWeight(lastSet?.targetWeight || 0);
                      setNewSetReps(lastSet?.targetReps || 8);
                      setShowAddSet(currentExercise.id);
                    }}
                    className="w-full bg-dark-300 hover:bg-dark-200 text-gray-300 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all border-2 border-dashed border-gray-600 hover:border-primary-500"
                  >
                    <Icons.Plus className="w-5 h-5 inline mr-2" />
                    Add Extra Set
                  </button>
                )}
              </div>
              */}
            </div>
          )}

          {/* All Exercises Overview */}
          <div>
            <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <Icons.Target className="w-6 h-6 text-primary-500" />
              Exercise List
            </h3>
            
            <div className="space-y-3">
              {activeWorkout.exercises?.map((exercise, index) => {
                const completedSets = exercise.sets.filter(s => s.isCompleted).length;
                const totalSets = exercise.sets.length;
                const isActive = exercise.status === 'in_progress';
                const isFinished = exercise.status === 'finished';
                const isSkipped = exercise.status === 'not_started' && index < (activeWorkout.exercises.findIndex(e => e.status === 'in_progress'));

                return (
                  <div
                    key={exercise.id}
                    className={`card transition-all ${
                      isActive ? 'border-2 border-primary-500' : ''
                    } ${isFinished ? 'opacity-60' : ''}`}
                  >
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                        isFinished ? 'bg-green-500 text-white' :
                        isActive ? 'bg-primary-500 text-white' :
                        isSkipped ? 'bg-yellow-500 text-white' :
                        'bg-dark-200 text-gray-400'
                      }`}>
                        {isFinished ? <Icons.Check className="w-6 h-6" /> : 
                         isSkipped ? '⏸' : 
                         index + 1}
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-white font-bold text-lg mb-1">
                          {exercise?.exercise?.name}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
                          <span>{completedSets}/{totalSets} sets completed</span>
                          {isActive && (
                            <span className="flex items-center gap-1 text-primary-500">
                              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                              Active
                            </span>
                          )}
                          {isSkipped && (
                            <span className="flex items-center gap-1 text-yellow-500">
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              Skipped
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        {isFinished && (
                          <span className="badge bg-green-500/20 text-green-500 border border-green-500/30">
                            <Icons.Check className="w-4 h-4 mr-1" />
                            Done
                          </span>
                        )}
                        {isActive && (
                          <span className="badge bg-primary-500/20 text-primary-500 border border-primary-500/30">
                            ● Active
                          </span>
                        )}
                        {isSkipped && (
                          <button
                            onClick={() => handleResumeExercise(exercise.id)}
                            className="badge bg-yellow-500/20 text-yellow-500 border border-yellow-500/30 hover:bg-yellow-500/30 cursor-pointer"
                          >
                            Resume
                          </button>
                        )}
                        {exercise.status === 'not_started' && !isSkipped && !isActive && (
                          <button
                            onClick={() => handleResumeExercise(exercise.id)}
                            className="badge bg-blue-500/20 text-blue-500 border border-blue-500/30 hover:bg-blue-500/30 cursor-pointer"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* No Active Workout */
        <div className="space-y-8">
          <div className="card text-center py-16">
            <div className="bg-primary-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Icons.Lightning className="w-12 h-12 text-primary-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No active workout</h3>
            <p className="text-gray-400 mb-6">Start a new workout to begin tracking</p>
            <button
              onClick={() => router.push('/templates')}
              className="btn-primary inline-block"
            >
              Browse Templates
            </button>
          </div>

          {/* Workout History */}
          {workoutHistory.length > 0 && (
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Icons.Calendar className="w-5 h-5 md:w-6 md:h-6 text-primary-500" />
                Recent History
              </h2>
              
              <div className="space-y-3">
                {workoutHistory.slice(0, 10).map((workout) => {
                  const workoutName = workout.workoutTemplate?.name 
                    ? `${workout.workoutTemplate.name}`
                    : 'Workout';
                  
                  return (
                    <div
                      key={workout.id}
                      onClick={() => router.push(`/workouts/${workout.id}`)}
                      className="card hover:border-primary-500/50 transition-all cursor-pointer group p-3 sm:p-4"
                    >
                      <div className="flex items-start gap-3 sm:items-center">
                        {/* Icon */}
                        <div className="bg-green-500/10 p-2 sm:p-3 rounded-xl group-hover:bg-green-500/20 transition-colors flex-shrink-0">
                          <Icons.Check className="w-4 h-4 sm:w-6 sm:h-6 text-green-500" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-bold text-sm sm:text-lg truncate">
                            {workoutName}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Icons.Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              {format(new Date(workout.clockIn), 'MMM dd, yyyy')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icons.Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                              {workout.durationMinutes} min
                            </span>
                          </div>
                        </div>
                        
                        {/* Status & Arrow */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {workout.isWorkoutFinished && (
                            <>
                              {/* Desktop badge */}
                              <div className="flex badge bg-green-500/10 text-green-500 border border-green-500/30">
                                <Icons.Check className="w-4 h-4 mr-1" />
                                Completed
                              </div>
                 
                            </>
                          )}
                          <Icons.ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  );
}