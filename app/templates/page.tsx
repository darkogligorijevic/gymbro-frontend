'use client';
import { useEffect, useState } from 'react';
import { useTemplates } from '@/hooks/useTemplates';
import Link from 'next/link';
import { Icons } from '@/components/Icons';

export default function TemplatesPage() {
  const { templates, isLoading, fetchTemplates, deleteTemplate } = useTemplates();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      setDeletingId(id);
      await deleteTemplate(id);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 flex items-center gap-3">
            <Icons.Target className="w-10 h-10 text-primary-500" />
            Workout Templates
          </h1>
          <p className="text-gray-400 text-lg">Create and manage your workout routines</p>
        </div>
        <Link href="/templates/new" className="btn-primary whitespace-nowrap">
          <Icons.Plus className="w-5 h-5 inline mr-2" />
          Create Template
        </Link>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card loading-shimmer h-64"></div>
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
                className="card-hover group relative"
              >
                {/* Template Content */}
                <div className="mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-2xl font-bold text-white group-hover:text-primary-500 transition-colors">
                      {template.name}
                    </h3>
                    <div className="bg-primary-500/10 p-2 rounded-lg">
                      <Icons.Dumbbell className="w-5 h-5 text-primary-500" />
                    </div>
                  </div>
                  
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2 min-h-[2.5rem]">
                    {template.description || 'No description'}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Icons.Target className="w-4 h-4" />
                    <span>{template.exercises.length} exercises</span>
                    <span className="text-gray-600">•</span>
                    <span>
                      {template.exercises.reduce((acc, ex) => acc + ex.sets.length, 0)} sets
                    </span>
                  </div>

                  {/* Exercise Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.exercises.slice(0, 3).map((ex, i) => (
                      <span
                        key={i}
                        className="badge bg-dark-200 text-gray-300 border border-dark-100"
                      >
                        {ex.exercise?.name}
                      </span>
                    ))}
                    {template.exercises.length > 3 && (
                      <span className="badge bg-primary-500/10 text-primary-500 border border-primary-500/30">
                        +{template.exercises.length - 3} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Link
                    href={`/templates/${template.id}`}
                    className="flex-1 bg-primary-500 hover:bg-primary-600 text-white px-4 py-3 rounded-xl font-semibold text-center transition-all transform hover:scale-105"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(template.id, template.name)}
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
            ))}
          </div>
        </>
      )}
    </div>
  );
}