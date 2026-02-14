---
title: 'Audit technique et Plan d\'amélioration d\'architecture'
slug: 'audit-technique-glowplan'
created: '2026-02-14T15:10:00+01:00'
status: 'ready-for-dev'
stepsCompleted: [1, 2, 3, 4]
tech_stack: ['Next.js 16 (App Router)', 'React 19', 'Supabase (SSR)', 'Tailwind CSS 4', 'Lucide React', 'Framer Motion', 'Radix UI Slot']
files_to_modify: ['app/dashboard/business/page.tsx', 'components/features/dashboard/agenda/CalendarView.tsx', 'components/features/dashboard/agenda/AppointmentForm.tsx']
code_patterns: ['Direct Supabase Client usage in Pages/Components', 'Large feature-specific hooks (useAgenda)', 'Atomic UI components in components/ui', 'Redirect-based dashboard entry']
test_patterns: ['None found']
---

# Tech-Spec: Audit technique et Plan d'amélioration d'architecture

**Created:** 2026-02-14T15:10:00+01:00

## Overview

### Problem Statement

Le projet `glowplan` utilise une pile technologique très récente. L'investigation a révélé des signes de dette technique classique dans un projet en croissance rapide : fuite de logique métier dans les pages, composants volumineux (bloat) et mélange des responsabilités (UI vs Data fetching).

### Solution

Proposer un plan de refactorisation par étapes : extraction de la logique métier des pages vers des hooks ou services, découpage des composants massifs en sous-composants atomiques, et harmonisation du pattern d'accès aux données Supabase.

### Scope

**In Scope:**
- Refactorisation de `app/dashboard/business/page.tsx` pour en extraire la logique Supabase.
- Décomposition de `CalendarView.tsx` et `AppointmentForm.tsx`.
- Standardisation de l'utilisation de Supabase (Server Components vs Hooks).
- Création de "User Stories" pour chaque bloc de refactorisation.

**Out of Scope:**
- Réécriture complète de l'UI.
- Migration de base de données.

## Context for Development

### Codebase Patterns

- **Logic Leakage**: Les pages du dashboard (particulièrement `business/page.tsx`) gèrent directement les états complexes et les appels API Supabase.
- **Component Bloat**: `CalendarView.tsx` (>27KB) contient trop de logique de rendu et de gestion d'événements.
- **UI Atomicity**: Le répertoire `components/ui` est bien structuré avec des composants de base (Flex, Box, Button, etc.), ce qui facilite la refactorisation.
- **Data Hook Pattern**: Présence de hooks personnalisés comme `useAgenda.ts` qui centralisent la logique, mais qui peuvent devenir des "God Objects" s'ils ne sont pas surveillés.
- **Testing Debt**: Absence totale de tests automatisés sur les parties critiques (Agenda/Calculs).

### Files to Reference

| File | Purpose |
| ---- | ------- |
| `app/dashboard/business/page.tsx` | Exemple de page à refactoriser (Leakage). |
| `components/features/dashboard/agenda/CalendarView.tsx` | Exemple de composant à découper (Bloat). |
| `lib/supabase/server.ts` | Pattern correct pour l'accès serveur. |
| `components/ui/index.ts` | Point d'entrée pour les composants UI centralisés. |
| `components/features/dashboard/agenda/hooks/useAgenda.ts` | Hook critique nécessitant des tests. |

### Technical Decisions

- **Pattern "Service Hooks"**: Extraire systématiquement la logique de données dans des hooks dédiés (ex: `useEstablishment`) pour alléger les `page.tsx`.
- **Stratégie "Test-First Refactor"**: Pour les composants complexes comme `CalendarView`, implémenter des tests unitaires sur les utilitaires avant tout découpage pour éviter les régressions.
- **Favor Composition**: Utiliser davantage la composition de composants pour réduire la taille des fichiers.
- **Standardisation Supabase**: Utiliser le client SSR via les hooks pour le dashboard et réserver les Server Actions aux mutations complexes si nécessaire.
- **Error Handling Strategy**: Utiliser un pattern de "Try-Catch-Notify". Chaque hook de service doit capturer les erreurs Supabase et les remonter via `ModalContext` ou un système de toast centralisé.
- **Middleware Delegation**: Migrer la logique de redirection de `app/dashboard/page.tsx` vers le middleware pour éviter les flashs de contenu vide (F10).

## Implementation Plan

### Tasks

- [ ] Task 1: Environnement de test et Mocking (F2, F3)
  - File: `package.json`, `vitest.config.ts`, `tests/setup.ts`
  - Action: Configurer Vitest avec support des alias (`@/*`) et créer un mock global pour le client Supabase SSR.
  - Notes: Indispensable pour éviter les erreurs de chemin et de connexion DB durant les tests.

- [ ] Task 2: Middleware de Redirection (F10)
  - File: `middleware.ts`
  - Action: Ajouter une règle de redirection automatique de `/dashboard` vers `/dashboard/business` pour les pros authentifiés.
  - Notes: Permet de supprimer la redirection client "legacy" dans `app/dashboard/page.tsx`.

- [ ] Task 3: Hook `useEstablishment` avec Error Handling et Typing (F1, F5, F9)
  - File: `components/features/dashboard/business/hooks/useEstablishment.ts`
  - Action: Extraire la logique, inclure un typage strict pour `EstablishmentData` et intégrer le `OnboardingAlert`.
  - Notes: Le hook gère aussi les notifications d'erreur via `useModal`.

- [ ] Task 4: Refactorisation de `BusinessPage`
  - File: `app/dashboard/business/page.tsx`
  - Action: Remplacer l'état local par `useEstablishment`.
  - Notes: Nettoyage radical du fichier (cible < 80 lignes).

- [ ] Task 5: Tests unitaires robustes `useAgenda` (F2, F8)
  - File: `components/features/dashboard/agenda/hooks/useAgenda.test.ts`
  - Action: Tester les calculs de dates, les changements de vue et simuler des échecs réseau.
  - Notes: Inclure un test de performance simple sur le calcul des événements.

- [ ] Task 6: Découpage Atomique de l'Agenda (F4, F8)
  - File: `components/features/dashboard/agenda/` (nouveaux fichiers : `AgendaGrid.tsx`, `AgendaHeaderContr.tsx`, `TimeSlot.tsx`)
  - Action: Extraire les sous-composants nommés de `CalendarView.tsx`.
  - Notes: Vérifier manuellement la fluidité de Framer Motion après chaque extraction.

### Acceptance Criteria

- [ ] AC 1: Pureté de la page
  - Given: `BusinessPage.tsx` gère manuellement Supabase.
  - When: Refactorisation terminée.
  - Then: Le fichier fait moins de 80 lignes, utilise explicitement le hook `useEstablishment`, et gère gracieusement les erreurs (F1, F3).

- [ ] AC 2: Zéro Flash Dashboard (F10)
  - Given: L'utilisateur accède à `/dashboard`.
  - When: Le middleware est configuré.
  - Then: La redirection vers `/dashboard/business` se fait côté serveur sans flash client.

- [ ] AC 3: Couverture de Tests (F2, F4, F9)
  - Given: Un environnement Next.js complexe.
  - When: Lancement de `npm test`.
  - Then: Tous les tests passent, les alias sont résolus, et les mocks Supabase isolent parfaitement la logique business.

- [ ] AC 4: Performance et UX de l'Agenda (F6, F8)
  - Given: Un composant lourd avec animations.
  - When: Découpage terminé.
  - Then: Chaque sous-composant a une responsabilité unique, et les animations Framer Motion restent fluides (> 60fps ressenti).

## Additional Context

### Dependencies

- **Vitest / jsdom**: Moteur de tests.
- **Supabase SSR / SSR Aliases**: Pour les tests unitaires.
- **Framer Motion**: Surveillance des performances lors du découpage.

### Testing Strategy

- **Mocking Supabase**: Utiliser `vi.mock` pour simuler les réponses de la base dans les tests de hooks.
- **Strict Typing**: Pas d'usage de `any`. Utiliser les types générés par Supabase ou manuellement étendus dans `types.ts`.
- **Pre-migration Benchmark**: Noter la fluidité actuelle de l'agenda avant de découper (F6).

### Notes

- **RLS (Security)**: Vérifier que les requêtes dans les hooks respectent les politiques RLS existantes lors de la migration de logique (F7).
- **Onboarding Component**: L'alerte d'onboarding est désormais gérée par le hook `useEstablishment` via un état `onboardingStep` (F5).
