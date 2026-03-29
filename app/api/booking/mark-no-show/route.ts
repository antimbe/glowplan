import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { appointmentId } = await request.json();

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId est requis" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Vérifier l'authentification
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // 2. Vérifier que l'utilisateur possède l'établissement lié au RDV
    const { data: appointment, error: aptError } = await supabase
      .from("appointments")
      .select("*, establishments(user_id)")
      .eq("id", appointmentId)
      .single();

    if (aptError || !appointment) {
      return NextResponse.json(
        { error: "Rendez-vous introuvable" },
        { status: 404 }
      );
    }

    if (appointment.establishments.user_id !== user.id) {
      return NextResponse.json(
        { error: "Action non autorisée sur cet établissement" },
        { status: 403 }
      );
    }

    // Un rendez-vous ne peut être marqué comme "no_show" que s'il est "completed" ou "confirmed" (passé)
    if (appointment.status !== "completed" && appointment.status !== "confirmed") {
      return NextResponse.json(
        { error: "Seul un rendez-vous confirmé/terminé peut être marqué comme non honoré." },
        { status: 400 }
      );
    }

    // 3. Mettre le statut à "no_show"
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "no_show" })
      .eq("id", appointmentId);

    if (updateError) throw updateError;

    // TODO Optionnel : Bloquer le client ou incrémenter son nombre d'absences dans une table 'client_stats'
    // ex: await supabase.rpc('increment_no_show', { client_email_param: appointment.client_email })

    return NextResponse.json({
      success: true,
      message: "Rendez-vous marqué comme non honoré (lapin)"
    });
  } catch (error) {
    console.error("Error marking no-show:", error);
    return NextResponse.json(
      { error: "Erreur interne" },
      { status: 500 }
    );
  }
}
