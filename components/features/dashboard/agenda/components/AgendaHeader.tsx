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
}

export default function AgendaHeader({
    view,
    formatDateHeader,
    onNavigatePrev,
    onNavigateNext,
    onGoToToday,
    onViewChange
}: AgendaHeaderProps) {
    return (
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
    );
}
