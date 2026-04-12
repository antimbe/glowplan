import { sendEmail } from "@/lib/mail";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { firstName, lastName, email, phone, subject, message } = body;

    // Validation
    if (!firstName || !lastName || !email || !phone || !message) {
      return NextResponse.json(
        { error: "Tous les champs requis doivent être complétés" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Veuillez fournir une adresse email valide" },
        { status: 400 }
      );
    }

    // Email to admin
    const adminTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8faf6; padding: 40px 20px; border-radius: 12px;">
        <h2 style="color: #32422c; margin-bottom: 24px;">Nouveau message de contact</h2>
        
        <div style="background: white; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <p><strong>Nom:</strong> ${firstName} ${lastName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Téléphone:</strong> ${phone}</p>
          <p><strong>Sujet:</strong> ${subject || "Non spécifié"}</p>
        </div>

        <div style="background: white; padding: 24px; border-radius: 8px; margin-bottom: 24px;">
          <h3 style="color: #32422c; margin-top: 0;">Message:</h3>
          <p style="white-space: pre-wrap; color: #666;">${message}</p>
        </div>

        <p style="color: #999; font-size: 12px; text-align: center;">
          Pour répondre, utilisez l'email: ${email}
        </p>
      </div>
    `;

    // Email to user confirmation
    const userTemplate = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #f8faf6; padding: 40px 20px; border-radius: 12px;">
        <div style="background: white; padding: 40px; border-radius: 12px; text-align: center;">
          <h2 style="color: #32422c; margin-bottom: 24px;">Merci pour votre message</h2>
          
          <p style="color: #666; font-size: 16px; margin-bottom: 24px;">
            Bonjour ${firstName},
          </p>

          <p style="color: #666; font-size: 16px; margin-bottom: 24px;">
            Nous avons bien reçu votre message et on vous remerciera de votre intérêt pour GlowPlan. Notre équipe vous répondra au plus vite, généralement sous 24 à 48 heures.
          </p>

          <div style="background: #f8faf6; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
            <p style="color: #999; font-size: 14px; margin: 0;">
              <strong>Récapitulatif de votre message:</strong><br>
              Sujet: ${subject || "Non spécifié"}<br>
              Date: ${new Date().toLocaleDateString("fr-FR")}
            </p>
          </div>

          <p style="color: #666; font-size: 16px;">
            Cordialement,<br>
            <strong>L'équipe GlowPlan</strong>
          </p>
        </div>

        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 24px;">
          © 2026 GlowPlan. Tous droits réservés.
        </p>
      </div>
    `;

    // Send email to admin
    const adminResult = await sendEmail({
      to: process.env.CONTACT_EMAIL || "contact@glowplan.fr",
      subject: `[GlowPlan Contact] Nouveau message de ${firstName} ${lastName}`,
      html: adminTemplate,
    });

    if (!adminResult.success) {
      console.error("Erreur lors de l'envoi à l'admin:", adminResult.error);
      return NextResponse.json(
        { error: "Erreur lors de l'envoi de votre message" },
        { status: 500 }
      );
    }

    // Send confirmation email to user
    const userResult = await sendEmail({
      to: email,
      subject: "Nous avons reçu votre message - GlowPlan",
      html: userTemplate,
    });

    if (!userResult.success) {
      console.error("Erreur lors de l'envoi de confirmation:", userResult.error);
      // Les administrateur ont déjà reçu le message, on confirme quand même le succès
    }

    return NextResponse.json({
      success: true,
      message: "Votre message a été envoyé avec succès ! Nous vous répondrons bientôt.",
    });
  } catch (error) {
    console.error("Erreur dans POST /api/contact/send:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors du traitement de votre message" },
      { status: 500 }
    );
  }
}
