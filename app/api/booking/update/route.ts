import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, changes } = await request.json();

    const supabase = await createClient();

    // Get appointment details with establishment and service info
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name, price, duration),
        establishments(name, email, phone)
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

    // Build changes description
    let changesDescription = "";
    if (changes?.date) {
      changesDescription += `<li><strong>Date :</strong> ${changes.oldDate} → ${changes.newDate}</li>`;
    }
    if (changes?.time) {
      changesDescription += `<li><strong>Horaire :</strong> ${changes.oldTime} → ${changes.newTime}</li>`;
    }
    if (changes?.service) {
      changesDescription += `<li><strong>Prestation :</strong> ${changes.oldService} → ${changes.newService}</li>`;
    }

    // Email to client about modification
    const clientEmailContent = {
      to: clientEmail,
      subject: `Modification de votre rendez-vous - ${appointment.establishments?.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #32422c; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">GlowPlan</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #f59e0b;">Votre rendez-vous a été modifié</h2>
            <p>Bonjour ${clientName},</p>
            <p><strong>${appointment.establishments?.name}</strong> a modifié votre rendez-vous.</p>
            
            ${changesDescription ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0 0 10px 0; color: #92400e; font-weight: bold;">Modifications :</p>
              <ul style="margin: 0; color: #92400e;">
                ${changesDescription}
              </ul>
            </div>
            ` : ''}
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #32422c;">
              <h3 style="margin-top: 0; color: #32422c;">Nouveau rendez-vous</h3>
              <p><strong>Établissement :</strong> ${appointment.establishments?.name}</p>
              <p><strong>Prestation :</strong> ${appointment.services?.name || "Non spécifiée"}</p>
              <p><strong>Date :</strong> ${formatDateFull(startDate)}</p>
              <p><strong>Heure :</strong> ${formatTime(startDate)} - ${formatTime(endDate)}</p>
              <p><strong>Prix :</strong> ${appointment.services?.price || "—"}€</p>
            </div>
            
            <p>Si ces modifications ne vous conviennent pas, vous pouvez annuler votre rendez-vous depuis votre espace client.</p>

            <p style="color: #666; font-size: 14px;">
              Pour toute question, contactez l'établissement :
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
      console.warn("RESEND_API_KEY manquante : l'email de modification n'a pas été envoyé.");
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
      message: "Update notification sent to client",
    });
  } catch (error) {
    console.error("Error sending update notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
