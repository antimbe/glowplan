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
        establishments(id, name, deposit_amount)
      `)
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const baseUrl = getBaseUrl();

    // Notification Client : Acompte validé
    const clientEmailData = EmailTemplates.depositValidatedUser({
      first_name: appointment.client_first_name,
      provider_name: appointment.establishments?.name || "Votre prestataire",
      service_name: Array.isArray(appointment.services) ? appointment.services[0]?.name : appointment.services?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      deposit_amount: appointment.establishments?.deposit_amount || "—",
      booking_link: `${baseUrl}/account/bookings/${appointment.id}`
    });

    const result = await sendEmail({
      to: appointment.client_email,
      subject: clientEmailData.subject,
      html: clientEmailData.html
    });

    return NextResponse.json({ 
      success: result.success, 
      message: result.success ? "Deposit validation email sent" : "Failed to send email"
    });
  } catch (error) {
    console.error("Error sending deposit validation email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
