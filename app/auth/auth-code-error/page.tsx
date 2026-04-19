"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ArrowLeft, Clock, ShieldOff } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

type ErrorInfo = {
  title: string;
  description: string;
  icon: React.ReactNode;
  proLink: string;
  clientLink: string;
};

function getErrorInfo(code: string): ErrorInfo {
  switch (code) {
    case "otp_expired":
      return {
        title: "Lien expiré",
        description:
          "Ce lien de réinitialisation a expiré. Les liens sont valables 1 heure. Demandez-en un nouveau et utilisez-le rapidement.",
        icon: <Clock size={32} className="text-[#c0a062]" />,
        proLink: "/auth/pro/forgot-password",
        clientLink: "/auth/client/forgot-password",
      };
    case "access_denied":
      return {
        title: "Accès refusé",
        description:
          "Ce lien a déjà été utilisé ou n'est plus valide. Demandez un nouveau lien de réinitialisation.",
        icon: <ShieldOff size={32} className="text-[#c0a062]" />,
        proLink: "/auth/pro/forgot-password",
        clientLink: "/auth/client/forgot-password",
      };
    default:
      return {
        title: "Lien invalide",
        description:
          "Une erreur s'est produite lors de la vérification de ce lien. Veuillez en demander un nouveau.",
        icon: <AlertTriangle size={32} className="text-[#c0a062]" />,
        proLink: "/auth/pro/forgot-password",
        clientLink: "/auth/client/forgot-password",
      };
  }
}

export default function AuthCodeErrorPage() {
  const [errorCode, setErrorCode] = useState<string>("unknown");
  const [errorInfo, setErrorInfo] = useState<ErrorInfo>(getErrorInfo("unknown"));

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const code = params.get("error_code") || params.get("error") || "unknown";
    setErrorCode(code);
    setErrorInfo(getErrorInfo(code));
  }, []);

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
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-[#c0a062]/8 blur-[120px] pointer-events-none z-[2]"
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-auto px-4"
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease }}
      >
        <div className="bg-white/[0.06] backdrop-blur-2xl border border-white/[0.1] rounded-3xl p-8 md:p-10 text-center shadow-[0_32px_80px_rgba(0,0,0,0.5)]">

          {/* Icon */}
          <div className="w-16 h-16 rounded-2xl bg-[#c0a062]/10 border border-[#c0a062]/20 flex items-center justify-center mx-auto mb-6">
            {errorInfo.icon}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black tracking-[-0.02em] text-white mb-3">
            {errorInfo.title}
          </h1>

          {/* Description */}
          <p className="text-white/50 text-[14px] font-medium leading-relaxed mb-8">
            {errorInfo.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-col gap-3">
            <Link
              href={errorInfo.proLink}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#c0a062] hover:bg-[#a88a50] text-white font-bold text-[14px] transition-all duration-300 shadow-[0_4px_20px_rgba(192,160,98,0.3)] hover:shadow-[0_6px_28px_rgba(192,160,98,0.45)]"
            >
              <RefreshCw size={16} />
              Nouveau lien — Espace Pro
            </Link>
            <Link
              href={errorInfo.clientLink}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white font-bold text-[14px] transition-all duration-300"
            >
              <RefreshCw size={16} />
              Nouveau lien — Espace Client
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full py-3 text-white/40 hover:text-white/70 font-medium text-[13px] transition-colors"
            >
              <ArrowLeft size={14} />
              Retour à l'accueil
            </Link>
          </div>

        </div>
      </motion.div>
    </section>
  );
}
