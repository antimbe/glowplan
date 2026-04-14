import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, getBaseUrl } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, reason } = await request.json();

    if (!appointmentId) {
      return NextResponse.json({ error: "Appointment ID is required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify the user is the establishment owner
    const { data: establishment, error: estError } = await supabase
      .from("establishments")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (estError || !establishment) {
      return NextResponse.json({ error: "Establishment not found for this user" }, { status: 404 });
    }

    const admin = createAdminClient();

    // Get appointment details with establishment and service info
    const { data: appointment, error: aptError } = await admin
      .from("appointments")
      .select(`
        *,
        services(name),
        establishments(id, name, email)
      `)
      .eq("id", appointmentId)
      .eq("establishment_id", establishment.id)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Update appointment status using admin client
    const { error: updateError } = await admin
      .from("appointments")
      .update({
        status: "cancelled",
        cancelled_by_client: false,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || null,
      })
      .eq("id", appointmentId);

    if (updateError) {
      console.error("Failed to update appointment status:", updateError);
      return NextResponse.json({ error: updateError.message || "Failed to cancel appointment" }, { status: 500 });
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
          service_name: Array.isArray(appointment.services) ? appointment.services[0]?.name : appointment.services?.name || "Non spécifiée",
          appointment_date: formatDateFull(startDate),
          appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        }) || EmailTemplates.bookingCancelledUser({
          first_name: appointment.client_first_name || clientName.split(" ")[0],
          provider_name: appointment.establishments?.name || "Votre prestataire",
          service_name: Array.isArray(appointment.services) ? appointment.services[0]?.name : appointment.services?.name || "Non spécifiée",
          appointment_date: formatDateFull(startDate),
          appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
          cancelled_by: appointment.establishments?.name || "le prestataire",
          booking_link: `${baseUrl}/account/bookings/${appointment.id}`
        }))
      : EmailTemplates.bookingCancelledUser({
          first_name: appointment.client_first_name,
          provider_name: appointment.establishments?.name || "Votre prestataire",
          service_name: Array.isArray(appointment.services) ? appointment.services[0]?.name : appointment.services?.name || "Non spécifiée",
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
      success: true, 
      message: "Appointment cancelled successfully"
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    return NextResponse.json({ error: "Failed to cancel appointment" }, { status: 500 });
  }
}
