"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { CalendarViewType } from "../types";

interface AgendaHeaderProps {
    currentDate: Date;
    view: CalendarViewType;
    formatDateHeader: (short?: boolean) => string;
    onNavigatePrev: () => void;
    onNavigateNext: () => void;
    onGoToToday: () => void;
    onViewChange: (view: CalendarViewType) => void;
    filters: { showAppointments: boolean; showUnavailabilities: boolean; showCancelled: boolean };
    onFiltersChange: (filters: { showAppointments: boolean; showUnavailabilities: boolean; showCancelled: boolean }) => void;
}

export default function AgendaHeader({
    view,
    formatDateHeader,
    onNavigatePrev,
    onNavigateNext,
    onGoToToday,
    onViewChange,
    filters,
    onFiltersChange
}: AgendaHeaderProps) {
    return (
        <>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-3 lg:p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white gap-2 lg:gap-0">
            <div className="flex items-center justify-between lg:justify-start gap-2 lg:gap-3">
                <div className="flex items-center gap-0.5 bg-white rounded-lg border border-gray-200 p-0.5 shadow-sm">
                    <button
                        onClick={onNavigatePrev}
                        className="w-8 h-8 rounded-md hover:bg-primary/5 flex items-center justify-center text-gray-500 hover:text-primary cursor-pointer transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={onNavigateNext}
                        className="w-8 h-8 rounded-md hover:bg-primary/5 flex items-center justify-center text-gray-500 hover:text-primary cursor-pointer transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
                <button
                    onClick={onGoToToday}
                    className="px-3 py-1.5 text-xs lg:text-sm font-semibold text-primary bg-primary/5 hover:bg-primary/10 rounded-lg cursor-pointer transition-colors border border-primary/20"
                >
                    Aujourd'hui
                </button>
                <h2 className="text-sm lg:text-lg font-bold text-gray-800 lg:ml-2">
                    <span className="hidden lg:inline">{formatDateHeader()}</span>
                    <span className="lg:hidden">{formatDateHeader(true)}</span>
                </h2>
            </div>

            {/* Filtres de type */}
            <div className="flex items-center gap-1.5 bg-gray-50/50 p-1 rounded-xl border border-gray-100">
                <button
                    onClick={() => onFiltersChange({ ...filters, showAppointments: !filters.showAppointments })}
                    className={`px-2.5 py-1.5 text-[10px] lg:text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border ${
                        filters.showAppointments 
                        ? "bg-white text-primary border-primary/20" 
                        : "bg-transparent text-gray-400 border-transparent hover:text-gray-600"
                    }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${filters.showAppointments ? "bg-primary shadow-[0_0_4px_rgba(var(--primary-rgb),0.5)]" : "bg-gray-300"}`} />
                    RDV
                </button>
                <button
                    onClick={() => onFiltersChange({ ...filters, showUnavailabilities: !filters.showUnavailabilities })}
                    className={`px-2.5 py-1.5 text-[10px] lg:text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border ${
                        filters.showUnavailabilities 
                        ? "bg-white text-red-600 border-red-100" 
                        : "bg-transparent text-gray-400 border-transparent hover:text-gray-600"
                    }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${filters.showUnavailabilities ? "bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.5)]" : "bg-gray-300"}`} />
                    Indispo.
                </button>
                <button
                    onClick={() => onFiltersChange({ ...filters, showCancelled: !filters.showCancelled })}
                    className={`px-2.5 py-1.5 text-[10px] lg:text-xs font-medium rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-sm border ${
                        filters.showCancelled 
                        ? "bg-white text-gray-600 border-gray-200" 
                        : "bg-transparent text-gray-400 border-transparent hover:text-gray-600"
                    }`}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${filters.showCancelled ? "bg-gray-500 shadow-[0_0_4px_rgba(107,114,128,0.5)]" : "bg-gray-300"}`} />
                    Annulés
                </button>
            </div>

            <div className="flex bg-gray-100/80 rounded-xl p-1 shadow-inner">
                {(["day", "week", "month"] as CalendarViewType[]).map((v) => (
                    <button
                        key={v}
                        onClick={() => onViewChange(v)}
                        className={`flex-1 lg:flex-none px-3 lg:px-4 py-1.5 lg:py-2 text-xs lg:text-sm font-semibold rounded-lg transition-all cursor-pointer ${view === v
                                ? "bg-white text-primary shadow-md"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                            }`}
                    >
                        {v === "day" ? "Jour" : v === "week" ? "Semaine" : "Mois"}
                    </button>
                ))}
            </div>
        </div>

        {/* Légende des couleurs */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-3 lg:px-4 py-2 border-t border-gray-100 bg-gray-50/60 text-[10px] text-gray-500">
            <span className="font-semibold text-gray-400 uppercase tracking-wider mr-1 hidden lg:inline">Légende :</span>
            <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-primary to-primary/80 inline-block flex-shrink-0" />
                RDV confirmé / en attente
            </span>
            <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-gray-500 to-gray-400 inline-block flex-shrink-0" />
                Honoré (passé)
            </span>
            <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-orange-500 to-orange-400 inline-block flex-shrink-0" />
                No-show (lapin)
            </span>
            <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-red-500 to-red-400 inline-block flex-shrink-0" />
                Indisponibilité
            </span>
            <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-300 inline-block flex-shrink-0 opacity-60" />
                Annulé
            </span>
        </div>
        </>
    );
}
