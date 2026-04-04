import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, getBaseUrl } from "@/lib/mail";

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
        establishments(id, name, email, phone, address, city, show_conditions_online, general_conditions)
      `)
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    const startDate = new Date(appointment.start_time);
    const endDate = new Date(appointment.end_time);
    const baseUrl = getBaseUrl();

    const clientEmail = appointment.client_email;
    if (!clientEmail) {
      return NextResponse.json({ error: "No client email found" }, { status: 400 });
    }

    // Email content for client
    const emailData = EmailTemplates.bookingConfirmedUser({
      first_name: appointment.client_first_name,
      provider_name: appointment.establishments?.name || "Votre prestataire",
      service_name: appointment.services?.name || "Non spécifiée",
      appointment_date: formatDateFull(startDate),
      appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
      price: `${appointment.services?.price || "—"}€`,
      booking_reference: appointment.id.slice(0, 8).toUpperCase(),
      address_or_24h_message: appointment.establishments?.address ? `${appointment.establishments.address}, ${appointment.establishments.city}` : "L'adresse vous sera communiquée prochainement.",
      conditions_block: appointment.establishments?.show_conditions_online ? appointment.establishments.general_conditions : undefined,
      booking_link: `${baseUrl}/account/bookings/${appointment.id}`
    });

    const result = await sendEmail({
      to: clientEmail,
      subject: emailData.subject,
      html: emailData.html
    });

    return NextResponse.json({ 
      success: result.success, 
      message: result.success ? "Confirmation email sent" : "Failed to send email",
      emailSent: result.success,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json({ error: "Failed to send confirmation email" }, { status: 500 });
  }
}
