import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";
import { Box, Container, Heading, Text, Link, Stack } from "@/components/ui";

const sections = [
  {
    id: "objet",
    title: "1. Objet",
    content: "Les présentes Conditions Générales d’Utilisation (ci-après « CGU ») ont pour objet de définir les modalités et conditions d’accès et d’utilisation du site/application Glowplan (ci-après « la Plateforme »).",
  },
  {
    id: "acceptation",
    title: "2. Acceptation des CGU",
    content: "En accédant ou en utilisant la Plateforme, l’utilisateur (ci-après « l’Utilisateur ») reconnaît avoir lu, compris et accepté les présentes CGU sans réserve. En cas de désaccord avec l’une des dispositions, l’Utilisateur est invité à ne pas utiliser la Plateforme.",
  },
  {
    id: "acces",
    title: "3. Accès à la Plateforme",
    content: "L’accès à la Plateforme est ouvert à toute personne disposant d’un accès internet. Glowplan se réserve le droit de suspendre, limiter ou interrompre l’accès à tout ou partie de la Plateforme, notamment pour des raisons techniques ou de maintenance.",
  },
  {
    id: "inscription",
    title: "4. Inscription et Compte Utilisateur",
    content: "Certaines fonctionnalités nécessitent la création d’un compte. L’Utilisateur s’engage à fournir des informations exactes, à jour et complètes lors de son inscription. L’Utilisateur est seul responsable de la confidentialité de ses identifiants et de toute activité effectuée via son compte.",
  },
  {
    id: "utilisation",
    title: "5. Utilisation de la Plateforme",
    content: "L’Utilisateur s’engage à : utiliser la Plateforme conformément à la législation en vigueur ; ne pas porter atteinte aux droits de Glowplan ou de tiers ; ne pas introduire de virus ou tout autre code malveillant. Glowplan se réserve le droit de suspendre ou supprimer le compte d’un Utilisateur en cas de non-respect des présentes CGU.",
  },
  {
    id: "services",
    title: "6. Services proposés",
    content: "Glowplan met à disposition des Utilisateurs divers outils et services destinés à faciliter la gestion et l’organisation de leurs projets. Les fonctionnalités peuvent évoluer au fil du temps.",
  },
  {
    id: "responsabilite",
    title: "7. Responsabilité",
    content: "Glowplan met en œuvre les moyens nécessaires pour assurer la sécurité et le bon fonctionnement de la Plateforme, sans pour autant garantir une accessibilité continue. Glowplan ne saurait être tenu responsable en cas de panne, interruption ou indisponibilité temporaire de la Plateforme, ou de perte de données ou dommages indirects résultant de l’utilisation de la Plateforme.",
  },
  {
    id: "donnees-personnelles",
    title: "8. Données personnelles",
    content: "Les données personnelles collectées sont traitées conformément à la réglementation en vigueur (RGPD). Pour plus d’informations, l’Utilisateur est invité à consulter la Politique de Confidentialité.",
  },
  {
    id: "propriete-intellectuelle",
    title: "9. Propriété intellectuelle",
    content: "L’ensemble des éléments constitutifs de la Plateforme (textes, images, logos, marques, fonctionnalités, etc.) est protégé par les lois relatives à la propriété intellectuelle. Toute reproduction, représentation ou exploitation non autorisée est strictement interdite.",
  },
  {
    id: "modification",
    title: "10. Modification des CGU",
    content: "Glowplan se réserve le droit de modifier les présentes CGU à tout moment. Toute modification sera notifiée aux Utilisateurs via la Plateforme, et leur utilisation postérieure à la notification vaut acceptation des nouvelles CGU.",
  },
  {
    id: "resiliation",
    title: "11. Résiliation",
    content: "L’Utilisateur peut à tout moment résilier son compte. Glowplan peut également suspendre ou supprimer un compte en cas de non-respect des CGU ou pour toute autre raison légitime.",
  },
  {
    id: "loi-applicable",
    title: "12. Loi applicable et juridiction compétente",
    content: "Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de solution amiable, les tribunaux compétents seront ceux du ressort du siège social de Glowplan.",
  },
];

export default function TermsPage() {
  return (
    <Box as="main" className="bg-[#f8faf6] pt-[110px]">
      <Header />
      <Container className="space-y-10 pb-20">
        <Box className="rounded-[32px] bg-white/95 shadow-[0_40px_100px_rgba(50,66,44,0.08)] border border-[#e7ebdf] p-10 lg:p-14">
          <Heading level={1} className="text-4xl font-bold text-slate-950 mb-4">
            Conditions Générales d’utilisation
          </Heading>
          <Text className="max-w-3xl text-gray-700 leading-8 text-lg">
            Ces conditions encadrent l’accès et l’utilisation de la plateforme Glowplan. Elles expliquent les droits et devoirs des Utilisateurs, ainsi que les engagements de Glowplan.
          </Text>
        </Box>

        <Box className="rounded-[28px] border border-[#e7ebdf] bg-white p-6 shadow-sm">
          <Text className="text-sm uppercase tracking-[0.24em] text-slate-400 font-bold mb-4">Sommaire</Text>
          <Stack as="nav" direction="row" wrap="wrap" gap={3}>
            {sections.map((section) => (
              <Link
                key={section.id}
                href={`#${section.id}`}
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                {section.title}
              </Link>
            ))}
          </Stack>
        </Box>

        <Box className="grid gap-6">
          {sections.map((section) => (
            <Box key={section.id} id={section.id} className="rounded-[28px] bg-white border border-[#e7ebdf] p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
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
