# 🗓️ Checklist de Tests : Agenda Professionnel Glowplan

Ce document récapitule l'ensemble des points à tester pour garantir la robustesse de l'agenda avant la mise en production.

---

## 1. 🧭 Navigation et Affichage
- [ ] **Changement de vue** : Passer entre Jour, Semaine et Mois. Vérifier que les événements restent cohérents.
- [ ] **Navigation temporelle** : Utiliser les flèches (Précédent/Suivant) et le bouton "Aujourd'hui".
- [ ] **Indicateur "Aujourd'hui"** : Vérifier que le jour actuel est bien mis en évidence dans toutes les vues.
- [ ] **Plage horaire** : Vérifier que l'agenda affiche bien de 07:00 à 19:00 (ou selon config).
- [ ] **Curseur temporel** : Vérifier que le trait indiquant l'heure actuelle est bien positionné (si présent).

---

## 2. 📅 Gestion des Rendez-vous (Appointments)
- [ ] **Création manuelle** : Créer un RDV en cliquant sur un créneau vide.
- [ ] **Validation passée** : Tenter de créer un RDV hier. Un message d'erreur doit s'afficher.
- [ ] **Validation horaire** : Tenter de créer un RDV pour aujourd'hui à une heure déjà passée.
- [ ] **Modification** : Changer l'heure, le service ou les notes d'un RDV existant.
- [ ] **Changement de statut** : Confirmer un RDV "En attente".
- [ ] **Annulation avec motif** : Annuler un RDV et vérifier qu'un motif peut être saisi.

---

## 3. 🚫 Gestion des Indisponibilités (Unavailabilities)
- [ ] **Création d'absence** : Bloquer un créneau (ex: Déjeuner, Formation).
- [ ] **Visualisation** : Vérifier que le bloc est bien rouge et affiche le bon label.
- [ ] **Absences passées** : Tenter de créer une absence dans le passé (bloqué).
- [ ] **Modification d'absence** : Changer la durée ou le type d'une absence.
- [ ] **Suppression** : Supprimer une absence et vérifier que le créneau redevient libre.

---

## 4. ⚔️ Conflits et Robustesse (CRITIQUE)
- [ ] **Double RDV** : Tenter de créer un RDV sur un créneau déjà occupé par un autre RDV (Avertissement attendu).
- [ ] **RDV sur Indisponibilité** : Tenter de créer un RDV sur un créneau bloqué (Blocage attendu).
- [ ] **Indisponibilité sur RDV** : Créer une absence là où il y a déjà des RDV.
    - [ ] Vérifier que la fenêtre de gestion des conflits apparaît.
    - [ ] Tester l'option "Annuler les RDV en conflit" avec motif.
    - [ ] Tester l'option "Créer sans annuler" (si autorisé par le métier).
- [ ] **Chevauchement partiel** : Créer un RDV de 1h qui mord de 15min sur une absence. Le conflit doit être détecté.

---

## 5. 🌍 Événements Multi-jours
- [ ] **Indisponibilité longue** : Créer une absence du lundi au mercredi.
    - [ ] Vérifier l'affichage en vue **Mois** (badge présent sur chaque jour).
    - [ ] Vérifier l'affichage en vue **Semaine** (bloc traversant).
    - [ ] Vérifier l'affichage en vue **Jour** (événement visible le lundi, le mardi ET le mercredi).
- [ ] **RDV à cheval sur minuit** : Tester un RDV qui finit le lendemain (cas limite).

---

## 6. ⚡ Temps Réel et Données
- [ ] **Synchronisation** : Ouvrir l'agenda sur deux onglets différents. Créer un RDV sur l'un, il doit apparaître instantanément sur l'autre.
- [ ] **Persistance** : Rafraîchir la page (F5) et vérifier que tous les événements sont toujours là.
- [ ] **Chargement** : Vérifier que le skeleton de chargement s'affiche proprement.

---

## 7. 📱 Ergonomie et Mobile
- [ ] **Responsive** : Vérifier que l'agenda est utilisable sur mobile (défilement horizontal ou vue jour par défaut).
- [ ] **Clic sur créneau** : Vérifier que la zone de clic pour ouvrir le formulaire est assez large.
- [ ] **Modal** : Vérifier que les formulaires ne débordent pas de l'écran sur petit téléphone.

---

## 🚀 Tentatives de Bug (Stress Test)
- [ ] Cliquer frénétiquement sur "Suivant" pour voir si le chargement suit.
- [ ] Tenter de créer un RDV avec une heure de fin AVANT l'heure de début.
- [ ] Saisir des emojis ou du texte très long dans les notes.
- [ ] Tenter d'annuler un RDV déjà annulé (si possible via double clic).
