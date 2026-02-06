import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";

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
        establishments(name, email, phone, address, city)
      `)
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);

    const clientName = appointment.client_first_name && appointment.client_last_name
      ? `${appointment.client_first_name} ${appointment.client_last_name}`
      : appointment.client_name || "Client";

    const clientEmail = appointment.client_email;

    if (!clientEmail) {
      return NextResponse.json({ error: "No client email found" }, { status: 400 });
    }

    // Email content for client
    const clientEmailContent = {
      to: clientEmail,
      subject: `Confirmation de votre réservation chez ${appointment.establishments?.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #32422c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">GlowPlan</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #32422c;">Votre réservation est confirmée !</h2>
            <p>Bonjour ${appointment.client_first_name || clientName},</p>
            <p>Bonne nouvelle ! Votre réservation chez <strong>${appointment.establishments?.name}</strong> a été confirmée.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #32422c;">
              <h3 style="margin-top: 0; color: #32422c;">Récapitulatif de votre rendez-vous</h3>
              <p><strong>Établissement :</strong> ${appointment.establishments?.name}</p>
              <p><strong>Adresse :</strong> ${appointment.establishments?.address || ""}, ${appointment.establishments?.city || ""}</p>
              <p><strong>Prestation :</strong> ${appointment.services?.name || "Non spécifiée"}</p>
              <p><strong>Date :</strong> ${formatDateFull(startDate)}</p>
              <p><strong>Heure :</strong> ${formatTime(startDate)} - ${formatTime(endDate)}</p>
              <p><strong>Prix :</strong> ${appointment.services?.price || "—"}€</p>
            </div>
            
            <p>Nous avons hâte de vous accueillir !</p>
            
            <p style="color: #666; font-size: 14px;">
              Pour toute question ou modification, contactez l'établissement :
            </p>
            <ul style="color: #666; font-size: 14px;">
              ${appointment.establishments?.phone ? `<li>Téléphone : ${appointment.establishments.phone}</li>` : ""}
              ${appointment.establishments?.email ? `<li>Email : ${appointment.establishments.email}</li>` : ""}
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
      console.warn("RESEND_API_KEY manquante : l'email de confirmation ne sera pas envoyé.");
      return NextResponse.json({ 
        success: true, 
        message: "Confirmation saved but email not sent (no API key)",
        emailSent: false,
      });
    }

    const resend = new Resend(apiKey);

    await resend.emails.send({
      from: "GlowPlan <noreply@glowplan.fr>",
      to: clientEmailContent.to,
      subject: clientEmailContent.subject,
      html: clientEmailContent.html,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Confirmation email sent",
      emailSent: true,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 });
  }
}
