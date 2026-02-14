"use client";

import { CalendarEvent } from "../types";

interface TimeSlotProps {
    hour: number;
    unavailableSlot?: CalendarEvent;
    slotEvents: CalendarEvent[];
    onSlotClick: (hour: number) => void;
    onEventClick: (event: CalendarEvent) => void;
    renderEventPositioned: (event: CalendarEvent, hour: number) => React.ReactNode;
}

export default function TimeSlot({
    hour,
    unavailableSlot,
    slotEvents,
    onSlotClick,
    onEventClick,
    renderEventPositioned
}: TimeSlotProps) {
    return (
        <div className="grid grid-cols-[60px_1fr] h-[70px] border-b border-gray-50 hover:bg-primary/[0.02] transition-colors">
            <div className="text-xs text-gray-400 text-right pr-3 pt-2 font-medium">
                {hour.toString().padStart(2, "0")}:00
            </div>
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
                {slotEvents.map(event => renderEventPositioned(event, hour))}
            </div>
        </div>
    );
}
