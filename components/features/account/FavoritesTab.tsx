"use client";

import { Heart, MapPin } from "lucide-react";
import { Button } from "@/components/ui";
import Link from "next/link";
import { Favorite } from "./types";

interface FavoritesTabProps {
    favorites: Favorite[];
    onRemove: (id: string) => void;
}

export function FavoritesTab({ favorites, onRemove }: FavoritesTabProps) {
    return (
        <div>
            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {favorites.map((fav) => (
                        <div key={fav.id} className="border border-gray-200 rounded-xl overflow-hidden group">
                            <div className="relative h-32">
                                {fav.establishments?.main_photo_url ? (
                                    <img
                                        src={fav.establishments.main_photo_url}
                                        alt={fav.establishments.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                                        <Heart size={32} className="text-primary/30" />
                                    </div>
                                )}
                                <button
                                    onClick={() => onRemove(fav.id)}
                                    className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 cursor-pointer"
                                >
                                    <Heart size={16} className="text-red-500 fill-red-500" />
                                </button>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900">{fav.establishments?.name}</h3>
                                <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                    <MapPin size={14} />
                                    <span>{fav.establishments?.city}</span>
                                </div>
                                <Link href={`/establishment/${fav.establishment_id}`}>
                                    <Button variant="outline" size="sm" className="w-full mt-3 cursor-pointer">
                                        Voir l'établissement
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Heart size={48} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun favori</h3>
                    <p className="text-gray-500 mb-4">Ajoutez des établissements à vos favoris</p>
                    <Link href="/search">
                        <Button variant="primary" className="cursor-pointer">
                            Explorer les établissements
                        </Button>
                    </Link>
                </div>
            )}
        </div>
    );
}
