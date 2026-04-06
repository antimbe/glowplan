import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAvailableSlots } from "@/lib/utils/booking-utils";
import { fetchOccupationData } from "@/lib/utils/booking-fetcher";
import { jsDayToDbDay } from "@/lib/utils/formatters";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const establishmentId = searchParams.get("establishmentId");
    const date = searchParams.get("date"); // ISO date string
    const duration = parseInt(searchParams.get("duration") || "60", 10);
    const excludeAppointmentId = searchParams.get("excludeAppointmentId");

    if (!establishmentId || !date) {
      return NextResponse.json(
        { error: "establishmentId and date are required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Fetch opening hours for this establishment
    const { data: openingHours, error: ohError } = await supabase
      .from("opening_hours")
      .select("*")
      .eq("establishment_id", establishmentId);

    if (ohError) throw ohError;

    const targetDate = new Date(date);
    const dbDayOfWeek = jsDayToDbDay(targetDate.getDay());
    const dayHours = openingHours?.find((h) => h.day_of_week === dbDayOfWeek);

    // Day is closed
    if (!dayHours || !dayHours.is_open || !dayHours.open_time || !dayHours.close_time) {
      return NextResponse.json({ slots: [], closed: true });
    }

    // Build opening window
    const dayStart = new Date(targetDate);
    const [openH, openM] = dayHours.open_time.split(":").map(Number);
    dayStart.setHours(openH, openM, 0, 0);

    const dayEnd = new Date(targetDate);
    const [closeH, closeM] = dayHours.close_time.split(":").map(Number);
    dayEnd.setHours(closeH, closeM, 0, 0);

    // Fetch all occupations for that day
    const { appointments, unavailabilities } = await fetchOccupationData(
      establishmentId,
      startOfDay(targetDate).toISOString(),
      endOfDay(targetDate).toISOString()
    );

    // Build occupied intervals, excluding the appointment being rescheduled
    const occupied = [
      ...appointments
        .filter((a) => a.id !== excludeAppointmentId)
        .map((a) => ({ start_time: a.start_time, end_time: a.end_time, type: "appointment" as const, id: a.id })),
      ...unavailabilities.map((u) => ({ start_time: u.start_time, end_time: u.end_time, type: "unavailability" as const, id: u.id })),
    ];

    // Add lunch break as an unavailability
    if (dayHours.break_start && dayHours.break_end) {
      const breakStart = new Date(targetDate);
      const [bSH, bSM] = dayHours.break_start.split(":").map(Number);
      breakStart.setHours(bSH, bSM, 0, 0);

      const breakEnd = new Date(targetDate);
      const [bEH, bEM] = dayHours.break_end.split(":").map(Number);
      breakEnd.setHours(bEH, bEM, 0, 0);

      occupied.push({
        id: "break",
        start_time: breakStart.toISOString(),
        end_time: breakEnd.toISOString(),
        type: "unavailability",
      });
    }

    const calculatedSlots = getAvailableSlots(dayStart, dayEnd, duration, occupied as any);

    const now = new Date();
    const slots = calculatedSlots
      .filter((s) => s.start > now) // only future slots
      .map((s) => ({
        startTime: s.start.toISOString(),
        endTime: s.end.toISOString(),
        label: `${s.start.getHours().toString().padStart(2, "0")}:${s.start.getMinutes().toString().padStart(2, "0")}`,
      }));

    return NextResponse.json({ slots, closed: false });
  } catch (error) {
    console.error("Error fetching slots:", error);
    return NextResponse.json({ error: "Failed to fetch slots" }, { status: 500 });
  }
}
