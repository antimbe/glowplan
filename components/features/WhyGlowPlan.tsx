"use client";

import { motion } from "framer-motion";
import { Calendar, Shield, TrendingUp, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { Container } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

const features = [
  {
    icon: Calendar,
    title: "Gestion simplifiée",
    description: "Un calendrier intuitif pour organiser vos journées sans stress.",
  },
  {
    icon: Clock,
    title: "Gain de temps",
    description: "Automatisez vos rappels et réduisez les absences non honorées.",
  },
  {
    icon: TrendingUp,
    title: "Croissance boostée",
    description: "Suivez vos revenus et identifiez vos leviers de croissance.",
  },
  {
    icon: Shield,
    title: "Réservation 24h/24",
    description: "Vos clients réservent quand ils veulent, même en dehors de vos heures d'ouverture.",
  },
];

const perks = [
  "Zéro frais d'installation",
  "Support client expert 7j/7",
  "Interface mobile-first intuitive",
];

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
};

export default function WhyGlowPlan() {
  return (
    <section className="bg-[#1e2b18] relative overflow-hidden py-28">

      {/* Background ambient glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#c0a062]/6 rounded-full -mr-80 -mt-80 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/30 rounded-full -ml-60 -mb-60 blur-[100px] pointer-events-none" />

      <Container className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* ── Left: text column ───────────────────────────── */}
          <motion.div
            className="text-white"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 mb-8">
              <Sparkles size={14} className="text-[#c0a062]" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/50">
                Expertise Beauté
              </span>
            </div>

            {/* Headline */}
            <h2 className="text-white text-[clamp(2.2rem,4.5vw,3.5rem)] font-black tracking-[-0.03em] leading-[1.08] mb-6">
              L'allié indispensable de{" "}
              <em
                className="not-italic font-serif font-medium"
                style={{
                  background: "linear-gradient(135deg, #c0a062, #e8c87a)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                votre réussite.
              </em>
            </h2>

            <p className="text-white/50 text-lg font-medium leading-relaxed max-w-md mb-12">
              GlowPlan a été conçu spécifiquement pour les professionnels de la beauté.
              Simple, élégant et redoutablement efficace.
            </p>

            {/* Perks list */}
            <ul className="space-y-4">
              {perks.map((perk) => (
                <li key={perk} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#c0a062]/15 border border-[#c0a062]/30 flex items-center justify-center shrink-0">
                    <CheckCircle2 size={14} className="text-[#c0a062]" />
                  </div>
                  <span className="text-white/80 font-semibold text-[15px]">{perk}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* ── Right: feature cards ────────────────────────── */}
          <motion.div
            className="grid sm:grid-cols-2 gap-4"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const isOffset = index % 2 === 1;
              return (
                <motion.div
                  key={feature.title}
                  variants={itemVariants}
                  className={cn(
                    "group relative p-6 rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm",
                    "hover:bg-white/[0.08] hover:border-white/[0.14] transition-colors duration-500",
                    "shadow-[0_0_0_1px_rgba(255,255,255,0.03)]",
                    isOffset ? "lg:translate-y-10" : ""
                  )}
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-[#c0a062]/15 group-hover:border-[#c0a062]/30 transition-all duration-500">
                    <Icon size={22} className="text-white/70 group-hover:text-[#c0a062] transition-colors duration-300" />
                  </div>

                  {/* Text */}
                  <h3 className="text-white font-bold text-[15px] mb-2 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-white/40 text-[13px] font-semibold leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Bottom accent line */}
                  <div className="absolute bottom-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#c0a062]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
