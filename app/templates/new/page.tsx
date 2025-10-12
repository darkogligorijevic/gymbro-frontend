'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/useTemplates';
import { useExercises } from '@/hooks/useExercises';

interface ExerciseForm {
  exerciseId: string;
  notes: string;
  sets: { targetWeight: number; targetReps: number }[];
}

export default function NewTemplatePage() {
  const router = useRouter();
  const { createTemplate, isLoading: saving } = useTemplates();
  const { exercises, fetchExercises } = useExercises();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [exercisesForms, setExercisesForms] = useState<ExerciseForm[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExercises();
  }, []);

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
    updated[exerciseIndex].sets.push({ targetWeight: 0, targetReps: 8 });
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
    }

    try {
      const template = await createTemplate({
        name,
        description,
        exercises: exercisesForms,
      });
      router.push(`/templates/${template.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create template');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-4xl font-bold text-white">Create Workout Template</h1>

      {error && (
        <div className="bg-red-500 text-white p-4 rounded-lg">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Template Name*</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-primary focus:outline-none"
              placeholder="e.g., Push Day A"
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-primary focus:outline-none"
              placeholder="Describe your workout..."
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Exercises</h2>
            <button
              type="button"
              onClick={addExercise}
              className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
            >
              + Add Exercise
            </button>
          </div>

          {exercisesForms.map((exerciseForm, exIndex) => (
            <div key={exIndex} className="bg-gray-800 p-6 rounded-lg space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold text-white">
                  Exercise #{exIndex + 1}
                </h3>
                <button
                  type="button"
                  onClick={() => removeExercise(exIndex)}
                  className="text-red-500 hover:text-red-400"
                >
                  Remove
                </button>
              </div>

              <div>
                <label className="block text-gray-300 mb-2">Select Exercise*</label>
                <select
                  value={exerciseForm.exerciseId}
                  onChange={(e) =>
                    updateExercise(exIndex, 'exerciseId', e.target.value)
                  }
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-primary focus:outline-none"
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

              <div>
                <label className="block text-gray-300 mb-2">Notes</label>
                <input
                  type="text"
                  value={exerciseForm.notes}
                  onChange={(e) =>
                    updateExercise(exIndex, 'notes', e.target.value)
                  }
                  className="w-full px-4 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-primary focus:outline-none"
                  placeholder="e.g., Rest 90 seconds between sets"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-gray-300">Sets</label>
                  <button
                    type="button"
                    onClick={() => addSet(exIndex)}
                    className="text-primary hover:text-orange-600 text-sm"
                  >
                    + Add Set
                  </button>
                </div>
                <div className="space-y-2">
                  {exerciseForm.sets.map((set, setIndex) => (
                    <div
                      key={setIndex}
                      className="flex gap-3 items-center bg-gray-700 p-3 rounded"
                    >
                      <span className="text-gray-400 w-16">
                        Set {setIndex + 1}
                      </span>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={set.targetWeight}
                          onChange={(e) =>
                            updateSet(
                              exIndex,
                              setIndex,
                              'targetWeight',
                              parseFloat(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-primary focus:outline-none"
                          placeholder="Weight (kg)"
                          step="0.5"
                          min="0"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          value={set.targetReps}
                          onChange={(e) =>
                            updateSet(
                              exIndex,
                              setIndex,
                              'targetReps',
                              parseInt(e.target.value)
                            )
                          }
                          className="w-full px-3 py-2 rounded bg-gray-600 text-white border border-gray-500 focus:border-primary focus:outline-none"
                          placeholder="Reps"
                          min="1"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSet(exIndex, setIndex)}
                        className="text-red-500 hover:text-red-400"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 bg-primary hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition disabled:opacity-50"
          >
            {saving ? 'Creating...' : 'Create Template'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
