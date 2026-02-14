"use client";

import { CalendarEvent } from "../types";
import TimeSlot from "./TimeSlot";

interface AgendaGridProps {
    currentDate: Date;
    hours: number[];
    isSlotUnavailable: (date: Date, hour: number) => CalendarEvent | undefined;
    getEventsStartingAtHour: (date: Date, hour: number) => CalendarEvent[];
    renderEventPositioned: (event: CalendarEvent, hour: number, height: number, date: Date) => React.ReactNode;
    onSlotClick: (date: Date) => void;
    onEventClick: (event: CalendarEvent) => void;
    isToday: (date: Date) => boolean;
    MONTHS: string[];
}

export default function AgendaGrid({
    currentDate,
    hours,
    isSlotUnavailable,
    getEventsStartingAtHour,
    renderEventPositioned,
    onSlotClick,
    onEventClick,
    isToday,
    MONTHS
}: AgendaGridProps) {
    return (
        <div className="flex flex-col h-full">
            <div className="grid grid-cols-[60px_1fr] border-b border-gray-100 bg-gray-50/50">
                <div className="h-14" />
                <div className="h-14 flex items-center justify-center font-semibold text-gray-700 border-l border-gray-100">
                    {isToday(currentDate) && (
                        <span className="bg-gradient-to-r from-primary to-primary/80 text-white px-3 py-1 rounded-full text-sm mr-2 shadow-sm">Aujourd'hui</span>
                    )}
                    <span className="text-lg">{currentDate.getDate()}</span>
                    <span className="text-gray-500 ml-1">{MONTHS[currentDate.getMonth()].slice(0, 3)}</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto">
                {hours.map((hour) => {
                    const unavailableSlot = isSlotUnavailable(currentDate, hour);
                    const slotEvents = getEventsStartingAtHour(currentDate, hour);

                    return (
                        <TimeSlot
                            key={hour}
                            hour={hour}
                            unavailableSlot={unavailableSlot}
                            slotEvents={slotEvents}
                            onSlotClick={(h) => {
                                const slotDate = new Date(currentDate);
                                slotDate.setHours(h, 0, 0, 0);
                                onSlotClick(slotDate);
                            }}
                            onEventClick={onEventClick}
                            renderEventPositioned={(e, h) => renderEventPositioned(e, h, 70, currentDate)}
                        />
                    );
                })}
            </div>
        </div>
    );
}
