'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useAuthStore } from '@/lib/stores/auth.store';
import { authService } from '@/lib/api/services/auth.service';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const t = useTranslations('nav');

  const navigation = [
    { name: t('dashboard'), href: '/dashboard', icon: '📊' },
    { name: t('workouts'), href: '/workouts', icon: '💪' },
    { name: t('templates'), href: '/templates', icon: '📋' },
    { name: t('plans'), href: '/plans', icon: '📅' },
    { name: t('analytics'), href: '/analytics', icon: '📈' },
    { name: t('profile'), href: '/profile', icon: '👤' },
    { name: t('settings'), href: '/settings', icon: '⚙️' },
    { name: t('goals'), href: '/goals', icon: '🎯' },
  ];

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <>
      {/* Mobile sidebar backdrop */}
      <div className="lg:hidden fixed inset-0 z-40 bg-gray-600 bg-opacity-75 hidden" />

      {/* Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-gray-900">Gym Dorian</h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="mr-3 text-xl">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}

              {user?.is_superuser && (
                <Link
                  href="/admin"
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === '/admin' || pathname.startsWith('/admin/')
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3 text-xl">🔐</span>
                  {t('admin')}
                </Link>
              )}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button
              onClick={handleLogout}
              className="flex-shrink-0 w-full group block text-left"
            >
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-gray-500 hover:text-gray-700">
                    {t('signOut')}
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
