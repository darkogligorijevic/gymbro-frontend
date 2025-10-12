'use client';
import { useEffect, useState } from 'react';
import { useWorkout } from '@/hooks/useWorkout';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

export default function WorkoutPage() {
  const router = useRouter();
  const {
    activeWorkout,
    workoutHistory,
    getActiveWorkout,
    fetchHistory,
    completeSet,
    finishWorkout,
    isLoading,
  } = useWorkout();
  const [repsInput, setRepsInput] = useState<{ [key: string]: number }>({});
  const [wasActive, setWasActive] = useState(false);

  useEffect(() => {
    getActiveWorkout();
    fetchHistory();
    
    // Poll every 5 seconds to check if workout finished automatically
    const interval = setInterval(() => {
      if (activeWorkout && !activeWorkout.isWorkoutFinished) {
        getActiveWorkout();
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Detect when workout automatically finishes
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

  const handleCompleteSet = async (setId: string) => {
    if (!activeWorkout) return;
    const reps = repsInput[setId] || 0;
    if (reps <= 0) {
      alert('Please enter reps');
      return;
    }
    try {
      await completeSet(activeWorkout.id, setId, reps);
      setRepsInput({ ...repsInput, [setId]: 0 });
    } catch (error) {
      alert('Failed to complete set');
    }
  };

  const handleFinishWorkout = async () => {
    if (!activeWorkout) return;
    
    // Proveri da li je trening već završen
    if (activeWorkout.isWorkoutFinished) {
      alert('This workout is already finished!');
      await getActiveWorkout(); // Refresh stanja
      return;
    }
    
    if (confirm('Are you sure you want to finish this workout?')) {
      try {
        await finishWorkout(activeWorkout.id);
        alert('Workout completed! Great job! 💪');
        await fetchHistory(); // Refresh history
        router.push('/dashboard');
      } catch (error: any) {
        console.error('Finish workout error:', error);
        const errorMsg = error.response?.data?.message || 'Failed to finish workout';
        alert(errorMsg);
        // Refresh da vidimo trenutno stanje
        await getActiveWorkout();
      }
    }
  };

  const getElapsedTime = () => {
    if (!activeWorkout || !activeWorkout.clockIn) return '0m';
    const now = new Date();
    const start = new Date(activeWorkout.clockIn);
    const diff = Math.floor((now.getTime() - start.getTime()) / 60000);
    return `${diff}m`;
  };

  const currentExercise = activeWorkout?.exercises?.find(
    (ex) => ex.status === 'in_progress'
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-white">Workout</h1>

      {activeWorkout ? (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-primary to-orange-600 p-6 rounded-lg text-white">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold">
                  {activeWorkout.workoutTemplate?.name || 'Active Workout'}
                </h2>
                <p className="text-white/80 mt-1">
                  Started {format(new Date(activeWorkout.clockIn), 'h:mm a')}
                </p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold">{getElapsedTime()}</div>
                <div className="text-sm text-white/80">elapsed</div>
              </div>
            </div>
            {!activeWorkout.isWorkoutFinished && (
              <div className="flex gap-4">
                <button
                  onClick={handleFinishWorkout}
                  disabled={isLoading}
                  className="bg-white text-primary px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                >
                  Finish Workout
                </button>
              </div>
            )}
            {activeWorkout.isWorkoutFinished && (
              <div className="bg-green-500 text-white px-6 py-2 rounded-lg font-semibold inline-block">
                ✓ Workout Completed
              </div>
            )}
          </div>

          {currentExercise && (
            <div className="bg-gray-800 p-6 rounded-lg border-2 border-primary">
              <h3 className="text-2xl font-bold text-white mb-2">
                Current: {currentExercise?.exercise?.name || 'Exercise'}
              </h3>
              {currentExercise?.notes && (
                <p className="text-gray-400 mb-4">📝 {currentExercise.notes}</p>
              )}
              <div className="space-y-3">
                {currentExercise?.sets?.map((set) => (
                  <div
                    key={set.id}
                    className={`flex items-center gap-4 p-4 rounded-lg ${
                      set.isCompleted
                        ? 'bg-green-900/30 border-2 border-green-500'
                        : 'bg-gray-700'
                    }`}
                  >
                    <div className="flex-shrink-0 w-20">
                      <span className="text-gray-300 font-semibold">
                        Set {set.setNumber}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-white">
                        {set.targetWeight} kg × {set.targetReps} reps
                      </div>
                    </div>
                    {!set.isCompleted ? (
                      <div className="flex gap-2 items-center">
                        <input
                          type="number"
                          value={repsInput[set.id] || ''}
                          onChange={(e) =>
                            setRepsInput({
                              ...repsInput,
                              [set.id]: parseInt(e.target.value) || 0,
                            })
                          }
                          className="w-20 px-3 py-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-primary focus:outline-none"
                          placeholder="Reps"
                          min="0"
                        />
                        <button
                          onClick={() => handleCompleteSet(set.id)}
                          disabled={isLoading}
                          className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
                        >
                          ✓
                        </button>
                      </div>
                    ) : (
                      <div className="text-green-500 font-semibold">
                        ✓ {set.actualReps} reps
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-xl font-bold text-white">All Exercises</h3>
            {activeWorkout.exercises?.map((exercise, index) => (
              <div
                key={exercise.id}
                className={`bg-gray-800 p-4 rounded-lg ${
                  exercise.status === 'in_progress'
                    ? 'border-2 border-primary'
                    : exercise.status === 'finished'
                    ? 'opacity-60'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-white font-semibold">
                      {index + 1}. {exercise.exercise.name}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {exercise.sets.length} sets •{' '}
                      {exercise.sets.filter((s) => s.isCompleted).length}{' '}
                      completed
                    </p>
                  </div>
                  <div>
                    {exercise.status === 'finished' && (
                      <span className="text-green-500">✓ Done</span>
                    )}
                    {exercise.status === 'in_progress' && (
                      <span className="text-primary">● Active</span>
                    )}
                    {exercise.status === 'not_started' && (
                      <span className="text-gray-500">Waiting</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-6">No active workout</p>
          <button
            onClick={() => router.push('/templates')}
            className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg transition"
          >
            Start a Workout
          </button>
        </div>
      )}

      {workoutHistory.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-white mb-4">Recent History</h2>
          <div className="space-y-3">
            {workoutHistory.slice(0, 10).map((workout) => (
              <div
                key={workout.id}
                className="bg-gray-800 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <h3 className="text-white font-semibold">
                    {workout.workoutTemplate?.name || 'Custom Workout'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {format(new Date(workout.clockIn), 'MMM dd, yyyy • h:mm a')}{' '}
                    • {workout.durationMinutes} min
                  </p>
                </div>
                {workout.isWorkoutFinished && (
                  <span className="text-green-500">✓ Completed</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}