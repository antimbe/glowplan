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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Partager mes disponibilités</h2>
              <p className="text-xs text-gray-500">Lien mis à jour en temps réel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {/* Période */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar size={14} className="inline mr-1.5 text-primary" />
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
          <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Link2 size={15} className="text-primary" />
              <span className="text-sm font-semibold text-gray-800">Votre lien de disponibilités</span>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-500 break-all select-all font-mono">
              {shareUrl}
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                onClick={handleCopy}
                className="flex-1"
              >
                {copied
                  ? <><Check size={15} className="mr-1.5" /> Copié !</>
                  : <><Copy size={15} className="mr-1.5" /> Copier le lien</>
                }
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpen}
                className="flex-1"
              >
                <ExternalLink size={15} className="mr-1.5" />
                Aperçu
              </Button>
            </div>
          </div>

          {/* Astuce Instagram */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                <Instagram size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800 mb-1">Astuce Instagram</p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Copiez ce lien et ajoutez-le dans votre <span className="font-semibold">bio Instagram</span> ou dans une Story via le sticker "Lien". Vos clientes verront vos créneaux en temps réel et pourront réserver directement.
                </p>
              </div>
            </div>
          </div>

          {/* Infos page */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Lightbulb size={17} className="text-primary flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 space-y-1 leading-relaxed">
                <p>La page affiche <span className="font-semibold text-gray-800">vos créneaux réels disponibles</span> en tenant compte de vos horaires, rendez-vous et indisponibilités.</p>
                <p>Elle se <span className="font-semibold text-gray-800">met à jour automatiquement</span> — pas besoin de la recréer à chaque fois.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
