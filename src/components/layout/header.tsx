'use client';

import { useAuthStore } from '@/lib/stores/auth.store';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export function Header() {
  const { user } = useAuthStore();

  return (
    <header className="bg-surface shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-text-primary">
            Welcome back, {user?.full_name || user?.email?.split('@')[0]}!
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-text-tertiary">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
