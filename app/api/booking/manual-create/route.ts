import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, checkProPreference, getBaseUrl } from "@/lib/mail";

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
        establishments(id, name, email, user_id, address, city, zip_code, hide_exact_address, require_deposit, deposit_amount, general_conditions)
      `)
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const baseUrl = getBaseUrl();

    const clientName = appointment.client_name || `${appointment.client_first_name || ""} ${appointment.client_last_name || ""}`.trim() || "Client";
    const firstName = appointment.client_first_name || clientName.split(" ")[0];

    // Professional Notification
    const proTemplate = EmailTemplates.manualBookingPro({
      provider_name: appointment.establishments?.name || "Prestataire",
      client_name: clientName,
      service_name: appointment.services?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      dashboard_link: `${baseUrl}/dashboard/agenda`
    });

    // Client Notification
    const clientTemplate = EmailTemplates.manualBookingUser({
      first_name: firstName,
      provider_name: appointment.establishments?.name || "Votre prestataire",
      service_name: appointment.services?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      address_or_24h_message: appointment.establishments?.hide_exact_address
        ? `L'adresse exacte (${appointment.establishments.city}) vous sera communiquée 24h avant votre rendez-vous.`
        : (appointment.establishments?.address ? `${appointment.establishments.address}, ${appointment.establishments.city}` : "L'adresse vous sera communiquée prochainement."),
      booking_link: `${baseUrl}/account/bookings/${appointment.id}`,
      conditions_block: appointment.establishments?.general_conditions || undefined
    });

    // Check professional preference
    const sendToPro = appointment.establishments?.user_id ? await checkProPreference(appointment.establishments.user_id, "email_new_booking") : true;

    if (sendToPro && appointment.establishments?.email) {
      await sendEmail({
        to: appointment.establishments.email,
        subject: proTemplate.subject,
        html: proTemplate.html
      });
    }

    if (appointment.client_email) {
      await sendEmail({
        to: appointment.client_email,
        subject: clientTemplate.subject,
        html: clientTemplate.html
      });
    }

    return NextResponse.json({ success: true, message: "Manual booking emails sent" });
  } catch (error) {
    console.error("Error sending manual booking emails:", error);
    return NextResponse.json({ error: "Failed to send manual booking emails" }, { status: 500 });
  }
}
