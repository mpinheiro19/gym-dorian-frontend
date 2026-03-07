'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { userService, UpdateSettingsData } from '@/lib/api/services/user.service';
import { useLocaleStore } from '@/lib/stores/locale.store';
import { ThemeSelector } from '@/components/ui/theme-toggle';

export default function SettingsPage() {
  const t = useTranslations('settings');
  const tCommon = useTranslations('common');
  const queryClient = useQueryClient();
  const { locale, setLocale } = useLocaleStore();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['user-settings'],
    queryFn: userService.getSettings,
  });

  const { register, handleSubmit, watch } = useForm<UpdateSettingsData>({
    values: settings || {
      weight_unit: 'kg',
      distance_unit: 'km',
      default_rest_time: 60,
      private_profile: false,
      email_notifications: true,
    },
  });

  const updateMutation = useMutation({
    mutationFn: userService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-settings'] });
      toast.success(t('settingsSaved'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Failed to update settings');
    },
  });

  const onSubmit = (data: UpdateSettingsData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-text-secondary">{t('loadingSettings')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-text-primary mb-6">{t('title')}</h1>

      {/* Appearance - standalone section, no save needed */}
      <div className="bg-surface rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-text-primary mb-4">{t('appearance')}</h2>
        <ThemeSelector />
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Language Selection */}
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">{t('language')}</h2>
          
          <div>
            <p className="text-sm text-text-secondary mb-3">{t('languageDesc')}</p>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={locale === 'en-US'}
                  onChange={() => setLocale('en-US')}
                  className="mr-2"
                />
                <span className="text-text-primary">{t('english')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={locale === 'pt-BR'}
                  onChange={() => setLocale('pt-BR')}
                  className="mr-2"
                />
                <span className="text-text-primary">{t('portuguese')}</span>
              </label>
            </div>
          </div>
        </div>

        {/* Units */}
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">{t('units')}</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('weightUnit')}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    {...register('weight_unit')}
                    type="radio"
                    value="kg"
                    className="mr-2"
                  />
                  <span className="text-text-primary">{t('kilograms')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('weight_unit')}
                    type="radio"
                    value="lbs"
                    className="mr-2"
                  />
                  <span className="text-text-primary">{t('pounds')}</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2">
                {t('distanceUnit')}
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    {...register('distance_unit')}
                    type="radio"
                    value="km"
                    className="mr-2"
                  />
                  <span className="text-text-primary">{t('kilometers')}</span>
                </label>
                <label className="flex items-center">
                  <input
                    {...register('distance_unit')}
                    type="radio"
                    value="miles"
                    className="mr-2"
                  />
                  <span className="text-text-primary">{t('miles')}</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Workout Preferences */}
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">{t('workoutPreferences')}</h2>
          
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              {t('defaultRestTime')}
            </label>
            <input
              {...register('default_rest_time', { valueAsNumber: true })}
              type="number"
              min="0"
              max="600"
              step="15"
              className="w-full px-3 py-2 border border-border-input rounded-md text-text-primary bg-surface"
            />
            <p className="mt-1 text-sm text-text-secondary">
              {t('restTimeDesc')}
            </p>
          </div>
        </div>

        {/* Privacy */}
        <div className="bg-surface rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">{t('privacy')}</h2>
          
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                {...register('private_profile')}
                type="checkbox"
                className="mr-3 h-4 w-4 text-accent"
              />
              <div>
                <span className="text-text-primary font-medium">{t('privateProfile')}</span>
                <p className="text-sm text-text-secondary">
                  {t('privateProfileDesc')}
                </p>
              </div>
            </label>

            <label className="flex items-center">
              <input
                {...register('email_notifications')}
                type="checkbox"
                className="mr-3 h-4 w-4 text-accent"
              />
              <div>
                <span className="text-text-primary font-medium">{t('emailNotifications')}</span>
                <p className="text-sm text-text-secondary">
                  {t('emailNotificationsDesc')}
                </p>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={updateMutation.isPending}
          className="w-full bg-accent hover:bg-accent-hover text-accent-fg px-6 py-3 rounded-md font-medium disabled:opacity-50"
        >
          {updateMutation.isPending ? tCommon('loading') : t('saveSettings')}
        </button>
      </form>
    </div>
  );
}
