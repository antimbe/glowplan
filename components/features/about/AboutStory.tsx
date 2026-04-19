"use client";

import { motion } from "framer-motion";
import { Container } from "@/components/ui";
import Image from "next/image";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const stats = [
  { value: "2 400+", label: "Professionnels" },
  { value: "150K+", label: "Réservations" },
  { value: "4.9★",  label: "Note moyenne" },
];

export default function AboutStory() {
  return (
    <section className="bg-white py-28 overflow-hidden">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* ── Image ───────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease }}
            className="relative"
          >
            {/* Main image */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(50,66,44,0.25)]">
              <Image
                src="/image1-quisommesnous.jpg"
                alt="L'essentiel des pros"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-[#32422c]/15 to-transparent" />
            </div>

            {/* Floating stat card */}
            <motion.div
              className="absolute -bottom-6 -right-6 bg-white rounded-2xl px-6 py-4 shadow-[0_20px_50px_-10px_rgba(0,0,0,0.12)] border border-gray-100"
              initial={{ opacity: 0, scale: 0.85 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease }}
            >
              <div className="flex items-center gap-4">
                {stats.map((s, i) => (
                  <div key={s.label} className={`text-center ${i > 0 ? "pl-4 border-l border-gray-100" : ""}`}>
                    <p className="text-[20px] font-black text-[#32422c] leading-none">{s.value}</p>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── Text ────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease }}
            className="space-y-8"
          >
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c0a062] mb-4">
                Notre plateforme
              </p>
              <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.03em] text-gray-900 leading-tight">
                L'essentiel des pros,{" "}
                <span className="text-[#32422c] italic font-serif font-medium">en une seule plateforme.</span>
              </h2>
            </div>

            <div className="space-y-5 text-gray-500 text-[15px] font-medium leading-relaxed">
              <p>
                GlowPlan a été conçu pour les professionnels du secteur de la beauté et du bien-être
                qui cherchent à simplifier leur quotidien — coiffeurs, esthéticiennes, maquilleurs, barbiers.
              </p>
              <p>
                Une solution tout-en-un : réservations, gestion des clients, statistiques et marketing,
                depuis une interface intuitive pensée pour vous.
              </p>
              <p className="text-[#32422c] font-semibold">
                Notre objectif ? Vous permettre de vous concentrer sur ce que vous faites de mieux : embellir vos clients.
              </p>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-[#c0a062]/30 to-transparent" />

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {["Réservations", "Gestion clients", "Statistiques", "Marketing", "Mobile-first"].map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1.5 rounded-full text-[12px] font-bold bg-[#32422c]/6 text-[#32422c] border border-[#32422c]/10"
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
