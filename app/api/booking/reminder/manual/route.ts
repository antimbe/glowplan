import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, getBaseUrl } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json();

    const supabase = await createClient();
    const supabaseAdmin = createAdminClient();

    // Get appointment details - must be visible to the current user (respects RLS)
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select("*")
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      console.error("Erreur SELECT appointment:", aptError);
      return NextResponse.json({ 
        error: "Appointment not found", 
        details: aptError?.message || "Record not found in database or not accessible"
      }, { status: 404 });
    }

    // Get service details (using admin client to ensure we have metadata)
    const { data: service } = await supabaseAdmin
      .from("services")
      .select("name, price, duration")
      .eq("id", appointment.service_id)
      .single();

    // Get establishment details (using admin client to ensure we have contact info)
    const { data: establishment, error: estError } = await supabaseAdmin
      .from("establishments")
      .select("id, name, email, address, city, postal_code, address_complement, hide_exact_address")
      .eq("id", appointment.establishment_id)
      .single();

    if (estError || !establishment) {
      console.error("Erreur SELECT establishment:", estError);
      return NextResponse.json({ 
        error: "Establishment info not found", 
        details: estError?.message || "Establishment record not accessible"
      }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const baseUrl = getBaseUrl();

    // Calculer le nom du client (fallback si first_name est nul)
    const clientFirstName = appointment.client_first_name || (appointment.client_name ? appointment.client_name.split(' ')[0] : "Client");

    // Logic Address Privacy (24h rule)
    const now = new Date();
    const diffInHours = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    const isWithin24h = diffInHours <= 24;
    const hideAddress = establishment.hide_exact_address && !isWithin24h;

    const addressMessage = hideAddress 
      ? `L'adresse exacte (${establishment.city}) vous sera communiquée 24h avant votre rendez-vous.`
      : `${establishment.address}, ${establishment.postal_code || ""} ${establishment.city}`;

    // Notification Client : Rappel manuel
    const clientEmailData = EmailTemplates.reminderManualUser({
      first_name: clientFirstName,
      provider_name: establishment.name || "Votre prestataire",
      service_name: service?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      full_address: addressMessage,
      access_info: hideAddress ? undefined : establishment.address_complement || undefined
    });

    const result = await sendEmail({
      to: appointment.client_email,
      subject: clientEmailData.subject,
      html: clientEmailData.html
    });

    if (result.success) {
      // Notification Pro : Rappel envoyé avec succès
      const proTemplate = EmailTemplates.reminderSentPro({
        provider_name: establishment.name || "Prestataire",
        client_name: (appointment.client_first_name && appointment.client_last_name) 
          ? `${appointment.client_first_name} ${appointment.client_last_name}` 
          : (appointment.client_name || "Client"),
        service_name: service?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`
      });

      await sendEmail({
        to: establishment.email || "",
        subject: proTemplate.subject,
        html: proTemplate.html
      });
    } else {
      // Notification Pro : Échec d'envoi du rappel
      const proTemplate = EmailTemplates.reminderFailedPro({
        provider_name: establishment.name || "Prestataire",
        client_name: (appointment.client_first_name && appointment.client_last_name) 
          ? `${appointment.client_first_name} ${appointment.client_last_name}` 
          : (appointment.client_name || "Client"),
        service_name: service?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        dashboard_link: `${baseUrl}/dashboard/business?tab=reminders`
      });

      await sendEmail({
        to: establishment.email || "",
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
