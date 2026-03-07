"use client";

import { useEffect, useState } from "react";
import { AGENDA_CONFIG } from "../constants";

interface TimeIndicatorProps {
    showLabel?: boolean;
}

export default function TimeIndicator({ showLabel = true }: TimeIndicatorProps) {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setNow(new Date());
        }, 60000); // Update every minute

        return () => clearInterval(timer);
    }, []);

    const hours = now.getHours();
    const minutes = now.getMinutes();

    // Check if current time is within agenda range
    if (hours < AGENDA_CONFIG.START_HOUR || hours > AGENDA_CONFIG.END_HOUR) {
        return null;
    }

    const minutesSinceStart = (hours - AGENDA_CONFIG.START_HOUR) * 60 + minutes;
    const top = (minutesSinceStart * AGENDA_CONFIG.SLOT_HEIGHT_PX) / 60;

    return (
        <div
            className="absolute left-0 right-0 z-20 pointer-events-none flex items-center"
            style={{ top: `${top}px` }}
        >
            {/* The line */}
            <div className="flex-1 h-0.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />

            {/* The indicator dot/pill */}
            <div className="absolute -left-1 w-3 h-3 rounded-full bg-red-600 border-2 border-white shadow-sm flex-shrink-0" />

            {/* Optional time label */}
            {showLabel && (
                <div className="absolute -left-14 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-sm">
                    {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
                </div>
            )}
        </div>
    );
}
