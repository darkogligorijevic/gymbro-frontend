'use client';
import { useEffect } from 'react';
import { useTemplates } from '@/hooks/useTemplates';
import Link from 'next/link';

export default function TemplatesPage() {
  const { templates, isLoading, fetchTemplates, deleteTemplate } = useTemplates();

  useEffect(() => {
    fetchTemplates();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      await deleteTemplate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-white">Workout Templates</h1>
        <Link
          href="/templates/new"
          className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition"
        >
          + Create Template
        </Link>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="text-gray-400">Loading templates...</div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-800 p-6 rounded-lg hover:shadow-lg transition"
            >
              <h3 className="text-2xl font-bold text-white mb-2">
                {template.name}
              </h3>
              <p className="text-gray-400 mb-4 min-h-[3rem]">
                {template.description || 'No description'}
              </p>
              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-500">
                  {template.exercises.length} exercises
                </div>
                <div className="flex flex-wrap gap-1">
                  {template.exercises.slice(0, 3).map((ex, i) => (
                    <span
                      key={i}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    >
                      {ex.exercise?.name}
                    </span>
                  ))}
                  {template.exercises.length > 3 && (
                    <span className="text-xs text-gray-500">
                      +{template.exercises.length - 3} more
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/templates/${template.id}`}
                  className="flex-1 bg-secondary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-center transition"
                >
                  View
                </Link>
                <button
                  onClick={() => handleDelete(template.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && templates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-400 mb-4">No templates yet</p>
          <Link
            href="/templates/new"
            className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-lg inline-block transition"
          >
            Create Your First Template
          </Link>
        </div>
      )}
    </div>
  );
}