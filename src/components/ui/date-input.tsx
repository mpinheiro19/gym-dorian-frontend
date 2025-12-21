'use client';

import { forwardRef } from 'react';

interface DateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type="date"
        lang="pt-BR"
        {...props}
        className={className}
      />
    );
  }
);

DateInput.displayName = 'DateInput';
