/**
 * RAPPELS AUTOMATIQUES DE RENDEZ-VOUS
 * ====================================
 * 
 * CONFIGURATION REQUISE:
 * 
 * 1. VERCEL (Production)
 *    - Le fichier vercel.json configure automatiquement les cron jobs
 *    - Schedule: "0 * * * *" (toutes les heures)
 *    - Ajouter l'env var CRON_SECRET dans Vercel Dashboard
 * 
 * 2. DÉVELOPPEMENT LOCAL
 *    - Ajouter dans .env.local:
 *      CRON_SECRET=your-secret-key-here
 * 
 *    - Pour tester manuellement:
 *      $ curl -X POST http://localhost:3000/api/cron/reminders \
 *        -H "Authorization: Bearer your-secret-key-here"
 * 
 *    - Ou en développement (sans auth requise):
 *      $ curl http://localhost:3000/api/cron/reminders
 * 
 * 3. SERVICE EXTERNE (ex: EasyCron, AWS Lambda)
 *    - Si pas déployé sur Vercel
 *    - Configurer une requête GET/POST toutes les heures vers:
 *      https://glowplan.vercel.app/api/cron/reminders
 *      Header: Authorization: Bearer <CRON_SECRET>
 * 
 * FONCTIONNEMENT:
 * 
 * 1. Rappels 24h avant RDV
 *    - Cherche les RDV confirmés dans 24h (+/- 1h battement)
 *    - Envoie email de rappel si pas déjà envoyé
 *    - Enregistre l'envoi dans appointment_reminders table
 * 
 * 2. Demandes d'avis post-RDV
 *    - Cherche les RDV terminés il y a 2-4h
 *    - Envoie email pour laisser un avis
 * 
 * 3. Auto-completion des RDV passés
 *    - Marque les RDV "confirmed" passés comme "completed"
 * 
 * 4. Auto-annulation des réservations expirées
 *    - Annule les "pending" et "pending_deposit" passés
 * 
 * DÉPANNAGE:
 * 
 * - Pas de rappels reçus?
 *   1. Vérifier le statut du RDV est "confirmed"
 *   2. Vérifier l'email du client est correct
 *   3. Vérifier les logs Vercel ou console
 *   4. Tester manuellement avec curl (voir haut)
 * 
 * - Rappels en double?
 *   - Vérifier la table appointment_reminders
 *   - Chaque rappel est enregistré par type (email_24h, review_request)
 */
