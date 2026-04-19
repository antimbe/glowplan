import LegalLayout from "@/components/features/legal/LegalLayout";

const sections = [
  {
    id: "objet",
    title: "1. Objet de la Politique",
    content: "La présente Politique de Confidentialité a pour objectif d'informer les utilisateurs de la manière dont GlowPlan collecte, utilise, stocke et protège leurs données personnelles, conformément au Règlement Général sur la Protection des Données (RGPD).",
  },
  {
    id: "donnees-collectees",
    title: "2. Données collectées",
    content: "Lors de l'utilisation de la plateforme, GlowPlan peut être amené à collecter :\n• Données d'identification : nom, prénom, adresse e-mail, mot de passe.\n• Données de navigation : adresse IP, type de navigateur, pages consultées, durée de connexion.\n• Données liées à l'utilisation des services : préférences, réservations enregistrées, interactions.",
  },
  {
    id: "finalite",
    title: "3. Finalité de la collecte",
    content: "Les données collectées sont utilisées afin de :\n• Permettre la création et la gestion des comptes Utilisateur.\n• Fournir et améliorer les services proposés.\n• Assurer la sécurité et la prévention contre les fraudes.\n• Envoyer des notifications liées au service.\n• Réaliser des statistiques d'utilisation et améliorer l'expérience.",
  },
  {
    id: "base-legale",
    title: "4. Base légale du traitement",
    content: "Le traitement des données personnelles repose sur :\n• L'exécution du contrat (accès et utilisation des services).\n• Le consentement explicite de l'Utilisateur.\n• L'intérêt légitime de GlowPlan (amélioration continue de ses services).",
  },
  {
    id: "conservation",
    title: "5. Conservation des données",
    content: "Les données personnelles sont conservées uniquement le temps nécessaire à la réalisation des finalités mentionnées ci-dessus, sauf obligations légales contraires.",
  },
  {
    id: "partage",
    title: "6. Partage des données",
    content: "GlowPlan s'engage à ne jamais vendre les données personnelles des Utilisateurs. Elles peuvent toutefois être partagées avec :\n• Des prestataires techniques (hébergement, maintenance, analytics).\n• Des autorités administratives ou judiciaires, si la loi l'exige.",
  },
  {
    id: "securite",
    title: "7. Sécurité des données",
    content: "GlowPlan met en œuvre toutes les mesures techniques et organisationnelles nécessaires pour assurer la protection des données personnelles contre tout accès, modification, divulgation ou destruction non autorisés.",
  },
  {
    id: "droits",
    title: "8. Droits des Utilisateurs",
    content: "Conformément au RGPD, chaque Utilisateur dispose des droits suivants :\n• Droit d'accès, de rectification et de suppression de ses données.\n• Droit d'opposition et de limitation du traitement.\n• Droit à la portabilité des données.\n• Droit de retirer son consentement à tout moment.\nPour exercer ces droits, contactez-nous à : contact@glowplan.fr",
  },
  {
    id: "transfert",
    title: "9. Transfert des données hors UE",
    content: "Les données sont hébergées et traitées au sein de l'Union Européenne. En cas de transfert vers un pays tiers, GlowPlan s'assure que les garanties appropriées sont en place conformément au RGPD.",
  },
  {
    id: "modifications",
    title: "10. Modifications de la Politique",
    content: "GlowPlan se réserve le droit de modifier la présente Politique de Confidentialité à tout moment. Les Utilisateurs seront informés de toute modification significative par notification ou via la plateforme.",
  },
  {
    id: "contact",
    title: "11. Contact",
    content: "Pour toute question concernant cette Politique de Confidentialité, contactez GlowPlan à : contact@glowplan.fr",
  },
];

export default function PrivacyPage() {
  return (
    <LegalLayout
      badge="Confidentialité"
      title="Politique de confidentialité"
      subtitle="GlowPlan informe ses utilisateurs de la manière dont leurs données personnelles sont collectées, utilisées et protégées, en accord avec le RGPD."
      sections={sections}
      updatedAt="Avril 2026"
    />
  );
}
