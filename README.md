# GlowPlan

> Application SaaS de gestion pour professionnels de la beauté

## 🎯 Description

GlowPlan est une plateforme web qui permet aux professionnels indépendants de la beauté (esthéticiennes, coiffeuses, prothésistes ongulaires) de gérer leurs rendez-vous, clients, services et revenus en toute simplicité.

## 🛠️ Stack Technique

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Database**: Supabase (à venir)

## 📁 Architecture du Projet

```
glowplan/
├── app/                      # Next.js App Router
│   ├── page.tsx             # Landing page (orchestration uniquement)
│   ├── layout.tsx           # Layout racine
│   └── globals.css          # Styles globaux
│
├── components/
│   ├── ui/                  # Design System - Composants atomiques
│   │   ├── Button.tsx       # Bouton avec variantes (primary, secondary, outline, danger, ghost)
│   │   ├── Input.tsx        # Input avec label, erreur, icônes
│   │   ├── Card.tsx         # Card avec variantes (default, bordered, elevated)
│   │   ├── Badge.tsx        # Badge avec variantes et tailles
│   │   ├── Container.tsx    # Container responsive
│   │   ├── Section.tsx      # Section avec variantes et spacing
│   │   └── Logo.tsx         # Logo GlowPlan
│   │
│   └── features/            # Composants métier
│       ├── Header.tsx       # Header avec navigation
│       ├── Hero.tsx         # Section hero avec recherche
│       ├── ServiceCategories.tsx
│       ├── ProviderCard.tsx
│       ├── FeaturedProviders.tsx
│       ├── WhyGlowPlan.tsx
│       ├── CTASection.tsx
│       └── Footer.tsx
│
├── lib/
│   └── utils/
│       └── cn.ts            # Utilitaire classnames (clsx + tailwind-merge)
│
└── types/
    └── index.ts             # Types métier (User, Client, Service, Appointment)
```

## 🎨 Design System

### Règles d'Architecture UI (STRICTES)

**❌ INTERDIT:**
- Créer des éléments HTML bruts (`<button>`, `<input>`, etc.) dans les pages
- Utiliser `alert()`, `confirm()`, `prompt()`
- Dupliquer du code UI

**✅ OBLIGATOIRE:**
- Tous les éléments UI doivent être des composants dans `/components/ui`
- Les pages ne font qu'orchestrer les composants
- Le design est centralisé et modifiable globalement

### Composants UI Disponibles

#### Button
```tsx
<Button variant="primary" size="md" loading={false}>
  Cliquer ici
</Button>
```
- **Variantes**: `primary`, `secondary`, `outline`, `danger`, `ghost`
- **Tailles**: `sm`, `md`, `lg`
- **Props**: `loading`, `fullWidth`, `disabled`

#### Input
```tsx
<Input 
  label="Email"
  placeholder="email@example.com"
  leftIcon={<Mail />}
  error="Champ requis"
/>
```

#### Card
```tsx
<Card variant="elevated" padding="md" hoverable>
  <CardHeader>
    <CardTitle>Titre</CardTitle>
  </CardHeader>
  <CardContent>Contenu</CardContent>
</Card>
```

### Palette de Couleurs

```css
primary: #4A5D4F (vert foncé)
secondary: #E8E4DD (beige/gris clair)
accent: #8B7355 (marron clair)
danger: #DC2626 (rouge)
success: #16A34A (vert)
```

## 🚀 Démarrage

### Installation

```bash
npm install
```

### Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

### Build

```bash
npm run build
npm start
```

## 📝 Principes de Développement

### Clean Code
- Nommage clair et explicite
- Fonctions petites et focalisées (SRP)
- Pas de duplication (DRY)
- Code auto-documenté

### SOLID
- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### Architecture
- Séparation UI / Business Logic
- Composants réutilisables
- Design system centralisé
- Mobile-first

## 🎯 Roadmap

- [x] Initialisation Next.js + TypeScript + Tailwind
- [x] Design System (Button, Input, Card, Badge, etc.)
- [x] Landing Page
- [ ] Authentification (Supabase Auth)
- [ ] Dashboard
- [ ] Gestion des rendez-vous
- [ ] Gestion des clients
- [ ] Gestion des services
- [ ] Suivi des revenus
- [ ] Fidélisation clients

## 📄 License

Propriétaire - GlowPlan © 2026
