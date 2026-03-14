"use client";

import { useState, useEffect } from "react";
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
    blockedError?: boolean;
    mode?: "booking" | "info";
    clientProfileId?: string | null;
    initialClientInfo?: Partial<ClientInfo>;
}

export function EstablishmentSidebar({
    establishment,
    services,
    openingHours,
    onBookingComplete,
    blockedError,
    mode = "booking",
    clientProfileId = null,
    initialClientInfo = {}
}: EstablishmentSidebarProps) {
    const [step, setStep] = useState<BookingStep>("info");

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
        prepareEdit,
        editingIndex,
        setEditingIndex,
        confirmBooking,
        isConfirming,
    } = useBooking(establishment.id, openingHours);

    const [clientInfo, setClientInfo] = useState<ClientInfo>({
        firstName: initialClientInfo?.firstName || "",
        lastName: initialClientInfo?.lastName || "",
        email: initialClientInfo?.email || "",
        phone: initialClientInfo?.phone || "",
        instagram: initialClientInfo?.instagram || "",
        notes: "",
    });

    // Force update whenever initialClientInfo receives valid data
    useEffect(() => {
        if (initialClientInfo && Object.keys(initialClientInfo).length > 0) {
            setClientInfo(prev => {
                // Seulement remplacer si la valeur est arrivée (non-vide)
                return {
                    ...prev,
                    firstName: initialClientInfo.firstName || prev.firstName,
                    lastName: initialClientInfo.lastName || prev.lastName,
                    email: initialClientInfo.email || prev.email,
                    phone: initialClientInfo.phone || prev.phone,
                    instagram: initialClientInfo.instagram || prev.instagram,
                };
            });
        }
    }, [initialClientInfo?.firstName, initialClientInfo?.lastName, initialClientInfo?.email, initialClientInfo?.phone, initialClientInfo?.instagram]);


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

    const formatDay = (dayIndex: number): string => {
        return DAYS_DB[dayIndex];
    };

    const handleSubmitBooking = async () => {
        const result = await confirmBooking(clientInfo);
        if (result.success) {
            setStep("confirmation");
            onBookingComplete();
        } else {
            alert(`Erreur lors de la réservation : ${result.error}`);
        }
    };

    if (mode === "info") {
        return (
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl shadow-gray-200/50 sticky top-24">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <MapPin size={20} className="text-primary" />
                            </div>
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Localisation</h3>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4">
                            {!establishment.hide_exact_address && (
                                <p className="font-bold text-gray-900">{establishment.address}</p>
                            )}
                            <p className="text-gray-500 font-medium">{establishment.postal_code} {establishment.city}</p>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Clock size={20} className="text-primary" />
                            </div>
                            <h3 className="font-black text-gray-900 uppercase tracking-widest text-[10px]">Horaires</h3>
                        </div>
                        <div className="space-y-2">
                            {getSortedHours().map((hours) => (
                                <div key={hours.day_of_week} className="flex justify-between items-start text-sm py-1 border-b border-gray-50 last:border-0">
                                    <span className="text-gray-500 font-medium">{formatDay(hours.day_of_week)}</span>
                                    <div className="text-right">
                                        {formatHours(hours).map((slot, i) => (
                                            <span key={i} className={cn("font-bold block", hours.is_open ? "text-gray-900" : "text-red-500")}>
                                                {slot}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="bg-primary p-4 text-white text-center">
                <p className="text-xs font-black uppercase tracking-widest opacity-80">Réservation en direct</p>
            </div>
            <BookingTunnel
                step={step}
                setStep={setStep}
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
                clientProfileId={clientProfileId}
                submitting={isConfirming}
                handleSubmitBooking={handleSubmitBooking}
                blockedError={blockedError || false}
                establishment={establishment}
                openingHours={openingHours}
                cart={cart}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                prepareEdit={prepareEdit}
                editingIndex={editingIndex}
                setEditingIndex={setEditingIndex}
            />
        </div>
    );
}
