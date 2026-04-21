"use client";

import { Heart, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";
import { motion } from "framer-motion";
import { Favorite } from "./types";

interface FavoritesTabProps {
    favorites: Favorite[];
    onRemove: (id: string) => void;
}

export function FavoritesTab({ favorites, onRemove }: FavoritesTabProps) {
    if (favorites.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="flex flex-col items-center justify-center py-16 text-center"
            >
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center mb-5 shadow-inner">
                    <Heart size={36} className="text-red-300" />
                </div>
                <h3 className="text-lg font-black text-gray-800 mb-2">Aucun favori</h3>
                <p className="text-gray-400 text-sm mb-6 max-w-xs">Sauvegardez vos établissements préférés pour les retrouver facilement</p>
                <Link href="/search">
                    <Button variant="primary" className="cursor-pointer gap-2 rounded-xl font-bold">
                        <Sparkles size={15} />
                        Explorer les établissements
                    </Button>
                </Link>
            </motion.div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {favorites.map((fav, i) => (
                <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 hover:border-[#c0a062]/20 transition-all duration-300"
                >
                    {/* Photo */}
                    <div className="relative h-36 overflow-hidden">
                        {fav.establishments?.main_photo_url ? (
                            <img
                                src={fav.establishments.main_photo_url}
                                alt={fav.establishments.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/10 to-[#c0a062]/10 flex items-center justify-center">
                                <Heart size={32} className="text-primary/20" />
                            </div>
                        )}

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        {/* Remove button */}
                        <button
                            onClick={() => onRemove(fav.id)}
                            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-red-50 hover:scale-110 transition-all duration-200 cursor-pointer"
                        >
                            <Heart size={15} className="text-red-500 fill-red-500" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <h3 className="font-bold text-gray-900 truncate group-hover:text-primary transition-colors">
                            {fav.establishments?.name}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1 font-medium">
                            <MapPin size={12} className="text-[#c0a062]/70 flex-shrink-0" />
                            <span>{fav.establishments?.city}</span>
                        </div>
                        <Link href={`/establishment/${fav.establishment_id}`}>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-3 rounded-xl font-bold text-xs border-gray-100 hover:border-[#c0a062]/40 hover:text-primary group/btn gap-1.5 cursor-pointer"
                            >
                                Voir l'établissement
                                <ArrowRight size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
