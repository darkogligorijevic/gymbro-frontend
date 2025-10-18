'use client';
import { useEffect, useState } from 'react';
import { useTemplates } from '@/hooks/useTemplates';
import { workoutApi } from '@/lib/api';
import Link from 'next/link';
import { Icons } from '@/components/Icons';
import { Modal } from '@/components/Modal';
import { useToast } from '@/hooks/useToast';

export default function TemplatesPage() {
  const { templates, isLoading, fetchTemplates, deleteTemplate } = useTemplates();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<{ id: string; name: string; hasWorkouts: boolean } | null>(null);
  const toast = useToast();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        await fetchTemplates();
      } catch (error: any) {
        const errorMsg = error.response?.data?.message || error.message || 'Failed to load templates';
        toast.error(`Error loading templates: ${errorMsg}`);
      }
    };
    loadTemplates();
  }, []);

  const handleDeleteClick = async (id: string, name: string) => {
    try {
      const workouts = await workoutApi.getAll();
      const hasWorkouts = workouts.data.some(w => w.workoutTemplateId === id);
      setSelectedTemplate({ id, name, hasWorkouts });
      setModalOpen(true);
    } catch (error) {
      toast.error('Failed to check workout history');
    }
  };

  const confirmDelete = async () => {
    if (!selectedTemplate) return;
    
    setDeletingId(selectedTemplate.id);
    
    try {
      await deleteTemplate(selectedTemplate.id);
      await fetchTemplates();
      toast.success('Template deleted successfully!', 3000);
    } catch (error: any) {
      let errorMsg = 'Failed to delete template.';
      
      if (error.response?.status === 500) {
        errorMsg = 'Cannot delete template! This template is being used by workout sessions. You need to delete those workout sessions first.';
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      toast.error(errorMsg, 7000);
    } finally {
      setDeletingId(null);
      setSelectedTemplate(null);
    }
  };

  return (
    <div className="space-y-8">
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedTemplate(null);
        }}
        onConfirm={confirmDelete}
        title={selectedTemplate?.hasWorkouts ? "⚠️ Warning: Template Has History" : "Delete Template"}
        message={
          selectedTemplate?.hasWorkouts
            ? `"${selectedTemplate.name}" has workout history!\n\nThis template has been used in workout sessions. Deleting it may affect your workout history.\n\nAre you ABSOLUTELY SURE you want to delete it?`
            : `Are you sure you want to delete "${selectedTemplate?.name}"?\n\nThis action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        type={selectedTemplate?.hasWorkouts ? "danger" : "warning"}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <Icons.Target className="w-10 h-10 text-primary-500" />
            Workout Templates
          </h1>
          <p className="text-gray-400 text-lg">Create and manage your workout routines</p>
        </div>
        <Link href="/templates/new" className="btn-primary whitespace-nowrap text-center">
          <Icons.Plus className="w-5 h-5 inline mr-2" />
          Create Template
        </Link>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card loading-shimmer h-80"></div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        /* Empty State */
        <div className="card text-center py-16">
          <div className="bg-primary-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Icons.Target className="w-12 h-12 text-primary-500" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No templates yet</h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Create your first workout template to get started with structured training
          </p>
          <Link href="/templates/new" className="btn-primary inline-block">
            <Icons.Plus className="w-5 h-5 inline mr-2" />
            Create Your First Template
          </Link>
        </div>
      ) : (
        /* Templates Grid */
        <>
          <div className="flex items-center gap-2 text-gray-400">
            <Icons.Fire className="w-5 h-5" />
            <span>{templates.length} templates</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div
                key={template.id}
                className="card-hover group relative border border-gray-900 rounded-2xl overflow-hidden hover:border-primary-500 transition-all shadow-md hover:shadow-primary-500/20 flex flex-col h-full"
              >
                {/* Content Section - Fixed Height */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-primary-500 transition-colors line-clamp-2 flex-1">
                      {template.name}
                    </h3>
                    <div className="bg-primary-500/10 p-2 rounded-lg flex-shrink-0 ml-2">
                      <Icons.Dumbbell className="w-5 h-5 text-primary-500" />
                    </div>
                  </div>
                  
                  {/* Description - Fixed Height */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 h-10">
                    {template.description || 'No description'}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Icons.Target className="w-4 h-4" />
                    <span>{template.exercises.length} exercises</span>
                    <span className="text-gray-600">•</span>
                    <span>
                      {template.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} sets
                    </span>
                  </div>

                  {/* Exercise Tags - Fixed Height */}
                  <div className="flex flex-wrap gap-2 mb-4 min-h-[2.5rem]">
                    {template.exercises.slice(0, 3).map((ex, i) => (
                      <span
                        key={i}
                        className="badge bg-dark-200 text-gray-300 border border-dark-100 text-xs"
                      >
                        {ex.exercise?.name}
                      </span>
                    ))}
                    {template.exercises.length > 3 && (
                      <span className="badge bg-primary-500/10 text-primary-500 border border-primary-500/30 text-xs">
                        +{template.exercises.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Spacer to push actions to bottom */}
                  <div className="flex-1"></div>

                  {/* Actions - Fixed at Bottom */}
                  <div className="flex gap-2 mt-auto">
                    <Link
                      href={`/templates/${template.id}`}
                      className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-semibold text-center transition-all transform hover:scale-105"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/templates/${template.id}/edit`}
                      className="bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white px-4 py-3 rounded-xl transition-all"
                      title="Edit template"
                    >
                      <Icons.Edit className="w-5 h-5" />
                    </Link>
                    <button
                      onClick={() => handleDeleteClick(template.id, template.name)}
                      disabled={deletingId === template.id}
                      className="bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white px-4 py-3 rounded-xl transition-all disabled:opacity-50"
                      title="Delete template"
                    >
                      {deletingId === template.id ? (
                        <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Icons.Trash className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}