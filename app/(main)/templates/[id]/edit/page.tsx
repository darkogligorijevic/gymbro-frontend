'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { useTemplates } from '@/hooks/useTemplates';
import { useExercises } from '@/hooks/useExercises';
import { Icons } from '@/components/Icons';
import Link from 'next/link';

interface ExerciseForm {
  exerciseId: string;
  notes: string;
  sets: { targetWeight: number; targetReps: number }[];
}

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { currentTemplate, updateTemplate, fetchTemplate, isLoading: saving } = useTemplates();
  const { exercises, fetchExercises } = useExercises();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercisesForms, setExercisesForms] = useState<ExerciseForm[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const hasProcessedSelection = useRef(false);

  useEffect(() => {
    fetchExercises();
    if (params.id) {
      fetchTemplate(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    if (currentTemplate) {
      setName(currentTemplate.name);
      setDescription(currentTemplate.description || '');
      setExercisesForms(
        currentTemplate.exercises.map((ex) => ({
          exerciseId: ex.exerciseId || ex.exercise?.id || '',
          notes: ex.notes || '',
          sets: ex.sets.map((set) => ({
            targetWeight: set.targetWeight,
            targetReps: set.targetReps,
          })),
        }))
      );
      setLoading(false);
    }
  }, [currentTemplate]);

  // Auto-dodaj vežbe iz URL parametara - SA ZAŠTITOM OD DUPLIKATA
  useEffect(() => {
    const selectedIds = searchParams.get('selected');
    
    // Ako nema parametra ili je već obrađeno ili još učitava template, izađi
    if (!selectedIds || hasProcessedSelection.current || loading) {
      return;
    }
    
    if (exercises.length > 0) {
      // Označi odmah da je u procesu obrade
      hasProcessedSelection.current = true;
      
      const ids = selectedIds.split(',');
      
      // Proveri da li su već dodati
      const existingIds = exercisesForms.map(f => f.exerciseId);
      const newIds = ids.filter(id => !existingIds.includes(id) && exercises.some(ex => ex.id === id));
      
      if (newIds.length > 0) {
        const newExerciseForms: ExerciseForm[] = newIds.map(id => ({
          exerciseId: id,
          notes: '',
          sets: [{ targetWeight: 0, targetReps: 8 }],
        }));
        
        setExercisesForms(prev => [...prev, ...newExerciseForms]);
      }
      
      // Očisti URL
      router.replace(`/templates/${params.id}/edit`, { scroll: false });
    }
  }, [searchParams, exercises, loading, router, params.id]);

  const addExercise = () => {
    setExercisesForms([
      ...exercisesForms,
      {
        exerciseId: '',
        notes: '',
        sets: [{ targetWeight: 0, targetReps: 8 }],
      },
    ]);
  };

  const addExerciseAfter = (index: number) => {
    const updated = [...exercisesForms];
    updated.splice(index + 1, 0, {
      exerciseId: '',
      notes: '',
      sets: [{ targetWeight: 0, targetReps: 8 }],
    });
    setExercisesForms(updated);
  };

  const handleBulkAddExercises = () => {
    router.push(`/exercises?mode=select&return=/templates/${params.id}/edit`);
  };

  const removeExercise = (index: number) => {
    setExercisesForms(exercisesForms.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: any) => {
    const updated = [...exercisesForms];
    updated[index] = { ...updated[index], [field]: value };
    setExercisesForms(updated);
  };

  const addSet = (exerciseIndex: number) => {
    const updated = [...exercisesForms];
    const lastSet = updated[exerciseIndex].sets[updated[exerciseIndex].sets.length - 1];
    updated[exerciseIndex].sets.push({ 
      targetWeight: lastSet?.targetWeight || 0, 
      targetReps: lastSet?.targetReps || 8 
    });
    setExercisesForms(updated);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updated = [...exercisesForms];
    updated[exerciseIndex].sets = updated[exerciseIndex].sets.filter(
      (_, i) => i !== setIndex
    );
    setExercisesForms(updated);
  };

  const updateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: string,
    value: number
  ) => {
    const updated = [...exercisesForms];
    updated[exerciseIndex].sets[setIndex] = {
      ...updated[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setExercisesForms(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Template name is required');
      return;
    }

    if (exercisesForms.length === 0) {
      setError('Add at least one exercise');
      return;
    }

    for (let i = 0; i < exercisesForms.length; i++) {
      if (!exercisesForms[i].exerciseId) {
        setError(`Select an exercise for exercise #${i + 1}`);
        return;
      }
      if (exercisesForms[i].sets.length === 0) {
        setError(`Add at least one set for exercise #${i + 1}`);
        return;
      }
    }

    try {
      await updateTemplate(params.id as string, {
        name,
        description,
        exercises: exercisesForms,
      });
      router.push(`/templates/${params.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update template');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading template...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/templates/${params.id}`}
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Template
        </Link>
        
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
          <Icons.Edit className="w-10 h-10 text-primary-500" />
          Edit Template
        </h1>
        <p className="text-gray-400 text-lg">Update your workout routine</p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl flex items-start gap-3">
          <svg className="w-6 h-6 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="font-semibold mb-1">Error</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="card">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Icons.Target className="w-6 h-6 text-primary-500" />
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-gray-300 font-semibold mb-2">
                Template Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                placeholder="e.g., Push Day A, Upper Body Strength"
                required
              />
            </div>
            
            <div>
              <label className="block text-gray-300 font-semibold mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="input-field"
                placeholder="Describe your workout routine..."
                rows={3}
              />
            </div>
          </div>
        </div>

        {/* Exercises */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <Icons.Dumbbell className="w-6 h-6 text-primary-500" />
              Exercises
              {exercisesForms.length > 0 && (
                <span className="text-gray-400 text-lg">({exercisesForms.length})</span>
              )}
            </h2>
            <div className="hidden md:flex gap-2">
              <button
                type="button"
                onClick={handleBulkAddExercises}
                className="bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white px-4 py-2 rounded-xl font-semibold transition-all"
              >
                <Icons.Plus className="w-5 h-5 inline mr-2" />
                Browse & Select
              </button>
              <button
                type="button"
                onClick={addExercise}
                className="btn-primary"
              >
                <Icons.Plus className="w-5 h-5 inline mr-2" />
                Add Single Exercise
              </button>
            </div>
          </div>

          {exercisesForms.length === 0 ? (
            <div className="card text-center py-12">
              <Icons.Dumbbell className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 mb-6">No exercises added yet</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={handleBulkAddExercises}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-blue-500/50"
                >
                  <Icons.Target className="w-5 h-5 inline mr-2" />
                  Browse & Select Multiple
                </button>
                <button
                  type="button"
                  onClick={addExercise}
                  className="btn-primary inline-block"
                >
                  Add Single Exercise
                </button>
              </div>
            </div>
          ) : (
            exercisesForms.map((exerciseForm, exIndex) => {
              const selectedExercise = exercises.find(e => e.id === exerciseForm.exerciseId);
              
              return (
                <div key={exIndex}>
                  <div className="card">
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold">
                          {exIndex + 1}
                        </div>
                        <h3 className="text-xl font-bold text-white">
                          {selectedExercise?.name || 'Select Exercise'}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeExercise(exIndex)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                        title="Remove exercise"
                      >
                        <Icons.Trash className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {/* Exercise Selection */}
                      <div>
                        <label className="block text-gray-300 font-semibold mb-2">
                          Select Exercise <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={exerciseForm.exerciseId}
                          onChange={(e) =>
                            updateExercise(exIndex, 'exerciseId', e.target.value)
                          }
                          className="input-field"
                          required
                        >
                          <option value="">Choose an exercise...</option>
                          {exercises.map((ex) => (
                            <option key={ex.id} value={ex.id}>
                              {ex.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="block text-gray-300 font-semibold mb-2">
                          Notes (optional)
                        </label>
                        <input
                          type="text"
                          value={exerciseForm.notes}
                          onChange={(e) =>
                            updateExercise(exIndex, 'notes', e.target.value)
                          }
                          className="input-field"
                          placeholder="e.g., Rest 90 seconds, Focus on form"
                        />
                      </div>

                      {/* Sets */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="text-gray-300 font-semibold">Sets</label>
                          <button
                            type="button"
                            onClick={() => addSet(exIndex)}
                            className="text-primary-500 hover:text-primary-400 font-semibold text-sm flex items-center gap-1"
                          >
                            <Icons.Plus className="w-4 h-4" />
                            Add Set
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          {exerciseForm.sets.map((set, setIndex) => (
                            <div
                              key={setIndex}
                              className="grid grid-cols-[auto_1fr_1fr_auto] gap-3 items-center bg-dark-300 p-3 rounded-xl"
                            >
                              <span className="text-gray-400 font-semibold w-16">
                                Set {setIndex + 1}
                              </span>
                              
                              <div>
                                <input
                                  type="number"
                                  value={set.targetWeight || ''}
                                  onChange={(e) =>
                                    updateSet(
                                      exIndex,
                                      setIndex,
                                      'targetWeight',
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  className="input-field py-2"
                                  placeholder="Weight (kg)"
                                  step="0.5"
                                  min="0"
                                />
                              </div>
                              
                              <div>
                                <input
                                  type="number"
                                  value={set.targetReps || ''}
                                  onChange={(e) =>
                                    updateSet(
                                      exIndex,
                                      setIndex,
                                      'targetReps',
                                      parseInt(e.target.value) || 0
                                    )
                                  }
                                  className="input-field py-2"
                                  placeholder="Reps"
                                  min="1"
                                />
                              </div>
                              
                              <button
                                type="button"
                                onClick={() => removeSet(exIndex, setIndex)}
                                className="text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-all"
                                disabled={exerciseForm.sets.length === 1}
                              >
                                <Icons.Trash className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Add Exercise Button After This One */}
                  <div className="flex justify-center -my-2 relative z-10">
                    <button
                      type="button"
                      onClick={() => addExerciseAfter(exIndex)}
                      className="bg-dark-300 hover:bg-primary-500 text-gray-400 hover:text-white p-2 rounded-full transition-all shadow-lg hover:shadow-primary-500/50 group"
                      title="Add exercise below"
                    >
                      <Icons.Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Submit Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving || exercisesForms.length === 0}
            className="btn-primary flex-1 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline mr-2"></div>
                Updating Template...
              </>
            ) : (
              <>
                <Icons.Check className="w-5 h-5 inline mr-2" />
                Save Changes
              </>
            )}
          </button>
          <Link
            href={`/templates/${params.id}`}
            className="btn-secondary px-8 py-4 text-lg"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}