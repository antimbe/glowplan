"use client";

import { Button } from "@/components/ui";
import { LogOut, Calendar, Heart, Star } from "lucide-react";
import { motion } from "framer-motion";

interface AccountHeaderProps {
    firstName: string | undefined;
    lastName: string | undefined;
    email: string | undefined;
    onSignOut: () => void;
    appointmentsCount?: number;
    favoritesCount?: number;
    reviewsCount?: number;
}

export function AccountHeader({
    firstName,
    lastName,
    email,
    onSignOut,
    appointmentsCount = 0,
    favoritesCount = 0,
    reviewsCount = 0,
}: AccountHeaderProps) {
    const initials = [firstName?.charAt(0), lastName?.charAt(0)]
        .filter(Boolean)
        .join("")
        .toUpperCase() || "?";

    const stats = [
        { label: "Réservations", value: appointmentsCount, icon: Calendar },
        { label: "Favoris", value: favoritesCount, icon: Heart },
        { label: "Avis", value: reviewsCount, icon: Star },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl overflow-hidden mb-6 shadow-xl shadow-primary/10"
        >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e2b18] via-[#2a3820] to-[#32422c]" />

            {/* Decorative orb */}
            <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-[#c0a062]/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-primary-light/5 blur-2xl pointer-events-none" />

            {/* Gold top line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c0a062]/60 to-transparent" />

            <div className="relative z-10 p-6 md:p-8">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                    {/* Avatar + identity */}
                    <div className="flex items-center gap-5">
                        <div className="relative flex-shrink-0">
                            <div className="w-18 h-18 w-[72px] h-[72px] rounded-2xl bg-gradient-to-br from-[#c0a062] to-[#a8854e] flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-black/30">
                                {initials}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-[#1e2b18]" />
                        </div>
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                                {firstName} {lastName}
                            </h1>
                            <p className="text-white/50 text-sm font-medium mt-0.5">{email}</p>
                        </div>
                    </div>

                    {/* Logout */}
                    <Button
                        variant="ghost"
                        onClick={onSignOut}
                        className="self-start md:self-auto text-white/60 hover:text-white hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl transition-all gap-2 cursor-pointer"
                    >
                        <LogOut size={16} />
                        <span className="text-sm font-bold">Déconnexion</span>
                    </Button>
                </div>

                {/* Stats row */}
                <div className="mt-6 pt-5 border-t border-white/[0.08] grid grid-cols-3 gap-2">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 + i * 0.07, duration: 0.4 }}
                            className="flex flex-col items-center gap-1"
                        >
                            <stat.icon size={14} className="text-[#c0a062]/70" />
                            <span className="text-xl font-black text-white">{stat.value}</span>
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest text-center">{stat.label}</span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}
