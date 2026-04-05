import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { EmailTemplates } from "./templates";
import { formatDateFull } from "@/lib/utils/formatters";

export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("RESEND_API_KEY manquante : l'email ne sera pas envoyé.");
    return { success: false, error: "Missing API key" };
  }

  const resend = new Resend(apiKey);
  try {
    const data = await resend.emails.send({
      from: params.from || "GlowPlan <noreply@glowplan.fr>",
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    console.log(`Email envoyé à ${params.to} avec succès. Resend ID: ${data.data?.id || (data as any).id}`);
    return { success: true, data };
  } catch (error: any) {
    console.error(`Erreur critique lors de l'envoi de l'email à ${params.to}:`, {
      message: error.message,
      name: error.name,
      fullError: error
    });
    return { success: false, error };
  }
}

/**
 * Checks if a professional wants to receive a specific type of email
 */
export async function checkProPreference(userId: string, preference: "email_new_booking" | "email_cancellation") {
  const supabase = await createClient();
  const { data: prefs } = await supabase
    .from("notification_preferences")
    .select("email_new_booking, email_cancellation")
    .eq("user_id", userId)
    .single();

  if (!prefs) return true;
  return (prefs as any)[preference] !== false;
}

/**
 * Helper to get site base URL for links
 */
export function getBaseUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Notify professional if a critical email (like deposit request or manual reminder) fails
 */
export async function notifyProOfCriticalError(appointmentId: string, emailType: string) {
  const supabase = await createClient();
  const baseUrl = getBaseUrl();

  const { data: apt } = await supabase
    .from("appointments")
    .select("*, establishments(name, email)")
    .eq("id", appointmentId)
    .single();

  if (!apt || !apt.establishments?.email) return;

  const template = EmailTemplates.criticalEmailFailedPro({
    provider_name: apt.establishments.name,
    email_type: emailType,
    client_name: `${apt.client_first_name} ${apt.client_last_name}`,
    client_email: apt.client_email,
    event_date: formatDateFull(new Date(apt.start_time)),
    dashboard_link: `${baseUrl}/dashboard/agenda`
  });

  await sendEmail({
    to: apt.establishments.email,
    subject: template.subject,
    html: template.html
  });
}
