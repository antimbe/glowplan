---
project_name: 'glowplan'
user_name: 'Antimbe'
date: '2026-02-14T18:50:00+01:00'
sections_completed: ['technology_stack', 'critical_rules', 'data_hooks', 'business_modules']
existing_patterns_found: 12
---

# Project Context for AI Agents (Quick-Spec)

_This file is the single source of truth for architectural standards in Glowplan. AI agents must strictly adhere to these rules._

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **Base**: React 19.2.3, TypeScript 5
- **Backend**: Supabase SSR 0.8.0
- **Styling**: Tailwind CSS 4 (Stable), Framer Motion 12.29.2
- **Icons**: Lucide React 0.563.0
- **Test**: Vitest 4.0.18 (JSDOM)

---

## 🏗️ Architectural Core Rules

### 1. Separation of Concerns (Data vs UI)
- **Pages (`app/`)**: Orchestrate data fetching and layout. Goal: `< 100 lines`.
- **Hooks (`hooks/`)**: Handle all Supabase logic, state management, and async flow.
- **Atomic Components**: Pure UI or self-contained features (e.g., `BookingTunnel`).

### 2. Data Hook Pattern (Robustness)
Every data hook (e.g., `useAccountData`, `useBooking`, `useAgenda`) MUST implement:
- **Anti-Race Condition**: Use a `lastRequestId` (Ref) to ignore obsolete responses from concurrent async calls.
- **Parallelism**: Fetch related data via `Promise.all` to avoid sequential waterfalls and reduce TTI.
- **Error Propagation**: Return actionable error states or use a centralized modal system for notifications.

### 3. Business Modules & Logic
- **Booking Module**: Centralized via `useBooking` and types in `components/features/booking/types.ts`.
- **Account Module**: Client profile and history management via `useAccountData` and `components/features/account/types.ts`.
- **Establishment Module**: Public details and reviews split into `EstablishmentReviews` and `EstablishmentSidebar`.

### 4. Strict Typing & Quality
- **Zero `any`**: Use explicit interfaces. For mutations, use generics: `<K extends keyof Data>(field: K, value: Data[K])`.
- **Centralized Types**: Never define complex interfaces locally in components. Use feature-specific `types.ts`.
- **Vitest**: Complex business logic must have unit test coverage (see `tests/setup.ts` for Supabase mocks).

---

## 📍 Key Directories & Files

- `_bmad/`: Original project blueprint and stories.
- `components/features/`: Feature-specific logic and UI (Booking, Account, Agenda).
- `lib/supabase/`: Client (`client.ts`) and Server (`server.ts`) factory functions.
- `middleware.ts`: Handles auth-based redirections (e.g., `/dashboard` -> `/business`).

---
**Standard Implementation Workflow**:
1. Plan in `implementation_plan.md`.
2. Write/Update tests for hook logic.
3. Implement logic in Hook -> UI in Component -> Orchestration in Page.
