"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, MapPin, Sparkles, Star, Users, ArrowRight, TrendingUp } from "lucide-react";
import { Container, Button, Box } from "@/components/ui";
import { CityAutocompleteSearch } from "@/components/features/search/CityAutocompleteSearch";

/* ─── animation variants ─────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const;

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, delay, ease } },
});

const fadeIn = (delay = 0) => ({
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, delay, ease } },
});

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

/* ─── stat pills data ─────────────────────────────────────────── */
const stats = [
  { icon: Users, label: "Professionnels", value: "2 400+" },
  { icon: Star,  label: "Avis vérifiés",  value: "4.9 ★" },
  { icon: TrendingUp, label: "Réservations", value: "150K+" },
];

export default function Hero() {
  const [searchQuery,   setSearchQuery]   = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const router = useRouter();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery)   params.set("q",        searchQuery);
    if (locationQuery) params.set("location", locationQuery);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0d1208]">

      {/* ── Background image ───────────────────────────────── */}
      <Box
        className="absolute inset-0 z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      />

      {/* ── Gradient overlays ──────────────────────────────── */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#0d1208]/95 via-[#1a2414]/75 to-[#32422c]/40" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0d1208]/90 via-transparent to-transparent" />

      {/* ── Ambient glow blobs ─────────────────────────────── */}
      <motion.div
        className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-[#c0a062]/10 blur-[120px] pointer-events-none z-[2]"
        animate={{ scale: [1, 1.12, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-[#32422c]/30 blur-[100px] pointer-events-none z-[2]"
        animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* ── Main content ───────────────────────────────────── */}
      <Container className="relative z-10 w-full pt-32 pb-20">
        <motion.div
          className="flex flex-col items-center text-center max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >

          {/* Badge */}
          <motion.div variants={fadeIn(0)}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/10 text-white mb-8">
              <Sparkles size={14} className="text-[#c0a062]" />
              <span className="text-[11px] font-bold tracking-[0.18em] uppercase text-white/70">
                Beauté & Bien-être en France
              </span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp(0.05)}
            className="text-[clamp(2.8rem,7vw,5.5rem)] font-black leading-[1.05] tracking-[-0.03em] text-white mb-6"
          >
            Révélez votre{" "}
            <span className="relative inline-block">
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: "linear-gradient(135deg, #c0a062 0%, #e8c87a 50%, #c0a062 100%)" }}
              >
                éclat
              </span>
              {/* Underline glow */}
              <motion.span
                className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-[#c0a062]/0 via-[#c0a062]/80 to-[#c0a062]/0"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, delay: 0.6, ease }}
              />
            </span>{" "}
            en un clic.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp(0.12)}
            className="text-[clamp(1rem,2vw,1.25rem)] text-white/55 max-w-xl mx-auto font-medium leading-relaxed mb-12"
          >
            Découvrez et réservez les meilleurs professionnels de beauté
            près de chez vous, en toute simplicité.
          </motion.p>

          {/* ── Search Bar ─────────────────────────────────── */}
          <motion.div variants={fadeUp(0.2)} className="w-full max-w-3xl px-2 md:px-0">
            <div className="relative bg-white/[0.07] backdrop-blur-2xl rounded-2xl md:rounded-full border border-white/[0.12] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col md:flex-row gap-1.5 md:gap-2">

              {/* Service field */}
              <div className="flex-1 flex items-center gap-3 hover:bg-white/[0.06] rounded-xl md:rounded-full px-4 py-3 transition-colors">
                <Search size={15} className="text-[#c0a062] shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c0a062] italic mb-0.5">
                    Prestation
                  </label>
                  <input
                    type="text"
                    placeholder="Coiffure, massage, ongles…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="bg-transparent text-white placeholder:text-white/30 text-[13px] md:text-sm font-semibold outline-none w-full italic"
                  />
                </div>
              </div>

              {/* Divider — horizontal on mobile, vertical on desktop */}
              <div className="block md:hidden h-px bg-white/10 mx-3" />
              <div className="hidden md:block w-px self-stretch bg-white/10 my-2" />

              {/* Location field */}
              <div className="flex-1 flex items-center gap-3 hover:bg-white/[0.06] rounded-xl md:rounded-full px-4 py-3 transition-colors">
                <MapPin size={15} className="text-[#c0a062] shrink-0" />
                <div className="flex flex-col flex-1 min-w-0">
                  <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c0a062] italic mb-0.5">
                    Localisation
                  </label>
                  <CityAutocompleteSearch
                    value={locationQuery}
                    onChange={setLocationQuery}
                    onSearch={handleSearch}
                    placeholder="Ville ou code postal"
                    inputClassName="bg-transparent text-white placeholder:text-white/30 text-[13px] md:text-sm font-semibold outline-none w-full italic"
                  />
                </div>
              </div>

              {/* CTA Button */}
              <Button
                size="lg"
                className="bg-gradient-to-br from-[#d4b070] via-[#c0a062] to-[#a8854e] hover:from-[#e0bc78] hover:via-[#cca96e] hover:to-[#b8945a] text-white font-bold rounded-xl md:rounded-full px-8 shrink-0 shadow-[0_4px_24px_rgba(192,160,98,0.45),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_32px_rgba(192,160,98,0.6)] transition-all duration-300 h-12 md:h-auto md:min-h-[52px] w-full md:w-auto"
                onClick={handleSearch}
              >
                <span>Trouver un pro</span>
                <ArrowRight size={17} className="ml-1.5 transition-transform duration-300 group-hover/shine:translate-x-1" />
              </Button>
            </div>
          </motion.div>

          {/* ── Stats row ──────────────────────────────────── */}
          {/* TODO: réactiver quand on aura les vraies stats
          <motion.div
            variants={fadeUp(0.3)}
            className="flex flex-wrap items-center justify-center gap-3 mt-10"
          >
            {stats.map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white/[0.05] backdrop-blur-md border border-white/[0.08] hover:bg-white/[0.09] transition-colors"
              >
                <Icon size={14} className="text-[#c0a062]" />
                <span className="text-[13px] font-bold text-white/50">{label}</span>
                <span className="text-[13px] font-black text-white">{value}</span>
              </div>
            ))}
          </motion.div>
          */}

        </motion.div>
      </Container>

      {/* ── Bottom fade into next section ──────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent z-10 pointer-events-none" />
    </section>
  );
}
