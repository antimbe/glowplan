import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, checkProPreference, getBaseUrl } from "@/lib/mail";

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
      .select("name, email, phone, user_id, address, city, postal_code, address_complement, show_conditions_online, general_conditions, deposit_amount, payment_links, hide_exact_address")
      .eq("id", establishmentId)
      .single() as { data: any, error: any };

    if (estError || !establishment) {
      return NextResponse.json({ error: "Establishment not found" }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const baseUrl = getBaseUrl();

    // Professional Notification
    const proTemplate = EmailTemplates.bookingRequestPro({
      provider_name: establishment.name,
      client_name: (appointment.client_first_name && appointment.client_last_name)
        ? `${appointment.client_first_name} ${appointment.client_last_name}`
        : (appointment.client_name || "Client"),
      service_name: appointment.services?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      client_note: appointment.notes || "",
      dashboard_link: `${baseUrl}/dashboard/agenda?date=${startDate.toISOString().split('T')[0]}`,
      isManualValidation: !autoConfirm
    });

    // Client Notification
    let clientEmailData;
    if (appointment.status === "pending_deposit") {
      // Get deposit info from establishment
      const depositAmount = establishment.deposit_amount || "À définir";
      console.log("DEBUG - raw establishmentId:", establishmentId);
      console.log("DEBUG - raw payment_links:", establishment.payment_links);
      
      let paymentLink = establishment.payment_links && establishment.payment_links.length > 0 
        ? (establishment.payment_links[0].url || establishment.payment_links[0]) 
        : `${baseUrl}/establishment/${establishmentId}?booking=${appointmentId}`;
      
      console.log("DEBUG - intermediate paymentLink:", paymentLink);
      
      // Ensure paymentLink is absolute
      if (typeof paymentLink === 'string' && !paymentLink.startsWith('http')) {
        paymentLink = paymentLink.startsWith('/') ? `${baseUrl}${paymentLink}` : `${baseUrl}/${paymentLink}`;
      }
      
      console.log("Final payment link being sent:", paymentLink);
      
      // Deadline: 2 hours after the booking request by default, or 24h before the appointment
      const deadlineDate = new Date();
      deadlineDate.setHours(deadlineDate.getHours() + 2);
      
      clientEmailData = EmailTemplates.depositRequestUser({
        first_name: appointment.client_first_name,
        provider_name: establishment.name,
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        deposit_amount: depositAmount,
        deposit_deadline: `${formatTime(deadlineDate)} ce jour`,
        payment_link: paymentLink
      });
    } else if (autoConfirm) {
      clientEmailData = EmailTemplates.bookingConfirmedUser({
        first_name: appointment.client_first_name,
        provider_name: establishment.name,
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        price: `${appointment.services?.price || "—"}€`,
        booking_reference: appointment.id.slice(0, 8).toUpperCase(),
        address_or_24h_message: (establishment.hide_exact_address) 
          ? `L'adresse exacte (${establishment.city}) vous sera communiquée 24h avant votre rendez-vous.`
          : (establishment.address ? `${establishment.address}, ${establishment.city}` : "L'adresse vous sera communiquée prochainement."),
        conditions_block: establishment.show_conditions_online ? establishment.general_conditions : undefined,
        booking_link: `${baseUrl}/account/bookings/${appointmentId}`
      });
    } else {
      clientEmailData = EmailTemplates.bookingRequestUser({
        first_name: appointment.client_first_name || (appointment.client_name ? appointment.client_name.split(' ')[0] : "Client"),
        provider_name: establishment.name,
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        price: `${appointment.services?.price || "—"}€`,
        address_or_24h_message: establishment.hide_exact_address
          ? `L'adresse exacte (${establishment.city}) vous sera communiquée 24h avant votre rendez-vous.`
          : (establishment.address ? `${establishment.address}, ${establishment.city}` : "L'adresse vous sera communiquée prochainement."),
        booking_link: `${baseUrl}/account/bookings/${appointmentId}`
      });
    }

    // Send emails
    let establishmentNotified = false;
    let clientNotified = false;

    // Check pro preference
    const sendToPro = establishment.user_id ? await checkProPreference(establishment.user_id, "email_new_booking") : true;

    if (sendToPro) {
      const proResult = await sendEmail({
        to: establishment.email,
        subject: proTemplate.subject,
        html: proTemplate.html
      });
      establishmentNotified = proResult.success;
    }

    const clientResult = await sendEmail({
      to: appointment.client_email,
      subject: clientEmailData.subject,
      html: clientEmailData.html
    });
    clientNotified = clientResult.success;

    return NextResponse.json({ 
      success: true, 
      message: "Notification emails processed",
      establishmentNotified,
      clientNotified
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return NextResponse.json({ error: "Failed to send notification" }, { status: 500 });
  }
}
