import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.user) {
      // Récupérer les métadonnées de l'utilisateur
      const userMetadata = data.user.user_metadata;
      const userType = userMetadata?.user_type;
      
      // Si c'est un client (type dans URL ou dans métadonnées)
      if (type === "client" || userType === "client") {
        // Vérifier si le profil existe déjà
        const { data: existingProfile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (!existingProfile) {
          // Créer le profil client avec les métadonnées de l'inscription
          await supabase.from("client_profiles").insert({
            user_id: data.user.id,
            first_name: userMetadata?.first_name || "",
            last_name: userMetadata?.last_name || "",
            phone: userMetadata?.phone || null,
            user_type: "client",
          });
        } else {
          // Toujours mettre à jour avec les métadonnées si elles existent
          if (userMetadata?.first_name) {
            await supabase
              .from("client_profiles")
              .update({
                first_name: userMetadata.first_name,
                last_name: userMetadata.last_name || "",
                phone: userMetadata.phone || null,
              })
              .eq("id", existingProfile.id);
          }
        }
        
        return NextResponse.redirect(`${origin}/search`);
      }
      
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
