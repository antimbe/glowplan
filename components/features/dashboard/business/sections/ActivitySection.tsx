"use client";

import { Scissors, Check } from "lucide-react";
import SectionCard from "../SectionCard";
import { TabProps, ACTIVITY_SECTORS } from "../types";

export default function ActivitySection({ formData, updateField }: TabProps) {
  const toggleSecteur = (id: string) => {
    const newSectors = formData.activity_sectors.includes(id)
      ? formData.activity_sectors.filter(s => s !== id)
      : [...formData.activity_sectors, id];
    updateField("activity_sectors", newSectors);
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
          <Scissors size={20} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-primary text-base lg:text-lg font-bold">Secteur d'activité</h2>
          <p className="text-gray-500 text-[10px] lg:text-xs">Sélectionnez un ou plusieurs secteurs</p>
        </div>
        {formData.activity_sectors.length > 0 && (
          <span className="px-2 lg:px-3 py-1 bg-primary-200 text-primary-700 rounded-full text-[10px] lg:text-xs font-bold flex-shrink-0">
            {formData.activity_sectors.length}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 lg:gap-3">
        {ACTIVITY_SECTORS.map((secteur) => (
          <button
            key={secteur.id}
            onClick={() => toggleSecteur(secteur.id)}
            className={`
              flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3.5 rounded-xl border-2 transition-all text-left cursor-pointer
              ${formData.activity_sectors.includes(secteur.id)
                ? "bg-primary border-primary text-white shadow-lg"
                : "bg-gray-50 border-gray-100 text-gray-700 hover:border-primary/30 hover:bg-white"
              }
            `}
          >
            <div className={`
              w-5 h-5 rounded-md border-2 flex items-center justify-center
              ${formData.activity_sectors.includes(secteur.id) ? "border-white bg-white" : "border-gray-300"}
            `}>
              {formData.activity_sectors.includes(secteur.id) && <Check size={14} className="text-primary" />}
            </div>
            <span className="text-sm font-medium">{secteur.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
