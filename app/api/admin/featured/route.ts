import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

// PATCH /api/admin/featured  { establishmentId, featured: bool }
export async function PATCH(request: NextRequest) {
  const supabase = createAdminClient();
  const { establishmentId, featured } = await request.json();

  if (!establishmentId || typeof featured !== "boolean") {
    return NextResponse.json({ error: "Paramètres invalides" }, { status: 400 });
  }

  // Si on active, vérifier qu'il n'y a pas déjà 3 partenaires phares
  if (featured) {
    const { count } = await supabase
      .from("establishments")
      .select("id", { count: "exact", head: true })
      .eq("is_featured", true)
      .neq("id", establishmentId);

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: "Maximum 3 partenaires phares. Désactivez-en un avant d'en ajouter un nouveau." },
        { status: 409 }
      );
    }
  }

  const { error } = await supabase
    .from("establishments")
    .update({ is_featured: featured })
    .eq("id", establishmentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}

// GET /api/admin/featured  → liste tous les établissements
export async function GET() {
  const supabase = createAdminClient();

  // Essai avec is_featured
  let { data, error } = await supabase
    .from("establishments")
    .select("id, name, city, main_photo_url, is_featured, is_profile_complete")
    .order("name");

  // Si la colonne n'existe pas encore (migration non appliquée), on récupère sans
  if (error?.message?.includes("is_featured")) {
    const fallback = await supabase
      .from("establishments")
      .select("id, name, city, main_photo_url, is_profile_complete")
      .order("name");

    if (fallback.error) return NextResponse.json({ error: fallback.error.message }, { status: 500 });

    // On ajoute is_featured: false par défaut
    data = (fallback.data ?? []).map((e: Record<string, unknown>) => ({ ...e, is_featured: false }));
    error = null;
  }

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Trier : featured en premier
  const sorted = [...(data ?? [])].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

  return NextResponse.json(sorted);
}
