import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, checkProPreference, getBaseUrl } from "@/lib/mail";

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

    const { data: profile, error: profileError } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Client profile not found" }, { status: 404 });
    }

    const admin = createAdminClient();
    const { data: appointment, error: appointmentError } = await admin
      .from("appointments")
      .select(`
        *,
        services(name),
        establishments(id, name, email, user_id)
      `)
      .eq("id", appointmentId)
      .single();

    if (appointmentError || !appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (appointment.client_profile_id !== profile.id) {
      return NextResponse.json({ error: "Unauthorized to cancel this appointment" }, { status: 403 });
    }

    const { error: updateError } = await admin
      .from("appointments")
      .update({
        status: "cancelled",
        cancelled_by_client: true,
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason || null,
      })
      .eq("id", appointmentId);

    if (updateError) {
      console.error("Failed to update appointment status:", updateError);
      return NextResponse.json({ error: updateError.message || "Failed to cancel appointment" }, { status: 500 });
    }

    const sendToPro = appointment.establishments?.user_id
      ? await checkProPreference(appointment.establishments.user_id, "email_cancellation")
      : true;

    if (sendToPro) {
      const startDate = new Date(appointment.start_time);
      const endDate = new Date(appointment.end_time);
      const baseUrl = getBaseUrl();

      const proTemplate = EmailTemplates.bookingCancelledPro({
        provider_name: appointment.establishments?.name || "Prestataire",
        client_name: `${appointment.client_first_name || ""} ${appointment.client_last_name || ""}`.trim() || appointment.client_name || "Client",
        service_name: appointment.services?.name || "Non spécifiée",
        appointment_date: formatDateFull(startDate),
        appointment_time: `${formatTime(startDate)} - ${formatTime(endDate)}`,
        dashboard_link: `${baseUrl}/dashboard/agenda`,
      });

      await sendEmail({
        to: appointment.establishments?.email || "",
        subject: proTemplate.subject,
        html: proTemplate.html,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error cancelling appointment by client:", error);
    return NextResponse.json({ error: error?.message || "Failed to cancel appointment" }, { status: 500 });
  }
}
