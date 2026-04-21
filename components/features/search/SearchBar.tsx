"use client";

import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui";
import { ACTIVITY_SECTORS } from "@/lib/constants/sectors";

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  locationQuery: string;
  setLocationQuery: (query: string) => void;
  onSearch: () => void;
  activeSector?: string;
  onSectorClick?: (sectorId: string) => void;
}

const CHIP_CLASS_BASE =
  "flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-black tracking-wide uppercase transition-all duration-200 cursor-pointer border whitespace-nowrap";
const CHIP_ACTIVE =
  "bg-[#c0a062] border-[#c0a062] text-white shadow-md shadow-[#c0a062]/30";
const CHIP_IDLE =
  "bg-white/10 border-white/20 text-white/60 hover:bg-white/20 hover:text-white";

export function SearchBar({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  onSearch,
  activeSector = "",
  onSectorClick,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") onSearch();
  };

  const sectors = ACTIVITY_SECTORS;

  return (
    <>
      {/* ── Bande sombre : inputs ──────────────────────────────
          overflow-hidden uniquement ici pour clipper les glows
      ────────────────────────────────────────────────────────── */}
      <div className="relative bg-[#1e2b18] overflow-hidden pt-20">
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c0a062]/6 rounded-full -mr-60 -mt-60 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#32422c]/60 rounded-full -ml-40 blur-[80px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 pt-7 pb-5">

          {/* Frosted-glass search bar — même style que la homepage */}
          <div className="relative bg-white/[0.07] backdrop-blur-2xl rounded-2xl md:rounded-full border border-white/[0.12] p-2 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.08)] flex flex-col md:flex-row md:items-center gap-1.5 md:gap-0">

            {/* Prestation */}
            <div className="flex-1 flex items-center gap-3 hover:bg-white/[0.06] rounded-xl md:rounded-full px-4 py-3 transition-colors">
              <Search size={15} className="text-[#c0a062] shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c0a062] italic mb-0.5">
                  Prestation
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Coiffure, massage, ongles…"
                  className="bg-transparent text-white placeholder:text-white/30 text-sm font-semibold outline-none w-full italic"
                />
              </div>
            </div>

            {/* Séparateur */}
            <div className="block md:hidden h-px bg-white/10 mx-3" />
            <div className="hidden md:block w-px self-stretch bg-white/10 my-2" />

            {/* Localisation */}
            <div className="flex-1 flex items-center gap-3 hover:bg-white/[0.06] rounded-xl md:rounded-full px-4 py-3 transition-colors">
              <MapPin size={15} className="text-[#c0a062] shrink-0" />
              <div className="flex flex-col flex-1 min-w-0">
                <label className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#c0a062] italic mb-0.5">
                  Localisation
                </label>
                <input
                  type="text"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ville ou code postal"
                  className="bg-transparent text-white placeholder:text-white/30 text-sm font-semibold outline-none w-full italic"
                />
              </div>
            </div>

            {/* Bouton doré */}
            <Button
              onClick={onSearch}
              className="bg-gradient-to-br from-[#d4b070] via-[#c0a062] to-[#a8854e] hover:from-[#e0bc78] hover:via-[#cca96e] hover:to-[#b8945a] shadow-none hover:shadow-none rounded-xl md:rounded-full px-8 shrink-0 h-12 md:min-h-[52px] w-full md:w-auto font-bold"
            >
              <span>Rechercher</span>
              <ArrowRight size={17} className="transition-transform duration-300 group-hover/shine:translate-x-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Bande sombre : chips ──────────────────────────────
          PAS de overflow-hidden → scroll horizontal fonctionne
      ────────────────────────────────────────────────────────── */}
      {onSectorClick && (
        <div className="bg-[#1e2b18]">
          <div className="relative max-w-4xl mx-auto">
            <div className="flex gap-2 overflow-x-auto py-4 px-4 pb-3 [scrollbar-width:thin] [scrollbar-color:#c0a062_rgba(255,255,255,0.1)] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-white/10 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#c0a062] [&::-webkit-scrollbar-thumb]:rounded-full">
              {/* Chip « Tous » */}
              <button
                onClick={() => onSectorClick("")}
                className={`${CHIP_CLASS_BASE} ${!activeSector ? CHIP_ACTIVE : CHIP_IDLE}`}
              >
                Tous
              </button>

              {sectors.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSectorClick(s.id)}
                  className={`${CHIP_CLASS_BASE} ${activeSector === s.id ? CHIP_ACTIVE : CHIP_IDLE}`}
                >
                  {s.label}
                </button>
              ))}

              {/* Spacer fin */}
              <div className="flex-shrink-0 w-4" aria-hidden="true" />
            </div>

            {/* Fondu droit */}
            <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#1e2b18] to-transparent pointer-events-none" />
          </div>

          {/* Wave */}
          <div
            className="h-8 bg-gray-50"
            style={{ clipPath: "ellipse(60% 100% at 50% 100%)", marginTop: "-1px" }}
          />
        </div>
      )}

      {/* Wave quand pas de chips */}
      {!onSectorClick && (
        <div className="bg-[#1e2b18]">
          <div
            className="h-8 bg-gray-50"
            style={{ clipPath: "ellipse(60% 100% at 50% 100%)", marginTop: "-1px" }}
          />
        </div>
      )}
    </>
  );
}
