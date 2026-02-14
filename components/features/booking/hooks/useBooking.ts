"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { jsDayToDbDay } from "@/lib/utils/formatters";

import { Service, OpeningHour, AvailableSlot } from "../types";

export function useBooking(establishmentId: string, openingHours: OpeningHour[]) {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const lastRequestId = useRef(0);
    const supabase = createClient();

    const loadAvailableSlots = useCallback(async (date: Date, service: Service) => {
        setLoadingSlots(true);
        const requestId = ++lastRequestId.current;

        try {
            const dbDayOfWeek = jsDayToDbDay(date.getDay());
            const hours = openingHours.find(h => h.day_of_week === dbDayOfWeek);

            if (!hours || !hours.is_open || !hours.open_time || !hours.close_time) {
                if (requestId === lastRequestId.current) setAvailableSlots([]);
                return;
            }

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            const [appointmentsResponse, unavailabilitiesResponse] = await Promise.all([
                supabase.from("appointments")
                    .select("start_time, end_time")
                    .eq("establishment_id", establishmentId)
                    .gte("start_time", startOfDay.toISOString())
                    .lte("start_time", endOfDay.toISOString())
                    .neq("status", "cancelled"),
                supabase.from("unavailabilities")
                    .select("start_time, end_time")
                    .eq("establishment_id", establishmentId)
                    .lte("start_time", endOfDay.toISOString())
                    .gte("end_time", startOfDay.toISOString())
            ]);

            if (requestId !== lastRequestId.current) return;

            const appointments = appointmentsResponse.data;
            const unavailabilities = unavailabilitiesResponse.data;

            const slots: AvailableSlot[] = [];
            const [openHour, openMin] = hours.open_time.split(":").map(Number);
            const [closeHour, closeMin] = hours.close_time.split(":").map(Number);

            let currentTime = new Date(date);
            currentTime.setHours(openHour, openMin, 0, 0);

            const closeTime = new Date(date);
            closeTime.setHours(closeHour, closeMin, 0, 0);

            const now = new Date();

            while (currentTime < closeTime) {
                const slotEnd = new Date(currentTime.getTime() + service.duration * 60000);
                if (slotEnd > closeTime) break;

                if (currentTime < now) {
                    currentTime = new Date(currentTime.getTime() + 30 * 60000);
                    continue;
                }

                if (hours.break_start && hours.break_end) {
                    const [breakStartH, breakStartM] = hours.break_start.split(":").map(Number);
                    const [breakEndH, breakEndM] = hours.break_end.split(":").map(Number);
                    const breakStart = new Date(date);
                    breakStart.setHours(breakStartH, breakStartM, 0, 0);
                    const breakEnd = new Date(date);
                    breakEnd.setHours(breakEndH, breakEndM, 0, 0);

                    if (currentTime < breakEnd && slotEnd > breakStart) {
                        currentTime = new Date(breakEnd);
                        continue;
                    }
                }

                const hasConflict = appointments?.some(apt => {
                    const aptStart = new Date(apt.start_time);
                    const aptEnd = new Date(apt.end_time);
                    return currentTime < aptEnd && slotEnd > aptStart;
                });

                const isUnavailable = unavailabilities?.some(u => {
                    const uStart = new Date(u.start_time);
                    const uEnd = new Date(u.end_time);
                    return currentTime < uEnd && slotEnd > uStart;
                });

                if (!hasConflict && !isUnavailable) {
                    slots.push({
                        date: new Date(currentTime),
                        time: `${currentTime.getHours().toString().padStart(2, "0")}:${currentTime.getMinutes().toString().padStart(2, "0")}`,
                        endTime: `${slotEnd.getHours().toString().padStart(2, "0")}:${slotEnd.getMinutes().toString().padStart(2, "0")}`,
                    });
                }

                currentTime = new Date(currentTime.getTime() + 30 * 60000);
            }

            setAvailableSlots(slots);
        } catch (error) {
            console.error("Error loading slots:", error);
            if (requestId === lastRequestId.current) setAvailableSlots([]);
        } finally {
            if (requestId === lastRequestId.current) setLoadingSlots(false);
        }
    }, [establishmentId, openingHours, supabase]);

    useEffect(() => {
        if (selectedDate && selectedService) {
            loadAvailableSlots(selectedDate, selectedService);
        }
    }, [selectedDate, selectedService, loadAvailableSlots]);

    return {
        selectedService,
        setSelectedService,
        selectedDate,
        setSelectedDate,
        selectedSlot,
        setSelectedSlot,
        availableSlots,
        loadingSlots,
    };
}
