# GlowPlan — Claude Code Context

## Stack
- **Framework** : Next.js 16 (App Router, TypeScript)
- **UI** : Tailwind CSS, composants custom dans `components/ui`
- **Backend** : Supabase (PostgreSQL + Auth + Storage)
- **Emails** : Resend via `lib/mail`
- **Animations** : Framer Motion

## Structure
- `app/` — pages et API routes (Next.js App Router)
- `components/features/` — composants métier (Hero, Dashboard, Booking…)
- `components/ui/` — design system interne (Button, Card, Input…)
- `lib/` — utilitaires, Supabase client, mail
- `supabase/migrations/` — migrations SQL

## Charte graphique
- Couleur primaire : `#32422c` (vert foncé)
- Accent : `#c0a062` (or)
- Font : Inter (sans-serif) + serif italique pour les titres

---

## UI/UX Pro Max Skill

Skill installé dans `.claude/skills/ui-ux-pro-max/`

**Commande de recherche :**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "<query>" [--domain <domain>] [--stack <stack>] [-n <max>]
```

**Domaines disponibles :** `style`, `color`, `typography`, `chart`, `landing`, `product`, `ux`, `google-fonts`

**Stacks disponibles :** `nextjs`, `react`, `react-native`, `vue`, `svelte`, `flutter`, `shadcn`, `html-tailwind`

**Générer un design system complet :**
```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness" --design-system -p "GlowPlan"
```

**Utilisation :** Avant tout travail UI/UX sur ce projet, utiliser ce skill pour obtenir des recommandations de styles, couleurs et typographies adaptées à une app beauté & bien-être.

Consulter `.claude/skills/ui-ux-pro-max/SKILL.md` pour les règles complètes de design.
