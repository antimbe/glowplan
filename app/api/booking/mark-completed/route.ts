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

    // Un rendez-vous ne peut être marqué comme "completed" que s'il est "confirmed" (passé) ou "no_show" (erreur de saisie)
    if (appointment.status !== "confirmed" && appointment.status !== "no_show" && appointment.status !== "completed") {
      return NextResponse.json(
        { error: "Seul un rendez-vous confirmé ou marqué comme absent peut être marqué comme honoré." },
        { status: 400 }
      );
    }

    // 3. Mettre le statut à "completed"
    const { error: updateError } = await supabase
      .from("appointments")
      .update({ status: "completed" })
      .eq("id", appointmentId);

    if (updateError) throw updateError;

    // 4. Si c'était un "no_show", décrémenter le compteur Lapin (optionnel/bonus)
    if (appointment.status === "no_show" && appointment.client_profile_id) {
       // Lire la valeur actuelle
       const { data: profile } = await supabase
         .from("client_profiles")
         .select("no_show_count")
         .eq("id", appointment.client_profile_id)
         .single();
       
       const currentCount = profile?.no_show_count || 0;

       if (currentCount > 0) {
         await supabase
           .from("client_profiles")
           .update({ no_show_count: currentCount - 1 })
           .eq("id", appointment.client_profile_id);
       }
    }

    return NextResponse.json({
      success: true,
      message: "Rendez-vous marqué comme honoré"
    });
  } catch (error) {
    console.error("Error marking completed:", error);
    return NextResponse.json(
      { error: "Erreur interne" },
      { status: 500 }
    );
  }
}
