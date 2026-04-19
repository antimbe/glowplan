"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, Instagram, ArrowRight, Loader2, MessageSquare } from "lucide-react";
import { Container, Button, Textarea } from "@/components/ui";
import { useModal } from "@/contexts/ModalContext";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const SUBJECTS = [
  "Booker un appel pour une démo",
  "Question sur GlowPlan",
  "Problème technique",
  "Signaler un bug",
  "Demande de partenariat",
  "Facturation / abonnement",
  "Autre",
];

const contactItems = [
  { icon: Phone, label: "Téléphone", value: "+33 6 64 73 93 35", href: "tel:+33664739335" },
  { icon: Mail,  label: "Email",     value: "contact@glowplan.fr", href: "mailto:contact@glowplan.fr" },
];

export default function ContactFormSection() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: SUBJECTS[0],
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useModal();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/contact/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Erreur lors de l'envoi");
      showSuccess("Message envoyé", result.message || "Votre message a bien été envoyé !");
      setFormData({ firstName: "", lastName: "", email: "", phone: "", subject: SUBJECTS[0], message: "" });
    } catch (error: any) {
      showError("Erreur", error.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#f7f5f2] py-24 -mt-20 relative z-20">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">

          {/* ── Left: Info card ─────────────────────────────────── */}
          <motion.div
            className="lg:col-span-4 flex"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, ease }}
          >
            <div className="relative w-full rounded-3xl overflow-hidden bg-[#1e2b18] p-8 lg:p-10 flex flex-col justify-between shadow-[0_30px_80px_-15px_rgba(30,43,24,0.4)]">

              {/* Ambient glows */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c0a062]/8 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/20 rounded-full blur-2xl pointer-events-none -ml-12 -mb-12" />
              {/* Top accent line */}
              <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#c0a062]/40 to-transparent" />

              <div className="relative z-10 space-y-10">
                {/* Header */}
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] mb-5">
                    <MessageSquare size={12} className="text-[#c0a062]" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Coordonnées</span>
                  </div>
                  <h2 className="text-white text-[clamp(1.6rem,3vw,2.2rem)] font-black tracking-[-0.02em] leading-tight mb-3">
                    On est là<br />
                    <span
                      className="text-transparent bg-clip-text"
                      style={{ backgroundImage: "linear-gradient(135deg, #c0a062, #e8c87a)" }}
                    >
                      pour vous.
                    </span>
                  </h2>
                  <p className="text-white/40 text-[14px] font-medium leading-relaxed">
                    N'hésitez pas, écrivez-nous.<br />On répond vite.
                  </p>
                </div>

                {/* Contact items */}
                <div className="space-y-5">
                  {contactItems.map(({ icon: Icon, label, value, href }) => (
                    <a
                      key={label}
                      href={href}
                      className="group flex items-center gap-4 p-4 rounded-2xl bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.08] hover:border-[#c0a062]/20 transition-all duration-300"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#c0a062]/15 group-hover:border-[#c0a062]/30 transition-all duration-300">
                        <Icon size={18} className="text-white/50 group-hover:text-[#c0a062] transition-colors" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25 mb-0.5">{label}</p>
                        <p className="text-white font-bold text-[14px]">{value}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>

              {/* Social */}
              <div className="relative z-10 pt-8 mt-8 border-t border-white/[0.06]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 mb-4">Réseaux</p>
                <a
                  href="https://www.instagram.com/glowplan.fr/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center hover:bg-white/10 hover:border-white/20 hover:scale-110 transition-all group"
                >
                  <Instagram size={17} className="text-white/40 group-hover:text-white transition-colors" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Form ─────────────────────────────────────── */}
          <motion.div
            className="lg:col-span-8 flex"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.8, delay: 0.15, ease }}
          >
            <div className="w-full bg-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)] border border-gray-100/80 p-8 lg:p-12">
              <form onSubmit={handleSubmit} className="flex flex-col gap-8 h-full">

                {/* Name row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "firstName", label: "Prénom", placeholder: "Jean" },
                    { name: "lastName",  label: "Nom",    placeholder: "Dupont" },
                  ].map((f) => (
                    <div key={f.name} className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#32422c]/40">
                        {f.label}
                      </label>
                      <input
                        name={f.name}
                        placeholder={f.placeholder}
                        value={(formData as any)[f.name]}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border-0 border-b-2 border-gray-100 focus:border-[#32422c] outline-none h-12 text-lg font-semibold text-gray-900 placeholder:text-gray-300 transition-colors duration-200"
                      />
                    </div>
                  ))}
                </div>

                {/* Email / Phone row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[
                    { name: "email", label: "Email", placeholder: "jean@example.com", type: "email" },
                    { name: "phone", label: "Téléphone", placeholder: "+33 6 12 34 56 78", type: "tel" },
                  ].map((f) => (
                    <div key={f.name} className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#32422c]/40">
                        {f.label}
                      </label>
                      <input
                        name={f.name}
                        type={f.type}
                        placeholder={f.placeholder}
                        value={(formData as any)[f.name]}
                        onChange={handleChange}
                        required
                        className="w-full bg-transparent border-0 border-b-2 border-gray-100 focus:border-[#32422c] outline-none h-12 text-lg font-semibold text-gray-900 placeholder:text-gray-300 transition-colors duration-200"
                      />
                    </div>
                  ))}
                </div>

                {/* Subject pills */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#32422c]/40">
                    Sujet
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SUBJECTS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, subject: s }))}
                        className={`cursor-pointer px-4 py-2 rounded-full text-[12px] font-bold border transition-all duration-200 ${
                          formData.subject === s
                            ? "bg-[#32422c] text-white border-[#32422c] shadow-md shadow-[#32422c]/20"
                            : "bg-white text-[#32422c]/50 border-[#32422c]/15 hover:border-[#32422c]/40 hover:text-[#32422c]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2 flex-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-[#32422c]/40">
                    Message
                  </label>
                  <Textarea
                    name="message"
                    placeholder="Décrivez votre demande..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    fullWidth
                    className="bg-[#f7f5f2]/60 border border-gray-100 rounded-2xl min-h-[150px] p-5 focus:bg-white focus:border-[#32422c]/20 transition-all text-[15px] font-medium resize-none w-full outline-none"
                  />
                </div>

                {/* Submit */}
                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    disabled={loading}
                    size="lg"
                    className="bg-gradient-to-br from-[#3d5233] via-[#32422c] to-[#263520] hover:from-[#475e3b] hover:via-[#3a4e33] text-white font-bold rounded-full px-10 shadow-[0_4px_24px_rgba(50,66,44,0.35)] hover:shadow-[0_6px_32px_rgba(50,66,44,0.45)] transition-all duration-300 min-w-[180px]"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Envoi…</span>
                      </>
                    ) : (
                      <>
                        <span>Envoyer</span>
                        <ArrowRight size={18} className="transition-transform group-hover/shine:translate-x-1" />
                      </>
                    )}
                  </Button>
                </div>

              </form>
            </div>
          </motion.div>

        </div>
      </Container>
    </section>
  );
}
