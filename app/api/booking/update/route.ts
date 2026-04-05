import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, checkProPreference, getBaseUrl } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, changes } = await request.json();

    const supabase = await createClient();

    // Get appointment details with establishment and service info
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name, price),
        establishments(id, name, email, user_id, address, city, postal_code, address_complement, hide_exact_address)
      `)
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const baseUrl = getBaseUrl();

    // Construct changes description
    let changesHtml = "";
    if (changes?.date) changesHtml += `<li>Date : ${changes.oldDate} ➔ ${changes.newDate}</li>`;
    if (changes?.time) changesHtml += `<li>Heure : ${changes.oldTime} ➔ ${changes.newTime}</li>`;
    if (changes?.service) changesHtml += `<li>Prestation : ${changes.oldService} ➔ ${changes.newService}</li>`;

    // --- Template Selection ---
    
    let proTemplate, clientTemplate;
    const clientName = appointment.is_manual 
      ? (appointment.client_name || `${appointment.client_first_name || ""} ${appointment.client_last_name || ""}`.trim() || "Client")
      : `${appointment.client_first_name} ${appointment.client_last_name}`;

    if (appointment.is_manual) {
      proTemplate = EmailTemplates.manualBookingModifiedPro({
        provider_name: appointment.establishments?.name || "Prestataire",
        client_name: clientName,
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        dashboard_link: `${baseUrl}/dashboard/agenda`
      });

      clientTemplate = EmailTemplates.manualBookingModifiedUser?.({
        first_name: appointment.client_first_name || clientName.split(" ")[0],
        provider_name: appointment.establishments?.name || "Votre prestataire",
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        address_or_24h_message: appointment.establishments?.hide_exact_address
          ? `L'adresse exacte (${appointment.establishments.city}) vous sera communiquée 24h avant votre rendez-vous.`
          : (appointment.establishments?.address ? `${appointment.establishments.address}, ${appointment.establishments.city}` : "L'adresse vous sera communiquée prochainement."),
        booking_link: `${baseUrl}/account/bookings/${appointment.id}`,
        changesDescription: changesHtml || undefined
      }) || EmailTemplates.bookingModifiedUser({
        first_name: appointment.client_first_name || clientName.split(" ")[0],
        provider_name: appointment.establishments?.name || "Votre prestataire",
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        address_or_24h_message: appointment.establishments?.hide_exact_address
          ? `L'adresse exacte (${appointment.establishments.city}) vous sera communiquée 24h avant votre rendez-vous.`
          : (appointment.establishments?.address ? `${appointment.establishments.address}, ${appointment.establishments.city}` : "L'adresse vous sera communiquée prochainement."),
        booking_link: `${baseUrl}/account/bookings/${appointment.id}`,
        changesDescription: changesHtml || undefined
      });
    } else {
      proTemplate = EmailTemplates.bookingModifiedPro({
        provider_name: appointment.establishments?.name || "Prestataire",
        client_name: clientName,
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        change_origin: "Prestataire (via dashboard)",
        dashboard_link: `${baseUrl}/dashboard/agenda`
      });

      clientTemplate = EmailTemplates.bookingModifiedUser({
        first_name: appointment.client_first_name || (appointment.client_name ? appointment.client_name.split(' ')[0] : "Client"),
        provider_name: appointment.establishments?.name || "Votre prestataire",
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        address_or_24h_message: appointment.establishments?.hide_exact_address
          ? `L'adresse exacte (${appointment.establishments.city}) vous sera communiquée 24h avant votre rendez-vous.`
          : (appointment.establishments?.address ? `${appointment.establishments.address}, ${appointment.establishments.city}` : "L'adresse vous sera communiquée prochainement."),
        booking_link: `${baseUrl}/account/bookings/${appointment.id}`,
        changesDescription: changesHtml || undefined
      });
    }

    // Check professional preference
    const sendToPro = appointment.establishments?.user_id ? await checkProPreference(appointment.establishments.user_id, "email_new_booking") : true;

    if (sendToPro && appointment.establishments?.email) {
      await sendEmail({
        to: appointment.establishments.email,
        subject: proTemplate.subject,
        html: proTemplate.html
      });
    }

    await sendEmail({
      to: appointment.client_email,
      subject: clientTemplate.subject,
      html: clientTemplate.html
    });

    return NextResponse.json({ success: true, message: "Update emails sent" });
  } catch (error) {
    console.error("Error sending update emails:", error);
    return NextResponse.json({ error: "Failed to send update emails" }, { status: 500 });
  }
}
