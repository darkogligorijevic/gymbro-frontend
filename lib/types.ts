export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  BICEPS = 'biceps',
  TRICEPS = 'triceps',
  LEGS = 'legs',
  GLUTES = 'glutes',
  CORE = 'core',
  CARDIO = 'cardio',
  FULL_BODY = 'full_body',
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  muscleGroup: MuscleGroup;
  videoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateSet {
  id?: string;
  setNumber: number;
  targetWeight: number;
  targetReps: number;
}

export interface TemplateExercise {
  id?: string;
  exerciseId: string;
  exercise?: Exercise;
  orderIndex: number;
  notes?: string;
  sets: TemplateSet[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  userId: string;
  exercises: TemplateExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface SessionSet {
  id: string;
  setNumber: number;
  targetWeight: number;
  targetReps: number;
  actualReps?: number;
  isCompleted: boolean;
}

export interface SessionExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  orderIndex: number;
  status: 'not_started' | 'in_progress' | 'finished';
  notes?: string;
  sets: SessionSet[];
}

export interface WorkoutSession {
  id: string;
  userId: string;
  workoutTemplateId?: string;
  workoutTemplate?: WorkoutTemplate;
  clockIn: string;
  clockOut?: string;
  isWorkoutFinished: boolean;
  durationMinutes?: number;
  exercises: SessionExercise[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}