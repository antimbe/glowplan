import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, establishmentId, autoConfirm } = await request.json();

    const supabase = await createClient();

    // Get appointment details
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name, price, duration)
      `)
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Get establishment details
    const { data: establishment, error: estError } = await supabase
      .from("establishments")
      .select("name, email, phone")
      .eq("id", establishmentId)
      .single();

    if (estError || !establishment) {
      return NextResponse.json({ error: "Establishment not found" }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);

    const formatDate = (date: Date) => {
      const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
      const months = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
      return `${days[date.getDay()]} ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const formatTime = (date: Date) => {
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };

    // Email content for establishment (always sent)
    const establishmentEmailContent = {
      to: establishment.email,
      subject: `Nouvelle demande de réservation - ${appointment.client_first_name} ${appointment.client_last_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #32422c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">GlowPlan</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #32422c;">Nouvelle demande de réservation</h2>
            <p>Vous avez reçu une nouvelle demande de réservation :</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #32422c;">Détails du client</h3>
              <p><strong>Nom :</strong> ${appointment.client_first_name} ${appointment.client_last_name}</p>
              <p><strong>Email :</strong> ${appointment.client_email}</p>
              <p><strong>Téléphone :</strong> ${appointment.client_phone}</p>
              ${appointment.client_instagram ? `<p><strong>Instagram :</strong> ${appointment.client_instagram}</p>` : ""}
              ${appointment.notes ? `<p><strong>Notes :</strong> ${appointment.notes}</p>` : ""}
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #32422c;">Détails de la réservation</h3>
              <p><strong>Prestation :</strong> ${appointment.services?.name || "Non spécifiée"}</p>
              <p><strong>Date :</strong> ${formatDate(startDate)}</p>
              <p><strong>Heure :</strong> ${formatTime(startDate)} - ${formatTime(endDate)}</p>
              <p><strong>Prix :</strong> ${appointment.services?.price || "—"}€</p>
            </div>
            
            ${!autoConfirm ? `
              <p style="color: #666;">Cette réservation est en attente de confirmation. Connectez-vous à votre espace pour la confirmer ou la refuser.</p>
            ` : `
              <p style="color: #32422c; font-weight: bold;">Cette réservation a été automatiquement confirmée selon vos paramètres.</p>
            `}
          </div>
          <div style="background: #32422c; padding: 15px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} GlowPlan - Tous droits réservés</p>
          </div>
        </div>
      `,
    };

    // Email content for client (only if auto-confirm is enabled)
    const clientEmailContent = autoConfirm ? {
      to: appointment.client_email,
      subject: `Confirmation de votre réservation chez ${establishment.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #32422c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">GlowPlan</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #32422c;">Votre réservation est confirmée !</h2>
            <p>Bonjour ${appointment.client_first_name},</p>
            <p>Votre réservation chez <strong>${establishment.name}</strong> a été confirmée.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #32422c;">Récapitulatif</h3>
              <p><strong>Prestation :</strong> ${appointment.services?.name || "Non spécifiée"}</p>
              <p><strong>Date :</strong> ${formatDate(startDate)}</p>
              <p><strong>Heure :</strong> ${formatTime(startDate)} - ${formatTime(endDate)}</p>
              <p><strong>Prix :</strong> ${appointment.services?.price || "—"}€</p>
            </div>
            
            <p>À bientôt !</p>
          </div>
          <div style="background: #32422c; padding: 15px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} GlowPlan - Tous droits réservés</p>
          </div>
        </div>
      `,
    } : null;

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn("RESEND_API_KEY manquante : les emails de notification ne seront pas envoyés.");
    } else {
      const resend = new Resend(apiKey);

      await resend.emails.send({
        from: "GlowPlan <noreply@glowplan.fr>",
        to: establishmentEmailContent.to,
        subject: establishmentEmailContent.subject,
        html: establishmentEmailContent.html,
      });

      if (clientEmailContent) {
        await resend.emails.send({
          from: "GlowPlan <noreply@glowplan.fr>",
          to: clientEmailContent.to,
          subject: clientEmailContent.subject,
          html: clientEmailContent.html,
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: "Notification emails queued",
      establishmentNotified: true,
      clientNotified: autoConfirm,
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
