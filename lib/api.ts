import axios from 'axios';
import type { 
  AuthResponse, 
  Exercise, 
  WorkoutTemplate, 
  WorkoutSession 
} from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor za dodavanje tokena
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authApi = {
  register: (data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }) => api.post<AuthResponse>('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data),
  
  getProfile: () => api.get('/auth/profile'),
};

// Exercises API
export const exercisesApi = {
  getAll: (muscleGroup?: string) =>
    api.get<Exercise[]>('/exercises', { params: { muscleGroup } }),
  
  getOne: (id: string) => api.get<Exercise>(`/exercises/${id}`),
  
  create: (data: Partial<Exercise>) => api.post<Exercise>('/exercises', data),
  
  update: (id: string, data: Partial<Exercise>) =>
    api.patch<Exercise>(`/exercises/${id}`, data),
  
  delete: (id: string) => api.delete(`/exercises/${id}`),
  
  seed: () => api.post('/exercises/seed'),
};

// Templates API
export const templatesApi = {
  getAll: () => api.get<WorkoutTemplate[]>('/workout-templates'),
  
  getOne: (id: string) => api.get<WorkoutTemplate>(`/workout-templates/${id}`),
  
  create: (data: any) => api.post<WorkoutTemplate>('/workout-templates', data),
  
  update: (id: string, data: any) =>
    api.patch<WorkoutTemplate>(`/workout-templates/${id}`, data),
  
  delete: (id: string) => api.delete(`/workout-templates/${id}`),
};

// Workout Sessions API
export const workoutApi = {
  start: (workoutTemplateId: string) =>
    api.post<WorkoutSession>('/workout-sessions/start', { workoutTemplateId }),
  
  getActive: () => api.get<WorkoutSession>('/workout-sessions/active'),
  
  getAll: () => api.get<WorkoutSession[]>('/workout-sessions'),
  
  getOne: (id: string) => api.get<WorkoutSession>(`/workout-sessions/${id}`),
  
  completeSet: (sessionId: string, setId: string, actualReps: number) =>
    api.patch<WorkoutSession>(`/workout-sessions/${sessionId}/complete-set`, {
      setId,
      actualReps,
    }),
  
  finish: (sessionId: string) =>
    api.post<WorkoutSession>(`/workout-sessions/${sessionId}/finish`),
  
  delete: (id: string) => api.delete(`/workout-sessions/${id}`),
};

export default api;
