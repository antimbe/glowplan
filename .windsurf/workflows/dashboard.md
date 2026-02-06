---
description: Logique de redirection dashboard client/pro
---

# Logique de redirection

## Détermination du type d'utilisateur

1. **Priorité 1** : Métadonnées `user_metadata.user_type` dans auth.users
   - `"pro"` → Utilisateur professionnel
   - `"client"` → Utilisateur client

2. **Fallback** : Présence d'un établissement dans la table `establishments`
   - A un établissement → Pro
   - Pas d'établissement → Client

## Redirections

### Header (bouton "Mon compte")
- **Pro** → `/dashboard`
- **Client** → `/account`
- **Non connecté** → `/auth/select-space`

### Dashboard Pro (`/dashboard/business`)
- **Non connecté** → `/auth/pro/login`
- **Pro sans établissement** → Création automatique d'un établissement vide, reste sur `/dashboard/business`
- **Client** → Redirection vers `/account`
- **Pro avec établissement** → Affichage normal du dashboard

### Espace Client (`/account`)
- **Non connecté** → `/auth/client/login`
- **Client** → Affichage normal
- **Pro** → Peut aussi accéder (un pro peut être client)
