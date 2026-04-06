import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId, newStartTime, newEndTime } = await request.json();

    if (!appointmentId || !newStartTime || !newEndTime) {
      return NextResponse.json(
        { error: "appointmentId, newStartTime et newEndTime sont requis" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Fetch the appointment to verify ownership and status
    const { data: appointment, error: fetchError } = await supabase
      .from("appointments")
      .select("id, status, start_time, end_time, client_email, establishments(id, name, email, user_id, address, city, address_complement, postal_code, hide_exact_address), services(name, price)")
      .eq("id", appointmentId)
      .single();

    if (fetchError || !appointment) {
      return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
    }

    // Verify ownership: client must own this appointment
    if (appointment.client_email !== user.email) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 });
    }

    // Verify appointment is in the future
    if (new Date(appointment.start_time) <= new Date()) {
      return NextResponse.json({ error: "Ce rendez-vous est déjà passé" }, { status: 400 });
    }

    // Verify status allows modification
    const modifiableStatuses = ["confirmed", "pending", "pending_deposit"];
    if (!modifiableStatuses.includes(appointment.status)) {
      return NextResponse.json(
        { error: "Ce rendez-vous ne peut pas être modifié dans son état actuel" },
        { status: 400 }
      );
    }

    // Update the appointment
    const { error: updateError } = await supabase
      .from("appointments")
      .update({
        start_time: newStartTime,
        end_time: newEndTime,
        updated_at: new Date().toISOString(),
      })
      .eq("id", appointmentId);

    if (updateError) throw updateError;

    // Send email notifications via the existing update route
    const oldStart = new Date(appointment.start_time);
    const newStart = new Date(newStartTime);

    const formatDate = (d: Date) =>
      d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const formatTime = (d: Date) =>
      `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

    // Fire and forget — don't block the response
    fetch(`${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/booking/update`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentId,
        changes: {
          date: true,
          oldDate: formatDate(oldStart),
          newDate: formatDate(newStart),
          time: true,
          oldTime: formatTime(oldStart),
          newTime: formatTime(newStart),
        },
      }),
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Rendez-vous déplacé avec succès",
      newStartTime,
      newEndTime,
    });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la modification" },
      { status: 500 }
    );
  }
}
