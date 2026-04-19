"use client";

import { motion } from "framer-motion";
import { Calendar, Eye, Heart, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/ui";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const valueCards = [
  {
    icon: Calendar,
    label: "Mission",
    title: "Notre Mission",
    accent: "from-[#c0a062]/20 to-[#c0a062]/5",
    points: [
      "Relier pros de la beauté et clients",
      "Simplifier la prise de rendez-vous",
      "Valoriser l'expertise des professionnels",
    ],
  },
  {
    icon: Eye,
    label: "Vision",
    title: "Notre Vision",
    accent: "from-white/10 to-white/5",
    points: [
      "La référence de la réservation beauté",
      "Mettre en avant le savoir-faire",
      "Créer une communauté engagée",
    ],
  },
  {
    icon: Heart,
    label: "Valeurs",
    title: "Nos Valeurs",
    accent: "from-[#c0a062]/15 to-transparent",
    points: [
      "Simplicité : On vous facilite la vie",
      "Engagement : On vous accompagne",
      "Excellence : Une expérience au top",
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export default function AboutValues() {
  return (
    <section className="bg-[#1e2b18] py-28 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-[#c0a062]/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-black/20 rounded-full blur-[80px] pointer-events-none -ml-40 -mb-40" />

      <Container className="relative z-10">

        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c0a062] mb-4">
            Ce qui nous anime
          </p>
          <h2 className="text-white text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.03em] leading-tight">
            Mission, Vision &{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #c0a062, #e8c87a)" }}
            >
              Valeurs
            </span>
          </h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {valueCards.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.title}
                variants={cardVariants}
                className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-sm p-8 hover:bg-white/[0.07] hover:border-white/[0.14] transition-all duration-500 overflow-hidden"
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
              >
                {/* Top gradient accent */}
                <div className={`absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r ${card.accent}`} />

                {/* Corner glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#c0a062]/8 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                {/* Label pill */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06] border border-white/[0.08] mb-6">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[#c0a062]">
                    {card.label}
                  </span>
                </div>

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center mb-5 group-hover:bg-[#c0a062]/15 group-hover:border-[#c0a062]/30 transition-all duration-500">
                  <Icon size={22} className="text-white/60 group-hover:text-[#c0a062] transition-colors duration-300" />
                </div>

                {/* Title */}
                <h3 className="text-white font-bold text-[16px] mb-5 tracking-tight">
                  {card.title}
                </h3>

                {/* Points */}
                <ul className="space-y-3">
                  {card.points.map((point) => (
                    <li key={point} className="flex items-start gap-3">
                      <CheckCircle2 size={15} className="text-[#c0a062]/60 shrink-0 mt-0.5" />
                      <span className="text-[13px] font-medium text-white/55 leading-relaxed">
                        {point}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Bottom accent line */}
                <div className="absolute bottom-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#c0a062]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </motion.div>

      </Container>
    </section>
  );
}
