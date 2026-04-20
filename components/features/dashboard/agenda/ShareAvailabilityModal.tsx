"use client";

import { useState } from "react";
import { Share2, Copy, ExternalLink, X, Lightbulb, Link2, Check, Instagram, Calendar } from "lucide-react";
import { Button, Select } from "@/components/ui";

interface ShareAvailabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  establishmentId: string;
}

const PERIOD_OPTIONS = [
  { value: "7",          label: "7 prochains jours" },
  { value: "this_month", label: "Ce mois-ci" },
  { value: "next_month", label: "Mois prochain" },
];

export default function ShareAvailabilityModal({ isOpen, onClose, establishmentId }: ShareAvailabilityModalProps) {
  const [period, setPeriod] = useState("7");
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/availability/${establishmentId}?period=${period}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpen = () => window.open(shareUrl, "_blank");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

      <div className="relative bg-white rounded-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.25)] w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Top accent */}
        <div className="h-[2px] bg-gradient-to-r from-transparent via-[#c0a062]/60 to-transparent" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#32422c]/8 border border-[#32422c]/12 flex items-center justify-center flex-shrink-0">
              <Share2 size={18} className="text-[#32422c]" />
            </div>
            <div>
              <h2 className="text-[16px] font-black text-gray-900 tracking-tight">Partager mes disponibilités</h2>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Lien mis à jour en temps réel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all cursor-pointer flex-shrink-0"
          >
            <X size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">

          {/* Période */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <Calendar size={12} className="text-[#32422c]" />
              Période à afficher
            </label>
            <Select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              options={PERIOD_OPTIONS}
              fullWidth
            />
          </div>

          {/* Lien généré */}
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Link2 size={14} className="text-[#32422c]" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Votre lien</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-[11px] text-gray-400 break-all select-all font-mono leading-relaxed">
              {shareUrl}
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopy}
                className={[
                  "flex-1 h-10 rounded-xl font-bold text-sm transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5",
                  copied
                    ? "bg-[#32422c] text-white shadow-lg shadow-[#32422c]/20"
                    : "bg-[#32422c] hover:bg-[#3d5438] text-white shadow-md shadow-[#32422c]/15",
                ].join(" ")}
              >
                {copied
                  ? <><Check size={14} /> Copié !</>
                  : <><Copy size={14} /> Copier</>
                }
              </button>
              <button
                onClick={handleOpen}
                className="flex-1 h-10 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 text-gray-600 font-bold text-sm transition-all duration-150 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ExternalLink size={14} />
                Aperçu
              </button>
            </div>
          </div>

          {/* Astuce Instagram */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100/80 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                <Instagram size={14} className="text-white" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-800 mb-1">Astuce Instagram</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Ajoutez ce lien dans votre <span className="font-semibold text-gray-700">bio</span> ou en Story via le sticker "Lien". Vos clientes voient vos créneaux en temps réel.
                </p>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="bg-[#32422c]/5 border border-[#32422c]/10 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Lightbulb size={15} className="text-[#32422c] flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-500 leading-relaxed">
                La page affiche vos <span className="font-semibold text-gray-700">créneaux réels</span> en tenant compte de vos horaires et rendez-vous — elle se met à jour automatiquement.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
