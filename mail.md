Emails réservation / activité
1. Demande de réservation
Côté prestataire
Nouvelle demande de réservation reçue
si fonctionnement en validation manuelle
contient :
cliente
prestation
date / heure
notes éventuelles
statut : en attente de validation

Objet : Nouvelle demande de réservation reçue
Préheader : Une demande est en attente de votre validation.
Bonjour {{provider_name}},
Vous avez reçu une nouvelle demande de réservation sur Glowplan.
Détails de la demande :
Cliente : {{client_name}}
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Notes : {{client_note}}
Statut : En attente de validation (si demande de confirmation préalable)
Vous pouvez consulter cette demande et la confirmer ou la refuser depuis votre espace prestataire.
Voir la demande
{{dashboard_link}}
L’équipe Glowplan


Côté utilisateur
Demande de réservation envoyée
cas validation manuelle
contient :
récapitulatif
message clair : “en attente de validation du prestataire”
mention acompte si applicable
mention adresse :
soit affichée
soit “communiquée 24h avant”

Objet : Votre demande de réservation a bien été envoyée
Préheader : Elle est maintenant en attente de validation.
Bonjour {{first_name}},
Votre demande de réservation a bien été envoyée à {{provider_name}}.
Récapitulatif :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Prix : {{price}}
Statut : En attente de validation du prestataire
{{deposit_block_optional}}
Adresse :
{{address_or_24h_message}}
Vous recevrez un nouvel email dès que votre réservation sera confirmée ou refusée.
Voir ma réservation
{{booking_link}}
L’équipe Glowplan





2. Réservation confirmée
Côté utilisateur
Rendez-vous confirmé
si confirmation auto ou après validation prestataire
contient :
prestataire
prestation
date / heure
prix
adresse ou mention “communiquée 24h avant”
conditions
acompte / lien de paiement si applicable

Objet : Votre rendez-vous est confirmé
Préheader : Retrouvez ici tous les détails de votre réservation.
Bonjour {{first_name}},
Bonne nouvelle ✨
Votre rendez-vous avec {{provider_name}} est confirmé.
Détails du rendez-vous :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Prix : {{price}}
Référence : {{booking_reference}}
Adresse :
{{address_or_24h_message}}
Conditions :
{{conditions_block}}
{{deposit_payment_block_optional}}
Voir ma réservation
{{booking_link}}
À bientôt,
L’équipe Glowplan





3. Réservation refusée
Côté utilisateur
Demande de réservation refusée
message simple et propre
idéalement :
raison facultative
invitation à reprendre un autre créneau

Objet : Votre demande de réservation n’a pas pu être confirmée
Préheader : Nous vous invitons à choisir un autre créneau.
Bonjour {{first_name}},
Votre demande de réservation auprès de {{provider_name}} n’a pas pu être confirmée.
Demande concernée :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
{{reason_optional_block}}
Nous vous invitons à choisir un autre créneau si vous le souhaitez.
Voir les disponibilités
{{booking_link}}
L’équipe Glowplan




Côté prestataire
Confirmation qu’un refus a bien été enregistré
optionnel

Objet : Refus de réservation enregistré
Préheader : La demande a bien été refusée.
Bonjour {{provider_name}},
Le refus de la demande de réservation suivante a bien été enregistré :
Cliente : {{client_name}}
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
La cliente a été informée.
L’équipe Glowplan








4. Réservation annulée
Côté utilisateur
Rendez-vous annulé
si annulation par prestataire
ou si annulation par l’utilisatrice
le mail doit indiquer :
qui a annulé
date / heure concernée
éventuel remboursement / acompte

Objet : Votre rendez-vous a été annulé
Préheader : Retrouvez le détail de cette annulation.
Bonjour {{first_name}},
Le rendez-vous suivant a été annulé :
Prestataire : {{provider_name}}
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Annulé par : {{cancelled_by}}
{{refund_or_deposit_block}}
Si besoin, vous pouvez reprendre un autre créneau directement depuis Glowplan.
Reprendre un rendez-vous
{{booking_link}}
L’équipe Glowplan




Côté prestataire
Rendez-vous annulé par la cliente

Objet : Rendez-vous annulé par la cliente
Préheader : Une réservation a été annulée.
Bonjour {{provider_name}},
La cliente {{client_name}} a annulé le rendez-vous suivant :
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
{{deposit_status_block}}
Voir mon agenda
{{dashboard_link}}
L’équipe Glowplan



Rendez-vous annulé par le système / admin :
Exemple : indispo ajoutée en dernière minute pour urgence

Objet : Un rendez-vous a été annulé automatiquement
Préheader : Consultez le détail de l’annulation.
Bonjour {{provider_name}},
Le rendez-vous suivant a été annulé par le système / un administrateur :
Cliente : {{client_name}}
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Motif : {{admin_reason}}
Voir mon agenda
{{dashboard_link}}
L’équipe Glowplan





5. Réservation modifiée / déplacée
Côté utilisateur
Rendez-vous modifié
nouvelle date / nouvelle heure / nouvelle prestation

Objet : Votre rendez-vous a été modifié
Préheader : Voici les nouvelles informations.
Bonjour {{first_name}},
Votre rendez-vous avec {{provider_name}} a été modifié.
Nouvelles informations :
Prestation : {{service_name}}
Nouvelle date : {{appointment_date}}
Nouvelle heure : {{appointment_time}}
{{address_or_24h_message}}
Voir ma réservation
{{booking_link}}
L’équipe Glowplan



Côté prestataire
Modification de rendez-vous enregistrée
si le changement vient de la cliente ou d’un admin

Objet : Modification de rendez-vous enregistrée
Préheader : La réservation a bien été mise à jour.
Bonjour {{provider_name}},
La modification du rendez-vous suivant a bien été enregistrée :
Cliente : {{client_name}}
Prestation : {{service_name}}
Date : {{appointment_date}}
Heure : {{appointment_time}}
Origine de la modification : {{change_origin}}
Voir le rendez-vous
{{dashboard_link}}
L’équipe Glowplan
