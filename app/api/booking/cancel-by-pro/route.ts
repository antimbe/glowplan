import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, getBaseUrl } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, reason } = await request.json();

    const supabase = await createClient();

    // Get appointment details with establishment and service info
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name),
        establishments(id, name, email)
      `)
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const baseUrl = getBaseUrl();

    // Email content for client
    const clientName = appointment.is_manual 
      ? (appointment.client_name || `${appointment.client_first_name || ""} ${appointment.client_last_name || ""}`.trim() || "Client")
      : `${appointment.client_first_name} ${appointment.client_last_name}`;

    const emailData = appointment.is_manual 
      ? (EmailTemplates.manualBookingCancelledUser?.({
          first_name: appointment.client_first_name || clientName.split(" ")[0],
          provider_name: appointment.establishments?.name || "Votre prestataire",
          service_name: appointment.services?.name || "Non spécifiée",
          appointment_date: formatDateFull(startDate),
          appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        }) || EmailTemplates.bookingCancelledUser({
          first_name: appointment.client_first_name || clientName.split(" ")[0],
          provider_name: appointment.establishments?.name || "Votre prestataire",
          service_name: appointment.services?.name || "Non spécifiée",
          appointment_date: formatDateFull(startDate),
          appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
          cancelled_by: appointment.establishments?.name || "le prestataire",
          booking_link: `${baseUrl}/account/bookings/${appointment.id}`
        }))
      : EmailTemplates.bookingCancelledUser({
          first_name: appointment.client_first_name,
          provider_name: appointment.establishments?.name || "Votre prestataire",
          service_name: appointment.services?.name || "Non spécifiée",
          appointment_date: formatDateFull(startDate),
          appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
          cancelled_by: appointment.establishments?.name || "le prestataire",
          booking_link: `${baseUrl}/account/bookings/${appointment.id}`
        });

    const result = await sendEmail({
      to: appointment.client_email,
      subject: emailData.subject,
      html: emailData.html
    });

    return NextResponse.json({ 
      success: result.success, 
      message: result.success ? "Cancellation email sent to client" : "Failed to send email"
    });
  } catch (error) {
    console.error("Error sending cancellation email:", error);
    return NextResponse.json({ error: "Failed to send cancellation email" }, { status: 500 });
  }
}
