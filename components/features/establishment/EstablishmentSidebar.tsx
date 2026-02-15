"use client";

import { useState } from "react";
import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { DAYS_DB } from "@/lib/utils/formatters";
import { OpeningHour, Service, ClientInfo, BookingStep, AvailableSlot } from "../booking/types";
import { BookingTunnel } from "../booking/BookingTunnel";
import { Establishment } from "./types";

interface EstablishmentSidebarProps {
    establishment: Establishment;
    services: Service[];
    openingHours: OpeningHour[];
    onBookingComplete: () => void;
    blockedError: boolean;
}

export function EstablishmentSidebar({
    establishment,
    services,
    openingHours,
    onBookingComplete,
    blockedError
}: EstablishmentSidebarProps) {
    const [step, setStep] = useState<BookingStep>("service");
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
    const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    const [clientInfo, setClientInfo] = useState<ClientInfo>({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        instagram: "",
        notes: "",
    });

    const getSortedHours = () => {
        return [...openingHours].sort((a, b) => {
            const aDay = a.day_of_week === 0 ? 7 : a.day_of_week;
            const bDay = b.day_of_week === 0 ? 7 : b.day_of_week;
            return aDay - bDay;
        });
    };

    const formatHours = (hour: OpeningHour) => {
        if (!hour.is_open) return "Fermé";
        let result = `${hour.open_time} - ${hour.close_time}`;
        if (hour.break_start && hour.break_end) {
            result = `${hour.open_time} - ${hour.break_start}, ${hour.break_end} - ${hour.close_time}`;
        }
        return result;
    };

    const handleSubmitBooking = async () => {
        // Logique de soumission simplifiée pour le walkthrough
        // En réalité, on appellerait une API ou une fonction passée en prop
        onBookingComplete();
    };

    return (
        <div className="space-y-6 sticky top-24">
            {/* Booking Card */}
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
                    clientProfileId={null} // À passer via props si besoin
                    submitting={false}
                    handleSubmitBooking={handleSubmitBooking}
                    blockedError={blockedError}
                    establishment={establishment}
                    openingHours={openingHours}
                />
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                <div className="space-y-6">
                    {/* Address */}
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

                    {/* Opening Hours */}
                    <div className="pt-6 border-t border-gray-50">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                <Clock size={20} />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Horaires</p>
                            </div>
                        </div>
                        <div className="space-y-2.5">
                            {getSortedHours().map((hour) => (
                                <div key={hour.day_of_week} className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">{DAYS_DB[hour.day_of_week]}</span>
                                    <span className={cn(
                                        "font-bold",
                                        hour.is_open ? "text-gray-900" : "text-red-500"
                                    )}>
                                        {formatHours(hour)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
