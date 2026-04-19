"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";
import Image from "next/image";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

export interface LegalSection {
  id: string;
  title: string;
  content: string;
}

interface LegalLayoutProps {
  badge: string;
  title: string;
  subtitle: string;
  sections: LegalSection[];
  updatedAt?: string;
}

export default function LegalLayout({ badge, title, subtitle, sections, updatedAt }: LegalLayoutProps) {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? "");
  const observerRef = useRef<IntersectionObserver | null>(null);

  /* ── Active section tracking via IntersectionObserver ── */
  useEffect(() => {
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [sections]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="bg-[#f7f5f2] min-h-screen">
      <Header />

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-[#0d1208]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/111c2f206_adam-winger-VjRpkGtS55w-unsplash.jpg"
            alt={title}
            fill
            className="object-cover object-center"
            priority
          />
        </div>
        <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#0d1208]/93 via-[#1a2414]/78 to-[#32422c]/45" />
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0d1208]/75 via-transparent to-transparent" />

        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#c0a062]/7 blur-[120px] pointer-events-none z-[2]"
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-36 pb-16">
          <motion.div
            className="max-w-2xl"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6 } } }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 mb-7">
                <span className="text-[11px] font-black tracking-[0.2em] uppercase text-white/55">{badge}</span>
              </div>
            </motion.div>

            <motion.h1
              className="text-[clamp(2.4rem,5vw,4rem)] font-black leading-[1.06] tracking-[-0.03em] text-white mb-5"
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease } } }}
            >
              {title}
            </motion.h1>

            <motion.p
              className="text-white/45 text-[15px] font-medium leading-relaxed max-w-md"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.1, ease } } }}
            >
              {subtitle}
            </motion.p>

            {updatedAt && (
              <motion.p
                className="mt-5 text-[11px] font-bold text-white/20 uppercase tracking-[0.18em]"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.6, delay: 0.2 } } }}
              >
                Mise à jour : {updatedAt}
              </motion.p>
            )}
          </motion.div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#f7f5f2] to-transparent z-10 pointer-events-none" />
      </section>

      {/* ── Body ─────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-28">
        <div className="flex gap-12 items-start">

          {/* ── Sticky TOC (desktop) ─────────────────────── */}
          <aside className="hidden lg:block w-64 shrink-0 sticky top-28">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] p-5 overflow-hidden">
              <div className="absolute top-0 left-5 right-5 h-[1px] bg-gradient-to-r from-transparent via-[#c0a062]/30 to-transparent" />
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-gray-300 mb-4">Sommaire</p>
              <nav className="space-y-1">
                {sections.map(({ id, title }) => (
                  <button
                    key={id}
                    onClick={() => scrollTo(id)}
                    className={`cursor-pointer w-full text-left px-3 py-2 rounded-xl text-[12px] font-semibold transition-all duration-200 leading-snug ${
                      activeId === id
                        ? "bg-[#32422c] text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                    }`}
                  >
                    {title}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Content ──────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Mobile TOC pill strip */}
            <div className="lg:hidden flex flex-wrap gap-2 mb-6">
              {sections.map(({ id, title }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className="cursor-pointer px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-600 hover:border-[#32422c]/30 hover:text-[#32422c] bg-white transition-all"
                >
                  {title}
                </button>
              ))}
            </div>

            {sections.map((section, i) => (
              <motion.div
                key={section.id}
                id={section.id}
                className="group relative bg-white rounded-2xl border border-gray-100 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_32px_-8px_rgba(50,66,44,0.1)] hover:border-[#32422c]/10 transition-all duration-500 p-7 lg:p-9 scroll-mt-28 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.6, delay: Math.min(i * 0.04, 0.3), ease }}
              >
                {/* Hover top accent */}
                <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-2xl bg-gradient-to-r from-transparent via-[#c0a062]/0 to-transparent group-hover:via-[#c0a062]/40 transition-all duration-500" />

                <div className="flex items-start gap-5">
                  {/* Index badge */}
                  <div className="shrink-0 w-8 h-8 rounded-lg bg-[#32422c]/6 border border-[#32422c]/8 flex items-center justify-center mt-0.5">
                    <span className="text-[11px] font-black text-[#32422c]/50">{String(i + 1).padStart(2, "0")}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h2 className="text-[17px] font-black text-gray-900 tracking-[-0.01em] mb-3 leading-tight">
                      {section.title}
                    </h2>
                    <p className="text-[14px] text-gray-500 leading-[1.85] font-medium whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Bottom note */}
            <div className="text-center pt-8">
              <p className="text-[12px] font-bold text-gray-300 uppercase tracking-[0.18em]">
                © {new Date().getFullYear()} GlowPlan — Tous droits réservés
              </p>
            </div>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
