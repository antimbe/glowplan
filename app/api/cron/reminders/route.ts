import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, getBaseUrl } from "@/lib/mail";

export async function GET(request: NextRequest) {
  // Optionnel : vérification d'une clé secrète CRON pour la sécurité
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new Response('Unauthorized', { status: 401 });
  // }

  try {
    const supabase = await createClient();
    const baseUrl = getBaseUrl();
    const now = new Date();

    // --- 1. RAPPELS 24H ---
    // Trouver les RDV dans 24h (+/- 1h de battement pour le cron)
    const tomorrowStart = new Date(now);
    tomorrowStart.setDate(tomorrowStart.getDate() + 1);
    tomorrowStart.setHours(tomorrowStart.getHours() - 1);
    
    const tomorrowEnd = new Date(now);
    tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
    tomorrowEnd.setHours(tomorrowEnd.getHours() + 1);

    const { data: apts24h } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name),
        establishments(name, email, address, city, access_info, general_conditions, show_conditions_online),
        appointment_reminders!left(id, type)
      `)
      .eq("status", "confirmed")
      .gte("start_time", tomorrowStart.toISOString())
      .lte("start_time", tomorrowEnd.toISOString());

    if (apts24h) {
      for (const apt of apts24h) {
        // Vérifier si un rappel 24h a déjà été envoyé
        const alreadySent = apt.appointment_reminders?.some((r: any) => r.type === 'email_24h');
        if (alreadySent) continue;

        const startDate = new Date(apt.start_time);
        const emailData = EmailTemplates.reminder24hUser({
          first_name: apt.client_first_name,
          provider_name: apt.establishments?.name || "Votre prestataire",
          service_name: apt.services?.name || "Non spécifiée",
          appointment_date: formatDateFull(startDate),
          appointment_time: formatTime(startDate),
          full_address: apt.establishments?.address ? `${apt.establishments.address}, ${apt.establishments.city}` : "L'adresse vous sera communiquée prochainement.",
          access_info: apt.establishments?.access_info || undefined,
          conditions_block: apt.establishments?.show_conditions_online ? apt.establishments.general_conditions : undefined
        });

        const result = await sendEmail({
          to: apt.client_email,
          subject: emailData.subject,
          html: emailData.html
        });

        if (result.success) {
          await supabase.from("appointment_reminders").insert({
            appointment_id: apt.id,
            establishment_id: apt.establishment_id,
            type: "email_24h",
            status: "sent"
          });
        }
      }
    }

    // --- 2. DEMANDES D'AVIS (POST-RDV) ---
    // Trouver les RDV terminés il y a entre 2h et 4h
    const finishedStart = new Date(now);
    finishedStart.setHours(finishedStart.getHours() - 4);
    const finishedEnd = new Date(now);
    finishedEnd.setHours(finishedEnd.getHours() - 2);

    const { data: aptsReview } = await supabase
      .from("appointments")
      .select(`
        *,
        establishments(id, name),
        appointment_reminders!left(id, type)
      `)
      .eq("status", "confirmed")
      .gte("end_time", finishedStart.toISOString())
      .lte("end_time", finishedEnd.toISOString());

    if (aptsReview) {
      for (const apt of aptsReview) {
        const alreadySent = apt.appointment_reminders?.some((r: any) => r.type === 'review_request');
        if (alreadySent) continue;

        const emailData = EmailTemplates.reviewRequestUser({
          first_name: apt.client_first_name,
          provider_name: apt.establishments?.name || "Votre prestataire",
          review_link: `${baseUrl}/establishment/${apt.establishments?.id}#reviews`
        });

        const result = await sendEmail({
          to: apt.client_email,
          subject: emailData.subject,
          html: emailData.html
        });

        if (result.success) {
          await supabase.from("appointment_reminders").insert({
            appointment_id: apt.id,
            establishment_id: apt.establishment_id,
            type: "review_request",
            status: "sent"
          });
        }
      }
    }

    // --- 3. AUTO-COMPLETION DES RDV TERMINÉS & NOTIFICATION PRO ---
    // Trouver les RDV "confirmed" dont le "end_time" est passé
    const { data: pastApts } = await supabase
      .from("appointments")
      .select(`
        *,
        services(name),
        establishments(id, name, email, user_id)
      `)
      .eq("status", "confirmed")
      .lte("end_time", now.toISOString());

    if (pastApts && pastApts.length > 0) {
      for (const apt of pastApts) {
        // Mettre à jour en "completed"
        await supabase
          .from("appointments")
          .update({ status: "completed" })
          .eq("id", apt.id);

        if (apt.establishments?.user_id) {
          const { data: prefs } = await supabase
            .from("notification_preferences")
            .select("email_ask_review_pro, app_ask_review_pro")
            .eq("user_id", apt.establishments.user_id)
            .single();

          const finalPrefs = prefs || { email_ask_review_pro: true, app_ask_review_pro: true };

          // Notification Web
          if (finalPrefs.app_ask_review_pro) {
            await supabase.from("notifications").insert({
              establishment_id: apt.establishment_id,
              type: "appointment_followup_pro",
              title: "Rendez-vous à valider",
              content: `${apt.client_first_name} s'est-il bien présenté pour sa prestation ?`,
              link: `/dashboard/agenda?date=${apt.start_time.split('T')[0]}`
            });
          }

          // Notification Email
          if (finalPrefs.email_ask_review_pro && apt.establishments.email) {
            const startDate = new Date(apt.start_time);
            const emailData = EmailTemplates.appointmentFollowupPro({
              provider_name: apt.establishments.name || "Prestataire",
              client_name: `${apt.client_first_name} ${apt.client_last_name}`,
              service_name: apt.services?.name || "Prestation",
              appointment_date: formatDateFull(startDate),
              appointment_time: formatTime(startDate),
              dashboard_link: `${baseUrl}/dashboard/agenda?date=${apt.start_time.split('T')[0]}`
            });

            await sendEmail({
              to: apt.establishments.email,
              subject: emailData.subject,
              html: emailData.html
            });
          }
        }
      }
    }

    return NextResponse.json({ success: true, message: "Cron jobs processed" });
  } catch (error) {
    console.error("Error in reminder cron:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
