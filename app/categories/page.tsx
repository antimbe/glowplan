"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  Leaf,
  Scissors,
  Paintbrush,
  Palette,
  Stethoscope,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";

/* ─────────────────────────────────────────────
   Données
───────────────────────────────────────────── */
const sectors = [
  {
    id: "coiffure",
    label: "Coupes & coiffures",
    short: "Coiffure",
    image: "/coupes.jpg",
    group: "cheveux",
  },
  {
    id: "ongles",
    label: "Ongles",
    short: "Ongles",
    image: "/ongles.jpg",
    group: "mains",
  },
  {
    id: "sourcils",
    label: "Sourcils & cils",
    short: "Sourcils & cils",
    image: "/sourcils.jpg",
    group: "visage",
  },
  {
    id: "massage",
    label: "Massage",
    short: "Massage",
    image: "/massages.jpg",
    group: "corps",
  },
  {
    id: "barbier",
    label: "Barbier",
    short: "Barbier",
    image: "/barber.jpg",
    group: "cheveux",
  },
  {
    id: "epilation",
    label: "Épilation",
    short: "Épilation",
    image: "/epilation.jpg",
    group: "corps",
  },
  {
    id: "soins",
    label: "Soins du corps",
    short: "Soins",
    image: null,
    Icon: Leaf,
    group: "corps",
  },
  {
    id: "protheses",
    label: "Prothèses capillaires",
    short: "Prothèses",
    image: null,
    Icon: Scissors,
    group: "cheveux",
  },
  {
    id: "tatouage",
    label: "Tatouage & piercing",
    short: "Tatouage",
    image: null,
    Icon: Paintbrush,
    group: "art",
  },
  {
    id: "maquillage",
    label: "Maquillage",
    short: "Maquillage",
    image: null,
    Icon: Palette,
    group: "visage",
  },
  {
    id: "medical",
    label: "Médical & dentaire",
    short: "Médical",
    image: null,
    Icon: Stethoscope,
    group: "corps",
  },
];

const filters = [
  { id: "all", label: "Toutes" },
  { id: "visage", label: "Visage" },
  { id: "cheveux", label: "Cheveux" },
  { id: "corps", label: "Corps" },
  { id: "mains", label: "Mains & ongles" },
  { id: "art", label: "Art corporel" },
];

/* ─────────────────────────────────────────────
   Animations
───────────────────────────────────────────── */
const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease },
  },
};

/* ─────────────────────────────────────────────
   Page
───────────────────────────────────────────── */
export default function CategoriesPage() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filtered =
    activeFilter === "all"
      ? sectors
      : sectors.filter((s) => s.group === activeFilter);

  return (
    <>
      <Header />

      <main className="min-h-screen bg-[#f7f5f1]">
        {/* ── Hero ───────────────────────────────── */}
        <section className="relative bg-[#1e2b18] overflow-hidden pt-20">
          {/* Ambient glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c0a062]/8 rounded-full -mr-60 -mt-60 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#32422c]/50 rounded-full -ml-40 blur-[100px] pointer-events-none" />

          <div className="relative max-w-6xl mx-auto px-4 py-16 md:py-20">
            {/* Back */}
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease }}
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors mb-10 group"
              >
                <ArrowLeft
                  size={15}
                  className="transition-transform group-hover:-translate-x-0.5"
                />
                Retour à l&apos;accueil
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease, delay: 0.05 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.07] backdrop-blur-md border border-white/10 mb-6">
                <Sparkles size={13} className="text-[#c0a062]" />
                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-white/50">
                  {sectors.length} catégories disponibles
                </span>
              </div>

              <h1 className="text-white text-[clamp(2.2rem,5vw,3.8rem)] font-black tracking-[-0.03em] leading-[1.06] mb-5">
                Choisissez votre{" "}
                <em
                  className="not-italic font-serif font-medium"
                  style={{
                    background: "linear-gradient(135deg, #c0a062, #e8c87a)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  univers beauté.
                </em>
              </h1>

              <p className="text-white/50 text-lg font-medium leading-relaxed max-w-lg">
                Des experts sélectionnés près de chez vous, disponibles à la
                réservation en ligne 24h/24.
              </p>
            </motion.div>
          </div>

          {/* Wave bottom */}
          <div
            className="h-10 bg-[#f7f5f1]"
            style={{
              clipPath: "ellipse(55% 100% at 50% 100%)",
              marginTop: "-1px",
            }}
          />
        </section>

        {/* ── Filter tabs ───────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 pt-10 pb-2">
          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease, delay: 0.25 }}
          >
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={[
                  "px-4 py-2 rounded-full text-sm font-bold transition-all duration-200 cursor-pointer",
                  activeFilter === f.id
                    ? "bg-[#32422c] text-white shadow-md shadow-[#32422c]/20"
                    : "bg-white text-gray-500 hover:text-[#32422c] hover:bg-[#32422c]/5 border border-gray-200",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* ── Grid ───────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 py-10">
          <motion.div
            key={activeFilter}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filtered.map((sector) => {
              const Icon = "Icon" in sector ? sector.Icon : null;
              return (
                <motion.div key={sector.id} variants={itemVariants}>
                  <Link
                    href={`/search?sector=${sector.id}`}
                    className="group block relative rounded-2xl overflow-hidden aspect-[3/4] shadow-sm hover:shadow-xl transition-shadow duration-500 cursor-pointer"
                  >
                    {/* Background */}
                    {sector.image ? (
                      <Image
                        src={sector.image}
                        alt={sector.label}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#32422c] to-[#1e2b18] flex items-center justify-center">
                        {/* Subtle texture */}
                        <div className="absolute inset-0 opacity-10"
                          style={{
                            backgroundImage:
                              "radial-gradient(circle at 20% 50%, #c0a062 0%, transparent 60%), radial-gradient(circle at 80% 20%, #c0a062 0%, transparent 50%)",
                          }}
                        />
                        {Icon && (
                          <Icon
                            size={52}
                            strokeWidth={1.2}
                            className="text-[#c0a062]/70 relative z-10"
                          />
                        )}
                      </div>
                    )}

                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/0 group-hover:from-black/70 transition-all duration-500" />

                    {/* Gold ring on hover */}
                    <div className="absolute inset-0 rounded-2xl ring-2 ring-transparent group-hover:ring-[#c0a062]/50 transition-all duration-400" />

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4">
                      <p className="text-white font-black text-[15px] md:text-base leading-tight mb-1 group-hover:text-[#e8c87a] transition-colors duration-300">
                        {sector.short}
                      </p>
                      <span className="inline-flex items-center gap-1 text-white/50 text-[11px] font-semibold group-hover:text-white/80 transition-colors duration-300">
                        Explorer
                        <ChevronRight
                          size={11}
                          className="transition-transform group-hover:translate-x-0.5"
                        />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <p className="text-gray-400 font-semibold text-lg">
                Aucune catégorie dans ce groupe
              </p>
              <button
                onClick={() => setActiveFilter("all")}
                className="mt-4 text-sm font-bold text-[#32422c] hover:underline"
              >
                Voir toutes les catégories
              </button>
            </div>
          )}
        </div>

        {/* ── CTA pros ──────────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 pb-16">
          <motion.div
            className="relative rounded-3xl bg-[#1e2b18] overflow-hidden p-10 md:p-14 flex flex-col md:flex-row items-center gap-8"
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.65, ease }}
          >
            {/* Glow */}
            <div className="absolute right-0 top-0 w-96 h-96 bg-[#c0a062]/10 rounded-full -mr-32 -mt-32 blur-[100px] pointer-events-none" />

            <div className="relative z-10 flex-1">
              <p className="text-[10px] font-black tracking-[0.2em] uppercase text-[#c0a062] mb-3">
                Vous êtes professionnel ?
              </p>
              <h2 className="text-white text-2xl md:text-3xl font-black tracking-[-0.02em] leading-tight mb-3">
                Rejoignez les pros de la beauté
                <br />
                sur GlowPlan.
              </h2>
              <p className="text-white/50 text-sm font-medium leading-relaxed max-w-sm">
                Gérez vos réservations, développez votre clientèle et faites
                croître votre activité — gratuitement.
              </p>
            </div>

            <div className="relative z-10 shrink-0">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2.5 bg-[#c0a062] hover:bg-[#d4b576] text-white font-black text-sm px-6 py-3.5 rounded-xl transition-all duration-200 shadow-lg shadow-[#c0a062]/20 hover:shadow-[#c0a062]/30 hover:scale-[1.02]"
              >
                Créer mon espace pro
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}
