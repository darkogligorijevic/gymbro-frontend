'use client';
import { create } from 'zustand';
import { exercisesApi } from '@/lib/api';
import type { Exercise, MuscleGroup } from '@/lib/types';

interface ExercisesState {
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  fetchExercises: (muscleGroup?: MuscleGroup) => Promise<void>;
  seedExercises: () => Promise<void>;
}

export const useExercises = create<ExercisesState>((set) => ({
  exercises: [],
  isLoading: false,
  error: null,

  fetchExercises: async (muscleGroup?: MuscleGroup) => {
    set({ isLoading: true, error: null });
    try {
      const response = await exercisesApi.getAll(muscleGroup);
      set({ exercises: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  seedExercises: async () => {
    try {
      await exercisesApi.seed();
    } catch (error) {
      console.error('Seed failed:', error);
    }
  },
}));