"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ArrowLeft } from "lucide-react";
import { ACTIVITY_SECTORS } from "@/lib/constants/sectors";
import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";

// Images disponibles par secteur
const SECTOR_IMAGES: Record<string, string> = {
  coiffure: "/coupes.jpg",
  ongles: "/ongles.jpg",
  sourcils: "/sourcils.jpg",
  massage: "/massages.jpg",
  barbier: "/barber.jpg",
  epilation: "/epilation.jpg",
};

// Couleurs de fallback pour les secteurs sans image
const SECTOR_COLORS: Record<string, string> = {
  soins: "from-emerald-400 to-teal-500",
  protheses: "from-amber-400 to-orange-500",
  tatouage: "from-slate-500 to-gray-700",
  maquillage: "from-rose-400 to-pink-500",
  medical: "from-blue-400 to-cyan-500",
};

// Emojis de fallback
const SECTOR_EMOJIS: Record<string, string> = {
  soins: "🌿",
  protheses: "✨",
  tatouage: "🎨",
  maquillage: "💄",
  medical: "🏥",
};

export default function CategoriesPage() {
  const router = useRouter();

  return (
    <>
    <Header />
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft size={16} />
            Retour à l'accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
            Toutes les prestations
          </h1>
          <p className="mt-2 text-gray-500 text-lg">
            Choisissez une catégorie pour trouver votre prestataire idéal
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
          {ACTIVITY_SECTORS.map((sector) => {
            const image = SECTOR_IMAGES[sector.id];
            const gradient = SECTOR_COLORS[sector.id];
            const emoji = SECTOR_EMOJIS[sector.id];

            return (
              <button
                key={sector.id}
                onClick={() => router.push(`/search?sector=${sector.id}`)}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer"
              >
                {/* Background */}
                {image ? (
                  <Image
                    src={image}
                    alt={sector.label}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                    <span className="text-5xl">{emoji}</span>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-base md:text-lg leading-tight">
                    {sector.label}
                  </p>
                  <p className="text-white/70 text-xs mt-1 flex items-center gap-1 group-hover:text-white transition-colors">
                    Voir les pros
                    <ChevronRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
