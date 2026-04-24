"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw, ArrowLeft, Clock, ShieldOff, Mail, Send, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

type ErrorType = "otp_expired" | "access_denied" | "unknown";

function getErrorMeta(code: ErrorType) {
  switch (code) {
    case "otp_expired":
      return {
        title: "Lien expiré",
        description: "Ce lien a expiré. Entrez votre adresse email pour en recevoir un nouveau.",
        icon: <Clock size={32} className="text-[#c0a062]" />,
      };
    case "access_denied":
      return {
        title: "Lien déjà utilisé",
        description: "Ce lien a déjà été utilisé ou n'est plus valide. Entrez votre email pour en recevoir un nouveau.",
        icon: <ShieldOff size={32} className="text-[#c0a062]" />,
      };
    default:
      return {
        title: "Lien invalide",
        description: "Une erreur s'est produite. Entrez votre email pour recevoir un nouveau lien.",
        icon: <AlertTriangle size={32} className="text-[#c0a062]" />,
      };
  }
}

export default function AuthCodeErrorPage() {
  const [errorCode, setErrorCode] = useState<ErrorType>("unknown");
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState<"client" | "pro" | null>(null);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const raw = params.get("error_code") || params.get("error") || "unknown";
    const code: ErrorType =
      raw === "otp_expired" ? "otp_expired"
      : raw === "access_denied" ? "access_denied"
      : "unknown";
    setErrorCode(code);
  }, []);

  const meta = getErrorMeta(errorCode);

  const handleResend = async (type: "client" | "pro") => {
    if (!email) { setSendError("Veuillez entrer votre adresse email."); return; }
    setSending(type);
    setSendError(null);

    const origin = window.location.origin;
    const redirectTo =
      type === "client"
        ? `${origin}/auth/callback?type=client`
        : `${origin}/auth/callback`;

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setSendError(error.message || "Erreur lors de l'envoi.");
    } else {
      setSent(true);
    }
    setSending(null);
  };

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
            {sent ? <CheckCircle2 size={32} className="text-emerald-400" /> : meta.icon}
          </div>

          {sent ? (
            <>
              <h1 className="text-2xl font-black tracking-[-0.02em] text-white mb-3">
                Email envoyé !
              </h1>
              <p className="text-white/50 text-[14px] font-medium leading-relaxed mb-8">
                Si un compte existe pour{" "}
                <span className="text-white font-bold">{email}</span>,
                un email vient d'être envoyé. Vérifiez vos spams si vous ne le recevez pas dans quelques minutes.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] text-white font-bold text-[14px] transition-all duration-300"
                >
                  <RefreshCw size={16} />
                  Renvoyer à une autre adresse
                </button>
                <Link
                  href="/"
                  className="flex items-center justify-center gap-2 w-full py-3 text-white/40 hover:text-white/70 font-medium text-[13px] transition-colors"
                >
                  <ArrowLeft size={14} />
                  Retour à l'accueil
                </Link>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-black tracking-[-0.02em] text-white mb-3">
                {meta.title}
              </h1>
              <p className="text-white/50 text-[14px] font-medium leading-relaxed mb-6">
                {meta.description}
              </p>

              {/* Email input */}
              <div className="relative mb-4">
                <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setSendError(null); }}
                  placeholder="votre@email.com"
                  className="w-full bg-white/[0.07] border border-white/[0.12] rounded-2xl pl-10 pr-4 py-3.5 text-white placeholder:text-white/30 text-[14px] font-medium focus:outline-none focus:border-[#c0a062]/50 focus:bg-white/[0.1] transition-all"
                />
              </div>

              {sendError && (
                <p className="text-red-400 text-xs font-medium mb-4 text-left">{sendError}</p>
              )}

              {/* Resend buttons */}
              <div className="flex flex-col gap-3 mb-5">
                <button
                  onClick={() => handleResend("client")}
                  disabled={!!sending}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#c0a062] hover:bg-[#a88a50] disabled:opacity-60 text-white font-bold text-[14px] transition-all duration-300 shadow-[0_4px_20px_rgba(192,160,98,0.3)] hover:shadow-[0_6px_28px_rgba(192,160,98,0.45)]"
                >
                  {sending === "client" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Renvoyer — Espace Client
                </button>
                <button
                  onClick={() => handleResend("pro")}
                  disabled={!!sending}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.12] disabled:opacity-60 text-white font-bold text-[14px] transition-all duration-300"
                >
                  {sending === "pro" ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Send size={16} />
                  )}
                  Renvoyer — Espace Pro
                </button>
              </div>

              {/* Separator */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/25 text-[11px] font-medium">ou</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Fallback — password reset links */}
              <div className="flex flex-col gap-2">
                <p className="text-white/25 text-[11px] font-medium mb-1">
                  Mot de passe oublié ?
                </p>
                <div className="flex gap-2">
                  <Link
                    href="/auth/client/forgot-password"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/50 hover:text-white/80 font-medium text-[12px] transition-all duration-300"
                  >
                    <RefreshCw size={13} />
                    Espace Client
                  </Link>
                  <Link
                    href="/auth/pro/forgot-password"
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-white/50 hover:text-white/80 font-medium text-[12px] transition-all duration-300"
                  >
                    <RefreshCw size={13} />
                    Espace Pro
                  </Link>
                </div>
              </div>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full mt-4 py-3 text-white/40 hover:text-white/70 font-medium text-[13px] transition-colors"
              >
                <ArrowLeft size={14} />
                Retour à l'accueil
              </Link>
            </>
          )}

        </div>
      </motion.div>
    </section>
  );
}
