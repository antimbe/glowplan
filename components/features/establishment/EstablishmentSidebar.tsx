"use client";

import { useState } from "react";
import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DAYS_DB } from "@/lib/utils/formatters";
import { OpeningHour, Service, ClientInfo, BookingStep, AvailableSlot } from "../booking/types";
import { BookingTunnel } from "../booking/BookingTunnel";
import { useBooking } from "../booking/hooks/useBooking";
import { Establishment } from "./types";

interface EstablishmentSidebarProps {
    establishment: Establishment;
    services: Service[];
    openingHours: OpeningHour[];
    onBookingComplete: () => void;
    blockedError: boolean;
    mode?: "booking" | "info";
}

export function EstablishmentSidebar({
    establishment,
    services,
    openingHours,
    onBookingComplete,
    blockedError,
    mode = "booking",
}: EstablishmentSidebarProps) {
    const [step, setStep] = useState<BookingStep>("service");

    const {
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
    } = useBooking(establishment.id, openingHours);

    const [clientInfo, setClientInfo] = useState<ClientInfo>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        instagram: "",
        notes: "",
    });

    const getSortedHours = () => {
        // DB convention: 0=Lundi, 1=Mardi, ..., 6=Dimanche — tri direct
        return [...openingHours].sort((a, b) => a.day_of_week - b.day_of_week);
    };

    const fmt = (t: string | null) => t ? t.substring(0, 5) : "";

    const formatHours = (hour: OpeningHour): string[] => {
        if (!hour.is_open) return ["Fermé"];
        if (hour.break_start && hour.break_end) {
            return [
                `${fmt(hour.open_time)} – ${fmt(hour.break_start)}`,
                `${fmt(hour.break_end)} – ${fmt(hour.close_time)}`,
            ];
        }
        return [`${fmt(hour.open_time)} – ${fmt(hour.close_time)}`];
    };

    const handleSubmitBooking = async () => {
        const result = await confirmBooking(clientInfo);
        if (result.success) {
            onBookingComplete();
        } else {
            alert(`Erreur lors de la réservation : ${result.error}`);
        }
    };

    if (mode === "info") {
        return (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm sticky top-24">
                <div className="space-y-6">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                            <MapPin size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-1">Localisation</p>
                            <p className="text-sm font-bold text-gray-900 leading-relaxed">
                                {establishment.address}<br />
                                {establishment.postal_code} {establishment.city}
                            </p>
                        </div>
                    </div>
                    <div className="pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                <Clock size={20} />
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">Horaires</p>
                        </div>
                        <div className="space-y-1">
                            {getSortedHours().map((hour) => {
                                const slots = formatHours(hour);
                                const isClosed = !hour.is_open;
                                return (
                                    <div key={hour.day_of_week} className="grid grid-cols-[100px_1fr] items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                                        <span className="text-sm font-semibold text-gray-600">{DAYS_DB[hour.day_of_week]}</span>
                                        <div className="flex flex-col gap-0.5">
                                            {slots.map((slot, i) => (
                                                <span key={i} className={cn("text-sm font-bold", isClosed ? "text-red-500" : "text-gray-900")}>{slot}</span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
            <div className="bg-primary p-4 text-white text-center">
                <p className="text-xs font-black uppercase tracking-widest opacity-80">Réservation en direct</p>
            </div>
            <BookingTunnel
                step={step === "service" ? "info" : step}
                setStep={(s) => setStep(s === "info" ? "service" : s)}
                services={services}
                selectedService={selectedService}
                setSelectedService={setSelectedService}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                selectedSlot={selectedSlot}
                setSelectedSlot={setSelectedSlot}
                availableSlots={availableSlots}
                loadingSlots={loadingSlots}
                clientInfo={clientInfo}
                setClientInfo={setClientInfo}
                clientProfileId={null}
                submitting={isConfirming}
                handleSubmitBooking={handleSubmitBooking}
                blockedError={blockedError}
                establishment={establishment}
                openingHours={openingHours}
                cart={cart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
            />
        </div>
    );
}
