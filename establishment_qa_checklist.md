# Checklist QA - Page Établissement & Réservation (Public)

Ce document liste les points de contrôle pour valider le bon fonctionnement de la page établissement et du tunnel de réservation client.

## 1. Présentation Générale
- [ ] Le nom, la ville et la description s'affichent correctement.
- [ ] La photo principale est visible et de bonne qualité.
- [ ] Les badges de secteurs d'activité sont présents et stylisés.
- [ ] Le fil d'Ariane (Breadcrumb) permet de revenir à l'accueil ou à la recherche.

## 2. Favoris (Heart Icon)
- [ ] Le bouton favoris (cœur) change d'état au clic pour les clients connectés.
- [ ] Une modale de connexion s'affiche si un utilisateur non-identifié clique sur le cœur.
- [ ] Après connexion, l'utilisateur est redirigé vers la page de l'établissement.

## 3. Tunnel de Réservation - Étape 1 : Prestations
- [ ] Toutes les prestations actives de l'établissement sont listées.
- [ ] Le prix et la durée sont affichés de manière lisible.
- [ ] Le clic sur une prestation passe sans erreur à l'étape suivante.

## 4. Tunnel de Réservation - Étape 2 : Date & Créneau
- [ ] La réglette des 14 jours commence bien à la date du jour.
- [ ] Les jours de fermeture de l'établissement sont grisés/désactivés.
- [ ] Les créneaux horaires s'affichent dynamiquement selon la durée de la prestation.
- [ ] Les créneaux déjà réservés ou marqués comme indisponibles sont masqués.
- [ ] La sélection d'un créneau affiche le bouton "Passer au récapitulatif".

## 5. Tunnel de Réservation - Étape 3 : Récapitulatif & Infos
- [ ] Les détails de la prestation et du créneau sélectionné sont exacts.
- [ ] Le bouton "Modifier le créneau" permet de revenir en arrière.
- [ ] Le formulaire client (Prénom, Nom, Email, Téléphone) valide la saisie.
- [ ] Le bouton "Confirmer" est désactivé si les champs obligatoires sont vides.
- [ ] Pour les clients non-identifiés, un encart suggère la connexion/création de compte.

## 6. Tunnel de Réservation - Étape 4 : Confirmation
- [ ] Le message de succès s'affiche immédiatement après la validation (sans rechargement de page).
- [ ] Le texte de confirmation s'adapte selon si l'établissement utilise l'auto-confirmation ou non.
- [ ] Le bouton "Retour à l'accueil" fonctionne correctement.

## 7. Avis Clients
- [ ] La note moyenne et le nombre total d'avis sont calculés correctement.
- [ ] Les étoiles utilisent la couleur de la charte (#c0a062).
- [ ] La liste affiche les derniers avis avec le nom du client (ou "Utilisateur").
- [ ] Le bouton "Donner mon avis" ouvre la modale de saisie.
- [ ] Un client ne peut pas laisser deux avis sur le même établissement.
- [ ] La soumission d'un avis rafraîchit la liste sans recharger la page.

## 8. Informations Sidebar (Desktop) / Bas de page (Mobile)
- [ ] L'adresse complète et le code postal sont affichés.
- [ ] Le tableau des horaires d'ouverture est fidèle aux réglages pro.
- [ ] La mention "Fermé" apparaît clairement pour les jours de repos.

## 9. Gestion des Blocages
- [ ] Si un client est banni par le professionnel, le tunnel affiche un message d'erreur et bloque la réservation.

## 10. Responsive & Mobile UX
- [ ] La navigation entre les étapes est fluide sur smartphone.
- [ ] La réglette des dates est scrollable horizontalement.
- [ ] Les images et textes s'adaptent sans déborder (over-flow).

## 11. États d'Authentification & Permissions
### A. Visiteur non-connecté
- [ ] Peut consulter la page, les services et les avis sans restriction de lecture.
- [ ] Le clic sur le cœur (favoris) affiche la modale "Ajouter aux favoris".
- [ ] Le clic sur "Donner mon avis" affiche la modale de connexion.
- [ ] Peut finaliser une réservation (l' étape 3 demande alors les infos manuellement).

### B. Client connecté
- [ ] Le bouton favoris fonctionne instantanément (ajout/suppression).
- [ ] Dans le tunnel (Étape 3), les champs Prénom, Nom, Email et Téléphone sont **pré-remplis**.
- [ ] Ne peut pas laisser d'avis s'il en a déjà publié un pour cet établissement (le bouton doit disparaître ou être désactivé).

### C. Professionnel connecté (Prestataire)
- [ ] **Navigation Pro** : S'il est sur sa propre page, un lien/bouton de retour au Dashboard est-il présent ?
- [ ] **Auto-réservation** : Vérifier si un professionnel peut prendre rendez-vous chez lui-même (comportement attendu ?).
- [ ] **Avis** : Un professionnel peut-il laisser un avis sur son propre établissement ? (Devrait être bloqué ou déconseillé).
- [ ] **Vue Confrère** : S'il visite un autre établissement, il doit être traité comme un client ou un visiteur (selon s'il a aussi un profil client lié).
