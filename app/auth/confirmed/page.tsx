"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ArrowRight, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

function ConfirmedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get("type") ?? "client";

  const isPro = type === "pro";
  const destination = isPro ? "/dashboard" : "/search";
  const destinationLabel = isPro ? "Accéder au dashboard" : "Découvrir les établissements";

  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          router.push(destination);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [destination, router]);

  return (
    <section className="min-h-screen relative overflow-hidden bg-[#0d1208] flex items-center justify-center">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/111c2f206_adam-winger-VjRpkGtS55w-unsplash.jpg"
          alt="GlowPlan"
          fill
          className="object-cover opacity-20"
          priority
        />
      </div>
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#0d1208]/95 via-[#1a2414]/80 to-[#32422c]/50" />

      {/* Ambient glow */}
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-emerald-500/8 blur-[140px] pointer-events-none z-[2]"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[200px] rounded-full bg-[#c0a062]/10 blur-[80px] pointer-events-none z-[2]"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto px-4"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.7, ease }}
      >
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-8 md:p-10 text-center shadow-[0_32px_80px_rgba(0,0,0,0.5)]">

          {/* Animated checkmark */}
          <motion.div
            className="w-20 h-20 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-7"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          >
            <CheckCircle2 size={40} className="text-emerald-400" />
          </motion.div>

          {/* Confetti-like sparkle */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5, ease }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c0a062]/15 border border-[#c0a062]/25 mb-5">
              <Sparkles size={12} className="text-[#c0a062]" />
              <span className="text-[#c0a062] text-[11px] font-bold uppercase tracking-[0.18em]">
                Compte activé
              </span>
            </div>
          </motion.div>

          <motion.h1
            className="text-2xl md:text-3xl font-black tracking-[-0.02em] text-white mb-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5, ease }}
          >
            Bienvenue sur GlowPlan !
          </motion.h1>

          <motion.p
            className="text-white/50 text-[14px] font-medium leading-relaxed mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {isPro
              ? "Votre compte professionnel est confirmé. Vous allez être redirigé vers votre dashboard."
              : "Votre adresse email est confirmée. Vous pouvez maintenant réserver vos prestations préférées."}
          </motion.p>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5, ease }}
          >
            <Link
              href={destination}
              className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-gradient-to-br from-[#d4b070] via-[#c0a062] to-[#a8854e] hover:from-[#e0bc78] hover:via-[#cca96e] hover:to-[#b8945a] text-white font-bold text-[15px] transition-all duration-300 shadow-[0_4px_24px_rgba(192,160,98,0.4)] hover:shadow-[0_6px_32px_rgba(192,160,98,0.55)]"
            >
              <span>{destinationLabel}</span>
              <ArrowRight size={18} />
            </Link>
          </motion.div>

          {/* Countdown */}
          <motion.p
            className="text-white/25 text-[12px] font-medium mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            Redirection automatique dans{" "}
            <span className="text-white/50 font-bold tabular-nums">{countdown}s</span>
          </motion.p>

        </div>
      </motion.div>
    </section>
  );
}

export default function ConfirmedPage() {
  return (
    <Suspense>
      <ConfirmedContent />
    </Suspense>
  );
}
