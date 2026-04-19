"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";
import { Container } from "@/components/ui";
import Link from "next/link";

const highlights = ["Gratuit 30 jours", "Sans CB requise", "Configuration en 5 min"];

export default function CTASection() {
  return (
    <section className="bg-white py-28 overflow-hidden">
      <Container>
        <motion.div
          className="relative rounded-[2.5rem] overflow-hidden"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-[#1a2414]" />

          {/* Background image with overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=2070&auto=format&fit=crop')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a2414]/90 via-[#1a2414]/70 to-[#32422c]/80" />

          {/* Ambient glows */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#c0a062]/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[#32422c]/50 rounded-full blur-[80px] pointer-events-none -mr-20 -mb-20" />


          {/* Content */}
          <div className="relative z-10 px-8 py-16 md:px-20 md:py-24 text-center">

            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.08] backdrop-blur-md border border-white/[0.12] text-white mb-10"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Sparkles size={14} className="text-[#c0a062]" />
              <span className="text-[11px] font-black tracking-[0.18em] uppercase text-white/60">
                Prêt à décoller ?
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h2
              className="text-[clamp(2.2rem,5vw,4rem)] font-black tracking-[-0.03em] text-white leading-[1.08] max-w-3xl mx-auto mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            >
              Faites briller votre{" "}
              <em
                className="not-italic font-serif font-medium"
                style={{
                  background: "linear-gradient(135deg, #c0a062 0%, #e8c87a 60%, #c0a062 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                expertise
              </em>{" "}
              avec GlowPlan
            </motion.h2>

            <motion.p
              className="text-white/50 text-lg font-medium max-w-xl mx-auto mb-12"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            >
              Rejoignez la communauté des professionnels qui ont choisi
              l'excellence pour gérer leur activité beauté.
            </motion.p>

            {/* Highlights row */}
            <motion.div
              className="flex flex-wrap items-center justify-center gap-4 mb-12"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.28 }}
            >
              {highlights.map((h) => (
                <div key={h} className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-[#c0a062]" />
                  <span className="text-[13px] font-bold text-white/60">{h}</span>
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link href="/auth/pro/login">
                <button className="cursor-pointer group inline-flex items-center gap-2 bg-[#c0a062] hover:bg-[#a88a50] text-white font-bold text-[15px] px-8 py-4 rounded-2xl shadow-[0_4px_24px_rgba(192,160,98,0.35)] hover:shadow-[0_6px_30px_rgba(192,160,98,0.45)] transition-all duration-200 min-w-[220px] justify-center">
                  Essayer gratuitement
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </button>
              </Link>
              <Link href="/contact">
                <button className="cursor-pointer inline-flex items-center gap-2 border border-white/20 text-white hover:bg-white hover:text-[#1a2414] font-bold text-[15px] px-8 py-4 rounded-2xl transition-all duration-200 min-w-[220px] justify-center backdrop-blur-sm">
                  Prendre rendez-vous
                </button>
              </Link>
            </motion.div>

          </div>
        </motion.div>
      </Container>
    </section>
  );
}
