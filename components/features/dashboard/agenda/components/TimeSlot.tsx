"use client";

import { CalendarEvent } from "../types";
import { AGENDA_CONFIG } from "../constants";
import AgendaEvent from "./AgendaEvent";

interface TimeSlotProps {
    hour: number;
    currentDay: Date;
    unavailableSlot?: CalendarEvent;
    slotEvents: CalendarEvent[];
    onSlotClick: (hour: number) => void;
    onEventClick: (event: CalendarEvent) => void;
    showTimeColumn?: boolean;
}

export default function TimeSlot({
    hour,
    currentDay,
    unavailableSlot,
    slotEvents,
    onSlotClick,
    onEventClick,
    showTimeColumn = true
}: TimeSlotProps) {
    return (
        <div
            className={`grid ${showTimeColumn ? "grid-cols-[60px_1fr]" : "grid-cols-1"} border-b border-gray-50 hover:bg-primary/[0.02] transition-colors`}
            style={{ height: `${AGENDA_CONFIG.SLOT_HEIGHT_PX}px` }}
        >
            {showTimeColumn && (
                <div className="text-xs text-gray-400 text-right pr-3 pt-2 font-medium">
                    {hour.toString().padStart(2, "0")}:00
                </div>
            )}
            <div
                className={`border-l border-gray-100 relative group ${unavailableSlot ? "cursor-not-allowed" : "cursor-pointer"
                    }`}
                onClick={() => {
                    if (unavailableSlot) {
                        onEventClick(unavailableSlot);
                        return;
                    }
                    onSlotClick(hour);
                }}
            >
                {!unavailableSlot && (
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-r-lg" />
                )}
                {slotEvents.map(event => (
                    <AgendaEvent
                        key={event.id}
                        event={event}
                        slotHour={hour}
                        currentDay={currentDay}
                        onEventClick={onEventClick}
                    />
                ))}
            </div>
        </div>
    );
}
