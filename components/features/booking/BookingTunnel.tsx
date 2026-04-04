"use client";

import { useState } from "react";

import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Check, Clock, Calendar, ArrowRight, ChevronLeft, User, Mail, Phone, Instagram, FileText, LogIn, UserPlus, Trash2, ShoppingCart, CreditCard, Link as LinkIcon, Info, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Service, AvailableSlot, ClientInfo, BookingStep, OpeningHour, CartItem } from "./types";
import { useEffect as useReactEffect } from "react";

const REASSURANCE_MESSAGES = [
    "Préparation de votre rendez-vous...",
    "Vérification finale du créneau...",
    "Envoi de la demande à l'établissement...",
    "Presque terminé, merci de votre patience !",
    "Sécurisation de votre réservation...",
    "Finalisation de votre demande..."
];

function BookingLoadingOverlay() {
    const [messageIndex, setMessageIndex] = useState(0);

    useReactEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex((prev) => (prev + 1) % REASSURANCE_MESSAGES.length);
        }, 2500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
            {/* Background avec effet de flou prononcé */}
            <div className="absolute inset-0 bg-white/80 backdrop-blur-xl animate-in fade-in duration-500" />
            
            <div className="relative z-10 max-w-sm w-full bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-primary/10 border border-primary/5 text-center animate-in zoom-in-95 duration-300">
                <div className="relative mb-8">
                    {/* Double spinner effect */}
                    <div className="absolute inset-0 flex items-center justify-center animate-spin duration-[3000ms]">
                        <div className="w-20 h-20 border-4 border-primary/10 border-t-primary rounded-full" />
                    </div>
                    <div className="flex items-center justify-center">
                        <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center text-primary">
                            <Sparkles size={32} className="animate-pulse" />
                        </div>
                    </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-3 tracking-tight">Confirmation en cours</h3>
                
                <div className="h-10 flex items-center justify-center">
                    <p className="text-primary font-bold text-base transition-all duration-500 animate-in slide-in-from-bottom-2">
                        {REASSURANCE_MESSAGES[messageIndex]}
                    </p>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex items-center justify-center gap-2 text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">
                        <ShieldCheck size={16} className="text-green-500" />
                        Réservation sécurisée
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-relaxed">
                        Veuillez ne pas quitter ou rafraîchir cette page pendant le traitement.
                    </p>
                </div>
            </div>
        </div>
    );
}

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
    cart: CartItem[];
    addToCart: () => { success: boolean; error?: string };
    removeFromCart: (index: number) => void;
    prepareEdit: (index: number) => void;
    editingIndex: number | null;
    setEditingIndex: (index: number | null) => void;
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
    openingHours,
    cart,
    addToCart,
    removeFromCart,
    prepareEdit,
    editingIndex,
    setEditingIndex
}: BookingTunnelProps) {
    const router = useRouter();
    const [cartError, setCartError] = useState<string | null>(null);

    const handleAddToCart = (nextStep: BookingStep) => {
        const result = addToCart();
        if (!result.success) {
            setCartError(result.error || "Erreur lors de l'ajout au panier.");
            return;
        }
        setCartError(null);
        setStep(nextStep);
    };

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
        const dbDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const hours = openingHours.find(h => h.day_of_week === dbDay);
        return hours?.is_open ?? false;
    };

    if (submitting) {
        return <BookingLoadingOverlay />;
    }

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
                                className="w-full flex flex-col sm:flex-row overflow-hidden border border-gray-200 rounded-2xl hover:border-primary/40 hover:shadow-lg transition-all text-left bg-white group cursor-pointer"
                            >
                                {service.image_url && (
                                    <div className="w-full aspect-video sm:aspect-auto sm:w-48 sm:h-32 flex-shrink-0 bg-gray-50 border-b sm:border-b-0 sm:border-r border-gray-100 relative overflow-hidden">
                                        <img
                                            src={service.image_url}
                                            alt={service.name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                )}
                                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center min-w-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-bold text-gray-900 group-hover:text-primary transition-colors truncate">
                                                {service.name}
                                            </h3>
                                            {service.description && (
                                                <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                                                    {service.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3 mt-3 text-sm text-gray-400 font-medium">
                                                <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                                                    <Clock size={14} />
                                                    {service.duration} min
                                                </span>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 flex flex-col items-end justify-between h-full">
                                            <span className="text-lg font-black text-primary">{service.price}€</span>
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center mt-auto group-hover:bg-primary/10 transition-colors">
                                                <ArrowRight size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                            </div>
                                        </div>
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
                        // Ne pas reset si on est en train d'éditer, car on veut garder le service sélectionné
                        if (editingIndex === null) {
                            setSelectedDate(null);
                            setSelectedSlot(null);
                        } else {
                            // Si on annule l'édition en revenant tout au début
                            setEditingIndex(null);
                            setSelectedDate(null);
                            setSelectedSlot(null);
                        }
                    }}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary mb-4"
                >
                    <ChevronLeft size={18} />
                    <span>{editingIndex !== null ? "Annuler la modification" : "Modifier la prestation"}</span>
                </Button>

                <div className="bg-primary/5 border border-primary/20 rounded-xl overflow-hidden mb-6 flex flex-col sm:flex-row items-stretch">
                    {selectedService.image_url && (
                        <div className="w-full aspect-video sm:aspect-auto sm:w-40 sm:h-32 flex-shrink-0 relative border-b sm:border-b-0 sm:border-r border-primary/10">
                            <img
                                src={selectedService.image_url}
                                alt={selectedService.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-white/60 px-2 py-0.5 rounded shadow-sm">
                                        {editingIndex !== null ? "Modification en cours" : "Prestation sélectionnée"}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 leading-tight mb-1">{selectedService.name}</h3>
                                <span className="text-sm text-gray-500 font-medium flex items-center gap-1.5">
                                    <Clock size={14} /> {selectedService.duration} min
                                </span>
                            </div>
                            <span className="font-black text-lg text-primary bg-white/60 px-3 py-1 rounded-lg shadow-sm">
                                {selectedService.price}€
                            </span>
                        </div>
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
                                {availableSlots.map((slot) => {
                                    const isSelected = selectedSlot?.time === slot.time;
                                    return (
                                        <button
                                            key={slot.time}
                                            onClick={() => setSelectedSlot(slot)}
                                            className={cn(
                                                "py-3 px-2 border rounded-xl text-center transition-all text-sm font-semibold cursor-pointer",
                                                isSelected ? "border-primary bg-primary text-white" : "border-gray-200 hover:border-primary/30"
                                            )}
                                        >
                                            {slot.time}
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-2xl">
                                <p className="text-gray-500">Aucun créneau disponible pour cette date.</p>
                            </div>
                        )}

                        {selectedSlot && (
                            <div className="mt-8 flex flex-col gap-3">
                                {cartError && (
                                    <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium">
                                        ⚠️ {cartError}
                                    </div>
                                )}
                                <Button
                                    variant="primary"
                                    onClick={() => handleAddToCart("recap")}
                                    className="w-full"
                                >
                                    Passer au récapitulatif
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    if (step === "recap" && cart.length > 0) {
        const totalPrice = cart.reduce((sum, item) => sum + item.service.price, 0);

        return (
            <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col h-full">
                <Button
                    variant="ghost"
                    onClick={() => {
                        prepareEdit(0); // On édite le premier item (cas simple)
                        setStep("datetime");
                    }}
                    className="flex items-center gap-2 text-gray-500 hover:text-primary mb-6 w-fit"
                >
                    <ChevronLeft size={18} />
                    <span>Modifier le créneau</span>
                </Button>

                <h2 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif de votre panier</h2>

                <div className="space-y-4 flex-1 overflow-y-auto mb-8 pr-2">
                    {cart.map((item, index) => (
                        <div key={`${item.service.id}-${index}`} className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-4">
                                {item.service.image_url ? (
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden shrink-0 shadow-sm relative border border-gray-100">
                                        <img src={item.service.image_url} alt={item.service.name} className="w-full h-full object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                                        <Clock size={24} />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate leading-tight">{item.service.name}</h4>
                                    <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                                        {format(item.slot.date, "EEEE d MMMM", { locale: fr })} à {item.slot.time}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <p className="font-black text-primary text-lg">{item.service.price}€</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="pt-6 border-t border-gray-100 mt-auto">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-500 font-medium">Total</span>
                        <span className="text-2xl font-black text-primary">{totalPrice}€</span>
                    </div>

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
                        type="button"
                        variant="primary"
                        onClick={(e) => {
                            e.preventDefault();
                            handleSubmitBooking();
                        }}
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
            </div>
        );
    }

    if (step === "confirmation") {
        if (establishment?.require_deposit) {
            return (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 text-center py-8">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
                        <CreditCard size={32} className="text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 mb-3">Acompte requis</h2>
                    <p className="text-gray-600 mb-6 text-sm">
                        Votre demande est enregistrée. Pour valider et confirmer définitivement votre rendez-vous, veuillez régler l'acompte demandé.
                    </p>

                    <div className="bg-gray-50 rounded-2xl p-5 mb-6 text-left border border-gray-100">
                        {establishment?.deposit_amount && (
                            <div className="mb-4 pb-4 border-b border-gray-200">
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Montant de l'acompte</span>
                                <p className="text-xl font-black text-gray-900 mt-1">{establishment.deposit_amount}</p>
                            </div>
                        )}
                        
                        {establishment?.payment_instructions && (
                            <div className="mb-4">
                                <div className="flex items-center gap-2 mb-2 text-primary font-semibold text-sm">
                                    <Info size={16} /> Instructions
                                </div>
                                <p className="text-sm text-gray-600 whitespace-pre-line">{establishment.payment_instructions}</p>
                            </div>
                        )}

                        {establishment?.payment_links && establishment.payment_links.length > 0 && (
                            <div className="mt-5 space-y-3">
                                {establishment.payment_links.map((link: any, i: number) => (
                                    <a key={i} href={link.url} target="_blank" rel="noopener noreferrer" className="block w-full">
                                        <Button variant="outline" className="w-full flex justify-between items-center h-12 border-primary/20 hover:bg-primary/5 hover:border-primary/50 group transition-all">
                                            <span className="font-bold text-gray-900 group-hover:text-primary transition-colors">Payer via {link.provider || "Lien externe"}</span>
                                            <LinkIcon size={16} className="text-gray-400 group-hover:text-primary transition-colors" />
                                        </Button>
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button variant="primary" onClick={() => router.push("/")} className="cursor-pointer w-full">
                        Retour à l'accueil
                    </Button>
                </div>
            );
        }

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
