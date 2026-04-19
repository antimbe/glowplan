import LegalLayout from "@/components/features/legal/LegalLayout";

const sections = [
  {
    id: "objet",
    title: "1. Objet",
    content: "Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités et conditions d'accès et d'utilisation de la plateforme GlowPlan.",
  },
  {
    id: "acceptation",
    title: "2. Acceptation des CGU",
    content: "En accédant ou en utilisant la Plateforme, l'Utilisateur reconnaît avoir lu, compris et accepté les présentes CGU sans réserve. En cas de désaccord, l'Utilisateur est invité à ne pas utiliser la Plateforme.",
  },
  {
    id: "acces",
    title: "3. Accès à la Plateforme",
    content: "L'accès à la Plateforme est ouvert à toute personne disposant d'un accès internet. GlowPlan se réserve le droit de suspendre, limiter ou interrompre l'accès, notamment pour des raisons techniques ou de maintenance.",
  },
  {
    id: "inscription",
    title: "4. Inscription et Compte Utilisateur",
    content: "Certaines fonctionnalités nécessitent la création d'un compte. L'Utilisateur s'engage à fournir des informations exactes et complètes. Il est seul responsable de la confidentialité de ses identifiants et de toute activité effectuée via son compte.",
  },
  {
    id: "utilisation",
    title: "5. Utilisation de la Plateforme",
    content: "L'Utilisateur s'engage à :\n• Utiliser la Plateforme conformément à la législation en vigueur.\n• Ne pas porter atteinte aux droits de GlowPlan ou de tiers.\n• Ne pas introduire de virus ou tout autre code malveillant.\nGlowPlan se réserve le droit de suspendre ou supprimer un compte en cas de non-respect des présentes CGU.",
  },
  {
    id: "services",
    title: "6. Services proposés",
    content: "GlowPlan met à disposition des Utilisateurs divers outils et services destinés à faciliter la gestion de leur activité beauté. Les fonctionnalités peuvent évoluer au fil du temps.",
  },
  {
    id: "responsabilite",
    title: "7. Responsabilité",
    content: "GlowPlan met en œuvre les moyens nécessaires pour assurer la sécurité et le bon fonctionnement de la Plateforme, sans pour autant garantir une accessibilité continue. GlowPlan ne saurait être tenu responsable en cas de panne, interruption temporaire ou perte de données résultant de l'utilisation de la Plateforme.",
  },
  {
    id: "donnees-personnelles",
    title: "8. Données personnelles",
    content: "Les données personnelles collectées sont traitées conformément au RGPD. Pour plus d'informations, l'Utilisateur est invité à consulter la Politique de Confidentialité disponible sur la plateforme.",
  },
  {
    id: "propriete-intellectuelle",
    title: "9. Propriété intellectuelle",
    content: "L'ensemble des éléments constitutifs de la Plateforme (textes, images, logos, marques, fonctionnalités) est protégé par les lois relatives à la propriété intellectuelle. Toute reproduction ou exploitation non autorisée est strictement interdite.",
  },
  {
    id: "modification",
    title: "10. Modification des CGU",
    content: "GlowPlan se réserve le droit de modifier les présentes CGU à tout moment. Toute modification sera notifiée aux Utilisateurs via la Plateforme, et leur utilisation postérieure vaut acceptation des nouvelles CGU.",
  },
  {
    id: "resiliation",
    title: "11. Résiliation",
    content: "L'Utilisateur peut à tout moment résilier son compte. GlowPlan peut également suspendre ou supprimer un compte en cas de non-respect des CGU ou pour toute autre raison légitime.",
  },
  {
    id: "loi-applicable",
    title: "12. Loi applicable",
    content: "Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de solution amiable, les tribunaux compétents seront ceux du ressort du siège social de GlowPlan.",
  },
];

export default function TermsPage() {
  return (
    <LegalLayout
      badge="CGU"
      title="Conditions générales d'utilisation"
      subtitle="Ces conditions encadrent l'accès et l'utilisation de la plateforme GlowPlan. Elles définissent les droits et devoirs des Utilisateurs ainsi que les engagements de GlowPlan."
      sections={sections}
      updatedAt="Avril 2026"
    />
  );
}
