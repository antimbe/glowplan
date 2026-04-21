"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface Commune {
  nom: string;
  codesPostaux: string[];
}

interface CityAutocompleteProps {
  cityValue: string;
  postalValue: string;
  onCityChange: (city: string) => void;
  onPostalChange: (postal: string) => void;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function CityAutocomplete({
  cityValue,
  postalValue,
  onCityChange,
  onPostalChange,
}: CityAutocompleteProps) {
  /* ─── City state ─────────────────────────────── */
  const [cityInput, setCityInput] = useState(cityValue);
  const [citySuggestions, setCitySuggestions] = useState<Commune[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [cityLocked, setCityLocked] = useState(!!cityValue); // true = a commune was selected

  /* ─── Postal state ─────────────────────────────── */
  const [postalInput, setPostalInput] = useState(postalValue);
  const [postalOptions, setPostalOptions] = useState<string[]>([]);
  const [postalSuggestions, setPostalSuggestions] = useState<Commune[]>([]);
  const [postalLoading, setPostalLoading] = useState(false);
  const [postalOpen, setPostalOpen] = useState(false);

  const cityRef = useRef<HTMLDivElement>(null);
  const postalRef = useRef<HTMLDivElement>(null);

  const debouncedCity = useDebounce(cityInput, 250);
  const debouncedPostal = useDebounce(postalInput, 250);

  /* ─── Sync props → local state when parent reloads ─── */
  useEffect(() => {
    setCityInput(cityValue);
    setCityLocked(!!cityValue);
  }, [cityValue]);

  useEffect(() => {
    setPostalInput(postalValue);
  }, [postalValue]);

  /* ─── Close on outside click ──────────────────── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setCityOpen(false);
        // If user typed but didn't select → revert to last confirmed value
        if (!cityLocked) setCityInput(cityValue);
      }
      if (postalRef.current && !postalRef.current.contains(e.target as Node))
        setPostalOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [cityValue, cityLocked]);

  /* ─── City search ─────────────────────────────── */
  useEffect(() => {
    if (cityLocked || debouncedCity.length < 2) {
      setCitySuggestions([]);
      setCityOpen(false);
      return;
    }
    let cancelled = false;
    setCityLoading(true);
    fetch(
      `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(debouncedCity)}&fields=nom,codesPostaux&boost=population&limit=8`
    )
      .then((r) => r.json())
      .then((data: Commune[]) => {
        if (!cancelled) {
          setCitySuggestions(data || []);
          setCityOpen((data || []).length > 0);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setCityLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedCity, cityLocked]);

  /* ─── Postal search (when typing in postal field directly) ─── */
  useEffect(() => {
    // Only search if not already filled by city selection
    if (postalOptions.length > 0 || postalInput.length < 2) {
      setPostalSuggestions([]);
      if (postalInput.length < 2) setPostalOpen(false);
      return;
    }
    let cancelled = false;
    setPostalLoading(true);
    fetch(
      `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(debouncedPostal)}&fields=nom,codesPostaux&limit=8`
    )
      .then((r) => r.json())
      .then((data: Commune[]) => {
        if (!cancelled) {
          setPostalSuggestions(data || []);
          setPostalOpen((data || []).length > 0);
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPostalLoading(false); });
    return () => { cancelled = true; };
  }, [debouncedPostal, postalOptions]);

  /* ─── Select a commune from city dropdown ─────── */
  const selectCommune = (commune: Commune) => {
    setCityInput(commune.nom);
    onCityChange(commune.nom);
    setCityLocked(true);
    setCityOpen(false);
    setCitySuggestions([]);

    const codes = commune.codesPostaux || [];
    setPostalOptions(codes);
    setPostalSuggestions([]);
    setPostalOpen(false);

    if (codes.length === 1) {
      setPostalInput(codes[0]);
      onPostalChange(codes[0]);
    } else if (codes.length > 1) {
      // Let user pick from options
      setPostalInput(codes[0]);
      onPostalChange(codes[0]);
      setPostalOpen(true);
    }
  };

  /* ─── Select postal code from list ───────────── */
  const selectPostal = (code: string) => {
    setPostalInput(code);
    onPostalChange(code);
    setPostalOpen(false);
  };

  /* ─── Select commune via postal code search ───── */
  const selectCommuneFromPostal = (commune: Commune, code: string) => {
    setPostalInput(code);
    onPostalChange(code);
    setCityInput(commune.nom);
    onCityChange(commune.nom);
    setCityLocked(true);
    setPostalOptions(commune.codesPostaux);
    setPostalSuggestions([]);
    setPostalOpen(false);
  };

  /* ─── Clear city selection ───────────────────── */
  const clearCity = () => {
    setCityInput("");
    onCityChange("");
    setCityLocked(false);
    setPostalInput("");
    onPostalChange("");
    setPostalOptions([]);
    setCitySuggestions([]);
    setCityOpen(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

      {/* ── City field ─────────────────────────── */}
      <div className="md:col-span-2" ref={cityRef}>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
          Ville <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <MapPin size={15} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={cityInput}
            readOnly={cityLocked}
            placeholder="Rechercher une ville..."
            onChange={(e) => {
              setCityInput(e.target.value);
              setCityLocked(false);
            }}
            onFocus={() => {
              if (!cityLocked && cityInput.length >= 2) setCityOpen(true);
            }}
            className={cn(
              "w-full pl-9 pr-10 py-2.5 rounded-xl border text-sm font-medium transition-all outline-none",
              "border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10",
              cityLocked && "bg-white cursor-default text-gray-900"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {cityLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
            {cityLocked && cityInput && (
              <button
                type="button"
                onClick={clearCity}
                className="w-5 h-5 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors cursor-pointer"
                title="Effacer"
              >
                <X size={11} className="text-gray-600" />
              </button>
            )}
          </div>

          {/* City dropdown */}
          {cityOpen && citySuggestions.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 overflow-hidden">
              <ul className="max-h-60 overflow-y-auto divide-y divide-gray-50">
                {citySuggestions.map((commune) => (
                  <li key={`${commune.nom}-${commune.codesPostaux[0]}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); selectCommune(commune); }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#32422c]/[0.04] transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-[#32422c]/8 flex items-center justify-center shrink-0">
                          <MapPin size={12} className="text-[#32422c]" />
                        </div>
                        <span className="text-[13px] font-bold text-gray-900 group-hover:text-[#32422c]">
                          {commune.nom}
                        </span>
                      </div>
                      <span className="text-[11px] font-medium text-gray-400">
                        {commune.codesPostaux.slice(0, 3).join(", ")}
                        {commune.codesPostaux.length > 3 && "…"}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* ── Postal code field ───────────────────── */}
      <div ref={postalRef}>
        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">
          Code postal
        </label>
        <div className="relative">
          {/* If city has multiple postal codes → show select-style button */}
          {postalOptions.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => setPostalOpen(!postalOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-900 hover:border-primary/40 transition-colors cursor-pointer"
              >
                <span>{postalInput || "Choisir..."}</span>
                <ChevronDown size={14} className={cn("text-gray-400 transition-transform", postalOpen && "rotate-180")} />
              </button>
              {postalOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                  <ul className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                    {postalOptions.map((code) => (
                      <li key={code}>
                        <button
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); selectPostal(code); }}
                          className={cn(
                            "w-full text-left px-4 py-2.5 text-[13px] font-bold transition-colors cursor-pointer",
                            postalInput === code
                              ? "bg-[#32422c]/8 text-[#32422c]"
                              : "hover:bg-gray-50 text-gray-700"
                          )}
                        >
                          {code}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <>
              <input
                type="text"
                value={postalInput}
                placeholder="75001"
                onChange={(e) => {
                  setPostalInput(e.target.value);
                  setPostalOptions([]); // allow free search if typing directly
                }}
                onFocus={() => {
                  if (postalInput.length >= 2 && postalOptions.length === 0) setPostalOpen(true);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-primary/40 focus:ring-2 focus:ring-primary/10 text-sm font-medium transition-all outline-none"
              />
              {postalLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={14} className="animate-spin text-gray-400" />
                </div>
              )}

              {/* Postal code search suggestions */}
              {postalOpen && postalSuggestions.length > 0 && (
                <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden">
                  <ul className="max-h-52 overflow-y-auto divide-y divide-gray-50">
                    {postalSuggestions.flatMap((commune) =>
                      commune.codesPostaux
                        .filter((c) => c.startsWith(debouncedPostal))
                        .map((code) => (
                          <li key={`${commune.nom}-${code}`}>
                            <button
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                selectCommuneFromPostal(commune, code);
                              }}
                              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#32422c]/[0.04] transition-colors cursor-pointer"
                            >
                              <span className="text-[13px] font-bold text-gray-900">{code}</span>
                              <span className="text-[12px] text-gray-400 font-medium">{commune.nom}</span>
                            </button>
                          </li>
                        ))
                    )}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
