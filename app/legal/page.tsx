import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";
import { Box, Container, Heading, Text, Link, Flex } from "@/components/ui";

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
    <Box as="main" className="bg-[#f8faf6] pt-[110px]">
      <Header />
      <Container className="space-y-10 pb-20">
        <Box className="rounded-[32px] bg-white/95 shadow-[0_40px_100px_rgba(50,66,44,0.08)] border border-[#e7ebdf] p-10 lg:p-14">
          <Heading level={1} className="text-4xl font-bold text-slate-950 mb-4">
            Mentions légales
          </Heading>
          <Text className="max-w-3xl text-gray-700 leading-8 text-lg">
            Retrouvez ici les informations légales de GlowPlan, notamment l’éditeur du site, les modalités d’hébergement et la propriété intellectuelle.
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
