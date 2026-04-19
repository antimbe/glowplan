"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowDown } from "lucide-react";
import { Container } from "@/components/ui";
import Image from "next/image";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export default function AboutHero() {
  return (
    <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-[#0d1208]">

      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/111c2f206_adam-winger-VjRpkGtS55w-unsplash.jpg"
          alt="GlowPlan — Notre histoire"
          fill
          className="object-cover object-center scale-105"
          priority
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#0d1208]/90 via-[#1a2414]/70 to-[#32422c]/40" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0d1208]/80 via-transparent to-transparent" />

      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/3 right-1/3 w-[500px] h-[500px] rounded-full bg-[#c0a062]/8 blur-[120px] pointer-events-none z-[2]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />

      <Container className="relative z-10 w-full pt-32 pb-20">
        <motion.div
          className="flex flex-col items-center text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
        >

          {/* Badge */}
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 mb-8">
              <Sparkles size={13} className="text-[#c0a062]" />
              <span className="text-[11px] font-black tracking-[0.2em] uppercase text-white/60">
                Notre Histoire
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.05] tracking-[-0.03em] text-white mb-6"
            variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
          >
            Redéfinir l'excellence{" "}
            <br className="hidden md:block" />
            dans l'univers de la{" "}
            <span
              className="text-transparent bg-clip-text"
              style={{ backgroundImage: "linear-gradient(135deg, #c0a062 0%, #e8c87a 50%, #c0a062 100%)" }}
            >
              beauté.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-[clamp(1rem,2vw,1.2rem)] text-white/50 max-w-lg mx-auto font-medium leading-relaxed"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1, ease } } }}
          >
            Une plateforme pensée par des passionnés, pour des professionnels
            qui veulent briller au quotidien.
          </motion.p>

          {/* Scroll hint */}
          <motion.div
            className="mt-16 flex flex-col items-center gap-2 text-white/20"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, delay: 0.5 } } }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Découvrir</span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown size={16} />
            </motion.div>
          </motion.div>

        </motion.div>
      </Container>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
    </section>
  );
}
