"use client";

import { User, Ban } from "lucide-react";
import { CalendarEvent, UnavailabilityType } from "../types";
import { AGENDA_CONFIG, UNAVAILABILITY_TYPE_LABELS } from "../constants";

interface AgendaEventProps {
    event: CalendarEvent;
    slotHour: number;
    currentDay: Date;
    onEventClick: (event: CalendarEvent) => void;
}

export default function AgendaEvent({
    event,
    slotHour,
    currentDay,
    onEventClick
}: AgendaEventProps) {
    const isAppointment = event.type === "appointment";
    const start = new Date(event.start);
    const end = new Date(event.end);

    let startMinutes = start.getHours() * 60 + start.getMinutes();
    let endMinutes = end.getHours() * 60 + end.getMinutes();

    if (!isAppointment) {
        const dayStart = new Date(currentDay).setHours(0, 0, 0, 0);
        const eventStartDay = new Date(event.start).setHours(0, 0, 0, 0);
        const eventEndDay = new Date(event.end).setHours(0, 0, 0, 0);

        if (dayStart === eventStartDay) {
            // Starts today, ends later or at end of current limit
            endMinutes = Math.min(endMinutes, AGENDA_CONFIG.END_HOUR * 60 + 60); // Include full last hour
        } else if (dayStart === eventEndDay) {
            // Ends today, started earlier
            startMinutes = Math.max(startMinutes, AGENDA_CONFIG.START_HOUR * 60);
        } else {
            // Spans entire day
            startMinutes = AGENDA_CONFIG.START_HOUR * 60;
            endMinutes = (AGENDA_CONFIG.END_HOUR + 1) * 60;
        }
    }

    const topPercent = ((startMinutes - slotHour * 60) / 60) * 100;
    const heightPercent = ((endMinutes - startMinutes) / 60) * 100;

    // Type safe access to data
    const title = event.title;
    let label = title;

    if (event.type === "unavailability") {
        const unavData = event.data as { unavailability_type: UnavailabilityType };
        label = title || UNAVAILABILITY_TYPE_LABELS[unavData.unavailability_type] || "Indisponible";
    }

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onEventClick(event);
            }}
            className={`absolute left-0.5 right-0.5 rounded-md cursor-pointer hover:shadow-lg transition-all overflow-hidden ${isAppointment
                ? "bg-gradient-to-r from-primary to-primary/80 border-l-2 border-primary-dark z-20"
                : "bg-gradient-to-r from-red-500 to-red-400 border-l-2 border-red-600 z-10"
                } text-white text-[10px] lg:text-xs px-1.5 py-0.5`}
            style={{
                top: `${topPercent}%`,
                height: `${heightPercent}%`,
                minHeight: "20px",
            }}
        >
            <div className="font-semibold truncate flex items-center gap-1">
                {isAppointment ? <User size={10} /> : <Ban size={10} />}
                {label}
            </div>
        </div>
    );
}
