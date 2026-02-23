import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { jsDayToDbDay } from "@/lib/utils/formatters";
import { fetchOccupationData } from "@/lib/utils/booking-fetcher";
import { getAvailableSlots } from "@/lib/utils/booking-utils";
import { startOfDay, endOfDay, parseISO } from "date-fns";

import { Service, OpeningHour, AvailableSlot, CartItem, ClientInfo } from "../types";

export function useBooking(establishmentId: string, openingHours: OpeningHour[]) {
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isConfirming, setIsConfirming] = useState(false);

    // TTL pour le panier (vage de 20 min d'inactivité)
    useEffect(() => {
        if (cart.length === 0) return;

        const timer = setTimeout(() => {
            setCart([]);
            alert("Votre panier a expiré après 20 minutes d'inactivité.");
        }, 20 * 60 * 1000);

        return () => clearTimeout(timer);
    }, [cart]);

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

            const dayStart = new Date(date);
            const [openH, openM] = hours.open_time.split(":").map(Number);
            dayStart.setHours(openH, openM, 0, 0);

            const dayEnd = new Date(date);
            const [closeH, closeM] = hours.close_time.split(":").map(Number);
            dayEnd.setHours(closeH, closeM, 0, 0);

            const { appointments, unavailabilities } = await fetchOccupationData(
                establishmentId,
                startOfDay(date).toISOString(),
                endOfDay(date).toISOString()
            );

            if (requestId !== lastRequestId.current) return;

            // Préparation des occupations pour l'intervalleur
            const occupied = [
                ...appointments.map(a => ({ start_time: a.start_time, end_time: a.end_time, type: 'appointment', id: a.id })),
                ...unavailabilities.map(u => ({ start_time: u.start_time, end_time: u.end_time, type: 'unavailability', id: u.id }))
            ];

            // Gestion de la pause déjeuner comme une indisponibilité si configurée
            if (hours.break_start && hours.break_end) {
                const breakStart = new Date(date);
                const [bSH, bSM] = hours.break_start.split(":").map(Number);
                breakStart.setHours(bSH, bSM, 0, 0);

                const breakEnd = new Date(date);
                const [bEH, bEM] = hours.break_end.split(":").map(Number);
                breakEnd.setHours(bEH, bEM, 0, 0);

                occupied.push({
                    id: 'break',
                    start_time: breakStart.toISOString(),
                    end_time: breakEnd.toISOString(),
                    type: 'unavailability'
                });
            }

            // Calcul des créneaux via l'intervalleur
            const calculatedSlots = getAvailableSlots(dayStart, dayEnd, service.duration, occupied as any);

            const formattedSlots: AvailableSlot[] = calculatedSlots.map(s => ({
                date: s.start,
                time: `${s.start.getHours().toString().padStart(2, "0")}:${s.start.getMinutes().toString().padStart(2, "0")}`,
                endTime: `${s.end.getHours().toString().padStart(2, "0")}:${s.end.getMinutes().toString().padStart(2, "0")}`,
            }));

            setAvailableSlots(formattedSlots);
        } catch (error) {
            console.error("Error loading slots:", error);
            if (requestId === lastRequestId.current) setAvailableSlots([]);
        } finally {
            if (requestId === lastRequestId.current) setLoadingSlots(false);
        }
    }, [establishmentId, openingHours]);

    const addToCart = useCallback(() => {
        if (selectedService && selectedSlot) {
            setCart(prev => [...prev, { service: selectedService, slot: selectedSlot }]);
            setSelectedSlot(null);
            // On pourrait aussi réinitialiser la date si on veut forcer un nouveau choix
        }
    }, [selectedService, selectedSlot]);

    const removeFromCart = useCallback((index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    }, []);

    const confirmBooking = useCallback(async (clientInfo: ClientInfo) => {
        setIsConfirming(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const payload = cart.map(item => ({
                service_id: item.service.id,
                start_time: item.slot.date.toISOString(),
                end_time: new Date(item.slot.date.getTime() + item.service.duration * 60000).toISOString(),
                client_name: `${clientInfo.firstName} ${clientInfo.lastName}`,
                client_email: clientInfo.email,
                client_phone: clientInfo.phone,
                client_first_name: clientInfo.firstName,
                client_last_name: clientInfo.lastName,
                client_profile_id: user?.id, // À ajuster selon si c'est le client_profile.id ou auth.user.id
            }));

            const { data, error } = await supabase.rpc('process_booking_cart', {
                p_establishment_id: establishmentId,
                p_items: payload,
                p_user_id: user?.id
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);

            setCart([]);
            return { success: true, appointmentIds: data.appointment_ids };
        } catch (error: any) {
            console.error("Booking confirmation error:", error);
            return { success: false, error: error.message };
        } finally {
            setIsConfirming(false);
        }
    }, [cart, establishmentId, supabase]);

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
        cart,
        addToCart,
        removeFromCart,
        confirmBooking,
        isConfirming,
    };
}
