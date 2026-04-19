"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Users, Briefcase } from "lucide-react";
import { Container } from "@/components/ui";
import Image from "next/image";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const slides = [
  {
    id: "pros",
    tab: "Pour les pros",
    icon: Briefcase,
    headline: "Tout ce dont vous avez besoin,\nen une seule app.",
    points: [
      "Gestion agenda, clients & stocks",
      "Visibilité & audience qualifiée",
      "Automatisation & gain de temps",
      "Fidélisation client intégrée",
      "Statistiques & performances",
      "Interface simple, mobile & desktop",
    ],
  },
  {
    id: "clients",
    tab: "Pour les clients",
    icon: Users,
    headline: "Trouvez le bon pro,\nen deux clics.",
    points: [
      "Le bon pro selon tes envies et disponibilités",
      "Réserve 24/7 sans passer par Instagram",
      "Avis vérifiés pour choisir en confiance",
      "Prestations sur mesure selon tes besoins",
      "Suivi clair : historique & paiements",
    ],
  },
];

export default function AboutCarousel() {
  const [active, setActive] = useState(0);

  return (
    <section className="bg-[#f7f5f2] py-28 overflow-hidden">
      <Container>

        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease }}
        >
          <p className="text-[11px] font-black uppercase tracking-[0.22em] text-[#c0a062] mb-4">
            Une plateforme, deux expériences
          </p>
          <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.03em] text-gray-900 leading-tight">
            Fait pour vous,{" "}
            <span className="text-[#32422c] italic font-serif font-medium">quel que soit votre rôle.</span>
          </h2>
        </motion.div>

        {/* Tab switcher */}
        <motion.div
          className="flex justify-center mb-10"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1, ease }}
        >
          <div className="inline-flex p-1 rounded-full bg-white border border-gray-200 shadow-sm">
            {slides.map((slide, i) => {
              const Icon = slide.icon;
              return (
                <button
                  key={slide.id}
                  onClick={() => setActive(i)}
                  className={`cursor-pointer relative flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold transition-all duration-300 ${
                    active === i
                      ? "bg-[#32422c] text-white shadow-lg shadow-[#32422c]/20"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Icon size={14} />
                  {slide.tab}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

          {/* Image */}
          <motion.div
            className="lg:col-span-7"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="relative w-full h-[400px] lg:h-full min-h-[450px] rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(50,66,44,0.2)]">
              <Image
                src="/image2-quisommesnous.png"
                alt="GlowPlan App Experience"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2414]/30 to-transparent" />
            </div>
          </motion.div>

          {/* Text panel */}
          <div className="lg:col-span-5">
            <div className="relative h-full bg-[#1e2b18] rounded-3xl p-10 lg:p-12 overflow-hidden flex flex-col justify-center shadow-[0_20px_60px_-15px_rgba(30,43,24,0.4)]">

              {/* Ambient glow */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#c0a062]/8 rounded-full blur-3xl pointer-events-none" />

              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.45, ease }}
                  className="relative z-10"
                >
                  {/* Headline */}
                  <h3 className="text-white text-[clamp(1.4rem,3vw,2rem)] font-black leading-tight tracking-[-0.02em] mb-8 whitespace-pre-line">
                    {slides[active].headline}
                  </h3>

                  {/* Points */}
                  <ul className="space-y-4">
                    {slides[active].points.map((point, i) => (
                      <motion.li
                        key={point}
                        initial={{ opacity: 0, x: 12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: i * 0.06, ease }}
                        className="flex items-start gap-3"
                      >
                        <div className="w-5 h-5 rounded-full bg-[#c0a062]/15 border border-[#c0a062]/30 flex items-center justify-center shrink-0 mt-0.5">
                          <CheckCircle2 size={12} className="text-[#c0a062]" />
                        </div>
                        <span className="text-[14px] font-semibold text-white/70 leading-relaxed">
                          {point}
                        </span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>

              {/* Dot indicators */}
              <div className="flex items-center gap-2 mt-10 relative z-10">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    className={`cursor-pointer h-1.5 rounded-full transition-all duration-300 ${
                      active === i ? "w-6 bg-[#c0a062]" : "w-1.5 bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>

            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}
