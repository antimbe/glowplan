"use client";

import { Image as ImageIcon, Camera, Plus } from "lucide-react";
import { TabProps } from "../types";

export default function PhotosSection({ formData, updateField }: TabProps) {
  return (
    <div className="w-full bg-white rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg flex-shrink-0">
          <ImageIcon size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-[#2a3626] text-base lg:text-lg font-bold">Photos & Visuels</h2>
          <p className="text-gray-500 text-[10px] lg:text-xs">Ajoutez jusqu'à 8 photos pour votre vitrine</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-4">
          <FormatOption
            label="Format logo"
            value={formData.logo_format}
            onChange={(value) => updateField("logo_format", value)}
          />
          <FormatOption
            label="Format photos"
            value={formData.photo_format}
            onChange={(value) => updateField("photo_format", value)}
          />
          <DisplayOption
            label="Affichage"
            value={formData.photo_display}
            onChange={(value) => updateField("photo_display", value)}
          />
        </div>

        <div className="grid grid-cols-4 gap-2 lg:gap-4">
          <div className="aspect-square bg-[#2a3626]/10 rounded-xl lg:rounded-2xl border-2 border-dashed border-[#2a3626]/40 flex flex-col items-center justify-center cursor-pointer hover:bg-[#2a3626]/20 transition-all">
            <div className="w-8 h-8 lg:w-14 lg:h-14 rounded-full bg-white shadow-lg flex items-center justify-center mb-1 lg:mb-3">
              <Camera size={16} className="text-[#2a3626] lg:hidden" />
              <Camera size={24} className="text-[#2a3626] hidden lg:block" />
            </div>
            <span className="text-[#2a3626] text-[8px] lg:text-xs font-semibold text-center px-1">Photo principale</span>
          </div>
          
          {[...Array(7)].map((_, i) => (
            <div 
              key={i}
              className="aspect-square bg-gray-50 rounded-xl lg:rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#2a3626]/30 transition-all"
            >
              <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1 lg:mb-2">
                <Plus size={14} className="text-gray-400 lg:hidden" />
                <Plus size={20} className="text-gray-400 hidden lg:block" />
              </div>
              <span className="text-gray-400 text-[8px] lg:text-[10px]">Photo {i + 2}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface FormatOptionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function FormatOption({ label, value, onChange }: FormatOptionProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 lg:p-4 border border-gray-100">
      <p className="text-[10px] lg:text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 lg:mb-3">{label}</p>
      <div className="flex gap-1">
        <button
          onClick={() => onChange("generate")}
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
            value === "generate" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Générer
        </button>
        <button
          onClick={() => onChange("fixed")}
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
            value === "fixed" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Fixé
        </button>
      </div>
    </div>
  );
}

function DisplayOption({ label, value, onChange }: FormatOptionProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 lg:p-4 border border-gray-100">
      <p className="text-[10px] lg:text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 lg:mb-3">{label}</p>
      <div className="flex gap-1">
        <button
          onClick={() => onChange("fill")}
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
            value === "fill" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Rempli
        </button>
        <button
          onClick={() => onChange("contain")}
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
            value === "contain" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Entier
        </button>
      </div>
    </div>
  );
}
