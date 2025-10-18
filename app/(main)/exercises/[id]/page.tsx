"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useExercises } from "@/hooks/useExercises";
import { useWorkout } from "@/hooks/useWorkout";
import { Icons } from "@/components/Icons";
import { MuscleGroup } from "@/lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

const muscleGroupConfig: Record<MuscleGroup, { label: string; color: string }> =
  {
    [MuscleGroup.CHEST]: { label: "Chest", color: "from-red-500 to-pink-500" },
    [MuscleGroup.BACK]: { label: "Back", color: "from-blue-500 to-cyan-500" },
    [MuscleGroup.SHOULDERS]: {
      label: "Shoulders",
      color: "from-orange-500 to-yellow-500",
    },
    [MuscleGroup.BICEPS]: {
      label: "Biceps",
      color: "from-purple-500 to-pink-500",
    },
    [MuscleGroup.TRICEPS]: {
      label: "Triceps",
      color: "from-green-500 to-emerald-500",
    },
    [MuscleGroup.LEGS]: {
      label: "Legs",
      color: "from-indigo-500 to-purple-500",
    },
    [MuscleGroup.GLUTES]: {
      label: "Glutes",
      color: "from-pink-500 to-rose-500",
    },
    [MuscleGroup.CORE]: {
      label: "Core",
      color: "from-yellow-500 to-orange-500",
    },
    [MuscleGroup.CARDIO]: {
      label: "Cardio",
      color: "from-cyan-500 to-blue-500",
    },
    [MuscleGroup.FULL_BODY]: {
      label: "Full Body",
      color: "from-primary-500 to-orange-500",
    },
  };

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

const formatShortDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatFullDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ExerciseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const exerciseId = params.id as string;
  const { currentExercise, fetchExercise, isLoading } = useExercises();
  const { workoutHistory, fetchHistory } = useWorkout();
  const [stats, setStats] = useState({
    personalRecord: { weight: 0, reps: 0, date: "" },
    totalSets: 0,
    totalReps: 0,
    totalVolume: 0,
    timesUsed: 0,
    lastUsed: "",
    avgWeight: 0,
    avgReps: 0,
  });

  useEffect(() => {
    fetchExercise(exerciseId);
    fetchHistory();
  }, [exerciseId]);

  useEffect(() => {
    if (currentExercise && workoutHistory.length > 0) {
      calculateStats();
    }
  }, [currentExercise, workoutHistory]);

  const calculateStats = () => {
    if (!currentExercise) return;

    let pr = { weight: 0, reps: 0, date: "" };
    let totalSets = 0;
    let totalReps = 0;
    let totalVolume = 0;
    let workoutsWithExercise = 0;
    let lastUsedDate = "";
    let allWeights: number[] = [];
    let allRepsCount: number[] = [];

    workoutHistory.forEach((session) => {
      const exerciseInSession = session.exercises.find(
        (ex) => ex.exerciseId === currentExercise.id
      );

      if (exerciseInSession) {
        workoutsWithExercise++;
        if (!lastUsedDate) {
          lastUsedDate = session.clockIn;
        }

        exerciseInSession.sets.forEach((set) => {
          if (set.isCompleted && set.actualReps && set.actualWeight != null) {
            const weight = Number(set.actualWeight);
            const reps = Number(set.actualReps);

            totalSets++;
            totalReps += reps;
            const volume = weight * reps;
            totalVolume += volume;
            allWeights.push(weight);
            allRepsCount.push(reps);

            // PR je najveća težina ikada podignuta
            if (weight > pr.weight) {
              pr = {
                weight: weight,
                reps: reps,
                date: session.clockIn,
              };
            }
          }
        });
      }
    });

    const avgWeight =
      allWeights.length > 0
        ? allWeights.reduce((a, b) => a + b, 0) / allWeights.length
        : 0;

    const avgReps =
      allRepsCount.length > 0
        ? allRepsCount.reduce((a, b) => a + b, 0) / allRepsCount.length
        : 0;

    setStats({
      personalRecord: pr,
      totalSets,
      totalReps,
      totalVolume,
      timesUsed: workoutsWithExercise,
      lastUsed: lastUsedDate,
      avgWeight: Math.round(avgWeight * 10) / 10,
      avgReps: Math.round(avgReps * 10) / 10,
    });
  };

  if (isLoading || !currentExercise) {
    return (
      <div className="space-y-8">
        <div className="card loading-shimmer h-64"></div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card loading-shimmer h-32"></div>
          ))}
        </div>
      </div>
    );
  }

  const config = muscleGroupConfig[currentExercise.muscleGroup];
  const recentWorkouts = workoutHistory
    .filter((session) =>
      session.exercises.some((ex) => ex.exerciseId === currentExercise.id)
    )
    .slice(0, 10);

  // Prepare chart data
  const chartData = recentWorkouts
    .slice()
    .reverse()
    .map((session) => {
      const exerciseInSession = session.exercises.find(
        (ex) => ex.exerciseId === currentExercise.id
      );
      if (!exerciseInSession) return null;

      const completedSets = exerciseInSession.sets.filter((s) => s.isCompleted);
      if (completedSets.length === 0) return null;

      const maxWeight = Math.max(...completedSets.map((s) => s.actualWeight || 0));
      
      return {
        date: formatShortDate(session.clockIn),
        weight: maxWeight,
        fullDate: formatFullDate(session.clockIn),
      };
    })
    .filter((d): d is { date: string; weight: number; fullDate: string } => d !== null && d.weight > 0);

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-400 border border-primary-500 rounded-lg p-3 shadow-xl">
          <p className="text-white font-bold text-lg">{payload[0].value} kg</p>
          <p className="text-gray-400 text-sm">{payload[0].payload.fullDate}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
      >
        <Icons.ArrowLeft className="w-5 h-5" />
        <span>Back to Exercises</span>
      </button>

      <div className="card">
        <div className="flex flex-col md:flex-row gap-6">
          {currentExercise.videoUrl && (
            <div className="md:w-1/3">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-dark-300">
                <img
                  src={currentExercise.videoUrl}
                  alt={currentExercise.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {currentExercise.name}
                </h1>
                <div
                  className={`inline-block badge bg-gradient-to-r ${config.color} text-white border-0 text-sm`}
                >
                  {config.label}
                </div>
              </div>
              <Icons.Dumbbell className="w-12 h-12 text-primary-500" />
            </div>

            <p className="text-gray-300 text-lg leading-relaxed">
              {currentExercise.description ||
                "No description available for this exercise."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-gradient-to-br from-primary-600 to-orange-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <Icons.Trophy className="w-8 h-8" />
            <span className="text-sm font-semibold opacity-90">
              Personal Record
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">
            {stats.personalRecord.weight > 0 ? (
              <>
                {stats.personalRecord.weight} kg
                <span className="text-lg ml-2">
                  × {stats.personalRecord.reps}
                </span>
              </>
            ) : (
              <span className="text-xl">No data yet</span>
            )}
          </div>
          {stats.personalRecord.date && (
            <div className="text-sm opacity-75">
              {formatFullDate(stats.personalRecord.date)}
            </div>
          )}
        </div>

        <div className="card bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <Icons.Target className="w-8 h-8" />
            <span className="text-sm font-semibold opacity-90">
              Total Volume
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">
            {stats.totalVolume.toLocaleString()} kg
          </div>
          <div className="text-sm opacity-75">
            {stats.totalSets} sets · {stats.totalReps} reps
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <Icons.Calendar className="w-8 h-8" />
            <span className="text-sm font-semibold opacity-90">Frequency</span>
          </div>
          <div className="text-3xl font-bold mb-1">{stats.timesUsed}x</div>
          <div className="text-sm opacity-75">
            {stats.lastUsed ? (
              <>Last used {formatShortDate(stats.lastUsed)}</>
            ) : (
              "Never used"
            )}
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-600 to-emerald-600 text-white">
          <div className="flex items-center justify-between mb-3">
            <Icons.Lightning className="w-8 h-8" />
            <span className="text-sm font-semibold opacity-90">
              Avg Performance
            </span>
          </div>
          <div className="text-3xl font-bold mb-1">
            {stats.avgWeight > 0 ? `${stats.avgWeight} kg` : "No data"}
          </div>
          <div className="text-sm opacity-75">
            {stats.avgReps > 0 ? `${stats.avgReps} reps avg` : ""}
          </div>
        </div>
      </div>

      {stats.totalSets > 0 && recentWorkouts.length > 0 && (
        <>
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Icons.Fire className="w-7 h-7 text-primary-500" />
              Volume Progression Chart
            </h2>

            {(() => {
              const volumeData = recentWorkouts
                .slice()
                .reverse()
                .map((session) => {
                  const exerciseInSession = session.exercises.find(
                    (ex) => ex.exerciseId === currentExercise.id
                  );
                  if (!exerciseInSession) return null;

                  const completedSets = exerciseInSession.sets.filter(
                    (s) => s.isCompleted
                  );
                  const totalVolume = completedSets.reduce(
                    (sum, set) =>
                      sum +
                      (Number(set.actualWeight) || 0) *
                        (Number(set.actualReps) || 0),
                    0
                  );

                  return {
                    date: formatShortDate(session.clockIn),
                    volume: totalVolume,
                    fullDate: formatFullDate(session.clockIn),
                  };
                })
                .filter(
                  (d): d is { date: string; volume: number; fullDate: string } =>
                    d !== null && d.volume > 0
                );

              const CustomVolumeTooltip = ({ active, payload }: any) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-dark-400 border border-primary-500 rounded-lg p-3 shadow-xl">
                      <p className="text-white font-bold text-lg">{payload[0].value.toLocaleString()} kg</p>
                      <p className="text-gray-400 text-sm">{payload[0].payload.fullDate}</p>
                    </div>
                  );
                }
                return null;
              };

              if (volumeData.length === 0) {
                return (
                  <div className="text-center py-8 text-gray-400">
                    Not enough data to display chart
                  </div>
                );
              }

              return (
                <>
                  <div className="w-full h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={volumeData}>
                        <defs>
                          <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis 
                          dataKey="date" 
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                        />
                        <YAxis 
                          stroke="#9ca3af"
                          style={{ fontSize: '12px' }}
                          label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                        />
                        <Tooltip content={<CustomVolumeTooltip />} />
                        <Area 
                          type="monotone" 
                          dataKey="volume" 
                          stroke="#f97316" 
                          strokeWidth={3}
                          fillOpacity={1} 
                          fill="url(#colorVolume)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-gradient-to-r from-primary-600 to-orange-500"></div>
                      <span className="text-gray-400">Total Volume per Workout</span>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Icons.Trophy className="w-7 h-7 text-primary-500" />
              Max Weight Progression
            </h2>

            {chartData.length > 0 ? (
              <div className="w-full h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="#9ca3af"
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', fill: '#9ca3af' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#f97316" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorWeight)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                Not enough data to display chart
              </div>
            )}

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.personalRecord.weight} kg
                </div>
                <div className="text-sm text-gray-400">All-Time PR</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.avgWeight} kg
                </div>
                <div className="text-sm text-gray-400">Average Weight</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.avgReps}
                </div>
                <div className="text-sm text-gray-400">Average Reps</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">
                  {stats.timesUsed}
                </div>
                <div className="text-sm text-gray-400">Workouts</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Icons.Calendar className="w-7 h-7 text-primary-500" />
              Recent Workout History
            </h2>

            <div className="space-y-4">
              {recentWorkouts.slice(0, 5).map((session) => {
                const exerciseInSession = session.exercises.find(
                  (ex) => ex.exerciseId === currentExercise.id
                );

                if (!exerciseInSession) return null;

                const completedSets = exerciseInSession.sets.filter(
                  (s) => s.isCompleted
                );
                if (completedSets.length === 0) return null;

                const maxWeight = Math.max(
                  ...completedSets.map((s) => s.actualWeight || 0)
                );
                const totalVolume = completedSets.reduce(
                  (sum, set) =>
                    sum + (set.actualWeight || 0) * (set.actualReps || 0),
                  0
                );

                return (
                  <div key={session.id} className="p-4 bg-dark-300 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="text-white font-semibold">
                          {formatDate(session.clockIn)}
                        </div>
                        <div className="text-sm text-gray-400">
                          {session.workoutTemplate?.name || "Custom Workout"}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-primary-500 font-bold text-lg">
                          {maxWeight} kg
                        </div>
                        <div className="text-sm text-gray-400">
                          {totalVolume.toLocaleString()} kg total
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {completedSets.map((set) => (
                        <div
                          key={set.id}
                          className="px-3 py-2 bg-dark-400 rounded-lg text-center"
                        >
                          <div className="text-xs text-gray-400 mb-1">
                            Set {set.setNumber}
                          </div>
                          <div className="text-white font-semibold">
                            {set.actualWeight} kg × {set.actualReps}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {stats.totalSets === 0 && (
        <div className="card text-center py-12">
          <Icons.AlertCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg">
            No workout history with this exercise yet.
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Start a workout to track your progress!
          </p>
        </div>
      )}

      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Icons.Target className="w-7 h-7 text-primary-500" />
          Muscle Groups Targeted
        </h2>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-6 bg-gradient-to-br from-primary-500/20 to-orange-500/20 rounded-xl border border-primary-500/30">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`w-12 h-12 rounded-lg bg-gradient-to-r ${config.color} flex items-center justify-center`}
              >
                <Icons.Fire className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Primary Target</div>
                <div className="text-xl font-bold text-white">
                  {config.label}
                </div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              Main muscle group worked during this exercise
            </p>
          </div>

          <div className="p-6 bg-dark-300 rounded-xl border border-dark-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-lg bg-dark-400 flex items-center justify-center">
                <Icons.Dumbbell className="w-6 h-6 text-gray-500" />
              </div>
              <div>
                <div className="text-sm text-gray-400">Secondary Muscles</div>
                <div className="text-xl font-bold text-white">Coming Soon</div>
              </div>
            </div>
            <p className="text-gray-400 text-sm">
              Additional muscle groups engaged during this exercise
            </p>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Icons.FileText className="w-7 h-7 text-primary-500" />
          Exercise Tips
        </h2>

        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
              <Icons.Check className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Proper Form</h3>
              <p className="text-gray-400 text-sm">
                Focus on controlled movements and maintain proper form
                throughout each rep to maximize effectiveness and prevent
                injury.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
              <Icons.Clock className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">Rest Periods</h3>
              <p className="text-gray-400 text-sm">
                Allow 60-90 seconds of rest between sets for optimal recovery
                and performance.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-500/20 flex items-center justify-center">
              <Icons.Lightning className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <h3 className="text-white font-semibold mb-1">
                Progressive Overload
              </h3>
              <p className="text-gray-400 text-sm">
                Gradually increase weight or reps over time to continue making
                progress and building strength.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}