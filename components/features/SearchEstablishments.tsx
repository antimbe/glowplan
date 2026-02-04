"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, MapPin, X, Star, Clock } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils/cn";

interface Establishment {
  id: string;
  name: string;
  city: string;
  activity_sectors: string[];
  main_photo_url: string | null;
  description: string | null;
}

interface SearchEstablishmentsProps {
  variant?: "header" | "hero";
  className?: string;
}

export default function SearchEstablishments({ variant = "header", className }: SearchEstablishmentsProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Establishment[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const searchEstablishments = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("establishments")
        .select("id, name, city, activity_sectors, main_photo_url, description")
        .eq("is_profile_complete", true)
        .or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,activity_sectors.cs.{${searchQuery}}`)
        .limit(6);

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (query) {
        searchEstablishments(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query, searchEstablishments]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (establishment: Establishment) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/establishment/${establishment.id}`);
  };

  const isHero = variant === "hero";

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className={cn(
        "flex items-center gap-3 rounded-full transition-all",
        isHero 
          ? "bg-white shadow-xl shadow-black/10 px-6 py-4" 
          : "bg-white/10 backdrop-blur-sm px-4 py-2.5 border border-white/20"
      )}>
        <Search 
          size={isHero ? 22 : 18} 
          className={isHero ? "text-gray-400" : "text-white/60"} 
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Rechercher un établissement..."
          className={cn(
            "bg-transparent outline-none flex-1 placeholder:text-gray-400",
            isHero 
              ? "text-gray-900 text-base w-64 md:w-80" 
              : "text-white text-sm w-48 md:w-64 placeholder:text-white/50"
          )}
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className={cn(
              "p-1 rounded-full transition-colors",
              isHero ? "hover:bg-gray-100 text-gray-400" : "hover:bg-white/10 text-white/60"
            )}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {isOpen && (query.length >= 2 || results.length > 0) && (
        <div className={cn(
          "absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl shadow-black/20 overflow-hidden z-50",
          isHero ? "min-w-[400px]" : "min-w-[320px]"
        )}>
          {loading ? (
            <div className="p-6 flex items-center justify-center">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((establishment) => (
                <button
                  key={establishment.id}
                  onClick={() => handleSelect(establishment)}
                  className="w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                >
                  {establishment.main_photo_url ? (
                    <img
                      src={establishment.main_photo_url}
                      alt={establishment.name}
                      className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Star size={20} className="text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{establishment.name}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <MapPin size={14} />
                      <span>{establishment.city}</span>
                    </div>
                    {establishment.activity_sectors?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {establishment.activity_sectors.slice(0, 2).map((sector, idx) => (
                          <span key={idx} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {sector}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-6 text-center text-gray-500">
              <Search size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Aucun établissement trouvé</p>
              <p className="text-xs text-gray-400 mt-1">Essayez avec un autre terme</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
