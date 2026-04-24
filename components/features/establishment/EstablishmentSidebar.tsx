"use client";

import { useState, useEffect } from "react";
import { MapPin, Clock, Phone, Instagram, Globe, ExternalLink, AlertTriangle } from "lucide-react";
import { useModal } from "@/contexts/ModalContext";
import { motion } from "framer-motion";
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
    const [isBlocked, setIsBlocked] = useState(blockedError || false);
    const { showError } = useModal();

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
        const result = await confirmBooking(clientInfo, establishment.require_deposit, establishment.auto_confirm_appointments);
        if (result.success) {
            setStep("confirmation");
            onBookingComplete();
        } else if (result.error === "BLOCKED") {
            setIsBlocked(true);
        } else {
            showError("Erreur de réservation", result.error || "Une erreur est survenue. Veuillez réessayer.");
        }
    };

    if (mode === "info") {
        const todayIdx = (new Date().getDay() + 6) % 7; // 0=Lundi
        const sortedHours = getSortedHours();
        const todayHours = sortedHours.find(h => h.day_of_week === todayIdx);
        const isOpenToday = todayHours?.is_open;

        const infoRows = [
            establishment.phone && {
                icon: Phone, label: "Téléphone",
                value: establishment.phone,
                href: `tel:${establishment.phone}`
            },
            establishment.instagram && {
                icon: Instagram, label: "Instagram",
                value: `@${establishment.instagram.replace(/^@/, "")}`,
                href: `https://instagram.com/${establishment.instagram.replace(/^@/, "")}`
            },
            establishment.website && {
                icon: Globe, label: "Site web",
                value: establishment.website.replace(/^https?:\/\//, ""),
                href: establishment.website
            },
        ].filter(Boolean) as Array<{ icon: any; label: string; value: string; href: string }>;

        return (
            <motion.div
                className="space-y-4 lg:sticky lg:top-24"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
                {/* Open status badge */}
                {todayHours && (
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[12px] font-bold border",
                        isOpenToday
                            ? "bg-green-50 text-green-700 border-green-100"
                            : "bg-red-50 text-red-600 border-red-100"
                    )}>
                        <span className={cn("w-2 h-2 rounded-full shrink-0", isOpenToday ? "bg-green-500" : "bg-red-400")} />
                        {isOpenToday
                            ? `Ouvert aujourd'hui · ${formatHours(todayHours).join(", ")}`
                            : "Fermé aujourd'hui"}
                    </div>
                )}

                {/* Localisation */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl shadow-gray-200/50">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-[#32422c]/8 flex items-center justify-center">
                            <MapPin size={15} className="text-[#32422c]" />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">Localisation</h3>
                    </div>
                    {!establishment.hide_exact_address ? (
                        <div>
                            <p className="font-black text-gray-900 text-[14px]">{establishment.address}</p>
                            <p className="text-[13px] text-gray-400 font-medium mt-0.5">{establishment.postal_code} {establishment.city}</p>
                            <a
                                href={`https://maps.google.com/?q=${encodeURIComponent(`${establishment.address} ${establishment.city}`)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-3 text-[12px] font-bold text-[#32422c] hover:text-[#c0a062] transition-colors"
                            >
                                <ExternalLink size={11} />
                                Voir sur Google Maps
                            </a>
                        </div>
                    ) : (
                        <div className="flex items-start gap-3 bg-amber-50/80 border border-amber-100 rounded-2xl p-3">
                            <AlertTriangle size={14} className="text-amber-500 shrink-0 mt-0.5" />
                            <p className="text-[12px] text-amber-700 font-medium leading-relaxed">
                                L'adresse exacte vous sera communiquée 24h avant votre rendez-vous.
                            </p>
                        </div>
                    )}
                </div>

                {/* Horaires */}
                <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl shadow-gray-200/50">
                    <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-xl bg-[#32422c]/8 flex items-center justify-center">
                            <Clock size={15} className="text-[#32422c]" />
                        </div>
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em]">Horaires</h3>
                    </div>
                    <div className="space-y-1.5">
                        {sortedHours.map((h) => {
                            const isToday = h.day_of_week === todayIdx;
                            return (
                                <div
                                    key={h.day_of_week}
                                    className={cn(
                                        "flex justify-between items-start py-1.5 px-2.5 rounded-xl transition-colors text-[13px]",
                                        isToday ? "bg-[#32422c]/[0.06]" : "hover:bg-gray-50"
                                    )}
                                >
                                    <span className={cn("font-bold", isToday ? "text-[#32422c]" : "text-gray-500")}>
                                        {formatDay(h.day_of_week)}
                                        {isToday && <span className="ml-1.5 text-[9px] bg-[#32422c] text-white rounded-full px-1.5 py-0.5 font-black uppercase tracking-wide">Auj.</span>}
                                    </span>
                                    <div className="text-right">
                                        {formatHours(h).map((slot, i) => (
                                            <span key={i} className={cn("font-bold block", h.is_open ? (isToday ? "text-[#32422c]" : "text-gray-900") : "text-red-400")}>
                                                {slot}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Contact */}
                {infoRows.length > 0 && (
                    <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xl shadow-gray-200/50">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-4">Contact</h3>
                        <div className="space-y-3">
                            {infoRows.map(({ icon: Icon, label, value, href }) => (
                                <a
                                    key={label}
                                    href={href}
                                    target={href.startsWith("http") ? "_blank" : undefined}
                                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                                    className="flex items-center gap-3 group cursor-pointer"
                                >
                                    <div className="w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-[#32422c]/8 flex items-center justify-center transition-colors">
                                        <Icon size={14} className="text-gray-400 group-hover:text-[#32422c] transition-colors" />
                                    </div>
                                    <span className="text-[13px] font-bold text-gray-700 group-hover:text-[#32422c] transition-colors truncate">
                                        {value}
                                    </span>
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
            <div className="bg-gradient-to-r from-[#32422c] to-[#3d5235] px-5 py-4 text-white flex items-center gap-3">
                <div className="w-7 h-7 rounded-xl bg-white/10 flex items-center justify-center">
                    <Clock size={14} className="text-[#c0a062]" />
                </div>
                <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-white/60">Réservation en direct</p>
                    <p className="text-[13px] font-bold text-white leading-tight">Choisissez votre créneau</p>
                </div>
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
                blockedError={isBlocked}
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
