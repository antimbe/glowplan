"use client";

import { useState } from "react";
import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";
import { Box, Container, Heading, Text, Flex, Button } from "@/components/ui";
import { Heart, Calendar, Users, BarChart2, Sparkles, Check, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

// ─── Feature categories ───────────────────────────────────────────────────────

const FEATURE_CATEGORIES = [
  {
    icon: Calendar,
    title: "Gestion d'agenda complète",
    items: [
      "Planification automatique",
      "Vue journalière, hebdo, mensuelle",
      "Notifications par SMS",
      "Rappels automatiques",
      "Synchronisation calendrier",
    ],
  },
  {
    icon: Users,
    title: "Gestion complète des clients",
    items: [
      "Fiches clients détaillées",
      "Historique des RDV et services",
      "Notes personnalisées",
      "Suivi des préférences",
      "Programme de fidélité",
    ],
  },
  {
    icon: BarChart2,
    title: "Analyses détaillées des performances",
    items: [
      "Rapports de chiffre d'affaires",
      "Analyse des tendances",
      "KPI personnalisés",
      "Export de données",
      "Tableaux de bord visuels",
    ],
  },
  {
    icon: Sparkles,
    title: "Boostez votre visibilité en ligne",
    items: [
      "Profil personnalisé",
      "Avis clients certifiés",
      "Référencement local",
      "Galerie photos/vidéos",
      "Badges de qualité",
    ],
  },
];

// ─── Fake blurred pricing plans ───────────────────────────────────────────────

const PLANS = [
  {
    name: "Starter",
    monthlyPrice: "19",
    yearlyPrice: "15",
    description: "Idéal pour démarrer en solo",
    features: ["Agenda illimité", "Rappels automatiques", "Page de réservation", "Support email"],
    highlight: false,
  },
  {
    name: "Pro",
    monthlyPrice: "39",
    yearlyPrice: "31",
    description: "Pour les pros qui veulent tout gérer",
    features: ["Tout Starter", "Gestion clients avancée", "Statistiques détaillées", "Notifications SMS", "Support prioritaire"],
    highlight: true,
  },
  {
    name: "Business",
    monthlyPrice: "79",
    yearlyPrice: "63",
    description: "Pour les équipes et multi-établissements",
    features: ["Tout Pro", "Multi-établissements", "Export comptable", "API access", "Account manager dédié"],
    highlight: false,
  },
];

// ─── Nav links section ────────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Accueil", href: "/", dark: true },
  { label: "Nous contacter", href: "/contact", dark: false },
  { label: "Qui sommes-nous", href: "/about", dark: false, light: true },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProsPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [featurePage, setFeaturePage] = useState(0);

  const totalFeaturePages = Math.ceil(FEATURE_CATEGORIES.length / 4);

  return (
    <Box as="main" className="bg-white">
      <Header />

      {/* ── 1. Banner gratuit ─────────────────────────────────────────────── */}
      <Box className="bg-primary pt-[110px] pb-8 px-4">
        <Box className="max-w-2xl mx-auto bg-white rounded-[2rem] p-8 text-center shadow-lg">
          <Box className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-primary" strokeWidth={1.5} />
          </Box>
          <Heading level={2} className="text-xl font-bold text-slate-900 mb-2">
            Pour le moment, l'accès est entièrement gratuit.
          </Heading>
          <Text className="text-slate-500 text-sm mb-4">
            Toute l'équipe Glowplan vous remercie chaleureusement de tester notre outil
          </Text>
          <Heart size={20} className="text-primary mx-auto" fill="currentColor" />
        </Box>
      </Box>

      {/* ── 2. Pricing section (green bg, cards blurred) ──────────────────── */}
      <Box className="bg-primary py-16 px-4">
        <Box className="max-w-5xl mx-auto text-center mb-10">
          <Heading level={1} className="text-4xl font-bold text-white mb-4">
            Pour les pros
          </Heading>
          <Text className="text-white/70 max-w-xl mx-auto leading-relaxed mb-6">
            Découvre nos formules conçues pour répondre tant au micro-entrepreneur en solo qu'à des entreprises plus développées. Compare les fonctionnalités, trouve celle qui correspond au profil et profite d'une plateforme adaptée à tes besoins.
          </Text>
          <Text className="text-white/50 text-xs mb-8">
            🔥 En plus d'avoir gratuit les 30 jours, sans engagement + offres supplémentaires. Accélère-toi avant de te plonger totalement dans l'univers GlowPlan sans aucun investissement initial requis !
          </Text>

          {/* Toggle Mois / Année */}
          <Flex align="center" justify="center" gap={3} className="mb-10">
            <Text className={`text-sm font-semibold ${!isYearly ? "text-white" : "text-white/50"}`}>Mois</Text>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isYearly ? "bg-accent" : "bg-white/30"}`}
            >
              <span
                className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${isYearly ? "translate-x-7" : "translate-x-1"}`}
              />
            </button>
            <Text className={`text-sm font-semibold ${isYearly ? "text-white" : "text-white/50"}`}>Année</Text>
          </Flex>
        </Box>

        {/* Blurred pricing cards */}
        <Box className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 select-none">
          {PLANS.map((plan) => (
            <Box
              key={plan.name}
              className={`relative rounded-[1.5rem] p-8 blur-sm pointer-events-none ${
                plan.highlight
                  ? "bg-white shadow-2xl scale-[1.02]"
                  : "bg-white/10 border border-white/20"
              }`}
            >
              {plan.highlight && (
                <Box className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-4 py-1 rounded-full">
                  Populaire
                </Box>
              )}
              <Text className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.highlight ? "text-primary/40" : "text-white/40"}`}>
                {plan.name}
              </Text>
              <Flex align="end" gap={1} className="mb-1">
                <Text className={`text-5xl font-bold ${plan.highlight ? "text-slate-900" : "text-white"}`}>
                  {isYearly ? plan.yearlyPrice : plan.monthlyPrice}€
                </Text>
                <Text className={`text-sm mb-2 ${plan.highlight ? "text-slate-400" : "text-white/50"}`}>/mois</Text>
              </Flex>
              <Text className={`text-sm mb-6 ${plan.highlight ? "text-slate-500" : "text-white/60"}`}>
                {plan.description}
              </Text>
              <Box className={`w-full h-px mb-6 ${plan.highlight ? "bg-slate-100" : "bg-white/10"}`} />
              <Box className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <Flex key={f} align="center" gap={2}>
                    <Check size={14} className={plan.highlight ? "text-primary" : "text-white/60"} />
                    <Text className={`text-sm ${plan.highlight ? "text-slate-700" : "text-white/70"}`}>{f}</Text>
                  </Flex>
                ))}
              </Box>
              <Box className={`w-full py-3 rounded-xl text-center text-sm font-bold ${
                plan.highlight ? "bg-primary text-white" : "bg-white/10 text-white"
              }`}>
                Choisir ce plan
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── 3. Features section ───────────────────────────────────────────── */}
      <Box className="bg-white py-20 px-4">
        <Box className="max-w-5xl mx-auto">
          <Box className="text-center mb-14">
            <Heading level={2} className="text-3xl font-bold text-slate-900 mb-3">
              Toutes les fonctionnalités dont tu as besoin,<br className="hidden md:block" /> en une seule plateforme
            </Heading>
            <Text className="text-slate-500 max-w-xl mx-auto">
              Développer l'aide à gérer, développer et fidéliser la clientèle, en toute simplicité.
            </Text>
          </Box>

          <Box className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            {FEATURE_CATEGORIES.map(({ icon: Icon, title, items }) => (
              <Box key={title} className="bg-[#f8faf6] rounded-2xl p-5">
                <Box className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center mb-3 shadow-sm">
                  <Icon size={20} className="text-primary" strokeWidth={1.5} />
                </Box>
                <Text className="text-sm font-bold text-slate-900 mb-3 leading-snug">{title}</Text>
                <Box className="space-y-1.5">
                  {items.map((item) => (
                    <Flex key={item} align="center" gap={1.5}>
                      <Check size={12} className="text-primary flex-shrink-0" />
                      <Text className="text-xs text-slate-600">{item}</Text>
                    </Flex>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          {/* Carousel arrows */}
          <Flex justify="center" gap={2}>
            <button
              onClick={() => setFeaturePage((p) => Math.max(0, p - 1))}
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronLeft size={16} className="text-slate-500" />
            </button>
            <button
              onClick={() => setFeaturePage((p) => Math.min(totalFeaturePages - 1, p + 1))}
              className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
            >
              <ChevronRight size={16} className="text-slate-500" />
            </button>
          </Flex>
        </Box>
      </Box>

      {/* ── 4. CTA section (green + image bg) ────────────────────────────── */}
      <Box className="relative bg-primary py-24 px-4 text-center overflow-hidden">
        <Box className="absolute inset-0 z-0">
          <Image
            src="/111c2f206_adam-winger-VjRpkGtS55w-unsplash.jpg"
            alt="GlowPlan"
            fill
            className="object-cover opacity-20 grayscale"
          />
          <Box className="absolute inset-0 bg-primary/80" />
        </Box>
        <Box className="relative z-10 max-w-xl mx-auto">
          <Box className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Heart size={24} className="text-white" strokeWidth={1.5} />
          </Box>
          <Heading level={2} className="text-3xl font-bold text-white mb-3">
            Pour le moment, l'accès est entièrement gratuit
          </Heading>
          <Text className="text-white/70 mb-8">
            Toute l'équipe Glowplan vous remercie chaleureusement de tester notre outil
          </Text>
          <Link href="/auth/pro/login">
            <Button variant="white" size="lg" className="font-bold px-8 rounded-2xl">
              Je teste GlowPlan
            </Button>
          </Link>
        </Box>
      </Box>

      {/* ── 5. Navigation links ───────────────────────────────────────────── */}
      <Box className="bg-[#f0f2ec]">
        <Box className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-px">
          <Link href="/" className="block bg-primary p-10 group">
            <Flex align="center" justify="between">
              <Text className="text-white text-xl font-bold">Accueil</Text>
              <ArrowRight size={20} className="text-white/60 group-hover:translate-x-1 transition-transform" />
            </Flex>
          </Link>
          <Link href="/contact" className="block bg-[#c0a062]/20 p-10 group">
            <Flex align="center" justify="between">
              <Text className="text-slate-700 text-xl font-bold">Nous contacter</Text>
              <ArrowRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Flex>
          </Link>
        </Box>
        <Box className="max-w-5xl mx-auto">
          <Link href="/about" className="block bg-white p-10 border-t border-slate-100 group">
            <Flex align="center" justify="between">
              <Text className="text-slate-700 text-xl font-bold">Qui sommes-nous</Text>
              <ArrowRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </Flex>
          </Link>
        </Box>
      </Box>

      <Footer />
    </Box>
  );
}
