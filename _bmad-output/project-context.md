---
project_name: 'glowplan'
user_name: 'Antimbe'
date: '2026-02-14T17:15:00+01:00'
sections_completed: ['technology_stack', 'critical_rules']
existing_patterns_found: 8
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

- **Next.js**: 16.1.6 (App Router)
- **React**: 19.2.3
- **Supabase SSR**: 0.8.0
- **Tailwind CSS**: 4 (Stable)
- **Vitest**: 4.0.18 (Environment: jsdom)
- **Framer Motion**: 12.29.2
- **Lucide React**: 0.563.0
- **Styling**: Vanilla CSS + Tailwind 4 Utility Classes

## Critical Implementation Rules

1. **Next.js App Router**: Always prefer Server Components for data fetching where possible. Reservate Client Components (`"use client"`) for interactivity and hooks.
2. **Supabase Client**: Never use the broad `supabase-js` client directly in components if a specialized SSR client is available. Use `@/lib/supabase/server` for RSC/Actions and `@/lib/supabase/client` for Client Components.
3. **Logic Extraction**: Extract complex business logic, state management, and data fetching into custom hooks (e.g., `useEstablishment`). Do not bloat page files.
4. **Atomic Components**: Favor composition. Break down large components into atomic pieces (e.g., `AgendaHeader`, `Grid`, `TimeSlot`) to ensure single responsibility.
5. **Testing First**: For complex logic (calendars, math, state flows), write Vitest unit tests before or during refactoring. Use the established mocking pattern for Supabase in `tests/setup.ts`.
6. **Navigation & Middleware**: Handle auth-based redirections in `middleware.ts` to prevent client-side flashes.
7. **Import Aliases**: Always use `@/*` for absolute imports from the project root.
8. **Error Handling**: Follow the "Try-Catch-Notify" pattern in hooks using the `useModal` context for user-facing errors.
9. **Naming Conventions**: PascalCase for Components, kebab-case for Files/Dirs, camelCase for Hooks.
10. **Anti-Race Condition**: In async hooks fetching data, always use a `requestId` (ref) to ignore results from obsolete requests.
11. **Performance (Parallelism)**: Use `Promise.all` to fetch multiple Supabase resources in hooks, avoiding "sequential waterfalls".
12. **No Magic Numbers**: Centralize all UI/Business constants (e.g., `7h-19h`, `70px`) in a `constants.ts` file within the feature folder.
13. **Strict Typing**: Avoid `any`. Use generics for update functions: `<K extends keyof Data>(field: K, value: Data[K])`.
14. **Silent Failure Prevention**: Ensure all insert/update operations are validated and check for `error` before proceeding.
