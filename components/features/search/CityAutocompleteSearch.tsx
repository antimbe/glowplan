"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { MapPin, Loader2, X } from "lucide-react";

interface Commune {
  nom: string;
  codesPostaux: string[];
}

interface CityAutocompleteSearchProps {
  /** Current city value (controlled) */
  value: string;
  onChange: (city: string) => void;
  /** Called when user presses Enter — trigger the search */
  onSearch?: () => void;
  placeholder?: string;
  /** Extra classes applied to the <input> element */
  inputClassName?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * Autocomplete city field — dark-theme variant (Hero & SearchBar).
 * The dropdown is rendered via a React Portal at <body> level so it is
 * never clipped by parent overflow-hidden containers.
 */
export function CityAutocompleteSearch({
  value,
  onChange,
  onSearch,
  placeholder = "Ville ou code postal",
  inputClassName = "",
}: CityAutocompleteSearchProps) {
  const [input, setInput] = useState(value);
  const [locked, setLocked] = useState(!!value);
  const [suggestions, setSuggestions] = useState<Commune[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  // Position of the dropdown (computed from the anchor element)
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const containerRef = useRef<HTMLDivElement>(null);
  const debouncedInput = useDebounce(input, 220);

  /* ── Compute dropdown position when opening ── */
  const updateDropdownPosition = () => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setDropdownStyle({
      position: "fixed",
      top: rect.bottom + 6,
      left: rect.left,
      width: Math.max(rect.width, 260),
      zIndex: 9999,
    });
  };

  /* ── Sync external value (e.g. reset from parent) ── */
  useEffect(() => {
    setInput(value);
    setLocked(!!value);
  }, [value]);

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (!locked) setInput(value);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [value, locked]);

  /* ── Recompute position on scroll / resize while open ── */
  useEffect(() => {
    if (!open) return;
    const update = () => updateDropdownPosition();
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open]);

  /* ── API call ── */
  useEffect(() => {
    if (locked || debouncedInput.length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    // Detect postal code vs city name
    const isPostal = /^\d+$/.test(debouncedInput.trim());
    const url = isPostal
      ? `https://geo.api.gouv.fr/communes?codePostal=${encodeURIComponent(debouncedInput.trim())}&fields=nom,codesPostaux&limit=8`
      : `https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(debouncedInput.trim())}&fields=nom,codesPostaux&boost=population&limit=8`;

    fetch(url)
      .then((r) => r.json())
      .then((data: Commune[]) => {
        if (!cancelled) {
          setSuggestions(data || []);
          if ((data || []).length > 0) {
            updateDropdownPosition();
            setOpen(true);
          } else {
            setOpen(false);
          }
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [debouncedInput, locked]);

  /* ── Select a commune ── */
  const selectCommune = (commune: Commune) => {
    setInput(commune.nom);
    onChange(commune.nom);
    setLocked(true);
    setOpen(false);
    setSuggestions([]);
  };

  /* ── Clear ── */
  const clear = () => {
    setInput("");
    onChange("");
    setLocked(false);
    setSuggestions([]);
    setOpen(false);
  };

  /* ── Dropdown markup (rendered via portal) ── */
  const dropdown = open && suggestions.length > 0 && typeof document !== "undefined"
    ? createPortal(
        <div
          style={dropdownStyle}
          className="bg-white rounded-2xl border border-gray-100 shadow-[0_16px_48px_-8px_rgba(0,0,0,0.28)] overflow-hidden"
        >
          <ul className="max-h-60 overflow-y-auto divide-y divide-gray-50">
            {suggestions.map((commune) => (
              <li key={`${commune.nom}-${commune.codesPostaux[0]}`}>
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); selectCommune(commune); }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#32422c]/[0.04] transition-colors text-left group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#32422c]/[0.08] flex items-center justify-center shrink-0">
                      <MapPin size={12} className="text-[#32422c]" />
                    </div>
                    <span className="text-[13px] font-bold text-gray-900 group-hover:text-[#32422c]">
                      {commune.nom}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-gray-400">
                    {commune.codesPostaux.slice(0, 2).join(", ")}
                    {commune.codesPostaux.length > 2 && "…"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={containerRef} className="relative flex-1 min-w-0">
      <div className="flex items-center gap-1.5 w-full">
        <input
          type="text"
          value={input}
          readOnly={locked}
          placeholder={placeholder}
          onChange={(e) => {
            setInput(e.target.value);
            setLocked(false);
          }}
          onFocus={() => {
            if (!locked && input.length >= 2) {
              updateDropdownPosition();
              setOpen(suggestions.length > 0);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { setOpen(false); onSearch?.(); }
            if (e.key === "Escape") setOpen(false);
          }}
          className={inputClassName}
        />

        {loading && (
          <Loader2 size={13} className="text-white/40 animate-spin flex-shrink-0" />
        )}
        {locked && input && (
          <button
            type="button"
            onMouseDown={(e) => { e.preventDefault(); clear(); }}
            className="w-4 h-4 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
            title="Effacer"
          >
            <X size={9} className="text-white" />
          </button>
        )}
      </div>

      {dropdown}
    </div>
  );
}
