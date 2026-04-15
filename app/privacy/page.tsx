import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";
import { Box, Container, Heading, Text, Link, Flex } from "@/components/ui";

const sections = [
  {
    id: "objet",
    title: "1. Objet de la Politique",
    content: "La présente Politique de Confidentialité a pour objectif d’informer les utilisateurs (ci-après « Utilisateurs ») de la manière dont Glowplan collecte, utilise, stocke et protège leurs données personnelles, conformément à la réglementation en vigueur et notamment au Règlement Général sur la Protection des Données (RGPD).",
  },
  {
    id: "donnees-collectees",
    title: "2. Données collectées",
    content: "Lors de l’utilisation de la plateforme, Glowplan peut être amené à collecter les catégories de données suivantes :\n• Données d’identification : nom, prénom, adresse e-mail, mot de passe, etc.\n• Données de navigation : adresse IP, type de navigateur, pages consultées, durée de connexion.\n• Données liées à l’utilisation des services : préférences, projets enregistrés, interactions avec la plateforme.\n(À compléter selon les données effectivement collectées par Glowplan)",
  },
  {
    id: "finalite",
    title: "3. Finalité de la collecte",
    content: "Les données collectées sont utilisées afin de :\n• Permettre la création et la gestion des comptes Utilisateur.\n• Fournir et améliorer les services proposés.\n• Assurer la sécurité et la prévention contre les fraudes.\n• Envoyer des notifications liées au service (mises à jour, support, etc.).\n• Réaliser des statistiques d’utilisation et améliorer l’expérience Utilisateur.",
  },
  {
    id: "base-legale",
    title: "4. Base légale du traitement",
    content: "Le traitement des données personnelles par Glowplan repose sur :\n• L’exécution du contrat (accès et utilisation des services).\n• Le consentement explicite de l’Utilisateur (ex. inscription à une newsletter).\n• L’intérêt légitime de Glowplan (amélioration continue de ses services).",
  },
  {
    id: "conservation",
    title: "5. Conservation des données",
    content: "Les données personnelles sont conservées uniquement le temps nécessaire à la réalisation des finalités mentionnées ci-dessus, sauf obligations légales contraires.",
  },
  {
    id: "partage",
    title: "6. Partage des données",
    content: "Glowplan s’engage à ne jamais vendre les données personnelles des Utilisateurs. Elles peuvent toutefois être partagées avec :\n• Des prestataires techniques (hébergement, maintenance, analytics).\n• Des autorités administratives ou judiciaires, si la loi l’exige.",
  },
  {
    id: "securite",
    title: "7. Sécurité des données",
    content: "Glowplan met en œuvre toutes les mesures techniques et organisationnelles nécessaires pour assurer la protection des données personnelles contre tout accès, modification, divulgation ou destruction non autorisés.",
  },
  {
    id: "droits",
    title: "8. Droits des Utilisateurs",
    content: "Conformément au RGPD, chaque Utilisateur dispose des droits suivants :\n• Droit d’accès, de rectification et de suppression de ses données.\n• Droit d’opposition et de limitation du traitement.\n• Droit à la portabilité des données.\n• Droit de retirer son consentement à tout moment.\nPour exercer ces droits, l’Utilisateur peut contacter Glowplan à l’adresse suivante : 📧 [adresse email à compléter]",
  },
  {
    id: "transfert",
    title: "9. Transfert des données hors UE",
    content: "(À préciser si Glowplan utilise des services hébergés hors Union Européenne, comme certains serveurs cloud. Sinon, indiquer que les données sont hébergées et traitées uniquement au sein de l’UE.)",
  },
  {
    id: "modifications",
    title: "10. Modifications de la Politique",
    content: "Glowplan se réserve le droit de modifier la présente Politique de Confidentialité à tout moment. Les Utilisateurs seront informés de toute modification significative par notification ou via la plateforme.",
  },
  {
    id: "contact",
    title: "11. Contact",
    content: "Pour toute question concernant cette Politique de Confidentialité, l’Utilisateur peut contacter Glowplan à : 📧 [adresse email à compléter]",
  },
];

export default function PrivacyPage() {
  return (
    <Box as="main" className="bg-[#f8faf6] pt-[110px]">
      <Header />
      <Container className="space-y-10 pb-20">
        <Box className="rounded-[32px] bg-white/95 shadow-[0_40px_100px_rgba(50,66,44,0.08)] border border-[#e7ebdf] p-10 lg:p-14">
          <Heading level={1} className="text-4xl font-bold text-slate-950 mb-4">
            Politique de confidentialité
          </Heading>
          <Text className="max-w-3xl text-gray-700 leading-8 text-lg">
            Glowplan informe ses utilisateurs de la manière dont leurs données personnelles sont collectées, utilisées, stockées et protégées, en accord avec la réglementation en vigueur et le RGPD.
          </Text>
        </Box>

        <Box className="rounded-[28px] border border-[#e7ebdf] bg-white p-6 shadow-sm">
          <Text className="text-sm uppercase tracking-[0.24em] text-slate-400 font-bold mb-4">Sommaire</Text>
          <Flex as="nav" direction="row" wrap="wrap" gap={3}>
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`#${section.id}`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {section.title}
              </Link>
            ))}
          </Flex>
        </Box>

        <Box className="grid gap-6">
          {sections.map((section) => (
            <Box key={section.id} id={section.id} className="rounded-[28px] bg-white border border-[#e7ebdf] p-8 shadow-sm">
              <Heading level={2} className="text-2xl font-semibold text-slate-950 mb-4">
                {section.title}
              </Heading>
              <Text className="text-gray-700 leading-8 text-base whitespace-pre-line">
                {section.content}
              </Text>
            </Box>
          ))}
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}
