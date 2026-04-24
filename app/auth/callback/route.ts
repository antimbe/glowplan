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
      // Flux de réinitialisation de mot de passe — rediriger vers la page de reset correspondante
      if (type === "recovery") {
        const resetTarget = next.startsWith("/auth/pro")
          ? "/auth/pro/reset-password"
          : "/auth/client/reset-password";
        return NextResponse.redirect(`${origin}${resetTarget}`);
      }

      // Récupérer les métadonnées de l'utilisateur
      const userMetadata = data.user.user_metadata;
      const userType = userMetadata?.user_type;

      // Si c'est un client (type dans URL ou dans métadonnées)
      if (type === "client" || userType === "client") {
<<<<<<< Updated upstream
        // Upsert du profil client — évite les doublons en cas de double callback (mobile/réseau lent)
        await supabase.from("client_profiles").upsert(
          {
=======
        // Vérifier si le profil existe déjà
        const { data: existingProfile } = await supabase
          .from("client_profiles")
          .select("id, first_name")
          .eq("user_id", data.user.id)
          .single();

        if (!existingProfile) {
          // Créer le profil client avec les métadonnées de l'inscription
          await supabase.from("client_profiles").insert({
>>>>>>> Stashed changes
            user_id: data.user.id,
            first_name: userMetadata?.first_name || userMetadata?.name || "",
            last_name: userMetadata?.last_name || "",
            phone: userMetadata?.phone || null,
            user_type: "client",
<<<<<<< Updated upstream
          },
          { onConflict: "user_id", ignoreDuplicates: false }
        );
=======
          });
        } else if (userMetadata?.first_name && (!existingProfile.first_name || existingProfile.first_name === "Client")) {
          // Mettre à jour si les métadonnées sont plus complètes que ce qui est en base
          await supabase
            .from("client_profiles")
            .update({
              first_name: userMetadata.first_name,
              last_name: userMetadata.last_name || "",
              phone: userMetadata.phone || null,
            })
            .eq("id", existingProfile.id);
        }
>>>>>>> Stashed changes

        return NextResponse.redirect(`${origin}/search`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
