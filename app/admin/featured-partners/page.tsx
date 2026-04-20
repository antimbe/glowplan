"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle2, XCircle, Loader2, MapPin, AlertTriangle } from "lucide-react";
import Image from "next/image";

interface Establishment {
  id: string;
  name: string;
  city: string | null;
  main_photo_url: string | null;
  is_featured: boolean;
  is_profile_complete: boolean;
  services_count: number;
}

export default function FeaturedPartnersAdminPage() {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const featuredCount = establishments.filter((e) => e.is_featured).length;

  async function fetchEstablishments() {
    try {
      const res = await fetch("/api/admin/featured");
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erreur lors du chargement");
        setEstablishments([]);
      } else {
        setEstablishments(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Impossible de contacter l'API");
      setEstablishments([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchEstablishments();
  }, []);

  async function toggleFeatured(est: Establishment) {
    setError(null);
    setSuccessMsg(null);
    setUpdating(est.id);

    let res: Response, data: { error?: string };
    try {
      res = await fetch("/api/admin/featured", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ establishmentId: est.id, featured: !est.is_featured }),
      });
      data = await res.json();
    } catch {
      setError("Impossible de contacter l'API");
      setUpdating(null);
      return;
    }

    if (!res.ok) {
      setError(data.error ?? "Erreur inconnue");
    } else {
      setEstablishments((prev) =>
        prev.map((e) => (e.id === est.id ? { ...e, is_featured: !e.is_featured } : e))
      );
      setSuccessMsg(
        !est.is_featured
          ? `✓ "${est.name}" ajouté aux partenaires phares`
          : `"${est.name}" retiré des partenaires phares`
      );
    }

    setUpdating(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-4 border border-amber-200">
            <AlertTriangle size={13} />
            PAGE ADMIN TEMPORAIRE — RÉSERVÉE À L'ÉQUIPE GLOWPLAN
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Partenaires <span className="text-[#32422c] italic font-serif">phares</span>
          </h1>
          <p className="text-gray-500 mt-2">
            Sélectionnez exactement <strong>3 établissements</strong> à afficher dans la section
            &quot;Nos partenaires phares&quot; de la page d&apos;accueil.
          </p>
        </div>

        {/* Counter */}
        <div className="flex items-center gap-3 mb-6">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                i < featuredCount
                  ? "bg-[#32422c] border-[#32422c] text-white"
                  : "bg-white border-gray-200 text-gray-300"
              }`}
            >
              <Star size={16} fill={i < featuredCount ? "currentColor" : "none"} />
            </div>
          ))}
          <span className="text-sm font-semibold text-gray-600 ml-1">
            {featuredCount}/3 partenaires sélectionnés
          </span>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
            <XCircle size={16} />
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-xl">
            <CheckCircle2 size={16} />
            {successMsg}
          </div>
        )}

        {/* List */}
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <Loader2 className="animate-spin mr-2" size={20} />
            Chargement...
          </div>
        ) : (
          <div className="space-y-3">
            {establishments.map((est) => (
              <div
                key={est.id}
                className={`flex items-center gap-4 bg-white rounded-2xl border p-4 transition-all ${
                  est.is_featured
                    ? "border-[#32422c]/40 shadow-md shadow-[#32422c]/5 ring-1 ring-[#32422c]/10"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {/* Photo */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  {est.main_photo_url ? (
                    <Image src={est.main_photo_url} alt={est.name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl font-bold">
                      {est.name[0]}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-gray-900 truncate">{est.name}</p>
                    {est.is_featured && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-[#32422c] text-white px-2 py-0.5 rounded-full">
                        <Star size={9} fill="currentColor" /> Phare
                      </span>
                    )}
                    {!est.is_profile_complete && (
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Profil incomplet
                      </span>
                    )}
                    {est.services_count === 0 && (
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        ⚠ Aucune prestation
                      </span>
                    )}
                  </div>
                  {est.city && (
                    <p className="text-sm text-gray-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={12} />
                      {est.city}
                    </p>
                  )}
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => toggleFeatured(est)}
                  disabled={updating === est.id || (!est.is_featured && featuredCount >= 3) || (!est.is_featured && est.services_count === 0)}
                  className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                    est.is_featured
                      ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
                      : "bg-[#32422c] text-white hover:bg-[#3d5438] shadow-sm"
                  }`}
                >
                  {updating === est.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : est.is_featured ? (
                    <>
                      <XCircle size={14} />
                      Retirer
                    </>
                  ) : (
                    <>
                      <Star size={14} />
                      Choisir
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          Les modifications sont instantanées et visibles sur la page d&apos;accueil.
        </p>
      </div>
    </div>
  );
}
