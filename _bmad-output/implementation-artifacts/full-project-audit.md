# 🔍 Audit Global du Projet - Glowplan

Cet audit couvre l'intégralité des répertoires `app/` et `components/` (environ 120 fichiers analysés).

---

## 🏗️ 1. Architecture & Patterns (Vue d'ensemble)
- **Points Forts** :
  - **Structure Modulaire** : Répartition claire entre `features/` (logique métier) et `ui/` (atomes graphiques).
  - **Pattern de Hooks** : La logique complexe est systématiquement extraite dans des hooks (`useAgenda`, `useEstablishment`, `useAccountData`).
  - **App Router** : Utilisation correcte des conventions Next.js pour l'organisation des routes.

- **Points Faibles** :
  - **Logic Leakage résiduel** : Certaines pages (`page.tsx`) contiennent encore des extractions de métadonnées ou des redirections qui pourraient être gérées côté serveur ou dans le middleware.
  - **Duplication de boilerplate Supabase** : Chaque hook recrée son client et gère l'auth de manière quasi identique.

---

## ⚡ 2. Performance & Optimisation
- **Sequential Waterfalls (CRITIQUE)** : 
  - Dans `useAccountData.ts`, `useAgenda.ts` et `useEstablishment.ts`, les appels `await` sont majoritairement séquentiels.
  - *Exemple* : Charger le profil, PUIS les rdv, PUIS les favs, PUIS les avis. Un `Promise.all` est nécessaire partout.
- **Rendus inutiles** : Manque d'utilisation de `useMemo` pour les calculs de dates lourds (notamment dans la grille de l'agenda).

---

## 🛠️ 3. Qualité du Code & Maintenance
- **Constantes Magiques (OUTIL)** :
  - Hauteur des slots (`70px`), heures de début/fin (`7h-19h`) sont répétées en dur.
  - Couleurs et gradients (Tailwind 4) non centralisés dans un fichier de tokens métier.
- **Typage TypeScript** :
  - Utilisation fréquente de `any` dans les retours de fonctions ou les données de formulaires complexes.
  - Incohérence entre `interface` et `type` selon les modules.

---

## 🔐 4. Sécurité & Robustness
- **Authentification** : Dépendance au client Supabase côté navigateur pour des vérifications qui devraient être atomisées par le middleware pour éviter les "flickers" visuels.
- **Gestion d'erreurs** : Les blocs `try/catch` sont présents mais souvent limités à un `console.error`. Manque de feedback utilisateur unifié (Toast/Modal) sur toutes les actions.

---

## 📂 5. Analyse par Répertoire

### Répertoire `app/`
- **API Routes** : Très atomisées (une route par action), ce qui est bon, mais sans décorateur de validation de schéma (Zod).
- **Routes Dashboard** : Cohérentes. `/dashboard/construction` sert de placeholder, à nettoyer.
- **Public Routes** : `book/[id]` et `establishment/[id]` souffrent de composants UI trop gros.

### Répertoire `components/`
- **`components/ui/`** : Excellente collection d'atomes (Box, Flex, MotionBox). Devrait être la source unique de style pour éviter les classes Tailwind ad-hoc dans les features.
- **`components/features/`** :
  - **Account** : `useAccountData.ts` est le plus gros point de friction performance (waterfall).
  - **Agenda** : Désormais découpé, mais le bug de layout en vue semaine (colonne d'heure dupliquée) doit être fixé.
  - **Business** : `useEstablishment.ts` est stable mais pourrait bénéficier d'une validation de formulaire (React Hook Form).

---

## 🚀 Plan d'action recommandé
1. **Fixer le layout "Waterfalls"** : Passer en `Promise.all` sur tous les hooks de data.
2. **Centraliser les Configs** : Créer un fichier `constants/agenda.ts` pour les heures et hauteurs.
3. **Unifier la validation** : Introduire Zod ou une validation stricte pour les données Supabase.
4. **Fixer le bug de la Vue Semaine** : Extraire la colonne d'heure de `TimeSlot`.
