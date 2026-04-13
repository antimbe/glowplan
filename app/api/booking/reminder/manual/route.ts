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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return NextResponse.json({ 
        error: "Unauthorized", 
        details: "User not authenticated"
      }, { status: 401 });
    }

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

    // Record the reminder in appointment_reminders (using authenticated client to respect RLS)
    const { error: reminderError } = await supabase
      .from("appointment_reminders")
      .insert({
        appointment_id: appointmentId,
        establishment_id: appointment.establishment_id,
        type: "manual",
        status: "sent",
        sent_by: user.id
      });

    if (reminderError) {
      console.error("Erreur INSERT reminder:", reminderError);
      return NextResponse.json({ 
        error: "Failed to record reminder", 
        details: reminderError.message
      }, { status: 500 });
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

    // Pour un rappel MANUEL, toujours afficher l'adresse complète
    const fullAddress = `${establishment.address}, ${establishment.postal_code || ""} ${establishment.city}`;
    const accessInfo = establishment.address_complement || undefined;

    // Notification Client : Rappel manuel
    const clientEmailData = EmailTemplates.reminderManualUser({
      first_name: clientFirstName,
      provider_name: establishment.name || "Votre prestataire",
      service_name: service?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      full_address: fullAddress,
      access_info: accessInfo
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
