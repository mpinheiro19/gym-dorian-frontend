'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { authService } from '@/lib/api/services/auth.service';
import { useAuthStore } from '@/lib/stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { setUser, setToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (tokenData) => {
      setToken(tokenData.access_token);
      
      // Fetch user data
      try {
        const user = await authService.getCurrentUser();
        setUser(user);
        toast.success('Welcome back!');
        router.push('/dashboard');
      } catch (error) {
        toast.error('Failed to load user data');
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.detail || 'Invalid email or password';
      toast.error(message);
    },
  });

  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true);
    loginMutation.mutate(data, {
      onSettled: () => setIsLoading(false),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-page px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-text-primary">Gym Dorian</h1>
          <h2 className="mt-6 text-3xl font-semibold text-text-primary">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-text-tertiary">
            Or{' '}
            <Link
              href="/register"
              className="font-medium text-accent hover:text-accent-hover"
            >
              create a new account
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary"
              >
                Email address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="mt-1 block w-full px-3 py-2 border border-border-input rounded-md shadow-sm bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-accent focus:border-accent"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary"
              >
                Password
              </label>
              <input
                {...register('password')}
                id="password"
                type="password"
                autoComplete="current-password"
                className="mt-1 block w-full px-3 py-2 border border-border-input rounded-md shadow-sm bg-surface text-text-primary placeholder-text-muted focus:outline-none focus:ring-accent focus:border-accent"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-error">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-accent-fg bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
