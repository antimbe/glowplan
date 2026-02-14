"use client";

import { MapPin, Clock, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { DAYS_DB } from "@/lib/utils/formatters";
import { OpeningHour } from "../booking/types";

interface EstablishmentSidebarProps {
    establishment: any;
    averageRating: number | null;
    reviewCount: number;
    fullAddress: string;
    openingHours: OpeningHour[];
    isFavorite: boolean;
    togglingFavorite: boolean;
    handleToggleFavorite: () => void;
}

export function EstablishmentSidebar({
    establishment,
    averageRating,
    reviewCount,
    fullAddress,
    openingHours,
    isFavorite,
    togglingFavorite,
    handleToggleFavorite
}: EstablishmentSidebarProps) {
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

    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-6">
            {/* Establishment Name & Location */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">{establishment.name}</h1>
                    <div className="flex items-center gap-1 text-gray-500 mt-1">
                        <MapPin size={14} />
                        <span className="text-sm">{establishment.city}</span>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleToggleFavorite}
                    disabled={togglingFavorite}
                    className={cn(
                        "p-2 rounded-full min-w-0 h-auto",
                        isFavorite ? "bg-red-50 hover:bg-red-100" : "hover:bg-gray-100"
                    )}
                >
                    <Heart
                        size={20}
                        className={cn(
                            "transition-colors",
                            isFavorite ? "text-red-500 fill-red-500" : "text-gray-400"
                        )}
                    />
                </Button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                {averageRating !== null ? (
                    <>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2.5 py-1 rounded-lg">
                            <Star size={14} className="text-yellow-500 fill-yellow-500" />
                            <span className="font-bold text-yellow-700">{averageRating}</span>
                        </div>
                        <span className="text-gray-400">({reviewCount} avis)</span>
                    </>
                ) : (
                    <span className="italic text-gray-400">Aucun avis pour le moment</span>
                )}
            </div>

            <div className="space-y-6">
                {/* Address */}
                {fullAddress && (
                    <div className="flex items-start gap-3 py-4 border-t border-gray-100">
                        <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-600 leading-relaxed">{fullAddress}</span>
                    </div>
                )}

                {/* Opening Hours */}
                {openingHours.length > 0 && (
                    <div className="py-4 border-t border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Clock size={18} className="text-gray-400" />
                            <span className="text-sm font-bold text-gray-900 uppercase tracking-wider">Horaires</span>
                        </div>
                        <div className="space-y-2.5">
                            {getSortedHours().map((hour) => (
                                <div key={hour.day_of_week} className="flex justify-between text-sm">
                                    <span className="text-gray-500">{DAYS_DB[hour.day_of_week]}</span>
                                    <span className={cn(
                                        "font-medium",
                                        hour.is_open ? "text-gray-900" : "text-red-500"
                                    )}>
                                        {formatHours(hour)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
