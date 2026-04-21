import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  try {
    // 1. Vérifier que l'utilisateur est connecté
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const admin = createAdminClient();
    const userId = user.id;

    // 2. Récupérer l'établissement (si pro)
    const { data: establishment } = await admin
      .from("establishments")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const establishmentId = establishment?.id ?? null;

    // 3. Récupérer le profil client (si client)
    const { data: clientProfile } = await admin
      .from("client_profiles")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();

    const clientProfileId = clientProfile?.id ?? null;

    // ─── Suppression en cascade (ordre important) ───────────────

    if (establishmentId) {
      // Annuler les rendez-vous à venir de l'établissement
      await admin
        .from("appointments")
        .delete()
        .eq("establishment_id", establishmentId);

      // Supprimer les services
      await admin
        .from("services")
        .delete()
        .eq("establishment_id", establishmentId);

      // Supprimer les horaires d'ouverture
      await admin
        .from("opening_hours")
        .delete()
        .eq("establishment_id", establishmentId);

      // Supprimer les indisponibilités
      await admin
        .from("unavailabilities")
        .delete()
        .eq("establishment_id", establishmentId);

      // Supprimer les avis liés à l'établissement
      await admin
        .from("reviews")
        .delete()
        .eq("establishment_id", establishmentId);

      // Supprimer l'établissement
      await admin
        .from("establishments")
        .delete()
        .eq("id", establishmentId);
    }

    if (clientProfileId) {
      // Supprimer les rendez-vous du client
      await admin
        .from("appointments")
        .delete()
        .eq("client_profile_id", clientProfileId);

      // Supprimer les avis du client
      await admin
        .from("reviews")
        .delete()
        .eq("client_profile_id", clientProfileId);

      // Supprimer le profil client
      await admin
        .from("client_profiles")
        .delete()
        .eq("id", clientProfileId);
    }

    // Supprimer les préférences de notification
    await admin
      .from("notification_preferences")
      .delete()
      .eq("user_id", userId);

    // 4. Supprimer le compte auth — déclenche les cascades Supabase restantes
    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(userId);

    if (deleteAuthError) {
      console.error("Erreur suppression auth user:", deleteAuthError);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du compte : " + deleteAuthError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erreur suppression compte:", error);
    return NextResponse.json(
      { error: error?.message || "Erreur inattendue" },
      { status: 500 }
    );
  }
}
