"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";
import CTASection from "@/components/features/CTASection";
import { Button } from "@/components/ui";
import {
  Heart, Calendar, Users, BarChart2, Sparkles,
  Check, ArrowRight, Lock, Zap, Star,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

/* ─── types ─────────────────────────────────────────────────────────────── */
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ─── data ───────────────────────────────────────────────────────────────── */
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
    title: "Gestion des clients",
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
    title: "Analyses & performances",
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
    title: "Visibilité en ligne",
    items: [
      "Profil personnalisé",
      "Avis clients certifiés",
      "Référencement local",
      "Galerie photos/vidéos",
      "Badges de qualité",
    ],
  },
];

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

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
};
const itemVariants = {
  hidden:  { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

/* ─── page ───────────────────────────────────────────────────────────────── */
export default function ProsPage() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <main className="bg-white">
      <Header />

      {/* ════════════════════════════════════════════════════════════
          1. HERO
      ════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#0d1208]">

        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/111c2f206_adam-winger-VjRpkGtS55w-unsplash.jpg"
            alt="GlowPlan pour les pros"
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#0d1208]/92 via-[#1a2414]/75 to-[#32422c]/45" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0d1208]/80 via-transparent to-transparent" />

        {/* Glow */}
        <motion.div
          className="absolute top-1/3 right-1/4 w-[500px] h-[500px] rounded-full bg-[#c0a062]/8 blur-[120px] pointer-events-none z-[2]"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
          <motion.div
            className="flex flex-col items-center text-center max-w-4xl mx-auto"
            initial="hidden" animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            {/* Free badge */}
            <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#c0a062]/15 backdrop-blur-md border border-[#c0a062]/30 mb-8">
                <Heart size={13} className="text-[#c0a062]" fill="currentColor" />
                <span className="text-[11px] font-black tracking-[0.18em] uppercase text-[#c0a062]">
                  Accès 100 % gratuit en ce moment
                </span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.05] tracking-[-0.03em] text-white mb-6"
              variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
            >
              La plateforme pensée{" "}
              <br className="hidden md:block" />
              pour les{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #c0a062 0%, #e8c87a 50%, #c0a062 100%)" }}
              >
                professionnels.
              </span>
            </motion.h1>

            {/* Sub */}
            <motion.p
              className="text-[clamp(1rem,2vw,1.2rem)] text-white/50 max-w-xl mx-auto font-medium leading-relaxed mb-12"
              variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1, ease } } }}
            >
              Agenda, clients, statistiques, marketing — tout ce dont vous avez besoin
              pour faire briller votre activité, en une seule app.
            </motion.p>

            {/* CTA row */}
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-4"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.2, ease } } }}
            >
              <Link href="/auth/pro/login">
                <Button
                  size="lg"
                  className="bg-gradient-to-br from-[#d4b070] via-[#c0a062] to-[#a8854e] hover:from-[#e0bc78] hover:via-[#cca96e] hover:to-[#b8945a] text-white font-bold rounded-full px-10 shadow-[0_4px_24px_rgba(192,160,98,0.4)] hover:shadow-[0_6px_32px_rgba(192,160,98,0.55)] transition-all duration-300"
                >
                  Commencer gratuitement
                  <ArrowRight size={18} className="ml-1 transition-transform group-hover/shine:translate-x-1" />
                </Button>
              </Link>
              <button
                onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}
                className="text-[14px] font-bold text-white/40 hover:text-white/70 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                Voir les fonctionnalités
                <ArrowRight size={14} />
              </button>
            </motion.div>

            {/* Social proof */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-3 mt-10"
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, delay: 0.3 } } }}
            >
              {[
                { icon: Zap,   text: "Sans engagement" },
                { icon: Heart, text: "Inscription en 2 minutes" },
                { icon: Star,  text: "Accès immédiat & gratuit" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/[0.07]">
                  <Icon size={13} className="text-[#c0a062]" />
                  <span className="text-[12px] font-bold text-white/50">{text}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#1e2b18] to-transparent z-10 pointer-events-none" />
      </section>

      {/* ════════════════════════════════════════════════════════════
          2. PRICING (blurred — coming soon)
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-[#1e2b18] py-28 relative overflow-hidden">

        {/* Ambient glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#c0a062]/6 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-[80px] pointer-events-none -mr-40 -mb-40" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c0a062] mb-4">Tarifs</p>
            <h2 className="text-white text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.03em] leading-tight mb-4">
              Des formules adaptées à{" "}
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #c0a062, #e8c87a)" }}
              >
                chaque profil.
              </span>
            </h2>
            <p className="text-white/45 max-w-xl mx-auto text-[15px] font-medium leading-relaxed mb-2">
              Du micro-entrepreneur à l'entreprise multi-établissements, trouvez la formule qui vous correspond.
            </p>
          </motion.div>

          {/* Toggle */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className={`text-[13px] font-bold transition-colors ${!isYearly ? "text-white" : "text-white/35"}`}>Mensuel</span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-12 h-6 rounded-full transition-colors duration-300 cursor-pointer focus:outline-none"
              style={{ backgroundColor: isYearly ? "#c0a062" : "rgba(255,255,255,0.15)" }}
            >
              <span
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300"
                style={{ left: isYearly ? "28px" : "4px" }}
              />
            </button>
            <span className={`text-[13px] font-bold transition-colors ${isYearly ? "text-white" : "text-white/35"}`}>
              Annuel
            </span>
          </motion.div>

          {/* Pricing cards (intentionally blurred — coming soon) */}
          <div className="relative">
            {/* Coming soon overlay */}
            <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl">
              <div className="bg-white/[0.07] backdrop-blur-xl border border-white/15 rounded-2xl px-8 py-6 text-center shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-[#c0a062]/15 border border-[#c0a062]/30 flex items-center justify-center mx-auto mb-4">
                  <Lock size={20} className="text-[#c0a062]" />
                </div>
                <p className="text-[#4a7c59] font-black text-[17px] mb-1">Bientôt disponible</p>
                <p className="text-[#4a7c59]/80 text-[13px] font-medium">Les offres payantes arrivent prochainement.</p>
                <div className="mt-4 px-4 py-2 rounded-full bg-[#c0a062]/15 border border-[#c0a062]/30 inline-block">
                  <span className="text-[#c0a062] text-[11px] font-black tracking-[0.15em] uppercase">Gratuit en ce moment</span>
                </div>
              </div>
            </div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-6 select-none pointer-events-none blur-sm"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.1 }}
            >
              {PLANS.map((plan) => (
                <motion.div
                  key={plan.name}
                  variants={itemVariants}
                  className={`relative rounded-2xl p-8 ${
                    plan.highlight
                      ? "bg-white shadow-2xl scale-[1.02]"
                      : "bg-white/[0.05] border border-white/10"
                  }`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#c0a062] text-white text-[10px] font-black px-4 py-1 rounded-full tracking-widest uppercase">
                      Populaire
                    </div>
                  )}
                  <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-3 ${plan.highlight ? "text-[#32422c]/40" : "text-white/30"}`}>
                    {plan.name}
                  </p>
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-5xl font-black ${plan.highlight ? "text-gray-900" : "text-white"}`}>
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}€
                    </span>
                    <span className={`text-sm mb-2 ${plan.highlight ? "text-gray-400" : "text-white/40"}`}>/mois</span>
                  </div>
                  <p className={`text-[13px] font-medium mb-6 ${plan.highlight ? "text-gray-500" : "text-white/50"}`}>
                    {plan.description}
                  </p>
                  <div className={`w-full h-px mb-6 ${plan.highlight ? "bg-gray-100" : "bg-white/10"}`} />
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5">
                        <Check size={14} className={plan.highlight ? "text-[#32422c]" : "text-white/50"} />
                        <span className={`text-[13px] font-medium ${plan.highlight ? "text-gray-700" : "text-white/60"}`}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <div className={`w-full py-3 rounded-xl text-center text-[13px] font-bold ${
                    plan.highlight ? "bg-[#32422c] text-white" : "bg-white/8 text-white/60"
                  }`}>
                    Choisir ce plan
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          3. FREE BANNER
      ════════════════════════════════════════════════════════════ */}
      <section className="bg-white py-16">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            className="relative rounded-3xl overflow-hidden border border-[#32422c]/10 bg-gradient-to-br from-[#f7f5f1] to-white shadow-[0_8px_32px_-8px_rgba(50,66,44,0.1)] p-10 text-center"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.7, ease }}
          >
            {/* Top accent */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c0a062]/50 to-transparent" />

            <div className="w-14 h-14 rounded-2xl bg-[#32422c]/6 border border-[#32422c]/10 flex items-center justify-center mx-auto mb-5">
              <Heart size={24} className="text-[#32422c]" strokeWidth={1.5} />
            </div>
            <h2 className="text-[22px] font-black text-gray-900 tracking-tight mb-2">
              Pour le moment, l'accès est entièrement gratuit.
            </h2>
            <p className="text-gray-400 text-[14px] font-medium mb-6 max-w-sm mx-auto">
              Toute l'équipe GlowPlan vous remercie chaleureusement de tester notre outil.
            </p>
            <Heart size={20} className="text-[#c0a062] mx-auto" fill="currentColor" />
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          4. FEATURES
      ════════════════════════════════════════════════════════════ */}
      <section id="features" className="bg-[#f7f5f2] py-28">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease }}
          >
            <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c0a062] mb-4">Fonctionnalités</p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.03em] text-gray-900 leading-tight mb-4">
              Tout ce qu'il vous faut,{" "}
              <span className="text-[#32422c] italic font-serif font-medium">en une seule plateforme.</span>
            </h2>
            <p className="text-gray-400 max-w-lg mx-auto text-[15px] font-medium">
              Gérez, développez et fidélisez votre clientèle, en toute simplicité.
            </p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
          >
            {FEATURE_CATEGORIES.map(({ icon: Icon, title, items }) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_-8px_rgba(50,66,44,0.14)] hover:border-[#32422c]/10 transition-all duration-500"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {/* Hover top glow */}
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[#c0a062]/0 to-transparent group-hover:via-[#c0a062]/50 transition-all duration-500" />

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-[#32422c]/6 border border-[#32422c]/8 flex items-center justify-center mb-5 group-hover:bg-[#32422c] group-hover:border-[#32422c] transition-all duration-500">
                  <Icon size={20} className="text-[#32422c] group-hover:text-white transition-colors duration-300" strokeWidth={1.5} />
                </div>

                {/* Title */}
                <p className="text-[14px] font-bold text-gray-900 mb-4 leading-snug">
                  {title}
                </p>

                {/* Items */}
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-center gap-2">
                      <Check size={12} className="text-[#c0a062] shrink-0" />
                      <span className="text-[12px] font-medium text-gray-500">{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════
          5. CTA + QUICK LINKS + FOOTER
      ════════════════════════════════════════════════════════════ */}
      <CTASection />
      <Footer />
    </main>
  );
}
