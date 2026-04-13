import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";

export async function GET(request: NextRequest) {
  try {
    const allowDev = process.env.NODE_ENV === "development";
    if (!allowDev) {
      return NextResponse.json({ error: "Only available in development" }, { status: 403 });
    }

    const supabase = await createClient();
    const now = new Date();

    // Get upcoming appointments (next 48 hours)
    const checkStart = new Date(now);
    checkStart.setDate(checkStart.getDate() + 0);
    const checkEnd = new Date(now);
    checkEnd.setDate(checkEnd.getDate() + 2);

    const { data: upcomingApts } = await supabase
      .from("appointments")
      .select(`
        id,
        start_time,
        end_time,
        status,
        client_email,
        client_first_name,
        client_last_name,
        services(name),
        establishments(name),
        appointment_reminders!left(type, status)
      `)
      .eq("status", "confirmed")
      .gte("start_time", checkStart.toISOString())
      .lte("start_time", checkEnd.toISOString())
      .order("start_time", { ascending: true });

    // Check which ones need 24h reminder
    const needsReminder = upcomingApts?.filter(apt => {
      const startTime = new Date(apt.start_time);
      const hoursUntil = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      const hasReminder = apt.appointment_reminders?.some((r: any) => r.type === 'email_24h');
      return hoursUntil <= 24 && hoursUntil > 0 && !hasReminder;
    }) || [];

    return NextResponse.json({
      status: "debug",
      currentTime: now.toISOString(),
      upcomingAppointments: upcomingApts?.map(apt => ({
        id: apt.id,
        client: `${apt.client_first_name} ${apt.client_last_name}`,
        email: apt.client_email,
        service: apt.services?.name,
        provider: apt.establishments?.name,
        startTime: apt.start_time,
        hoursUntilAppointment: ((new Date(apt.start_time).getTime() - now.getTime()) / (1000 * 60 * 60)).toFixed(2),
        remindersSent: apt.appointment_reminders?.map((r: any) => `${r.type}:${r.status}`),
        needsReminder: needsReminder.some(n => n.id === apt.id)
      })),
      summary: {
        total: upcomingApts?.length || 0,
        needsReminder: needsReminder.length,
        nextCronRun: new Date(checkEnd).toISOString()
      }
    });
  } catch (error) {
    console.error("Error in reminders debug:", error);
    return NextResponse.json({ error: `Debug error: ${error}` }, { status: 500 });
  }
}
