"use client";

import { Check, Clock, Calendar, ArrowRight, ChevronLeft, User, Mail, Phone, Instagram, FileText, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Service, AvailableSlot, ClientInfo, BookingStep, OpeningHour } from "./types";

interface BookingTunnelProps {
    step: BookingStep;
    setStep: (step: BookingStep) => void;
    services: Service[];
    selectedService: Service | null;
    setSelectedService: (service: Service | null) => void;
    selectedDate: Date | null;
    setSelectedDate: (date: Date | null) => void;
    selectedSlot: AvailableSlot | null;
    setSelectedSlot: (slot: AvailableSlot | null) => void;
    availableSlots: AvailableSlot[];
    loadingSlots: boolean;
    clientInfo: ClientInfo;
    setClientInfo: (info: ClientInfo) => void;
    clientProfileId: string | null;
    submitting: boolean;
    handleSubmitBooking: () => Promise<void>;
    blockedError: boolean;
    establishment: any;
    openingHours: OpeningHour[];
}

export function BookingTunnel({
    step,
    setStep,
    services,
    selectedService,
    setSelectedService,
    selectedDate,
    setSelectedDate,
    selectedSlot,
    setSelectedSlot,
    availableSlots,
    loadingSlots,
    clientInfo,
    setClientInfo,
    clientProfileId,
    submitting,
    handleSubmitBooking,
    blockedError,
    establishment,
    openingHours
}: BookingTunnelProps) {
    const router = useRouter();

    const getNext14Days = () => {
        const days: Date[] = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            days.push(date);
        }
        return days;
    };

    const isDateAvailable = (date: Date) => {
        const dayOfWeek = date.getDay();
        // Convert JS day (0-6, Sun-Sat) to DB day (0-6, Mon-Sun)
        const dbDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const hours = openingHours.find(h => h.day_of_week === dbDay);
        return hours?.is_open ?? false;
    };

    if (step === "info") {
        return (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Prestations</h2>
                {services.length > 0 ? (
                    <div className="space-y-3">
                        {services.map((service) => (
                            <button
                                key={service.id}
                                onClick={() => {
                                    setSelectedService(service);
                                    setStep("datetime");
                                }}
                                className="w-full p-4 border border-gray-200 rounded-xl hover:border-primary/30 hover:shadow-md transition-all text-left group cursor-pointer"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                            {service.name}
                                        </h3>
                                        {service.description && (
                                            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                                        )}
                                        <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
                                            <span className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {service.duration} min
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-bold text-primary">{service.price}€</span>
                                        <ArrowRight size={20} className="text-gray-300 group-hover:text-primary transition-colors ml-auto mt-2" />
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">Aucune prestation disponible</p>
                )}
            </div>
        );
    }

    if (step === "datetime" && selectedService) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <Button
                    variant="ghost"
                    onClick={() => {
                        setStep("info");
                        setSelectedDate(null);
                        setSelectedSlot(null);
                    }}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary mb-4"
                >
                    <ChevronLeft size={18} />
                    <span>Modifier la prestation</span>
                </Button>

                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold text-gray-900">{selectedService.name}</h3>
                            <span className="text-sm text-gray-500">{selectedService.duration} min</span>
                        </div>
                        <span className="font-bold text-primary">{selectedService.price}€</span>
                    </div>
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-4">Choisissez une date</h2>
                <div className="flex gap-2 overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
                    {getNext14Days().map((date) => {
                        const isAvailable = isDateAvailable(date);
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        return (
                            <button
                                key={date.toISOString()}
                                onClick={() => isAvailable && setSelectedDate(date)}
                                disabled={!isAvailable}
                                className={cn(
                                    "flex-shrink-0 w-16 py-3 rounded-xl text-center transition-all cursor-pointer",
                                    isSelected ? "bg-primary text-white" :
                                        isAvailable ? "bg-white border border-gray-200 hover:border-primary/30" :
                                            "bg-gray-50 opacity-40 grayscale cursor-not-allowed"
                                )}
                            >
                                <p className="text-[10px] uppercase font-bold opacity-60">
                                    {date.toLocaleDateString("fr-FR", { weekday: "short" })}
                                </p>
                                <p className="text-lg font-black">{date.getDate()}</p>
                            </button>
                        );
                    })}
                </div>

                {selectedDate && (
                    <div className="mt-8">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Horaires disponibles</h3>
                        {loadingSlots ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin w-8 h-8 border-3 border-primary border-t-transparent rounded-full" />
                            </div>
                        ) : availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                {availableSlots.map((slot) => (
                                    <button
                                        key={slot.time}
                                        onClick={() => {
                                            setSelectedSlot(slot);
                                            setStep("recap");
                                        }}
                                        className="py-3 px-2 border border-gray-200 rounded-xl text-center hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-sm font-semibold cursor-pointer"
                                    >
                                        {slot.time}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl">
                                <p className="text-gray-500">Aucun créneau disponible pour cette date.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (step === "recap" && selectedService && selectedSlot) {
        return (
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <Button
                    variant="ghost"
                    onClick={() => setStep("datetime")}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6"
                >
                    <ChevronLeft size={18} />
                    <span>Modifier l'horaire</span>
                </Button>

                {/* Recap Card */}
                <div className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Calendar size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Date & Heure</p>
                            <p className="font-bold text-gray-900">
                                {selectedDate?.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                            <p className="text-primary font-bold">{selectedSlot.time} ({selectedService.duration} min)</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <ArrowRight size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">Prestation</p>
                            <p className="font-bold text-gray-900">{selectedService.name}</p>
                            <p className="text-primary font-bold">{selectedService.price}€</p>
                        </div>
                    </div>
                </div>

                {/* Login Prompt if guest */}
                {!clientProfileId && (
                    <div className="mb-6 p-4 border border-primary/20 bg-primary/5 rounded-xl">
                        <div className="flex gap-3">
                            <div className="p-2 bg-primary/10 rounded-full h-fit">
                                <UserPlus size={18} className="text-primary" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Connectez-vous pour gagner du temps</p>
                                <p className="text-xs text-gray-600 mb-3">Retrouvez votre historique et vos favoris.</p>
                                <div className="flex gap-2">
                                    <Link href={`/auth/client/login?redirect=${encodeURIComponent(window.location.pathname)}`}>
                                        <Button variant="outline" size="sm" className="cursor-pointer">
                                            <LogIn size={16} className="mr-1" />
                                            Connexion
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <h2 className="text-lg font-bold text-gray-900 mb-4">Vos informations</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={clientInfo.firstName}
                                    onChange={(e) => setClientInfo({ ...clientInfo, firstName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all"
                                    placeholder="Jean"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom <span className="text-red-500">*</span></label>
                            <div className="relative">
                                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={clientInfo.lastName}
                                    onChange={(e) => setClientInfo({ ...clientInfo, lastName: e.target.value })}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all"
                                    placeholder="Dupont"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="email"
                                value={clientInfo.email}
                                onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all"
                                placeholder="jean.dupont@email.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="tel"
                                value={clientInfo.phone}
                                onChange={(e) => setClientInfo({ ...clientInfo, phone: e.target.value })}
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary outline-none transition-all"
                                placeholder="06 12 34 56 78"
                            />
                        </div>
                    </div>
                </div>

                <Button
                    variant="primary"
                    onClick={handleSubmitBooking}
                    disabled={!clientInfo.firstName || !clientInfo.lastName || !clientInfo.email || !clientInfo.phone || submitting || blockedError}
                    className="w-full mt-8 py-4 text-base cursor-pointer"
                >
                    {submitting ? (
                        <div className="flex items-center gap-2 justify-center">
                            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                            <span>Confirmation en cours...</span>
                        </div>
                    ) : (
                        <span>Confirmer la réservation</span>
                    )}
                </Button>
            </div>
        );
    }

    if (step === "confirmation") {
        return (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check size={40} className="text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée !</h2>
                <p className="text-gray-500 mb-8">
                    {establishment?.auto_confirm_appointments
                        ? "Votre réservation a été confirmée. Vous recevrez un email de confirmation."
                        : "Votre demande a été envoyée. L'établissement vous contactera pour confirmer."}
                </p>
                <Button variant="primary" onClick={() => router.push("/")} className="cursor-pointer">
                    Retour à l'accueil
                </Button>
            </div>
        );
    }

    return null;
}
