import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, getBaseUrl } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, reason } = await request.json();

    const supabase = await createClient();

    // Get appointment details with establishment info
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

    // Update status to 'refused' (or 'cancelled' if 'refused' is not preferred)
    // We'll use 'refused' to distinguish it from a normal cancellation
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ 
        status: "refused",
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || "Demande refusée par le prestataire"
      })
      .eq("id", appointmentId);

    if (updateError) throw updateError;

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const baseUrl = getBaseUrl();

    // Email to client
    const clientTemplate = EmailTemplates.bookingRefusedUser({
      first_name: appointment.client_first_name,
      provider_name: appointment.establishments?.name || "Votre prestataire",
      service_name: appointment.services?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      reason: reason || undefined,
      booking_link: `${baseUrl}/establishment/${appointment.establishments?.id}`
    });

    // Email to pro (confirmation of refusal)
    const proTemplate = EmailTemplates.bookingRefusedPro({
      provider_name: appointment.establishments?.name || "Prestataire",
      client_name: `${appointment.client_first_name} ${appointment.client_last_name}`,
      service_name: appointment.services?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`
    });

    await sendEmail({
      to: appointment.client_email,
      subject: clientTemplate.subject,
      html: clientTemplate.html
    });

    if (appointment.establishments?.email) {
      await sendEmail({
        to: appointment.establishments.email,
        subject: proTemplate.subject,
        html: proTemplate.html
      });
    }

    return NextResponse.json({ success: true, message: "Appointment refused and emails sent" });
  } catch (error) {
    console.error("Error refusing appointment:", error);
    return NextResponse.json({ error: "Failed to refuse appointment" }, { status: 500 });
  }
}
