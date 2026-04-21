import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function DELETE() {
  try {
    // 1. Vérifier l'authentification
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const admin = createAdminClient();
    const userId = user.id;

    // 2. Récupérer l'établissement (pro) et le profil client
    const [{ data: establishment }, { data: clientProfile }] = await Promise.all([
      admin.from("establishments").select("id").eq("user_id", userId).maybeSingle(),
      admin.from("client_profiles").select("id").eq("user_id", userId).maybeSingle(),
    ]);

    const establishmentId = establishment?.id ?? null;
    const clientProfileId = clientProfile?.id ?? null;

    // ─── Suppression PRO (tout ce qui dépend de l'établissement) ────────────
    if (establishmentId) {
      // Niveau 1 : dépend de appointments (doit passer avant appointments)
      await admin.from("appointment_reminders").delete().eq("establishment_id", establishmentId);

      // Niveau 1 : dépend de appointments + establishments
      await admin.from("reviews").delete().eq("establishment_id", establishmentId);

      // Niveau 1 : dépend directement de establishments
      await admin.from("booking_audit_logs").delete().eq("establishment_id", establishmentId);
      await admin.from("notifications").delete().eq("establishment_id", establishmentId);
      await admin.from("blocked_clients").delete().eq("establishment_id", establishmentId);
      await admin.from("favorites").delete().eq("establishment_id", establishmentId);
      await admin.from("establishment_photos").delete().eq("establishment_id", establishmentId);

      // Niveau 2 : appointments dépend de services → supprimer appointments avant services
      await admin.from("appointments").delete().eq("establishment_id", establishmentId);

      // Niveau 2 : dépendent de establishments uniquement
      await admin.from("services").delete().eq("establishment_id", establishmentId);
      await admin.from("opening_hours").delete().eq("establishment_id", establishmentId);
      await admin.from("unavailabilities").delete().eq("establishment_id", establishmentId);

      // Niveau 3 : l'établissement lui-même
      await admin.from("establishments").delete().eq("id", establishmentId);
    }

    // ─── Suppression CLIENT (tout ce qui dépend du profil client) ───────────
    if (clientProfileId) {
      // Récupérer les IDs des rendez-vous du client pour supprimer les reminders
      const { data: clientAppointments } = await admin
        .from("appointments")
        .select("id")
        .eq("client_profile_id", clientProfileId);

      const appointmentIds = (clientAppointments ?? []).map((a) => a.id);

      if (appointmentIds.length > 0) {
        await admin.from("appointment_reminders").delete().in("appointment_id", appointmentIds);
      }

      await admin.from("reviews").delete().eq("client_profile_id", clientProfileId);
      await admin.from("favorites").delete().eq("client_id", clientProfileId);
      await admin.from("blocked_clients").delete().eq("client_profile_id", clientProfileId);
      await admin.from("appointments").delete().eq("client_profile_id", clientProfileId);

      // Profil client
      await admin.from("client_profiles").delete().eq("id", clientProfileId);
    }

    // ─── Préférences de notification ────────────────────────────────────────
    await admin.from("notification_preferences").delete().eq("user_id", userId);

    // ─── Suppression du compte auth ─────────────────────────────────────────
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
