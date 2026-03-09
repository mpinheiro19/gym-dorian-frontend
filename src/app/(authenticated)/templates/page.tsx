'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { templatesService } from '@/lib/api/services/templates.service';

export default function TemplatesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templates, isLoading } = useQuery({
    queryKey: ['workout-templates'],
    queryFn: () => templatesService.listTemplates(),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: templatesService.deleteTemplate,
    onSuccess: () => {
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['workout-templates'] });
    },
    onError: () => {
      toast.error('Failed to delete template');
    },
  });

  // Execute mutation (prepara workout)
  const executeMutation = useMutation({
    mutationFn: templatesService.prepareWorkoutFromTemplate,
    onSuccess: (data) => {
      // Redirecionar para página de execução com template_id
      router.push(`/templates/execute?template_id=${data.template_id}`);
    },
    onError: () => {
      toast.error('Failed to prepare workout');
    },
  });

  const handleExecuteTemplate = (templateId: number) => {
    executeMutation.mutate({
      template_id: templateId,
      workout_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDeleteTemplate = async (templateId: number, templateName: string) => {
    if (confirm(`Delete template "${templateName}"?`)) {
      deleteMutation.mutate(templateId);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Workout Templates</h1>
        <Link
          href="/templates/create"
          className="bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md font-medium"
        >
          + Create Template
        </Link>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-secondary">Loading templates...</p>
        </div>
      ) : templates && templates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-surface rounded-lg shadow hover:shadow-md transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-text-primary">
                    {template.name}
                  </h3>
                  {template.description && (
                    <p className="text-sm text-text-tertiary mt-1">
                      {template.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="inline-block bg-accent-surface text-accent-surface-text text-sm px-3 py-1 rounded-full">
                  {template.exercises.length} exercises
                </span>
              </div>

              {/* Exercise Preview */}
              <div className="mb-4 space-y-1">
                {template.exercises.slice(0, 3).map((te) => (
                  <p key={te.id} className="text-sm text-text-secondary">
                    {te.order_index + 1}. {te.exercise.name}
                    {te.target_sets && ` (${te.target_sets} sets)`}
                  </p>
                ))}
                {template.exercises.length > 3 && (
                  <p className="text-sm text-text-muted">
                    +{template.exercises.length - 3} more...
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleExecuteTemplate(template.id)}
                  disabled={executeMutation.isPending}
                  className="w-full bg-success hover:bg-success/90 text-white px-4 py-2 rounded-md font-medium text-sm disabled:opacity-50"
                >
                  Start Workout
                </button>
                <div className="flex gap-2">
                  <Link
                    href={`/templates/${template.id}/edit`}
                    className="flex-1 px-4 py-2 text-accent hover:bg-accent-surface rounded-md text-sm font-medium border border-border-input text-center"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteTemplate(template.id, template.name)}
                    disabled={deleteMutation.isPending}
                    className="flex-1 px-4 py-2 text-error hover:bg-error-surface rounded-md text-sm font-medium disabled:opacity-50 border border-error"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-surface rounded-lg shadow">
          <p className="text-text-tertiary mb-4">No templates created yet</p>
          <Link
            href="/templates/create"
            className="inline-block bg-accent hover:bg-accent-hover text-accent-fg px-6 py-3 rounded-md font-medium"
          >
            Create Your First Template
          </Link>
        </div>
      )}
    </div>
  );
}
