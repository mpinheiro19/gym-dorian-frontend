'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

type Theme = 'light' | 'dark' | 'system';

const THEMES: Theme[] = ['light', 'dark', 'system'];

function SunIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="4" />
      <line x1="12" y1="20" x2="12" y2="22" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="2" y1="12" x2="4" y2="12" />
      <line x1="20" y1="12" x2="22" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-4 h-4"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: Theme | undefined }) {
  if (theme === 'dark') return <MoonIcon />;
  if (theme === 'system') return <MonitorIcon />;
  return <SunIcon />;
}

/**
 * Compact header toggle — cycles Light → Dark → System on each click.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('settings');

  useEffect(() => setMounted(true), []);

  // Avoid hydration mismatch — render placeholder until client mounts
  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-md bg-surface-hover animate-pulse" />
    );
  }

  const currentTheme = (theme as Theme) ?? 'system';
  const nextTheme = THEMES[(THEMES.indexOf(currentTheme) + 1) % THEMES.length];

  const label =
    currentTheme === 'light'
      ? t('themeLight')
      : currentTheme === 'dark'
        ? t('themeDark')
        : t('themeSystem');

  return (
    <button
      onClick={() => setTheme(nextTheme)}
      aria-label={`${t('theme')}: ${label}`}
      title={`${t('theme')}: ${label}`}
      className="flex items-center justify-center w-8 h-8 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-hover transition-colors"
    >
      <ThemeIcon theme={currentTheme} />
    </button>
  );
}

/**
 * Full radio-button selector for the Settings page.
 */
export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const t = useTranslations('settings');

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-20 rounded-md bg-surface-hover animate-pulse" />;
  }

  const options: { value: Theme; label: string; description: string }[] = [
    { value: 'light', label: t('themeLight'), description: t('themeLightDesc') },
    { value: 'dark', label: t('themeDark'), description: t('themeDarkDesc') },
    { value: 'system', label: t('themeSystem'), description: t('themeSystemDesc') },
  ];

  return (
    <div className="space-y-2">
      {options.map(({ value, label, description }) => (
        <label
          key={value}
          className="flex items-start gap-3 cursor-pointer group"
        >
          <input
            type="radio"
            name="theme"
            value={value}
            checked={(theme ?? 'system') === value}
            onChange={() => setTheme(value)}
            className="mt-1 accent-accent"
          />
          <div>
            <span className="text-sm font-medium text-text-primary">{label}</span>
            <p className="text-xs text-text-tertiary">{description}</p>
          </div>
        </label>
      ))}
    </div>
  );
}
