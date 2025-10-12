'use client';
import { create } from 'zustand';
import { workoutApi } from '@/lib/api';
import type { WorkoutSession } from '@/lib/types';

interface WorkoutState {
  activeWorkout: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  isLoading: boolean;
  error: string | null;
  startWorkout: (templateId: string) => Promise<void>;
  getActiveWorkout: () => Promise<void>;
  completeSet: (sessionId: string, setId: string, reps: number) => Promise<void>;
  finishWorkout: (sessionId: string) => Promise<void>;
  fetchHistory: () => Promise<void>;
}

export const useWorkout = create<WorkoutState>((set, get) => ({
  activeWorkout: null,
  workoutHistory: [],
  isLoading: false,
  error: null,

  startWorkout: async (templateId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutApi.start(templateId);
      set({ activeWorkout: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || error.message, isLoading: false });
      throw error;
    }
  },

  getActiveWorkout: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await workoutApi.getActive();
      set({ activeWorkout: response.data, isLoading: false });
    } catch (error: any) {
      if (error.response?.status !== 404) {
        set({ error: error.message, isLoading: false });
      } else {
        set({ activeWorkout: null, isLoading: false });
      }
    }
  },

  completeSet: async (sessionId: string, setId: string, reps: number) => {
    set({ isLoading: true });
    try {
      const response = await workoutApi.completeSet(sessionId, setId, reps);
      set({ activeWorkout: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  finishWorkout: async (sessionId: string) => {
    set({ isLoading: true });
    try {
      await workoutApi.finish(sessionId);
      set({ activeWorkout: null, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  fetchHistory: async () => {
    try {
      const response = await workoutApi.getAll();
      set({ workoutHistory: response.data });
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));