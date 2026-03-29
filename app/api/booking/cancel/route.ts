import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, checkProPreference, getBaseUrl } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json();

    const supabase = await createClient();

    // Get appointment details with establishment info
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name),
        establishments(id, name, email, user_id)
      `)
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const baseUrl = getBaseUrl();

    // Email content for professional
    const proTemplate = EmailTemplates.bookingCancelledPro({
      provider_name: appointment.establishments?.name || "Prestataire",
      client_name: `${appointment.client_first_name} ${appointment.client_last_name}`,
      service_name: appointment.services?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      dashboard_link: `${baseUrl}/dashboard/agenda`
    });

    // Check professional notification preference
    const sendToPro = appointment.establishments?.user_id ? await checkProPreference(appointment.establishments.user_id, "email_cancellation") : true;

    let success = true;
    if (sendToPro) {
      const result = await sendEmail({
        to: appointment.establishments?.email || "",
        subject: proTemplate.subject,
        html: proTemplate.html
      });
      success = result.success;
    }

    return NextResponse.json({ 
      success, 
      message: success ? "Cancellation notification processed" : "Failed to send notification" 
    });
  } catch (error) {
    console.error("Error sending cancellation notification:", error);
    return NextResponse.json({ error: "Failed to send cancellation notification" }, { status: 500 });
  }
}
