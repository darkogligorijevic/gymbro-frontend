'use client';
import { create } from 'zustand';
import { exercisesApi } from '@/lib/api';
import type { Exercise, MuscleGroup } from '@/lib/types';

interface ExercisesState {
  exercises: Exercise[];
  currentExercise: Exercise | null;
  isLoading: boolean;
  error: string | null;
  fetchExercises: (muscleGroup?: MuscleGroup) => Promise<void>;
  fetchExercise: (id: string) => Promise<void>;
  createExercise: (data: Partial<Exercise>) => Promise<Exercise>;
  updateExercise: (id: string, data: Partial<Exercise>) => Promise<Exercise>;
  deleteExercise: (id: string) => Promise<void>;
  seedExercises: () => Promise<void>;
}

export const useExercises = create<ExercisesState>((set) => ({
  exercises: [],
  currentExercise: null,
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

  fetchExercise: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await exercisesApi.getOne(id);
      set({ currentExercise: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createExercise: async (data: Partial<Exercise>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await exercisesApi.create(data);
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateExercise: async (id: string, data: Partial<Exercise>) => {
    set({ isLoading: true, error: null });
    try {
      const response = await exercisesApi.update(id, data);
      set({ 
        currentExercise: response.data,
        isLoading: false 
      });
      return response.data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteExercise: async (id: string) => {
    try {
      await exercisesApi.delete(id);
      set((state) => ({
        exercises: state.exercises.filter((e) => e.id !== id),
        currentExercise: state.currentExercise?.id === id ? null : state.currentExercise,
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
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