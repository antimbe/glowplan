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

    let user: any = null;
    let authError: any = null;

    if (code) {
      // PKCE flow (même navigateur que l'inscription)
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      user = data?.user;
      authError = error;
    } else if (token_hash) {
      // Token-hash flow — fonctionne cross-browser (pas besoin du cookie PKCE)
      // Supabase envoie type="email" pour confirmation, "recovery" pour reset
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash,
        type: (type ?? "email") as any,
      });
      user = data?.user;
      authError = error;
    }

    if (!authError && user) {
      // ── Flux reset mot de passe ──────────────────────────────
      if (type === "recovery") {
        const resetTarget = next.startsWith("/auth/pro")
          ? "/auth/pro/reset-password"
          : "/auth/client/reset-password";
        return NextResponse.redirect(`${origin}${resetTarget}`);
      }

      // ── Flux client (type URL ou metadata) ──────────────────
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

      // ── Flux pro ────────────────────────────────────────────
      return NextResponse.redirect(`${origin}/auth/confirmed?type=pro`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
