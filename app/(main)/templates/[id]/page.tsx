'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTemplates } from '@/hooks/useTemplates';
import { useWorkout } from '@/hooks/useWorkout';
import { workoutApi } from '@/lib/api';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function TemplateDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentTemplate, isLoading, fetchTemplate, deleteTemplate } = useTemplates();
  const { startWorkout, isLoading: starting } = useWorkout();
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchTemplate(params.id as string);
    }
  }, [params.id]);

  const handleStartWorkout = async () => {
    if (!currentTemplate) return;
    try {
      await startWorkout(currentTemplate.id);
      router.push('/workouts');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to start workout';
      alert(message);
    }
  };

  const handleDelete = async () => {
    if (!currentTemplate) return;
    setDeleting(true);
    
    try {
      // Prvo proveri da li template ima workout sessions
      const workouts = await workoutApi.getAll();
      const hasWorkouts = workouts.data.some(w => w.workoutTemplateId === currentTemplate.id);
      
      if (hasWorkouts) {
        const confirmDelete = confirm(
          `⚠️ WARNING: "${currentTemplate.name}" has workout history!\n\n` +
          `This template has been used in workout sessions. ` +
          `Deleting it may affect your workout history.\n\n` +
          `Are you ABSOLUTELY SURE you want to delete it?`
        );
        
        if (!confirmDelete) {
          setDeleting(false);
          return;
        }
      } else {
        const confirmDelete = confirm(
          `Are you sure you want to delete "${currentTemplate.name}"?\n\n` +
          `This action cannot be undone.`
        );
        
        if (!confirmDelete) {
          setDeleting(false);
          return;
        }
      }

      await deleteTemplate(currentTemplate.id);
      alert('✅ Template deleted successfully!');
      router.push('/templates');
      
    } catch (error: any) {
      console.error('Delete failed:', error);
      
      let errorMsg = 'Failed to delete template.';
      
      if (error.response?.status === 500) {
        errorMsg = '❌ Cannot delete template!\n\n' +
          'This template is being used by workout sessions. ' +
          'You need to delete those workout sessions first, or contact support.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      alert(errorMsg);
      setDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading template...</p>
        </div>
      </div>
    );
  }

  if (!currentTemplate) {
    return (
      <div className="card text-center py-16">
        <Icons.Target className="w-20 h-20 text-gray-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Template not found</h3>
        <p className="text-gray-400 mb-6">This template doesn't exist or has been deleted</p>
        <Link href="/templates" className="btn-primary inline-block">
          Back to Templates
        </Link>
      </div>
    );
  }

  const totalSets = currentTemplate.exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const estimatedTime = totalSets * 3; // Rough estimate: 3 mins per set

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex-1">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Templates
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            {currentTemplate.name}
          </h1>
          
          {currentTemplate.description && (
            <p className="text-gray-400 text-lg">{currentTemplate.description}</p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 bg-dark-300 px-4 py-2 rounded-xl">
              <Icons.Dumbbell className="w-5 h-5 text-primary-500" />
              <span className="text-white font-semibold">{currentTemplate.exercises.length} exercises</span>
            </div>
            <div className="flex items-center gap-2 bg-dark-300 px-4 py-2 rounded-xl">
              <Icons.Target className="w-5 h-5 text-blue-500" />
              <span className="text-white font-semibold">{totalSets} sets</span>
            </div>
            <div className="flex items-center gap-2 bg-dark-300 px-4 py-2 rounded-xl">
              <Icons.Clock className="w-5 h-5 text-green-500" />
              <span className="text-white font-semibold">~{estimatedTime} min</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 lg:w-64">
          <button
            onClick={handleStartWorkout}
            disabled={starting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {starting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Starting...
              </>
            ) : (
              <>
                <Icons.Lightning className="w-5 h-5" />
                Start Workout
              </>
            )}
          </button>
          
          <Link
            href={`/templates/${currentTemplate.id}/edit`}
            className="bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all text-center"
          >
            <Icons.Edit className="w-5 h-5 inline mr-2" />
            Edit Template
          </Link>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-6 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete Template'}
          </button>
        </div>
      </div>

      {/* Exercises List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Icons.Fire className="w-7 h-7 text-primary-500" />
          Workout Plan
        </h2>

        {currentTemplate.exercises.map((exercise, index) => (
          <div key={exercise.id} className="card">
            <div className="flex items-start gap-4 mb-4">
              <div className="bg-primary-500 text-white w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg flex-shrink-0">
                {index + 1}
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {exercise.exercise?.name}
                </h3>
                {exercise.notes && (
                  <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 mb-3">
                    <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-blue-400 text-sm">{exercise.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sets Table */}
            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-4 px-4 py-2 text-sm font-semibold text-gray-400 uppercase tracking-wider">
                <span>Set</span>
                <span className="text-center">Weight</span>
                <span className="text-center">Reps</span>
              </div>
              {exercise.sets.map((set) => (
                <div
                  key={set.id}
                  className="grid grid-cols-3 gap-4 bg-dark-300 px-4 py-3 rounded-xl items-center hover:bg-dark-200 transition-colors"
                >
                  <span className="text-white font-semibold">Set {set.setNumber}</span>
                  <span className="text-center">
                    <span className="text-primary-500 font-bold text-lg">{set.targetWeight}</span>
                    <span className="text-gray-400 text-sm ml-1">kg</span>
                  </span>
                  <span className="text-center">
                    <span className="text-primary-500 font-bold text-lg">{set.targetReps}</span>
                    <span className="text-gray-400 text-sm ml-1">reps</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="card bg-gradient-to-r from-primary-600 to-orange-600">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Ready to crush it?</h3>
            <p className="text-white/90">Start this workout and track your progress</p>
          </div>
          <button
            onClick={handleStartWorkout}
            disabled={starting}
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition-all transform hover:scale-105 disabled:opacity-50 whitespace-nowrap"
          >
            {starting ? 'Starting...' : 'Start Workout Now'}
          </button>
        </div>
      </div>
    </div>
  );
}