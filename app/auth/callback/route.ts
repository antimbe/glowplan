import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code       = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type       = searchParams.get("type");
  const next       = searchParams.get("next") ?? "/dashboard";

  if (code || token_hash) {
    const supabase = await createClient();

    let user: any   = null;
    let authError: any = null;

    if (code) {
      // PKCE flow — nécessite le cookie verifier du même navigateur
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      user      = data?.user;
      authError = error;
    } else if (token_hash) {
      // Token-hash flow — fonctionne cross-browser (pas de cookie PKCE requis)
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: (type ?? "email") as any,
      });
      user      = data?.user;
      authError = error;
    }

    // ── Cas 1 : succès complet ──────────────────────────────────
    if (!authError && user) {
      if (type === "recovery") {
        const resetTarget = next.startsWith("/auth/pro")
          ? "/auth/pro/reset-password"
          : "/auth/client/reset-password";
        return NextResponse.redirect(`${origin}${resetTarget}`);
      }

      const userMetadata = user.user_metadata ?? {};
      const userType     = userMetadata.user_type;

      if (type === "client" || userType === "client") {
        await supabase.from("client_profiles").upsert(
          {
            user_id:    user.id,
            first_name: userMetadata.first_name || userMetadata.name || "",
            last_name:  userMetadata.last_name  || "",
            phone:      userMetadata.phone      || null,
            user_type:  "client",
          },
          { onConflict: "user_id", ignoreDuplicates: false }
        );
        return NextResponse.redirect(`${origin}/auth/confirmed?type=client`);
      }

      return NextResponse.redirect(`${origin}/auth/confirmed?type=pro`);
    }

    // ── Cas 2 : échange échoué mais un code était présent ──────
    // Supabase confirme l'email côté serveur AVANT de rediriger vers notre callback.
    // Si le code existe mais l'échange échoue (ex. PKCE cross-browser — lien ouvert
    // dans un navigateur différent de celui de l'inscription), l'email est quand même
    // confirmé. On redirige vers une page "confirmé" avec instruction de se connecter.
    if (authError && code) {
      const accountType = type === "client" ? "client" : "pro";
      return NextResponse.redirect(
        `${origin}/auth/confirmed?type=${accountType}&login_required=true`
      );
    }
  }

  // Aucun code du tout → lien vraiment invalide
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
