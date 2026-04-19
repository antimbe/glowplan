"use client";

import { motion } from "framer-motion";
import { Instagram, ArrowRight, Globe } from "lucide-react";
import { Container, Logo } from "@/components/ui";
import Link from "next/link";

const footerSections = [
  {
    title: "Accès rapide",
    links: [
      { label: "Accueil", href: "/" },
      { label: "Rechercher un pro", href: "/search" },
      { label: "Pour les pros", href: "/pros" },
      { label: "Nous contacter", href: "/contact" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Confidentialité", href: "/privacy" },
      { label: "Conditions d'utilisation", href: "/terms" },
      { label: "Mentions légales", href: "/legal" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-[#1e2f16] pt-24 pb-10 text-white/80 overflow-hidden relative">

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#32422c]/30 rounded-full -mr-64 -mt-64 blur-[120px] pointer-events-none opacity-60" />

      <Container className="relative z-10">

        {/* ── Top separator ──────────────────────────────────── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-16" />

        {/* ── Main grid ──────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-14 mb-20"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >

          {/* Brand column */}
          <div className="lg:col-span-4 space-y-8">
            <Logo variant="light" size="xl" />
            <p className="text-white/40 leading-relaxed max-w-sm text-[15px] font-medium">
              La plateforme tout-en-un qui sublime la gestion de votre activité
              beauté et bien-être avec élégance et simplicité.
            </p>
            <div className="flex gap-3">
              <Link
                href="https://www.instagram.com/glowplan.fr/"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all group"
              >
                <Instagram size={18} className="text-white/40 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>

          {/* Links columns */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-10">
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-6">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/20">
                  {section.title}
                </p>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[14px] font-semibold text-white/45 hover:text-white transition-colors relative group inline-block"
                      >
                        {link.label}
                        <span className="absolute -bottom-0.5 left-0 w-0 h-[1px] bg-[#c0a062]/60 transition-all duration-300 group-hover:w-full" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter column */}
          <div className="lg:col-span-3 space-y-6">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/20">
              Newsletter
            </p>
            <p className="text-[14px] text-white/40 font-medium leading-relaxed">
              Recevez des conseils exclusifs pour booster votre activité.
            </p>
            <div className="relative group">
              <input
                type="email"
                placeholder="votre@email.com"
                className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl py-3.5 pl-4 pr-12 text-[14px] font-semibold text-white placeholder:text-white/20 outline-none focus:border-[#c0a062]/30 focus:bg-white/[0.08] transition-all"
              />
              <button
                className="cursor-pointer absolute right-1.5 top-1.5 bottom-1.5 w-9 bg-[#c0a062]/20 hover:bg-[#c0a062] rounded-lg flex items-center justify-center transition-all group/btn"
                aria-label="S'abonner"
              >
                <ArrowRight size={16} className="text-white transition-transform group-hover/btn:translate-x-0.5" />
              </button>
            </div>
          </div>

        </motion.div>

        {/* ── Bottom bar ─────────────────────────────────────── */}
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[12px] font-bold text-white/15 tracking-tight order-2 md:order-1">
            © 2026 GlowPlan. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2 order-1 md:order-2 group cursor-pointer">
            <Globe size={13} className="text-white/20 group-hover:text-[#c0a062] transition-colors" />
            <span className="text-[11px] font-black uppercase tracking-[0.18em] text-white/25 group-hover:text-white/60 transition-colors">
              Français (FR)
            </span>
          </div>
        </div>

      </Container>
    </footer>
  );
}
