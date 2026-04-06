import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// On utilise le service_role pour outrepasser les règles RLS (Row Level Security)
// et avoir un accès global à la table `client_profiles` et `auth.users`
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email, phone } = await req.json();

    if (!email && !phone) {
      return NextResponse.json({ exists: false });
    }

    // On vérifie d'abord si l'email existe dans l'Auth de Subapase ou dans les profils
    let exists = false;

    if (email) {
      // Vérification API RPC ou table profile directement
      // Par sécurité, on regarde si un auth.user existe via le profile
      const { data: profileByEmail, error: emailError } = await supabaseAdmin
        .from("client_profiles")
        .select("id")
        // Note : auth.users ne peut pas être listé sans adminAPI mais "client_profiles" peut stocker l'email, 
        // ou on peut appeler getUserById si besoin. Pour l'instant, on suppose que Glowplan 
        // peut avoir une DB join. On va utiliser une recherche stricte sur le profile.
        // Si l'email n'est pas dans le profile, on doit vérifier auth.users, mais l'admin 
        // peut le faire via listUsers() :
        .limit(1);
        
      // Solution plus fiable : on utilise listUsers admin API.
      const { data: userData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      if (!authError && userData?.users) {
        const foundAutoMatch = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (foundAutoMatch) {
            exists = true;
        }
      }
    }

    if (!exists && phone) {
      const { data: profileByPhone, error: phoneError } = await supabaseAdmin
        .from("client_profiles")
        .select("id")
        .eq("phone", phone)
        .limit(1);

      if (profileByPhone && profileByPhone.length > 0) {
        exists = true;
      }
    }

    return NextResponse.json({ exists });

  } catch (error: any) {
    console.error("Erreur lors de la validation guest:", error);
    // On ne coupe pas toute la réservation en cas de crash, on laisse passer (exists: false)
    return NextResponse.json({ exists: false, error: error.message }, { status: 500 });
  }
}
