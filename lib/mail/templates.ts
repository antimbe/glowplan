import { getBaseLayout, getButton, getInfoBox, MAIL_PALETTE } from "./layout";

export const EmailTemplates = {
  // 1. Demande de réservation
  bookingRequestPro: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    client_note?: string;
    dashboard_link: string;
    isManualValidation: boolean;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Nouvelle demande de réservation reçue</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>Vous avez reçu une nouvelle demande de réservation sur Glowplan.</p>
      
      ${getInfoBox("Détails de la demande", [
        { label: "Cliente", value: data.client_name },
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        ...(data.client_note ? [{ label: "Notes", value: data.client_note }] : []),
        { label: "Statut", value: data.isManualValidation ? "En attente de validation" : "Confirmée automatiquement" }
      ])}
      
      <p>Vous pouvez consulter cette demande et la gérer depuis votre espace prestataire.</p>
      ${getButton("Voir la demande", data.dashboard_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Nouvelle demande de réservation reçue",
      html: getBaseLayout("Nouvelle demande de réservation", content),
    };
  },

  bookingRequestUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    price: string;
    address_or_24h_message: string;
    booking_link: string;
    deposit_block?: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Votre demande a bien été envoyée</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Votre demande de réservation a bien été envoyée à <strong>${data.provider_name}</strong>. Elle est actuellement en attente de validation.</p>
      
      ${getInfoBox("Récapitulatif", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Prix", value: data.price },
        { label: "Statut", value: "En attente de validation" }
      ])}
      
      ${data.deposit_block ? `<div style="margin: 20px 0;">${data.deposit_block}</div>` : ""}
      
      <h3 style="color: ${MAIL_PALETTE.primary}; font-size: 16px; margin-bottom: 10px;">Adresse</h3>
      <p style="margin-top: 0; color: ${MAIL_PALETTE.text};">${data.address_or_24h_message}</p>
      
      <p>Vous recevrez un nouvel email dès que votre réservation sera confirmée ou refusée.</p>
      ${getButton("Voir ma réservation", data.booking_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre demande de réservation a bien été envoyée",
      html: getBaseLayout("Demande de réservation envoyée", content),
    };
  },

  // 2. Réservation confirmée
  bookingConfirmedUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    price: string;
    booking_reference: string;
    address_or_24h_message: string;
    conditions_block?: string;
    deposit_payment_block?: string;
    booking_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Votre rendez-vous est confirmé ✨</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Bonne nouvelle ! Votre rendez-vous avec <strong>${data.provider_name}</strong> est maintenant confirmé.</p>
      
      ${getInfoBox("Détails du rendez-vous", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Prix", value: data.price },
        { label: "Référence", value: data.booking_reference }
      ])}
      
      <h3 style="color: ${MAIL_PALETTE.primary}; font-size: 16px; margin-bottom: 5px;">Adresse</h3>
      <p style="margin-top: 0; margin-bottom: 20px;">${data.address_or_24h_message}</p>
      
      ${data.conditions_block ? `
        <h3 style="color: ${MAIL_PALETTE.primary}; font-size: 16px; margin-bottom: 5px;">Conditions</h3>
        <p style="margin-top: 0; font-size: 14px; color: ${MAIL_PALETTE.textLight}; white-space: pre-line;">${data.conditions_block}</p>
      ` : ""}
      
      ${data.deposit_payment_block ? `<div style="margin: 20px 0;">${data.deposit_payment_block}</div>` : ""}
      
      ${getButton("Voir ma réservation", data.booking_link)}
      <p>À bientôt,<br>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre rendez-vous est confirmé",
      html: getBaseLayout("Rendez-vous confirmé", content),
    };
  },

  // 3. Réservation refusée
  bookingRefusedUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    reason?: string;
    booking_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Réservation non confirmée</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Votre demande de réservation auprès de <strong>${data.provider_name}</strong> n'a pas pu être confirmée.</p>
      
      ${getInfoBox("Demande concernée", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ])}
      
      ${data.reason ? `
        <p style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; font-style: italic;">
          <strong>Message du prestataire :</strong> ${data.reason}
        </p>
      ` : ""}
      
      <p>Nous vous invitons à choisir un autre créneau si vous le souhaitez.</p>
      ${getButton("Voir les disponibilités", data.booking_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre demande de réservation n’a pas pu être confirmée",
      html: getBaseLayout("Réservation refusée", content),
    };
  },

  bookingRefusedPro: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Refus de réservation enregistré</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>Le refus de la demande de réservation suivante a bien été enregistré :</p>
      
      ${getInfoBox("Détails", [
        { label: "Cliente", value: data.client_name },
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ])}
      
      <p>La cliente a été informée automatiquement par email.</p>
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Refus de réservation enregistré",
      html: getBaseLayout("Refus enregistré", content),
    };
  },

  // 4. Réservation annulée
  bookingCancelledUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    cancelled_by: string;
    refund_or_deposit_block?: string;
    booking_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Rendez-vous annulé</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Le rendez-vous suivant a été annulé :</p>
      
      ${getInfoBox("Détails de l'annulation", [
        { label: "Prestataire", value: data.provider_name },
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Annulé par", value: data.cancelled_by }
      ], "accent")}
      
      ${data.refund_or_deposit_block ? `<p>${data.refund_or_deposit_block}</p>` : ""}
      
      <p>Si besoin, vous pouvez reprendre un autre créneau directement depuis Glowplan.</p>
      ${getButton("Reprendre un rendez-vous", data.booking_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre rendez-vous a été annulé",
      html: getBaseLayout("Rendez-vous annulé", content),
    };
  },

  bookingCancelledPro: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    dashboard_link: string;
    deposit_status_block?: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Rendez-vous annulé par la cliente</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>La cliente <strong>${data.client_name}</strong> a annulé le rendez-vous suivant :</p>
      
      ${getInfoBox("Détails", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ], "accent")}
      
      ${data.deposit_status_block ? `<p>${data.deposit_status_block}</p>` : ""}
      
      ${getButton("Voir mon agenda", data.dashboard_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Rendez-vous annulé par la cliente",
      html: getBaseLayout("Annulation cliente", content),
    };
  },

  bookingCancelledSystem: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    reason: string;
    dashboard_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Annulation automatique</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>Le rendez-vous suivant a été annulé par le système ou un administrateur :</p>
      
      ${getInfoBox("Détails", [
        { label: "Cliente", value: data.client_name },
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Motif", value: data.reason }
      ], "accent")}
      
      ${getButton("Voir mon agenda", data.dashboard_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Un rendez-vous a été annulé automatiquement",
      html: getBaseLayout("Annulation automatique", content),
    };
  },

  // 5. Réservation modifiée
  bookingModifiedUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    address_or_24h_message: string;
    booking_link: string;
    changesDescription?: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Votre rendez-vous a été modifié</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Votre rendez-vous avec <strong>${data.provider_name}</strong> a été mis à jour.</p>
      
      ${data.changesDescription ? `
        <div style="background-color: ${MAIL_PALETTE.accentBg}; border-left: 4px solid ${MAIL_PALETTE.accent}; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">Modifications :</p>
          <ul style="margin: 5px 0 0 20px; color: #92400e; padding: 0;">
            ${data.changesDescription}
          </ul>
        </div>
      ` : ""}

      ${getInfoBox("Nouvelles informations", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ])}
      
      <h3 style="color: ${MAIL_PALETTE.primary}; font-size: 16px; margin-bottom: 5px;">Adresse</h3>
      <p style="margin-top: 0; margin-bottom: 20px;">${data.address_or_24h_message}</p>
      
      ${getButton("Voir ma réservation", data.booking_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre rendez-vous a été modifié",
      html: getBaseLayout("Rendez-vous modifié", content),
    };
  },

  bookingModifiedPro: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    change_origin: string;
    dashboard_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Modification de rendez-vous enregistrée</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>La modification du rendez-vous suivant a bien été enregistrée :</p>
      
      ${getInfoBox("Détails mis à jour", [
        { label: "Cliente", value: data.client_name },
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Origine", value: data.change_origin }
      ])}
      
      ${getButton("Voir le rendez-vous", data.dashboard_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Modification de rendez-vous enregistrée",
      html: getBaseLayout("Modification enregistrée", content),
    };
  },

  // --- C. MANUEL BOOKING ---

  manualBookingPro: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    dashboard_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Rendez-vous manuel créé</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>Vous avez créé un rendez-vous manuel pour <strong>${data.client_name}</strong>.</p>
      
      ${getInfoBox("Détails", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ])}
      
      <p>Ce rendez-vous a bien été ajouté à votre agenda.</p>
      ${getButton("Voir mon agenda", data.dashboard_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Rendez-vous manuel créé",
      html: getBaseLayout("Rendez-vous manuel créé", content),
    };
  },

  manualBookingUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    address_or_24h_message: string;
    conditions_block?: string;
    deposit_payment_block?: string;
    booking_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Un rendez-vous a été créé à votre nom</h2>
      <p>Bonjour ${data.first_name},</p>
      <p><strong>${data.provider_name}</strong> a créé un rendez-vous à votre nom sur Glowplan.</p>
      
      ${getInfoBox("Détails du rendez-vous", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Prestataire", value: data.provider_name }
      ])}
      
      <h3 style="color: ${MAIL_PALETTE.primary}; font-size: 16px; margin-bottom: 5px;">Adresse</h3>
      <p style="margin-top: 0; margin-bottom: 20px; color: ${MAIL_PALETTE.text};">${data.address_or_24h_message}</p>
      
      ${data.conditions_block ? `
        <h3 style="color: ${MAIL_PALETTE.primary}; font-size: 16px; margin-bottom: 5px;">Conditions</h3>
        <p style="margin-top: 0; font-size: 14px; color: ${MAIL_PALETTE.textLight}; white-space: pre-line;">${data.conditions_block}</p>
      ` : ""}
      
      ${data.deposit_payment_block ? `<div style="margin: 20px 0;">${data.deposit_payment_block}</div>` : ""}
      
      ${getButton("Voir mon rendez-vous", data.booking_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Un rendez-vous a été créé à votre nom",
      html: getBaseLayout("Nouveau rendez-vous", content),
    };
  },

  manualBookingModifiedPro: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    dashboard_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Rendez-vous manuel modifié</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>Le rendez-vous manuel créé pour <strong>${data.client_name}</strong> a bien été modifié.</p>
      
      ${getInfoBox("Nouvelles informations", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ])}
      
      <p>La modification a bien été enregistrée.</p>
      ${getButton("Voir mon agenda", data.dashboard_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Rendez-vous manuel modifié",
      html: getBaseLayout("Modification enregistrée", content),
    };
  },

  manualBookingModifiedUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    address_or_24h_message: string;
    booking_link: string;
    changesDescription?: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Votre rendez-vous a été modifié</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Le rendez-vous créé à votre nom par <strong>${data.provider_name}</strong> a été modifié.</p>
      
      ${data.changesDescription ? `
        <div style="background-color: ${MAIL_PALETTE.accentBg}; border-left: 4px solid ${MAIL_PALETTE.accent}; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #92400e; font-weight: bold;">Modifications :</p>
          <ul style="margin: 5px 0 0 20px; color: #92400e; padding: 0;">
            ${data.changesDescription}
          </ul>
        </div>
      ` : ""}

      ${getInfoBox("Nouvelles informations", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ])}
      
      <h3 style="color: ${MAIL_PALETTE.primary}; font-size: 16px; margin-bottom: 5px;">Adresse</h3>
      <p style="margin-top: 0; margin-bottom: 20px; color: ${MAIL_PALETTE.text};">${data.address_or_24h_message}</p>
      
      ${getButton("Voir ma réservation", data.booking_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre rendez-vous a été modifié",
      html: getBaseLayout("Rendez-vous modifié", content),
    };
  },

  manualBookingDeletedPro: (data: {
    provider_name: string;
    client_name: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Rendez-vous manuel supprimé</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>Le rendez-vous manuel créé pour <strong>${data.client_name}</strong> a bien été supprimé de votre agenda.</p>
      <p>La suppression a bien été prise en compte.</p>
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Rendez-vous manuel supprimé",
      html: getBaseLayout("Suppression enregistrée", content),
    };
  },

  manualBookingCancelledUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.accent}; font-size: 22px; font-weight: 700; margin-top: 0;">Votre rendez-vous a été annulé</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Le rendez-vous créé à votre nom par <strong>${data.provider_name}</strong> a été annulé.</p>
      
      ${getInfoBox("Rendez-vous concerné", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ], "accent")}
      
      <p>Pour toute question complémentaire, vous pouvez contacter directement votre prestataire.</p>
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre rendez-vous a été annulé",
      html: getBaseLayout("Rendez-vous annulé", content),
    };
  },
  
  // --- D. ACOMPTES / PAIEMENTS ---

  depositRequestUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    deposit_amount: string;
    deposit_deadline: string;
    payment_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Acompte requis</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Pour confirmer votre rendez-vous avec <strong>${data.provider_name}</strong>, un acompte de <strong>${data.deposit_amount}</strong> est demandé.</p>
      
      ${getInfoBox("Rendez-vous concerné", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Acompte", value: data.deposit_amount },
        { label: "À régler avant le", value: data.deposit_deadline }
      ])}
      
      ${getButton("Payer mon acompte", data.payment_link)}
      <p style="font-size: 14px; color: ${MAIL_PALETTE.textLight}; margin-top: 20px;">Sans règlement avant cette échéance, votre réservation pourra ne pas être maintenue.</p>
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre acompte est requis pour confirmer le rendez-vous",
      html: getBaseLayout("Acompte requis", content),
    };
  },

  depositPaidUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    deposit_amount: string;
    manual_validation_optional_block?: string;
    booking_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Acompte payé avec succès</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Votre acompte de <strong>${data.deposit_amount}</strong> a bien été payé pour votre rendez-vous avec <strong>${data.provider_name}</strong>.</p>
      
      ${getInfoBox("Récapitulatif", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Acompte payé", value: data.deposit_amount }
      ])}
      
      ${data.manual_validation_optional_block ? `<p>${data.manual_validation_optional_block}</p>` : ""}
      
      ${getButton("Voir ma réservation", data.booking_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre acompte a bien été payé",
      html: getBaseLayout("Paiement enregistré", content),
    };
  },

  depositPendingProValidationUser: (data: {
    first_name: string;
    provider_name: string;
    deposit_amount: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Acompte en attente de validation</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Votre acompte de <strong>${data.deposit_amount}</strong> a bien été signalé pour votre rendez-vous avec <strong>${data.provider_name}</strong>.</p>
      <p>Il est actuellement en attente de validation par le prestataire.</p>
      <p>Vous recevrez un nouvel email dès que votre acompte sera confirmé.</p>
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre acompte est en attente de validation",
      html: getBaseLayout("Paiement en attente", content),
    };
  },

  depositValidatedUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    deposit_amount: string;
    booking_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Acompte validé ✨</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Bonne nouvelle ✨</p>
      <p>Votre acompte de <strong>${data.deposit_amount}</strong> a bien été validé par <strong>${data.provider_name}</strong>.</p>
      <p>Votre rendez-vous est désormais confirmé.</p>
      
      ${getInfoBox("Détails", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ])}
      
      ${getButton("Voir ma réservation", data.booking_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre acompte a bien été validé",
      html: getBaseLayout("Rendez-vous confirmé", content),
    };
  },

  depositFailedUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    payment_issue_reason: string;
    payment_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.accent}; font-size: 22px; font-weight: 700; margin-top: 0;">Échec de l'accompte</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Nous n’avons pas pu confirmer le règlement de votre acompte pour le rendez-vous suivant :</p>
      
      ${getInfoBox("Détails", [
        { label: "Prestataire", value: data.provider_name },
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Raison", value: data.payment_issue_reason }
      ], "accent")}
      
      <p>Si votre réservation est toujours active, vous pouvez réessayer via le lien ci-dessous :</p>
      ${getButton("Régler mon acompte", data.payment_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre acompte n’a pas pu être validé",
      html: getBaseLayout("Échec de paiement", content),
    };
  },

  depositRefundedUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    deposit_amount: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Acompte remboursé</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Votre acompte de <strong>${data.deposit_amount}</strong> pour le rendez-vous avec <strong>${data.provider_name}</strong> a bien été remboursé.</p>
      
      ${getInfoBox("Récapitulatif", [
        { label: "Prestation", value: data.service_name },
        { label: "Date initiale", value: data.appointment_date },
        { label: "Montant remboursé", value: data.deposit_amount }
      ])}
      
      <p style="font-size: 14px; color: ${MAIL_PALETTE.textLight};">Le délai d’apparition sur votre compte dépend de votre banque.</p>
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre acompte a été remboursé",
      html: getBaseLayout("Remboursement effectué", content),
    };
  },

  depositReceivedPro: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    deposit_amount: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Réception d'acompte confirmée</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>La réception de l’acompte de <strong>${data.deposit_amount}</strong> pour <strong>${data.client_name}</strong> a bien été enregistrée.</p>
      
      ${getInfoBox("Rendez-vous concerné", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ])}
      
      <p>La cliente a été informée.</p>
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Réception d’acompte enregistrée",
      html: getBaseLayout("Acompte reçu", content),
    };
  },

  // --- E. RAPPELS DE RDV ---

  reminder24hUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    full_address: string;
    access_info?: string;
    conditions_block?: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Rappel : votre rendez-vous approche</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Petit rappel : vous avez rendez-vous demain avec <strong>${data.provider_name}</strong>.</p>
      
      ${getInfoBox("Détails du rendez-vous", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Adresse", value: data.full_address }
      ])}
      
      ${data.access_info ? `
        <h3 style="color: ${MAIL_PALETTE.primary}; font-size: 16px; margin-bottom: 5px;">Informations utiles</h3>
        <p style="margin-top: 0; margin-bottom: 20px;">${data.access_info}</p>
      ` : ""}
      
      ${data.conditions_block ? `
        <h3 style="color: ${MAIL_PALETTE.primary}; font-size: 16px; margin-bottom: 5px;">Conditions importantes</h3>
        <p style="margin-top: 0; font-size: 14px; color: ${MAIL_PALETTE.textLight}; white-space: pre-line;">${data.conditions_block}</p>
      ` : ""}
      
      <p>Nous vous recommandons d’arriver quelques minutes en avance si nécessaire.</p>
      <p>À bientôt,<br>L'équipe Glowplan</p>
    `;
    return {
      subject: "Rappel : votre rendez-vous approche",
      html: getBaseLayout("Rappel RDV", content),
    };
  },

  reminderManualUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    full_address: string;
    access_info?: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Rappel de votre rendez-vous</h2>
      <p>Bonjour ${data.first_name},</p>
      <p><strong>${data.provider_name}</strong> vous rappelle votre rendez-vous à venir.</p>
      
      ${getInfoBox("Détails", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time },
        { label: "Adresse", value: data.full_address }
      ])}
      
      ${data.access_info ? `<p>${data.access_info}</p>` : ""}
      
      <p>À bientôt,<br>L'équipe Glowplan</p>
    `;
    return {
      subject: "Rappel de votre rendez-vous",
      html: getBaseLayout("Rappel prestataire", content),
    };
  },

  reminderSameDayUser: (data: {
    first_name: string;
    provider_name: string;
    service_name: string;
    appointment_time: string;
    full_address: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Rappel : c'est aujourd'hui !</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Petit rappel : vous avez rendez-vous aujourd’hui avec <strong>${data.provider_name}</strong>.</p>
      
      ${getInfoBox("Détails", [
        { label: "Prestation", value: data.service_name },
        { label: "Heure", value: data.appointment_time },
        { label: "Adresse", value: data.full_address }
      ])}
      
      <p>À tout à l'heure,<br>L'équipe Glowplan</p>
    `;
    return {
      subject: "Rappel : votre rendez-vous est aujourd’hui",
      html: getBaseLayout("Rappel aujourd’hui", content),
    };
  },

  reminderSentPro: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Rappel envoyé avec succès</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>Votre rappel manuel a bien été envoyé à <strong>${data.client_name}</strong> pour le rendez-vous suivant :</p>
      
      ${getInfoBox("Détails", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ])}
      
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Rappel envoyé avec succès",
      html: getBaseLayout("Rappel transmis", content),
    };
  },

  reminderFailedPro: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    dashboard_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.accent}; font-size: 22px; font-weight: 700; margin-top: 0;">Échec d'envoi du rappel</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>Le rappel manuel destiné à <strong>${data.client_name}</strong> n’a pas pu être envoyé.</p>
      
      ${getInfoBox("Rendez-vous concerné", [
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ], "accent")}
      
      <p>Merci de réessayer depuis votre espace ou de contacter directement la cliente si besoin.</p>
      ${getButton("Voir le rendez-vous", data.dashboard_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Échec d’envoi du rappel",
      html: getBaseLayout("Échec de rappel", content),
    };
  },

  // --- F. POST-RENDEZ-VOUS ---

  reviewRequestUser: (data: {
    first_name: string;
    provider_name: string;
    review_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Votre avis nous intéresse</h2>
      <p>Bonjour ${data.first_name},</p>
      <p>Suite à votre rendez-vous avec <strong>${data.provider_name}</strong>, nous serions ravis d’avoir votre retour.</p>
      <p>Votre avis aide :</p>
      <ul>
        <li>Les autres clientes à faire le bon choix</li>
        <li>Le prestataire à s'améliorer</li>
        <li>Glowplan à garantir une expérience de qualité</li>
      </ul>
      ${getButton("Laisser un avis", data.review_link)}
      <p>Merci pour votre aide,<br>L'équipe Glowplan</p>
    `;
    return {
      subject: "Votre avis nous intéresse",
      html: getBaseLayout("Avis client", content),
    };
  },

  reviewReceivedPro: (data: {
    provider_name: string;
    client_name: string;
    rating: number;
    review_excerpt: string;
    dashboard_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Nouvel avis reçu ✨</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>Vous avez reçu un nouvel avis sur Glowplan.</p>
      
      ${getInfoBox("Détails de l'avis", [
        { label: "Cliente", value: data.client_name },
        { label: "Note", value: `${data.rating}/5` }
      ])}
      
      <p style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; font-style: italic;">
        "${data.review_excerpt}"
      </p>
      
      ${getButton("Voir l'avis", data.dashboard_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Vous avez reçu un nouvel avis",
      html: getBaseLayout("Nouvel avis", content),
    };
  },

  // --- G. SYSTEME / ERREURS ---

  appointmentFollowupPro: (data: {
    provider_name: string;
    client_name: string;
    service_name: string;
    appointment_date: string;
    appointment_time: string;
    dashboard_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.primary}; font-size: 22px; font-weight: 700; margin-top: 0;">Comment s'est passé votre rendez-vous ?</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>Le rendez-vous suivant vient de se terminer :</p>
      
      ${getInfoBox("Détails du rendez-vous", [
        { label: "Cliente", value: data.client_name },
        { label: "Prestation", value: data.service_name },
        { label: "Date", value: data.appointment_date },
        { label: "Heure", value: data.appointment_time }
      ])}
      
      <p>Le client s'est-il bien présenté ?</p>
      <p>Si ce n'est pas le cas, vous avez la possibilité de déclarer une absence non honorée ("poser un lapin") directement depuis votre tableau de bord.</p>
      
      ${getButton("Gérer ce rendez-vous", data.dashboard_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Suivi de rendez-vous : " + data.client_name,
      html: getBaseLayout("Suivi de votre agenda", content),
    };
  },

  criticalEmailFailedPro: (data: {
    provider_name: string;
    email_type: string;
    client_name: string;
    client_email: string;
    event_date: string;
    dashboard_link: string;
  }) => {
    const content = `
      <h2 style="color: ${MAIL_PALETTE.accent}; font-size: 22px; font-weight: 700; margin-top: 0;">Échec d'envoi d'email important</h2>
      <p>Bonjour ${data.provider_name},</p>
      <p>L’un de vos emails automatiques n’a pas pu être envoyé.</p>
      
      ${getInfoBox("Détails de l'erreur", [
        { label: "Type d'email", value: data.email_type },
        { label: "Destinataire", value: `${data.client_name} (${data.client_email})` },
        { label: "Date de l'événement", value: data.event_date }
      ], "accent")}
      
      <p style="font-size: 14px; color: ${MAIL_PALETTE.textLight};">Exemples : rappel manuel, demande de paiement d’acompte, confirmation importante.</p>
      <p>Merci de vérifier la situation depuis votre espace.</p>
      ${getButton("Accéder à mon tableau de bord", data.dashboard_link)}
      <p>L'équipe Glowplan</p>
    `;
    return {
      subject: "Échec d’envoi d’un email important",
      html: getBaseLayout("Erreur de notification", content),
    };
  }
};
