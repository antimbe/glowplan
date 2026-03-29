import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, getBaseUrl } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json();

    const supabase = await createClient();

    // Get appointment details
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name, price, duration),
        establishments(id, name, address, city, access_info)
      `)
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const baseUrl = getBaseUrl();

    // Notification Client : Rappel manuel
    const clientEmailData = EmailTemplates.reminderManualUser({
      first_name: appointment.client_first_name,
      provider_name: appointment.establishments?.name || "Votre prestataire",
      service_name: appointment.services?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      full_address: appointment.establishments?.address ? `${appointment.establishments.address}, ${appointment.establishments.city}` : "L'adresse vous sera communiquée prochainement.",
      access_info: appointment.establishments?.access_info || undefined
    });

    const result = await sendEmail({
      to: appointment.client_email,
      subject: clientEmailData.subject,
      html: clientEmailData.html
    });

    if (result.success) {
      // Notification Pro : Rappel envoyé avec succès
      const proTemplate = EmailTemplates.reminderSentPro({
        provider_name: appointment.establishments?.name || "Prestataire",
        client_name: `${appointment.client_first_name} ${appointment.client_last_name}`,
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`
      });

      await sendEmail({
        to: appointment.establishments?.email || "",
        subject: proTemplate.subject,
        html: proTemplate.html
      });
    } else {
      // Notification Pro : Échec d'envoi du rappel
      const proTemplate = EmailTemplates.reminderFailedPro({
        provider_name: appointment.establishments?.name || "Prestataire",
        client_name: `${appointment.client_first_name} ${appointment.client_last_name}`,
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        dashboard_link: `${baseUrl}/dashboard/business?tab=reminders`
      });

      await sendEmail({
        to: appointment.establishments?.email || "",
        subject: proTemplate.subject,
        html: proTemplate.html
      });
    }

    return NextResponse.json({ 
      success: result.success, 
      message: result.success ? "Reminder email sent" : "Failed to send email"
    });
  } catch (error) {
    console.error("Error sending manual reminder email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
