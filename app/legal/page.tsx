import LegalLayout from "@/components/features/legal/LegalLayout";

const sections = [
  {
    id: "editeur",
    title: "Éditeur du site",
    content: "GlowPlan est édité par GlowPlan SAS, dont le siège social est situé en France. Toutes les informations de contact sont disponibles sur la page Contact.",
  },
  {
    id: "hebergement",
    title: "Hébergement",
    content: "La plateforme est hébergée sur des infrastructures sécurisées conformes aux standards en vigueur pour garantir disponibilité et protection des données.",
  },
  {
    id: "propriete-intellectuelle",
    title: "Propriété intellectuelle",
    content: "Tous les contenus présents sur la plateforme, y compris textes, images, logos et designs, sont protégés par la législation sur la propriété intellectuelle. Toute reproduction est interdite sans autorisation.",
  },
  {
    id: "responsabilite",
    title: "Responsabilité",
    content: "GlowPlan met en œuvre les moyens nécessaires pour assurer le service, mais ne peut garantir une disponibilité continue et ne saurait être tenu responsable des interruptions ou des pertes de données.",
  },
];

export default function LegalPage() {
  return (
    <LegalLayout
      badge="Légal"
      title="Mentions légales"
      subtitle="Informations légales relatives à l'éditeur du site, l'hébergement et la propriété intellectuelle de GlowPlan."
      sections={sections}
      updatedAt="Avril 2026"
    />
  );
}
