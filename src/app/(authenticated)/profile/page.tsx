'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { userService } from '@/lib/api/services/user.service';
import { useAuthStore } from '@/lib/stores/auth.store';

const profileSchema = z.object({
  email: z.string().email('Invalid email address'),
  full_name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const { user, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: userService.getProfile,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      email: profile?.email || user?.email || '',
      full_name: profile?.full_name || user?.full_name || '',
      password: '',
    },
  });

  const updateMutation = useMutation({
    mutationFn: userService.updateProfile,
    onSuccess: (data) => {
      setUser(data);
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    const updateData: any = {
      email: data.email,
      full_name: data.full_name,
    };
    
    // Only include password if it was filled
    if (data.password && data.password.length > 0) {
      updateData.password = data.password;
    }

    updateMutation.mutate(updateData);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-text-secondary">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-6">Profile</h1>

      <div className="bg-surface rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-text-primary">Personal Information</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-accent hover:text-accent-hover font-medium"
            >
              Edit
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className="w-full px-3 py-2 border border-border-input rounded-md text-text-primary placeholder-text-muted bg-surface"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Full Name
              </label>
              <input
                {...register('full_name')}
                type="text"
                className="w-full px-3 py-2 border border-border-input rounded-md text-text-primary placeholder-text-muted bg-surface"
              />
              {errors.full_name && (
                <p className="mt-1 text-sm text-error">{errors.full_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                New Password (leave blank to keep current)
              </label>
              <input
                {...register('password')}
                type="password"
                className="w-full px-3 py-2 border border-border-input rounded-md text-text-primary placeholder-text-muted bg-surface"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="flex-1 bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md font-medium disabled:opacity-50"
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  reset();
                }}
                className="px-4 py-2 border border-border-input rounded-md font-medium hover:bg-surface-hover text-text-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-text-secondary">Email</p>
              <p className="text-lg text-text-primary">{profile?.email || user?.email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">Full Name</p>
              <p className="text-lg text-text-primary">
                {profile?.full_name || user?.full_name || 'Not set'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">Account Type</p>
              <p className="text-lg text-text-primary">
                {user?.is_superuser ? (
                  <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2 py-1 rounded">
                    Administrator
                  </span>
                ) : (
                  'User'
                )}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-text-secondary">Member Since</p>
              <p className="text-lg text-text-primary">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
