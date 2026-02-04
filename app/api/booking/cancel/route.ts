import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json();

    const supabase = await createClient();

    // Get appointment details with establishment and service info
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name, price, duration),
        establishments(name, email),
        client_profiles(first_name, last_name)
      `)
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
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

    const clientName = appointment.client_profiles 
      ? `${appointment.client_profiles.first_name} ${appointment.client_profiles.last_name}`
      : `${appointment.client_first_name || ""} ${appointment.client_last_name || appointment.client_name || ""}`.trim();

    // Email to establishment about cancellation
    const establishmentEmailContent = {
      to: appointment.establishments?.email,
      subject: `Annulation de réservation - ${clientName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #32422c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">GlowPlan</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #dc2626;">Réservation annulée</h2>
            <p>Le client <strong>${clientName}</strong> a annulé sa réservation.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #32422c;">Détails de la réservation annulée</h3>
              <p><strong>Client :</strong> ${clientName}</p>
              <p><strong>Email :</strong> ${appointment.client_email || "Non renseigné"}</p>
              <p><strong>Téléphone :</strong> ${appointment.client_phone || "Non renseigné"}</p>
              <p><strong>Prestation :</strong> ${appointment.services?.name || "Non spécifiée"}</p>
              <p><strong>Date :</strong> ${formatDate(startDate)}</p>
              <p><strong>Heure :</strong> ${formatTime(startDate)} - ${formatTime(endDate)}</p>
              <p><strong>Prix :</strong> ${appointment.services?.price || "—"}€</p>
            </div>
            
            <p style="color: #666;">Ce créneau est maintenant disponible pour d'autres réservations.</p>
          </div>
          <div style="background: #32422c; padding: 15px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} GlowPlan - Tous droits réservés</p>
          </div>
        </div>
      `,
    };

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn("RESEND_API_KEY manquante : l'email d'annulation établissement n'a pas été envoyé.");
    } else if (establishmentEmailContent.to) {
      const resend = new Resend(apiKey);

      await resend.emails.send({
        from: "GlowPlan <noreply@glowplan.fr>",
        to: establishmentEmailContent.to,
        subject: establishmentEmailContent.subject,
        html: establishmentEmailContent.html,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Cancellation notification sent",
    });
  } catch (error) {
    console.error("Error sending cancellation notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
