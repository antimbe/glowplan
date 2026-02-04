import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, reason } = await request.json();

    const supabase = await createClient();

    // Get appointment details with establishment and service info
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name, price, duration),
        establishments(name, email, phone, address, city)
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

    const clientName = appointment.client_first_name && appointment.client_last_name
      ? `${appointment.client_first_name} ${appointment.client_last_name}`
      : appointment.client_name || "Client";

    const clientEmail = appointment.client_email;

    if (!clientEmail) {
      return NextResponse.json({ error: "No client email found" }, { status: 400 });
    }

    // Email to client about cancellation by establishment
    const clientEmailContent = {
      to: clientEmail,
      subject: `Annulation de votre rendez-vous - ${appointment.establishments?.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #32422c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">GlowPlan</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #dc2626;">Votre rendez-vous a été annulé</h2>
            <p>Bonjour ${clientName},</p>
            <p>Nous sommes désolés de vous informer que <strong>${appointment.establishments?.name}</strong> a dû annuler votre rendez-vous.</p>
            
            ${reason ? `
            <div style="background: #fef2f2; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <p style="margin: 0; color: #991b1b;"><strong>Motif :</strong> ${reason}</p>
            </div>
            ` : ''}
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc2626;">
              <h3 style="margin-top: 0; color: #32422c;">Détails du rendez-vous annulé</h3>
              <p><strong>Établissement :</strong> ${appointment.establishments?.name}</p>
              <p><strong>Prestation :</strong> ${appointment.services?.name || "Non spécifiée"}</p>
              <p><strong>Date :</strong> ${formatDate(startDate)}</p>
              <p><strong>Heure :</strong> ${formatTime(startDate)} - ${formatTime(endDate)}</p>
              <p><strong>Prix :</strong> ${appointment.services?.price || "—"}€</p>
            </div>
            
            <p>Nous vous invitons à reprendre rendez-vous directement sur notre plateforme.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://glowplan.fr'}/search" 
                 style="background: #32422c; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                Reprendre rendez-vous
              </a>
            </div>

            <p style="color: #666; font-size: 14px;">
              Si vous avez des questions, n'hésitez pas à contacter l'établissement :
            </p>
            <ul style="color: #666; font-size: 14px;">
              ${appointment.establishments?.email ? `<li>Email : ${appointment.establishments.email}</li>` : ''}
              ${appointment.establishments?.phone ? `<li>Téléphone : ${appointment.establishments.phone}</li>` : ''}
            </ul>
          </div>
          <div style="background: #32422c; padding: 15px; text-align: center;">
            <p style="color: white; margin: 0; font-size: 12px;">© ${new Date().getFullYear()} GlowPlan - Tous droits réservés</p>
          </div>
        </div>
      `,
    };

    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      console.warn("RESEND_API_KEY manquante : l'email d'annulation client n'a pas été envoyé.");
    } else {
      const resend = new Resend(apiKey);

      await resend.emails.send({
        from: "GlowPlan <noreply@glowplan.fr>",
        to: clientEmailContent.to,
        subject: clientEmailContent.subject,
        html: clientEmailContent.html,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Cancellation notification sent to client",
    });
  } catch (error) {
    console.error("Error sending cancellation notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
