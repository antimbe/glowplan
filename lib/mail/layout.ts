export const MAIL_PALETTE = {
  primary: "#32422c",
  primaryForeground: "#ffffff",
  secondary: "#f9f9f9",
  accent: "#f59e0b",
  accentBg: "#fef3c7",
  text: "#374151",
  textLight: "#6b7280",
  white: "#ffffff",
};

export function getBaseLayout(title: string, content: string) {
  return `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${MAIL_PALETTE.secondary}; color: ${MAIL_PALETTE.text}; line-height: 1.6;">
      <div style="max-width: 600px; margin: 0 auto; background-color: ${MAIL_PALETTE.white}; overflow: hidden; border-radius: 8px; margin-top: 20px; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
        <!-- Header -->
        <div style="background-color: ${MAIL_PALETTE.primary}; padding: 30px 20px; text-align: center;">
          <h1 style="color: ${MAIL_PALETTE.primaryForeground}; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.02em;">GlowPlan</h1>
        </div>
        
        <!-- Content -->
        <div style="padding: 40px 30px;">
          ${content}
        </div>
        
        <!-- Footer -->
        <div style="background-color: ${MAIL_PALETTE.primary}; padding: 20px; text-align: center; color: rgba(255, 255, 255, 0.8);">
          <p style="margin: 0; font-size: 13px;">&copy; ${new Date().getFullYear()} GlowPlan. Tous droits réservés.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export function getButton(text: string, url: string) {
  return `
    <div style="text-align: center; margin: 35px 0;">
      <a href="${url}" style="background-color: ${MAIL_PALETTE.primary}; color: ${MAIL_PALETTE.primaryForeground}; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block; transition: background-color 0.2s;">
        ${text}
      </a>
    </div>
  `;
}

export function getInfoBox(title: string, items: { label: string; value: string }[], variant: "primary" | "accent" = "primary") {
  const borderColor = variant === "primary" ? MAIL_PALETTE.primary : MAIL_PALETTE.accent;
  const bgColor = variant === "primary" ? "#f8faf7" : MAIL_PALETTE.accentBg;
  
  return `
    <div style="background-color: ${bgColor}; border-left: 4px solid ${borderColor}; padding: 20px; border-radius: 8px; margin: 25px 0;">
      <h3 style="margin-top: 0; margin-bottom: 15px; color: ${MAIL_PALETTE.primary}; font-size: 16px; font-weight: 700;">${title}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${items.map(item => `
          <tr>
            <td style="padding: 4px 0; vertical-align: top; width: 100px; color: ${MAIL_PALETTE.textLight}; font-size: 14px;"><strong>${item.label} :</strong></td>
            <td style="padding: 4px 0; vertical-align: top; color: ${MAIL_PALETTE.text}; font-size: 14px;">${item.value}</td>
          </tr>
        `).join('')}
      </table>
    </div>
  `;
}
