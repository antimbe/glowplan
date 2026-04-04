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
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
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

    const addToCart = useCallback((): { success: boolean; error?: string } => {
        if (!selectedService || !selectedSlot) return { success: false, error: "Aucune prestation ou créneau sélectionné." };

        const newStart = selectedSlot.date.getTime();
        const newEnd = newStart + selectedService.duration * 60000;

        // Vérifier les chevauchements avec les articles déjà dans le panier
        const overlap = cart.find((item, index) => {
            // Si on est en train d'éditer cet item précisément, on ne le compte pas comme un chevauchement
            if (editingIndex === index) return false;

            const itemStart = item.slot.date.getTime();
            const itemEnd = itemStart + item.service.duration * 60000;
            return newStart < itemEnd && newEnd > itemStart;
        });

        if (overlap) {
            return {
                success: false,
                error: `Ce créneau (${selectedSlot.time}) chevauche déjà "${overlap.service.name}" à ${overlap.slot.time}. Veuillez choisir un autre créneau.`,
            };
        }

        if (editingIndex !== null) {
            // Remplacer l'item existant si on est en mode édition
            setCart(prev => {
                const newCart = [...prev];
                newCart[editingIndex] = { service: selectedService, slot: selectedSlot };
                return newCart;
            });
            setEditingIndex(null);
        } else {
            // Ajouter un nouvel item
            setCart(prev => [...prev, { service: selectedService, slot: selectedSlot }]);
        }

        setSelectedSlot(null);
        return { success: true };
    }, [selectedService, selectedSlot, cart, editingIndex]);

    const prepareEdit = useCallback((index: number) => {
        const item = cart[index];
        if (!item) return;

        setSelectedService(item.service);
        setSelectedDate(item.slot.date);
        setSelectedSlot(item.slot);
        setEditingIndex(index);
    }, [cart]);

    const removeFromCart = useCallback((index: number) => {
        setCart(prev => prev.filter((_, i) => i !== index));
        if (editingIndex === index) {
            setEditingIndex(null);
        }
    }, [editingIndex]);

    const confirmBooking = useCallback(async (clientInfo: ClientInfo, requireDeposit = false, autoConfirm = false) => {
        setIsConfirming(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            let profileId = null;

            if (user) {
                const { data: profile } = await supabase
                    .from("client_profiles")
                    .select("id")
                    .eq("user_id", user.id)
                    .single();
                if (profile) profileId = profile.id;
            }

            const payload = cart.map(item => ({
                service_id: item.service.id,
                start_time: item.slot.date.toISOString(),
                end_time: new Date(item.slot.date.getTime() + item.service.duration * 60000).toISOString(),
                client_name: `${clientInfo.firstName} ${clientInfo.lastName}`,
                client_email: clientInfo.email,
                client_phone: clientInfo.phone,
                client_first_name: clientInfo.firstName,
                client_last_name: clientInfo.lastName,
                client_profile_id: profileId,
            }));

            const { data, error } = await supabase.rpc('process_booking_cart', {
                p_establishment_id: establishmentId,
                p_items: payload,
                p_user_id: user?.id
            });

            if (error) throw error;
            if (!data.success) throw new Error(data.error);
            // Golden Rule for Status
            // 1. If deposit required => pending_deposit (overrides auto_confirm)
            // 2. If no deposit AND auto_confirm => confirmed
            // 3. Otherwise => pending (handled by default in RPC or we force it here to be safe)
            if (data.appointment_ids && data.appointment_ids.length > 0) {
                let finalStatus = 'pending';
                if (requireDeposit) {
                    finalStatus = 'pending_deposit';
                } else if (autoConfirm) {
                    finalStatus = 'confirmed';
                }

                await supabase
                    .from("appointments")
                    .update({ status: finalStatus })
                    .in("id", data.appointment_ids);
            }

            setCart([]);

            // Trigger notifications for each appointment created in parallel
            if (data.appointment_ids && data.appointment_ids.length > 0) {
                await Promise.all(data.appointment_ids.map((appointmentId: string) => 
                    fetch("/api/booking/notify", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ 
                            appointmentId, 
                            establishmentId, 
                            autoConfirm: !requireDeposit && autoConfirm
                        }),
                    })
                ));
            }

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
        prepareEdit,
        editingIndex,
        setEditingIndex,
        confirmBooking,
        isConfirming,
    };
}
