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
  startOfDay,
  subDays,
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
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { BicepsFlexed, Captions, Flame } from "lucide-react";

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

  // Personal Records with exercise ID
  const personalRecords = useMemo(() => {
    const prMap = new Map<
      string,
      { weight: number; date: string; sessionId: string; exerciseId: string; exerciseName: string }
    >();

    workoutHistory.forEach((session) => {
      session.exercises.forEach((exercise) => {
        exercise.sets.forEach((set) => {
          if (!set?.isCompleted) return;

          const w = Number(set.actualWeight ?? 0);
          if (w <= 0) return;

          const key = exercise.exercise.name;
          const current = prMap.get(key);

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
              exerciseId: exercise.exerciseId,
              exerciseName: exercise.exercise.name,
            });
          }
        });
      });
    });

    return Array.from(prMap.values())
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5);
  }, [workoutHistory]);

  // Most Frequent Exercises with exercise ID
  const mostFrequentExercises = useMemo(() => {
    const exerciseCount = new Map<string, { count: number; name: string; exerciseId: string }>();

    workoutHistory.forEach((session) => {
      session.exercises.forEach((exercise) => {
        const name = exercise.exercise.name;
        const id = exercise.exerciseId;
        const current = exerciseCount.get(id);

        if (current) {
          current.count++;
        } else {
          exerciseCount.set(id, { count: 1, name, exerciseId: id });
        }
      });
    });

    return Array.from(exerciseCount.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [workoutHistory]);

  // Weekly Progress Data
  const weeklyWorkouts = useMemo(() => {
    const weeks: { week: string; workouts: number; volume: number; sets: number }[] = [];
    const now = new Date();

    for (let i = 7; i >= 0; i--) {
      const weekStart = startOfWeek(subMonths(now, 0));
      weekStart.setDate(weekStart.getDate() - i * 7);
      const weekEnd = endOfWeek(weekStart);

      const workoutsInWeek = workoutHistory.filter((w) => {
        const date = new Date(w.clockIn);
        return date >= weekStart && date <= weekEnd;
      });

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

      const totalSets = workoutsInWeek.reduce((sum, workout) => {
        return sum + workout.exercises.reduce((exSum, ex) => {
          return exSum + ex.sets.filter(s => s.isCompleted).length;
        }, 0);
      }, 0);

      weeks.push({
        week: format(weekStart, "MMM dd"),
        workouts: workoutsInWeek.length,
        volume: Math.round(volume),
        sets: totalSets,
      });
    }

    return weeks;
  }, [workoutHistory]);

  // Daily Activity (Last 30 days)
  const dailyActivity = useMemo(() => {
    const days = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const day = startOfDay(subDays(now, i));
      const dayWorkouts = workoutHistory.filter(w => 
        isSameDay(new Date(w.clockIn), day)
      );
      
      const totalVolume = dayWorkouts.reduce((sum, workout) => {
        return sum + workout.exercises.reduce((exSum, ex) => {
          return exSum + ex.sets.reduce((setSum, set) => {
            return setSum + (set.actualWeight || 0) * (set.actualReps || 0);
          }, 0);
        }, 0);
      }, 0);

      days.push({
        date: format(day, "MMM dd"),
        volume: Math.round(totalVolume),
        workouts: dayWorkouts.length,
      });
    }
    
    return days;
  }, [workoutHistory]);

  // Muscle Group Distribution
  const muscleGroupData = useMemo(() => {
    const muscleGroups = new Map<string, number>();

    workoutHistory.forEach((session) => {
      session.exercises.forEach((exercise) => {
        const group = exercise.exercise.muscleGroup;
        muscleGroups.set(group, (muscleGroups.get(group) || 0) + 1);
      });
    });

    return Array.from(muscleGroups.entries())
      .map(([name, value]) => ({ 
        name: name.replace('_', ' ').charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
        value 
      }))
      .sort((a, b) => b.value - a.value);
  }, [workoutHistory]);

  // Workout Intensity Analysis
  const intensityData = useMemo(() => {
    const last10Workouts = workoutHistory.slice(0, 10).reverse();
    
    return last10Workouts.map((workout, index) => {
      const totalSets = workout.exercises.reduce((sum, ex) => 
        sum + ex.sets.filter(s => s.isCompleted).length, 0
      );
      
      const totalVolume = workout.exercises.reduce((sum, ex) => 
        sum + ex.sets.reduce((setSum, set) => 
          setSum + (set.actualWeight || 0) * (set.actualReps || 0), 0
        ), 0
      );
      
      const avgWeightPerSet = totalSets > 0 ? totalVolume / totalSets : 0;
      
      return {
        workout: `W${index + 1}`,
        sets: totalSets,
        avgWeight: Math.round(avgWeightPerSet),
        volume: Math.round(totalVolume / 1000), // Convert to tons
        date: format(new Date(workout.clockIn), "MMM dd"),
      };
    });
  }, [workoutHistory]);

  // Workout Consistency (Days with workouts)
  const consistencyData = useMemo(() => {
    const last7Days = [];
    const now = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const day = startOfDay(subDays(now, i));
      const hasWorkout = workoutHistory.some(w => 
        isSameDay(new Date(w.clockIn), day)
      );
      
      last7Days.push({
        day: format(day, "EEE"),
        active: hasWorkout ? 1 : 0,
        fullDate: format(day, "MMM dd"),
      });
    }
    
    return last7Days;
  }, [workoutHistory]);

  // Calendar Data
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
      icon: BicepsFlexed,
      color: "from-primary-500 to-orange-500",
      bgColor: "bg-primary-500/10",
      iconColor: "text-primary-500",
      link: "/workouts",
    },
    {
      label: "Templates",
      value: templates.length,
      icon: Captions,
      color: "from-blue-500 to-cyan-500",
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-500",
      link: "/templates",
    },
    {
      label: "This Week",
      value: thisWeekWorkouts,
      icon: Flame,
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

  const COLORS = ['#FF6B35', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-400 border border-primary-500 rounded-lg p-3 shadow-xl">
          <p className="text-white font-bold mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-orange-500 p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-gym-pattern opacity-10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Flame className="w-10 h-10 text-white animate-bounce-slow" />
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

      {/* 30-Day Activity Heatmap */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Icons.Calendar className="w-8 h-8 text-primary-500" />
          <h2 className="text-2xl font-bold text-white">30-Day Activity</h2>
        </div>
        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyActivity}>
              <defs>
                <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#FF6B35" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="volume" 
                stroke="#FF6B35" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorActivity)"
                name="Volume (kg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Workout Intensity & Consistency */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Intensity Analysis */}
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icons.Lightning className="w-7 h-7 text-primary-500" />
            Workout Intensity
          </h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={intensityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="workout" 
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                  width={40}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="sets" fill="#3B82F6" radius={[8, 8, 0, 0]} name="Sets" />
                <Bar dataKey="volume" fill="#FF6B35" radius={[8, 8, 0, 0]} name="Volume (tons)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Consistency */}
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Icons.Fire className="w-7 h-7 text-primary-500" />
            7-Day Consistency
          </h2>
          <div className="w-full h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consistencyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="day" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '11px' }}
                  width={40}
                  domain={[0, 1]}
                  ticks={[0, 1]}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="active" 
                  fill="#10B981" 
                  radius={[8, 8, 0, 0]} 
                  name="Workout Done"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">
              {consistencyData.filter(d => d.active === 1).length} of 7 days active this week
            </p>
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Icons.Target className="w-8 h-8 text-primary-500" />
          <h2 className="text-2xl font-bold text-white">8-Week Progress</h2>
        </div>
        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyWorkouts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="week" 
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
              />
              <YAxis 
                yAxisId="left"
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                width={50}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#9ca3af"
                style={{ fontSize: '11px' }}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="volume" 
                stroke="#FF6B35" 
                strokeWidth={3}
                name="Volume (kg)"
                dot={{ fill: '#FF6B35', r: 4 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="sets" 
                stroke="#10B981" 
                strokeWidth={3}
                name="Sets"
                dot={{ fill: '#10B981', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Muscle Group Distribution */}
      {muscleGroupData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Icons.Target className="w-7 h-7 text-primary-500" />
              Muscle Group Focus
            </h2>
            <div className="w-full h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={muscleGroupData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(Number(percent) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {muscleGroupData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Icons.Dumbbell className="w-7 h-7 text-primary-500" />
              Muscle Group Breakdown
            </h2>
            <div className="space-y-3">
              {muscleGroupData.map((group, idx) => {
                const total = muscleGroupData.reduce((sum, g) => sum + g.value, 0);
                const percentage = ((group.value / total) * 100).toFixed(1);
                
                return (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-semibold">{group.name}</span>
                      <span className="text-gray-400">{group.value} exercises ({percentage}%)</span>
                    </div>
                    <div className="h-3 bg-dark-300 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: COLORS[idx % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

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
                <Link
                  key={pr.exerciseId}
                  href={`/exercises/${pr.exerciseId}`}
                  className="bg-dark-300 hover:bg-dark-200 p-4 rounded-xl transition-all cursor-pointer group block"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-bold text-lg group-hover:text-primary-500 transition-colors">
                        {pr.exerciseName}
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
                </Link>
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
                <Link
                  key={exercise.exerciseId}
                  href={`/exercises/${exercise.exerciseId}`}
                  className="bg-dark-300 hover:bg-dark-200 p-4 rounded-xl transition-all cursor-pointer group block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center font-bold text-primary-500">
                        {idx + 1}
                      </div>
                      <span className="text-white font-semibold group-hover:text-primary-500 transition-colors">
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
                </Link>
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
                <div className="flex items-start gap-3 sm:items-center">
                  <div className="bg-primary-500/10 p-2 sm:p-3 rounded-xl group-hover:bg-primary-500/20 transition-colors flex-shrink-0">
                    <Icons.Check className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />
                  </div>

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

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {workout.isWorkoutFinished && (
                      <div className="hidden sm:flex badge sm:bg-green-500/10 sm:text-green-500 sm:border sm:border-green-500/30">
                        <Icons.Check className="hidden w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Completed</span>
                      </div>
                    )}
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