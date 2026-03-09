# Role: Frontend Developer (Next.js 15 + Tailwind v4 + next-themes)

## Project Overview

This is the **gym-dorian** frontend — a workout tracking & planning app built with:
- **Next.js 15** (App Router, `'use client'` where needed)
- **Tailwind CSS v4** with `@theme inline` and CSS custom properties
- **next-themes** for dark/light mode (class strategy — adds `.dark` to `<html>`)
- **React Query** (`@tanstack/react-query`) for server state
- **Zod + React Hook Form** for form validation
- **TypeScript** (strict mode)

---

## Design Token System

All colors are defined as CSS custom properties in `src/app/globals.css` and registered via `@theme inline`.
The `:root` block contains light mode values; `.dark` overrides them automatically.

**NEVER use raw Tailwind color classes. ALWAYS use the tokens below.**

### Available Tokens

| Category | Classes |
|----------|---------|
| **Background** | `bg-page`, `bg-surface`, `bg-surface-hover`, `bg-surface-secondary` |
| **Text** | `text-text-primary`, `text-text-secondary`, `text-text-tertiary`, `text-text-muted` |
| **Border** | `border-border`, `border-border-input` |
| **Accent (blue)** | `bg-accent`, `bg-accent-hover`, `text-accent-fg`, `bg-accent-surface`, `text-accent-surface-text` |
| **Success (green)** | `bg-success`, `bg-success-surface`, `text-success-text` |
| **Error (red)** | `bg-error`, `bg-error-surface`, `text-error-text`, `text-error`, `border-error` |
| **Warning (amber)** | `bg-warning`, `bg-warning-surface`, `text-warning-text` |
| **Info (purple)** | `bg-info`, `bg-info-surface`, `text-info-text` |

---

## Mandatory Styling Rules

### ❌ NEVER use hardcoded Tailwind colors
```tsx
// ❌ BAD
<div className="bg-white text-gray-900 border-gray-300">
<button className="bg-blue-600 hover:bg-blue-700 text-white">
<span className="bg-green-100 text-green-800">
<p className="text-gray-500 dark:text-gray-400">  {/* dark: is also forbidden */}
```

### ✅ ALWAYS use design tokens
```tsx
// ✅ GOOD
<div className="bg-surface text-text-primary border-border-input">
<button className="bg-accent hover:bg-accent-hover text-accent-fg">
<span className="bg-success-surface text-success-text">
<p className="text-text-muted">  {/* tokens auto-switch for dark/light */}
```

### ❌ NEVER use the `dark:` prefix
The `.dark` class on `<html>` already switches all token values via CSS custom properties.
Adding `dark:` creates hardcoded overrides that break the token system.

```tsx
// ❌ BAD
<p className="text-green-600 dark:text-green-400">
// ✅ GOOD
<p className="text-success-text">
```

---

## Quick Reference: Hardcoded → Token

| Hardcoded | Token |
|-----------|-------|
| `bg-white` | `bg-surface` |
| `bg-gray-50` / `bg-gray-100` | `bg-surface-secondary` |
| `bg-gray-200` | `bg-surface-hover` |
| `text-gray-900` / `text-gray-800` | `text-text-primary` / `text-text-secondary` |
| `text-gray-700` / `text-gray-600` | `text-text-secondary` / `text-text-tertiary` |
| `text-gray-500` / `text-gray-400` | `text-text-muted` |
| `border-gray-200` | `border-border` |
| `border-gray-300` | `border-border-input` |
| `bg-blue-600` | `bg-accent` |
| `hover:bg-blue-700` | `hover:bg-accent-hover` |
| `text-blue-600` | `text-accent` |
| `bg-blue-100` / `bg-blue-50` | `bg-accent-surface` |
| `text-blue-800` | `text-accent-surface-text` |
| `text-white` (on accent buttons) | `text-accent-fg` |
| `bg-green-600` | `bg-success` |
| `bg-green-100` / `bg-green-50` | `bg-success-surface` |
| `text-green-800` / `text-green-600` | `text-success-text` |
| `bg-red-100` / `bg-red-50` | `bg-error-surface` |
| `text-red-800` / `text-red-700` / `text-red-600` | `text-error-text` / `text-error` |
| `border-red-300` | `border-error` |
| `bg-yellow-100` / `bg-yellow-50` | `bg-warning-surface` |
| `text-yellow-800` / `text-yellow-700` | `text-warning-text` |
| `bg-purple-100` / `bg-purple-50` | `bg-info-surface` |
| `text-purple-800` | `text-info-text` |
| `bg-orange-50` | `bg-warning-surface` |
| `hover:bg-gray-50` | `hover:bg-surface-hover` |
| `hover:bg-gray-200` | `hover:bg-surface-hover` |
| `focus:ring-blue-500` | `focus:ring-accent` |
| `focus:border-blue-500` | `focus:border-accent` |

---

## Common Patterns

### Input fields
```tsx
className="w-full border border-border-input rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent bg-surface text-text-primary placeholder-text-muted"
```

### Labels
```tsx
className="block text-sm font-medium text-text-secondary mb-1"
```

### Cards / Containers
```tsx
className="bg-surface rounded-lg shadow p-6"
```

### Primary button (accent)
```tsx
className="bg-accent hover:bg-accent-hover text-accent-fg px-4 py-2 rounded-md font-medium"
```

### Success button
```tsx
className="bg-success hover:bg-success/90 text-accent-fg px-4 py-2 rounded-md font-medium"
```

### Cancel / secondary button
```tsx
className="border border-border-input hover:bg-surface-hover text-text-secondary px-4 py-2 rounded-md font-medium"
```

### Danger / error button
```tsx
className="text-error hover:bg-error-surface border border-error px-4 py-2 rounded-md font-medium"
```

### Status badges
```tsx
// Import from the shared constant:
import { STATUS_COLORS } from '@/lib/constants/status-colors';
// Usage:
<span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_COLORS[plan.status]}`}>
```

---

## Adding New Tokens

When a new semantic color is needed (e.g., a new status type), define it in **three places** in `src/app/globals.css`:

1. **`:root`** — light mode value
2. **`.dark`** — dark mode value  
3. **`@theme inline`** — registers it as a Tailwind class

```css
/* Example: adding a "neutral" token */
:root {
  --color-neutral: #6b7280;
  --color-neutral-surface: #f3f4f6;
  --color-neutral-text: #374151;
}
.dark {
  --color-neutral: #9ca3af;
  --color-neutral-surface: #1f2937;
  --color-neutral-text: #d1d5db;
}
@theme inline {
  --color-neutral: var(--color-neutral);
  --color-neutral-surface: var(--color-neutral-surface);
  --color-neutral-text: var(--color-neutral-text);
}
```

---

## Theme Testing

Every new UI feature must be tested visually in **both** dark and light mode:

1. Use the theme toggle in the app header to switch modes.
2. Check: text readability, border visibility, button contrast, badge legibility.
3. The goal: zero hardcoded colors, zero `dark:` prefixes.

---

**Last Updated**: March 8, 2026  
- Initial creation — full token system documented.
- Info (purple) tokens added for role/type badges.
- STATUS_COLORS shared constant extracted to `src/lib/constants/status-colors.ts`.
