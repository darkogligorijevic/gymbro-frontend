'use client';
import { create } from 'zustand';
import { templatesApi } from '@/lib/api';
import type { WorkoutTemplate } from '@/lib/types';

interface TemplatesState {
  templates: WorkoutTemplate[];
  currentTemplate: WorkoutTemplate | null;
  isLoading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  fetchTemplate: (id: string) => Promise<void>;
  createTemplate: (data: any) => Promise<WorkoutTemplate>;
  deleteTemplate: (id: string) => Promise<void>;
}

export const useTemplates = create<TemplatesState>((set) => ({
  templates: [],
  currentTemplate: null,
  isLoading: false,
  error: null,

  fetchTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesApi.getAll();
      set({ templates: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  fetchTemplate: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesApi.getOne(id);
      set({ currentTemplate: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  createTemplate: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await templatesApi.create(data);
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteTemplate: async (id: string) => {
    try {
      await templatesApi.delete(id);
      set((state) => ({
        templates: state.templates.filter((t) => t.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },
}));