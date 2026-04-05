import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { EmailTemplates } from "@/lib/mail/templates";
import { sendEmail, getBaseUrl } from "@/lib/mail";

export async function POST(request: NextRequest) {
  try {
    const { email, password, user_type } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();
    const baseUrl = getBaseUrl();

    // 1. Create the user (unconfirmed) via the admin client
    //    This bypasses email sending by Supabase since we'll handle it ourselves
    const { data: userData, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false, // Must confirm via email
        user_metadata: {
          user_type: user_type || "client",
        },
      });

    if (createError) {
      // Handle "User already exists" gracefully
      if (createError.message.includes("already registered")) {
        return NextResponse.json(
          { error: "Un compte existe déjà avec cette adresse email." },
          { status: 409 }
        );
      }
      console.error("Erreur création utilisateur:", createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    // 2. Generate the confirmation link via the admin client
    const { data: linkData, error: linkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
        options: {
          redirectTo: `${baseUrl}/auth/callback?type=${user_type || "client"}`,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("Erreur génération lien de confirmation:", linkError);
      // User was created but link failed — still return success
      // The user can request a new confirmation link later
      return NextResponse.json({
        success: true,
        warning: "Compte créé mais échec d'envoi de l'email de confirmation.",
      });
    }

    const confirmationUrl = linkData.properties.action_link;

    // 3. Send our custom branded email via Resend
    const emailData = EmailTemplates.accountConfirmation({
      user_type: (user_type === "pro" ? "pro" : "client") as "pro" | "client",
      confirmation_url: confirmationUrl,
    });

    const emailResult = await sendEmail({
      to: email,
      subject: emailData.subject,
      html: emailData.html,
    });

    if (!emailResult.success) {
      console.error("Erreur envoi email de confirmation:", emailResult.error);
      // Don't fail — user exists, they can resend from the login page
      return NextResponse.json({
        success: true,
        warning: "Compte créé mais l'email de confirmation n'a pas pu être envoyé.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Compte créé ! Vérifiez votre email pour confirmer votre inscription.",
    });
  } catch (error) {
    console.error("Erreur inscription:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'inscription." },
      { status: 500 }
    );
  }
}
