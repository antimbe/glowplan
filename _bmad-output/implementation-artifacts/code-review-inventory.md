# 📄 Inventaire exhaustif du Codebase (Revue de Code)

Ce document liste l'intégralité des fichiers dans `app/` et `components/` avec un statut de qualité et les points de vigilance identifiés.

## 🟢 Statut Légende
- **SAIN** : Code propre, respecte les patterns.
- **OPTIMISÉ** : Récemment refactoré et performant.
- **VIGILANCE** : Fonctionne mais présente des risques (race conditions, magic numbers, logic leakage).
- **DETTE** : Nécessite une refactorisation (bloat, couplage fort).

---

## 📂 Répertoire `app/` (Routes)

| Fichier | Statut | Points de Vigilance / Commentaires |
| :--- | :--- | :--- |
| `app/about/page.tsx` | SAIN | Pur rendu client. |
| `app/account/page.tsx` | **DETTE** | Bloat extrême (~900 lignes). N'utilise pas `useAccountData`. Duplication de types. |
| `app/establishment/[id]/page.tsx` | **DETTE** | Mastodonte (>1300 lignes). Logique de réservation mélangée au rendu. Risques de Race Conditions massifs. |
| `app/api/booking/*` | SAIN | Routes atomiques. Manque de validation Zod. |
| `app/auth/*` | SAIN | Logique standard Supabase. |
| `app/dashboard/agenda/page.tsx` | OPTIMISÉ | Bien découpé. |
| `app/dashboard/business/page.tsx` | OPTIMISÉ | Refactorisation réussie (~80 lignes). |
| `app/layout.tsx` | SAIN | Structure racine propre. |

---

## 📂 Répertoire `components/` (Interface & Logique)

### 🧩 Logic & Hooks
| Fichier | Statut | Points de Vigilance / Commentaires |
| :--- | :--- | :--- |
| `useAgenda.ts` | OPTIMISÉ | **VIGILANCE** : Risque de Race Condition (pas de cleanup/abort). |
| `useAccountData.ts` | OPTIMISÉ | **VIGILANCE** : Race Conditions sur le chargement des rdv/avis. |
| `useEstablishment.ts` | OPTIMISÉ | Désormais sécurisé contre les créations vides. |
| `useAgendaModals.ts` | SAIN | Logique UI bien isolée. |
| `useConflictValidation.ts` | VIGILANCE | Logique pure mais sans tests unitaires associés. |

### 🖼️ UI Components (Atomes)
| Fichier | Statut | Points de Vigilance / Commentaires |
| :--- | :--- | :--- |
| `components/ui/*` (26 fichiers) | SAIN | Bibliothèque très solide et cohérente. |
| `Modal.tsx` | SAIN | Gestion correcte du focus et des événements clavier. |
| `Tabs.tsx` | SAIN | Version accessible avec indicateur de verrouillage. |

### 🚀 Features (Dashboard)
| Fichier | Statut | Points de Vigilance / Commentaires |
| :--- | :--- | :--- |
| `CalendarView.tsx` | OPTIMISÉ | Bien découpé. Vue semaine implémentée. |
| `AgendaEvent.tsx` | OPTIMISÉ | Centralise la logique de positionnement. |
| `TimeSlot.tsx` | OPTIMISÉ | Bug de layout (colonne d'heure) corrigé. |
| `Business/sections/*` | SAIN | Composants de petits formulaires, bien isolés. |

---

## 🛠️ Synthèse Globale des Issues

### 🔴 Risques de Race Conditions (CRITIQUE)
- **Fichiers** : `useAgenda.ts`, `useAccountData.ts`.
- **Détail** : En cas de navigation rapide, des résultats de requêtes obsolètes peuvent écraser les nouveaux, créant des incohérences visuelles.

### 🟡 Manque de Validation de Schéma
- **Fichiers** : `app/api/booking/*`, `useEstablishment.ts`.
- **Détail** : Les données venant de formulaires ou de l'API ne sont pas validées par Zod avant d'être envoyées à Supabase.

### 🟢 Typage "Any" résiduel
- **Fichiers** : `useAccountData.ts` (user object), `useEstablishment.ts`.
- **Détail** : Quelques types `any` persistent dans les hooks liés à Supabase.
