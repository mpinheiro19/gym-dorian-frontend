'use client';

import { NextIntlClientProvider } from 'next-intl';
import { ReactNode, useEffect, useState } from 'react';
import { useLocaleStore } from '@/lib/stores/locale.store';

export function IntlProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocaleStore();
  const [messages, setMessages] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        const msgs = await import(`../../messages/${locale}.json`);
        setMessages(msgs.default);
      } catch (error) {
        console.error('Failed to load messages:', error);
        // Fallback to English
        const msgs = await import(`../../messages/en-US.json`);
        setMessages(msgs.default);
      } finally {
        setIsLoading(false);
      }
    };
    loadMessages();
  }, [locale]);

  if (isLoading || !messages) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-page">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-text-tertiary">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
