"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useWorkout } from "@/hooks/useWorkout";
import { useTemplates } from "@/hooks/useTemplates";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  subMonths,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { Icons } from "@/components/Icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { activeWorkout, workoutHistory, getActiveWorkout, fetchHistory } =
    useWorkout();
  const { templates, fetchTemplates } = useTemplates();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  useEffect(() => {
    getActiveWorkout();
    fetchHistory();
    fetchTemplates();
  }, []);

  const thisWeekWorkouts = workoutHistory.filter((w) => {
    const date = new Date(w.clockIn);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  }).length;

  // Funkcija za pronalaženje PRova
  // PR-ovi: najveća podignuta kilaža po vežbi (reps se ignorišu)
  const personalRecords = useMemo(() => {
    const prMap = new Map<
      string,
      { weight: number; date: string; sessionId: string }
    >();

    workoutHistory.forEach((session) => {
      session.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (!set?.isCompleted) return;

          const w = Number(set.actualWeight ?? 0);
          if (w <= 0) return;

          const key = exercise.exercise.name; // po potrebi: .trim().toLowerCase()
          const current = prMap.get(key);

          // Ako je kilaža veća — ili ista ali je sesija novija — ažuriraj PR
          if (
            !current ||
            w > current.weight ||
            (w === current.weight &&
              new Date(session.clockIn).getTime() >
                new Date(current.date).getTime())
          ) {
            prMap.set(key, {
              weight: w,
              date: session.clockIn,
              sessionId: session.id,
            });
          }
        });
      });
    });

    return Array.from(prMap.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
  }, [workoutHistory]);

  // Najčešće vežbe
  const mostFrequentExercises = useMemo(() => {
    const exerciseCount = new Map<string, { count: number; name: string }>();

    workoutHistory.forEach((session) => {
      session.exercises.forEach((exercise) => {
        const name = exercise.exercise.name;
        const current = exerciseCount.get(exercise.exerciseId);

        if (current) {
          current.count++;
        } else {
          exerciseCount.set(exercise.exerciseId, { count: 1, name });
        }
      });
    });

    return Array.from(exerciseCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [workoutHistory]);

  // Workouts per week (poslednjih 8 nedelja)
  const weeklyWorkouts = useMemo(() => {
    const weeks: { week: string; count: number; volume: number }[] = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subMonths(now, 0));
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = endOfWeek(weekStart);

      const workoutsInWeek = workoutHistory.filter((w) => {
        const date = new Date(w.clockIn);
        return date >= weekStart && date <= weekEnd;
      });

      // Računamo volume (total weight lifted)
      const volume = workoutsInWeek.reduce((sum, workout) => {
        const workoutVolume = workout.exercises.reduce((exSum, ex) => {
          return (
            exSum +
            ex.sets.reduce((setSum, set) => {
              return setSum + (set.actualWeight || 0) * (set.actualReps || 0);
            }, 0)
          );
        }, 0);
        return sum + workoutVolume;
      }, 0);

      weeks.push({
        week: format(weekStart, "MMM dd"),
        count: workoutsInWeek.length,
        volume: Math.round(volume),
      });
    }

    return weeks;
  }, [workoutHistory]);

  // Kalendar podataka
  const calendarData = useMemo(() => {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const workout = workoutHistory.find((w) =>
        isSameDay(new Date(w.clockIn), day)
      );
      return {
        date: day,
        workout,
        hasWorkout: !!workout,
      };
    });
  }, [workoutHistory, selectedMonth]);

  const stats = [
    {
      label: "Total Workouts",
      value: workoutHistory.length,
      icon: Icons.Trophy,
      color: "from-primary-500 to-orange-500",
      bgColor: "bg-primary-500/10",
      iconColor: "text-primary-500",
      link: "/workouts",
    },
    {
      label: "Templates",
      value: templates.length,
      icon: Icons.Target,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      link: "/templates",
    },
    {
      label: "This Week",
      value: thisWeekWorkouts,
      icon: Icons.Fire,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-500",
      link: "/workouts",
    },
  ];

  const getSessionName = (workout: any) => {
    const templateName = workout.workoutTemplate?.name || "Workout";
    const date = format(new Date(workout.clockIn), "MMM dd, yyyy");
    return `${templateName} - ${date}`;
  };

  const maxWeeklyCount = Math.max(...weeklyWorkouts.map((w) => w.count), 1);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-orange-500 p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gym-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Icons.Fire className="w-10 h-10 text-white animate-bounce-slow" />
            <h1 className="text-3xl md:text-5xl font-bold text-white text-shadow">
              Welcome, {user?.firstName || user?.username}!
            </h1>
          </div>
          <p className="text-white/90 text-lg md:text-xl mb-6">
            Ready to crush your goals today? Let's make it count! 💪
          </p>
          {!activeWorkout && (
            <Link
              href="/templates"
              className="inline-flex items-center text-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 shadow-lg w-full md:w-auto"
            >
              <Icons.Lightning className="w-5 h-5" />
              Start New Workout
            </Link>
          )}
        </div>
      </div>

      {/* Active Workout Banner */}
      {activeWorkout && (
        <div className="card bg-gradient-to-r from-green-600 to-emerald-600 border-green-500 animate-glow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="text-white/90 font-semibold">
                  ACTIVE WORKOUT
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                {getSessionName(activeWorkout)}
              </h2>
              <p className="text-white/80">
                Started {format(new Date(activeWorkout.clockIn), "h:mm a")}
              </p>
            </div>
            <Link
              href="/workouts"
              className="btn-primary bg-white text-green-600 hover:bg-gray-100 whitespace-nowrap"
            >
              Continue Workout →
            </Link>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6 justify-center text-center">
        {stats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <Link
              key={idx}
              href={stat.link}
              className="card-hover group py-6 px-8 rounded-2xl overflow-hidden border-gray-900 hover:border-primary-500 transition-all shadow-md hover:shadow-primary-500/20 cursor-pointer"
            >
              <div
                className={`${stat.bgColor} rounded-2xl p-4 mb-4 inline-flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <IconComponent className={`w-8 h-8 ${stat.iconColor}`} />
              </div>
              <h3 className="text-gray-400 text-sm font-semibold mb-2">
                {stat.label}
              </h3>
              <p className="text-5xl font-bold text-white">{stat.value}</p>
            </Link>
          );
        })}
      </div>

      {/* Personal Records & Most Frequent Exercises */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Personal Records */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Icons.Trophy className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-white">Personal Records</h2>
          </div>

          {personalRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No PRs yet. Start lifting! 💪</p>
            </div>
          ) : (
            <div className="space-y-3">
              {personalRecords.map((pr, idx) => (
                <div
                  key={pr.name}
                  onClick={() => router.push(`/workouts/${pr.sessionId}`)}
                  className="bg-dark-300 hover:bg-dark-200 p-4 rounded-xl transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg group-hover:text-primary-500 transition-colors">
                        {pr.name}
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        {format(new Date(pr.date), "MMM dd, yyyy")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl md:text-2xl font-bold text-primary-500">
                        {pr.weight} kg
                      </div>
                    </div>
                  </div>
                  {idx === 0 && (
                    <div className="mt-2 inline-flex items-center gap-1 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold">
                      <Icons.Trophy className="w-3 h-3" />
                      TOP PR
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Frequent Exercises */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <Icons.Fire className="w-8 h-8 text-orange-500" />
            <h2 className="text-2xl font-bold text-white">Most Frequent</h2>
          </div>

          {mostFrequentExercises.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-400">No exercises yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {mostFrequentExercises.map((exercise, idx) => (
                <div key={exercise.name} className="bg-dark-300 p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center font-bold text-primary-500">
                        {idx + 1}
                      </div>
                      <span className="text-white font-semibold">
                        {exercise.name}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        {exercise.count}
                      </div>
                      <div className="text-gray-400 text-xs">sessions</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Calendar */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Icons.Calendar className="w-8 h-8 text-primary-500" />
            <h2 className="text-sm md:text-2xl font-bold text-white">
              Activity Calendar
            </h2>
          </div>
          <div className="flex items-center sm:gap-2">
            <button
              onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))}
              className="pl-2 md:p-2 hover:bg-dark-300 rounded-lg transition"
            >
              <Icons.ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <span className="text-white text-sm md:text-xl font-semibold min-w-28 md:min-w-32 text-center">
              {format(selectedMonth, "MMMM yyyy")}
            </span>
            <button
              onClick={() => setSelectedMonth(new Date())}
              className="px-3 py-1 bg-primary-500/10 text-primary-500 rounded-lg text-sm font-medium hover:bg-primary-500/20 transition"
            >
              Today
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div
              key={day}
              className="text-center text-gray-400 text-sm font-semibold py-2"
            >
              {day}
            </div>
          ))}

          {/* Padding za prvi dan meseca */}
          {Array.from({ length: startOfMonth(selectedMonth).getDay() }).map(
            (_, idx) => (
              <div key={`empty-${idx}`} />
            )
          )}

          {calendarData.map(({ date, workout, hasWorkout }) => {
            const isToday = isSameDay(date, new Date());

            return (
              <div
                key={date.toISOString()}
                onClick={() =>
                  workout && router.push(`/workouts/${workout.id}`)
                }
                className={`
                  aspect-square rounded-lg p-2 transition-all
                  ${
                    hasWorkout
                      ? "bg-green-500/20 hover:bg-green-500/30 cursor-pointer border border-green-500/30"
                      : "bg-dark-300 hover:bg-dark-200"
                  }
                  ${isToday ? "ring-2 ring-primary-500" : ""}
                `}
              >
                <div className="text-white text-sm font-semibold">
                  {format(date, "d")}
                </div>
                {hasWorkout && workout && (
                  <div className="mt-1 hidden md:block">
                    <div className="w-2 h-2 bg-green-500 rounded-full mx-auto" />
                    <div className="text-xs text-green-400 text-center mt-1">
                      {workout.durationMinutes}m
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-4 mt-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
            <span className="text-gray-400">Workout completed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-dark-300" />
            <span className="text-gray-400">Rest day</span>
          </div>
        </div>
      </div>

      {/* Workouts Per Week Chart */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Icons.Target className="w-8 h-8 text-blue-500" />
          <h2 className="text-2xl font-bold text-white">Weekly Progress</h2>
        </div>

        <div className="space-y-4">
          {weeklyWorkouts.map((week) => (
            <div key={week.week}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm font-medium">
                  {week.week}
                </span>
                <div className="flex items-center gap-4">
                  <span className="text-white font-bold">
                    {week.count} workouts
                  </span>
                  <span className="text-gray-400 text-sm">
                    {week.volume.toLocaleString()} kg
                  </span>
                </div>
              </div>
              <div className="relative h-8 bg-dark-300 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary-500 to-orange-500 rounded-lg transition-all"
                  style={{ width: `${(week.count / maxWeeklyCount) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold z-10">
                    {week.count > 0 && `${week.count}x`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href="/templates" className="card-hover group">
          <div className="flex items-center gap-4">
            <div className="bg-primary-500/10 p-4 rounded-2xl group-hover:bg-primary-500/20 transition-colors">
              <Icons.Target className="w-8 h-8 text-primary-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Browse Templates
              </h3>
              <p className="text-gray-400">Start a structured workout</p>
            </div>
            <Icons.ArrowRight className="w-6 h-6 text-gray-400 ml-auto group-hover:text-primary-500 group-hover:translate-x-2 transition-all" />
          </div>
        </Link>

        <Link href="/exercises" className="card-hover group">
          <div className="flex items-center gap-4">
            <div className="bg-blue-500/10 p-4 rounded-2xl group-hover:bg-blue-500/20 transition-colors">
              <Icons.Dumbbell className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">
                Exercise Library
              </h3>
              <p className="text-gray-400">Explore all exercises</p>
            </div>
            <Icons.ArrowRight className="w-6 h-6 text-gray-400 ml-auto group-hover:text-blue-500 group-hover:translate-x-2 transition-all" />
          </div>
        </Link>
      </div>

      {/* Recent Workouts */}
      <div>
        <div className="flex sm:flex-row justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Icons.Calendar className="w-6 h-6 md:w-8 md:h-8 text-primary-500" />
            Recent Workouts
          </h2>
          <Link
            href="/workouts"
            className="text-primary-500 hover:text-primary-400 transition flex items-center gap-2 font-semibold text-sm self-start sm:self-auto"
          >
            View All
            <Icons.ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
          </Link>
        </div>

        {workoutHistory.length === 0 ? (
          <div className="card text-center py-12">
            <Icons.Dumbbell className="w-12 h-12 md:w-16 md:h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-base md:text-lg mb-4">
              No workouts yet
            </p>
            <Link href="/templates" className="btn-primary inline-block">
              Start Your First Workout
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {workoutHistory.slice(0, 5).map((workout) => (
              <div
                key={workout.id}
                onClick={() => router.push(`/workouts/${workout.id}`)}
                className="card hover:border-primary-500/50 transition-all group cursor-pointer p-4"
              >
                {/* Mobile Layout */}
                <div className="flex items-start gap-3 sm:items-center">
                  {/* Icon */}
                  <div className="bg-primary-500/10 p-2 sm:p-3 rounded-xl group-hover:bg-primary-500/20 transition-colors flex-shrink-0">
                    <Icons.Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-bold text-sm sm:text-lg mb-1 truncate">
                      {getSessionName(workout)}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Icons.Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        {format(new Date(workout.clockIn), "MMM dd")}
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
                      <div className="hidden sm:flex badge sm:bg-green-500/10 sm:text-green-500 sm:border sm:border-green-500/30">
                        <Icons.Check className="hidden w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Completed</span>
                      </div>
                    )}
                    {/* Green checkmark for mobile */}
                    {workout.isWorkoutFinished && (
                      <div className="sm:hidden w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center">
                        <Icons.Check className="w-4 h-4 text-green-500" />
                      </div>
                    )}
                    <Icons.ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Motivational Quote */}
      <div className="card bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/30 text-center">
        <Icons.Trophy className="w-12 h-12 text-purple-500 mx-auto mb-4" />
        <p className="text-xl md:text-2xl font-bold text-white mb-2">
          "The only bad workout is the one that didn't happen."
        </p>
        <p className="text-gray-400">Keep pushing forward! 💪</p>
      </div>
    </div>
  );
}
