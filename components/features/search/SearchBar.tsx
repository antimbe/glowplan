"use client";

import { Search, MapPin } from "lucide-react";
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

  const sectors = ACTIVITY_SECTORS.filter((s) => s.id !== "medical");

  return (
    <div className="relative bg-[#1e2b18] overflow-hidden pt-20">
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#c0a062]/6 rounded-full -mr-60 -mt-60 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#32422c]/60 rounded-full -ml-40 blur-[80px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 pt-7 pb-5">

        {/* ── Desktop unified search box ── */}
        <div className="hidden sm:flex items-center bg-white rounded-2xl shadow-2xl shadow-black/30 overflow-hidden">
          {/* Prestation input */}
          <div className="flex items-center gap-3 flex-1 px-5 py-4 min-w-0">
            <Search size={18} className="text-[#32422c]/40 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Prestation, établissement..."
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium text-[15px] min-w-0"
            />
          </div>

          <div className="self-stretch w-px bg-gray-100 flex-shrink-0" />

          {/* Ville input */}
          <div className="flex items-center gap-3 px-5 py-4">
            <MapPin size={18} className="text-[#32422c]/40 flex-shrink-0" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ville"
              className="w-36 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium text-[15px]"
            />
          </div>

          {/* CTA */}
          <div className="p-2 flex-shrink-0">
            <Button
              onClick={onSearch}
              variant="primary"
              size="sm"
              className="rounded-xl font-bold px-6 py-3.5 text-sm gap-2"
            >
              <Search size={15} />
              Rechercher
            </Button>
          </div>
        </div>

        {/* ── Mobile search ── */}
        <div className="sm:hidden space-y-2">
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-lg shadow-black/20">
            <Search size={18} className="text-[#32422c]/40 flex-shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Prestation, établissement..."
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium"
            />
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 shadow-lg shadow-black/20">
            <MapPin size={18} className="text-[#32422c]/40 flex-shrink-0" />
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => setLocationQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ville"
              className="flex-1 bg-transparent outline-none text-gray-900 placeholder:text-gray-400 font-medium"
            />
          </div>
          <Button
            onClick={onSearch}
            variant="primary"
            size="md"
            fullWidth
            className="rounded-xl font-bold gap-2"
          >
            <Search size={18} />
            Rechercher
          </Button>
        </div>

        {/* ── Category chips ── */}
        {onSectorClick && (
          <div className="mt-4 -mx-4 relative">
            {/* Scroll container — negative margin escape padding parent */}
            <div className="flex gap-2 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <button
                onClick={() => onSectorClick("")}
                className={[
                  "flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-black tracking-wide uppercase transition-all duration-200 cursor-pointer border whitespace-nowrap",
                  !activeSector
                    ? "bg-[#c0a062] border-[#c0a062] text-white shadow-md shadow-[#c0a062]/30"
                    : "bg-white/10 border-white/20 text-white/60 hover:bg-white/20 hover:text-white",
                ].join(" ")}
              >
                Tous
              </button>
              {sectors.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSectorClick(s.id)}
                  className={[
                    "flex-shrink-0 px-4 py-2 rounded-full text-[11px] font-black tracking-wide uppercase transition-all duration-200 cursor-pointer border whitespace-nowrap",
                    activeSector === s.id
                      ? "bg-[#c0a062] border-[#c0a062] text-white shadow-md shadow-[#c0a062]/30"
                      : "bg-white/10 border-white/20 text-white/60 hover:bg-white/20 hover:text-white",
                  ].join(" ")}
                >
                  {s.label}
                </button>
              ))}
              {/* Trailing spacer : dernier chip jamais collé au bord */}
              <div className="flex-shrink-0 w-4" aria-hidden="true" />
            </div>
            {/* Gradient fade droit — indique qu'il y a du contenu à scroller */}
            <div className="absolute right-0 top-0 bottom-1 w-10 bg-gradient-to-l from-[#1e2b18] to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* Wave bottom */}
      <div
        className="h-8 bg-gray-50"
        style={{ clipPath: "ellipse(60% 100% at 50% 100%)", marginTop: "-1px" }}
      />
    </div>
  );
}
