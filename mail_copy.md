Emails liés aux RDV créés manuellement par le prestataire
Côté prestataire
RDV manuel créé
“vous avez créé un rendez-vous manuel pour X”
utile comme confirmation / traçabilité

Objet : Rendez-vous manuel créé
Préheader : Le rendez-vous a bien été ajouté à votre agenda.
Bonjour {{provider_name}},
Vous avez créé un rendez-vous manuel pour {{client_name}}.
Détails :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Ce rendez-vous a bien été ajouté à votre agenda.
Voir mon agenda
{{dashboard_link}}
L’équipe Glowplan







Côté utilisateur
Un rendez-vous a été créé à votre nom
essentiel
doit contenir :
prestation
date / heure
prestataire
adresse / ou mention “24h avant”
conditions / acompte si applicable

Objet : Un rendez-vous a été créé à votre nom
Préheader : Retrouvez ici toutes les informations utiles.
Bonjour {{first_name}},
{{provider_name}} a créé un rendez-vous à votre nom sur Glowplan.
Détails du rendez-vous :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Prestataire : {{provider_name}}
Adresse :
{{address_or_24h_message}}
Conditions :
{{conditions_block}}
{{deposit_payment_block_optional}}
Voir mon rendez-vous
{{booking_link}}
L’équipe Glowplan



Côté prestataire
RDV manuel modifié

Objet : Rendez-vous manuel modifié
Préheader : La mise à jour a bien été enregistrée.
Bonjour {{provider_name}},
Le rendez-vous manuel créé pour {{client_name}} a bien été modifié.
Nouvelles informations :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Voir mon agenda
{{dashboard_link}}
L’équipe Glowplan











RDV manuel supprimé
optionnel mais utile

Objet : Rendez-vous manuel supprimé
Préheader : La suppression a bien été prise en compte.
Bonjour {{provider_name}},
Le rendez-vous manuel créé pour {{client_name}} a bien été supprimé de votre agenda.
L’équipe Glowplan



Côté utilisateur
Le rendez-vous créé manuellement à votre nom a été modifié

Objet : Votre rendez-vous a été modifié
Préheader : Voici les nouvelles informations communiquées par votre prestataire.
Bonjour {{first_name}},
Le rendez-vous créé à votre nom par {{provider_name}} a été modifié.






Le rendez-vous créé manuellement à votre nom a été annulé
Objet : Votre rendez-vous a été annulé
Préheader : Le rendez-vous créé à votre nom n’est plus maintenu.
Bonjour {{first_name}},
Le rendez-vous créé à votre nom par {{provider_name}} a été annulé.
Rendez-vous concerné :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Pour toute question complémentaire, vous pouvez contacter directement votre prestataire.
L’équipe Glowplan





D. Emails liés aux acomptes / paiements
Côté utilisateur
Demande de paiement d’acompte (en général cette demain est envoyée soit directement via le mail de confirmation de rdv reçu parl’utilisateur / ou possible de faire un second mail séparé)
lien de paiement
montant
délai éventuel
conséquences si non payé


Objet : Votre acompte est requis pour confirmer le rendez-vous
Préheader : Réglez votre acompte pour finaliser votre réservation.
Bonjour {{first_name}},
Pour confirmer votre rendez-vous avec {{provider_name}}, un acompte de {{deposit_amount}} est demandé.
Rendez-vous concerné :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Montant de l’acompte : {{deposit_amount}}
À régler avant le : {{deposit_deadline}}
Payer mon acompte
{{payment_link}}
Sans règlement avant cette échéance, votre réservation pourra ne pas être maintenue.
L’équipe Glowplan

Acompte payé avec succès
confirmation côté cliente

Objet : Votre acompte a bien été payé
Préheader : Votre paiement a été enregistré.
Bonjour {{first_name}},
Votre acompte de {{deposit_amount}} a bien été payé pour votre rendez-vous avec {{provider_name}}.
Récapitulatif :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Acompte payé : {{deposit_amount}}
{{manual_validation_optional_block}}
Voir ma réservation
{{booking_link}}
L’équipe Glowplan



Acompte en attente de validation du prestataire
si le prestataire confirme manuellement la réception

Objet : Votre acompte est en attente de validation
Préheader : Votre paiement a bien été transmis.
Bonjour {{first_name}},
Votre acompte de {{deposit_amount}} a bien été signalé pour votre rendez-vous avec {{provider_name}}.
Il est actuellement en attente de validation par le prestataire.
Vous recevrez un nouvel email dès que votre acompte sera confirmé.
L’équipe Glowplan

Acompte validé / reçu par le prestataire
le RDV est désormais confirmé

Objet : Votre acompte a bien été validé
Préheader : Votre rendez-vous est désormais confirmé.
Bonjour {{first_name}},
Bonne nouvelle ✨
Votre acompte de {{deposit_amount}} a bien été validé par {{provider_name}}.
Votre rendez-vous est désormais confirmé.
Détails :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Voir ma réservation
{{booking_link}}
L’équipe Glowplan

Acompte non reçu / paiement expiré / lien expiré
si ce cas existe dans le flow

Objet : Votre acompte n’a pas pu être validé
Préheader : Le lien de paiement a expiré ou le paiement n’a pas été reçu.
Bonjour {{first_name}},
Nous n’avons pas pu confirmer le règlement de votre acompte pour le rendez-vous suivant :
Prestataire : {{provider_name}}
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Raison : {{payment_issue_reason}}
Si votre réservation est toujours active, vous pouvez réessayer via le lien ci-dessous :
Régler mon acompte
{{payment_link}}
L’équipe Glowplan


Remboursement d’acompte
si annulation ou geste commercial

Objet : Votre acompte a été remboursé
Préheader : Confirmation du remboursement.
Bonjour {{first_name}},
Votre acompte de {{deposit_amount}} pour le rendez-vous avec {{provider_name}} a bien été remboursé.
Récapitulatif :
Prestation : {{service_name}}
Date initiale : {{appointment_date}}
Montant remboursé : {{deposit_amount}}
Le délai d’apparition sur votre compte dépend de votre banque.
L’équipe Glowplan









Côté prestataire
Confirmation de réception d’acompte enregistrée 
si action manuelle depuis l’app : normalement possibilité via l’appli de confirmer la réception de l’acompte. Si oui, l’utilisateur reçoit le mail de confirmation de l’acompte.

Objet : Réception d’acompte enregistrée
Préheader : L’acompte a bien été confirmé.
Bonjour {{provider_name}},
La réception de l’acompte de {{deposit_amount}} pour {{client_name}} a bien été enregistrée.
Rendez-vous concerné :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
La cliente a été informée.
L’équipe Glowplan



E. Emails de rappel de RDV
Côté utilisateur
Rappel automatique 24h avant le RDV
très important
contient :
date / heure
prestation
prestataire
adresse complète si masquée jusque-là
conditions importantes
consignes d’accès si besoin

Objet : Rappel : votre rendez-vous approche
Préheader : Toutes les informations utiles pour demain.
Bonjour {{first_name}},
Petit rappel : vous avez rendez-vous demain avec {{provider_name}}.
Détails du rendez-vous :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Adresse :
{{full_address}}
Informations utiles :
{{access_info}}
Conditions importantes :
{{conditions_block}}
Nous vous recommandons d’arriver quelques minutes en avance si nécessaire.
À bientôt,
L’équipe Glowplan


Rappel manuel envoyé par le prestataire
si le prestataire clique “envoyer maintenant”
contenu identique au rappel automatique

Objet : Rappel de votre rendez-vous
Préheader : Votre prestataire vous rappelle votre rendez-vous à venir.
Bonjour {{first_name}},
{{provider_name}} vous rappelle votre rendez-vous à venir.
Détails :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Adresse : {{full_address}}
{{access_info}}
À bientôt,
L’équipe Glowplan


Rappel le jour même (dans le cas où réservation de dernuère minute ou ajout manuel de réservation)
optionnel MVP
à décider seulement si utile

Objet : Rappel : votre rendez-vous est aujourd’hui
Préheader : Voici les informations utiles pour aujourd’hui.
Bonjour {{first_name}},
Petit rappel : vous avez rendez-vous aujourd’hui avec {{provider_name}}.
Prestation : {{service_name}}
Heure : {{appointment_time}}
Adresse : {{full_address}}
À tout à l’heure,
L’équipe Glowplan




Côté prestataire
Confirmation qu’un rappel manuel a bien été envoyé
seulement si le mail a réellement été envoyé
pas de faux positif

Objet : Rappel envoyé avec succès
Préheader : Votre rappel manuel a bien été transmis.
Bonjour {{provider_name}},
Votre rappel manuel a bien été envoyé à {{client_name}} pour le rendez-vous suivant :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
L’équipe Glowplan



Échec d’envoi du rappel
très utile si le mail ne part pas
Objet : Échec d’envoi du rappel
Préheader : Le rappel manuel n’a pas pu être envoyé.
Bonjour {{provider_name}},
Le rappel manuel destiné à {{client_name}} n’a pas pu être envoyé.
Rendez-vous concerné :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Merci de réessayer depuis votre espace ou de contacter directement la cliente si besoin.
Voir le rendez-vous
{{dashboard_link}}
L’équipe Glowplan




F. Emails post-rendez-vous
Côté utilisateur
Demande d’avis
très intéressant produit


Objet : Votre avis nous intéresse
Préheader : Partagez votre retour sur votre rendez-vous.
Bonjour {{first_name}},
Suite à votre rendez-vous avec {{provider_name}}, nous serions ravis d’avoir votre retour.
Votre avis aide :
les autres clientes
le prestataire
Glowplan à améliorer l’expérience
Laisser un avis
{{review_link}}
Merci pour votre aide,
L’équipe Glowplan


Côté prestataire
Nouvel avis reçu

Objet : Vous avez reçu un nouvel avis
Préheader : Consultez le dernier avis laissé sur votre profil.
Bonjour {{provider_name}},
Vous avez reçu un nouvel avis sur Glowplan.
Cliente : {{client_name}}
Note : {{rating}}/5
{{review_excerpt}}
Voir l’avis
{{dashboard_link}}
L’équipe Glowplan


G. Emails système / erreurs / sécurité
Côté prestataire
Échec d’envoi d’un mail critique
ex : rappel manuel, demande de paiement, etc.

Objet : Échec d’envoi d’un email important
Préheader : Une action n’a pas pu être notifiée automatiquement.
Bonjour {{provider_name}},
L’un de vos emails automatiques n’a pas pu être envoyé.
Type d’email concerné : {{email_type}}
Destinataire : {{client_name}} / {{client_email}}
Date : {{event_date}}
Exemples : rappel manuel, demande de paiement d’acompte, confirmation importante.
Merci de vérifier la situation depuis votre espace.
Accéder à mon tableau de bord
{{dashboard_link}}
L’équipe Glowplan
