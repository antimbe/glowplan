"use client";

import { Search, Heart, Star, MapPin, Calendar, LogIn, UserPlus } from "lucide-react";
import { Card, CardContent, Badge, Button, Heading, Text, Box, Flex, Stack, MotionBox } from "@/components/ui";
import Link from "next/link";
import NextLink from "next/link";
import { EstablishmentSearchResult } from "./types";

interface ResultsGridProps {
    results: EstablishmentSearchResult[];
    loading: boolean;
    favorites: Set<string>;
    onToggleFavorite: (id: string, e: React.MouseEvent) => void;
    onShowLoginPrompt: (id: string) => void;
    hasProfile: boolean;
    onResetSearch: () => void;
}

export function ResultsGrid({
    results,
    loading,
    favorites,
    onToggleFavorite,
    onShowLoginPrompt,
    hasProfile,
    onResetSearch
}: ResultsGridProps) {
    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin w-10 h-10 border-3 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (results.length === 0) {
        return (
            <div className="text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Aucun résultat</h2>
                <p className="text-gray-500 mb-6 max-w-sm mx-auto">
                    Essayez avec d'autres termes de recherche ou une autre localisation pour trouver votre bonheur.
                </p>
                <Button variant="outline" onClick={onResetSearch} className="cursor-pointer">
                    Voir tous les établissements
                </Button>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {results.map((establishment) => (
                <EstablishmentCard
                    key={establishment.id}
                    establishment={establishment}
                    isFavorite={favorites.has(establishment.id)}
                    onToggleFavorite={(e) => {
                        if (!hasProfile) {
                            onShowLoginPrompt(establishment.id);
                        } else {
                            onToggleFavorite(establishment.id, e);
                        }
                    }}
                />
            ))}
        </div>
    );
}

function EstablishmentCard({ establishment, isFavorite, onToggleFavorite }: {
    establishment: EstablishmentSearchResult;
    isFavorite: boolean;
    onToggleFavorite: (e: React.MouseEvent) => void
}) {
    return (
        <Link href={`/establishment/${establishment.id}`} className="block cursor-pointer">
            <Card
                variant="default"
                padding="none"
                hoverable
                className="group overflow-hidden bg-white border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_30px_rgba(50,66,44,0.1)] transition-all duration-500 cursor-pointer h-full border-b-4 border-b-transparent hover:border-b-primary/50"
            >
                <Box className="relative h-56 overflow-hidden">
                    <MotionBox
                        className="absolute inset-0 bg-gray-200 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{
                            backgroundImage: establishment.main_photo_url ? `url(${establishment.main_photo_url})` : undefined,
                        }}
                    />
                    {!establishment.main_photo_url && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <Star size={40} className="text-primary/20" />
                        </div>
                    )}
                    <Box className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <Button
                        variant="ghost"
                        size="sm"
                        className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all shadow-sm h-10 w-10 min-w-0 z-10 cursor-pointer ${isFavorite
                                ? "bg-red-50 text-red-500 hover:bg-red-100"
                                : "bg-white/90 text-gray-900 hover:text-red-500 hover:bg-white"
                            }`}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onToggleFavorite(e);
                        }}
                    >
                        <Heart size={18} strokeWidth={2.5} className={isFavorite ? "fill-red-500" : ""} />
                    </Button>

                    {establishment.activity_sectors?.length > 0 && (
                        <Box className="absolute bottom-4 left-4 right-4 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                            <Flex wrap="wrap" gap={2}>
                                {establishment.activity_sectors.slice(0, 2).map((sector) => (
                                    <Badge key={sector} variant="secondary" size="sm" className="bg-white/95 backdrop-blur-sm text-primary border-none shadow-md font-bold px-3">
                                        <Text variant="small" as="span" className="font-bold text-[10px] uppercase tracking-wider">{sector}</Text>
                                    </Badge>
                                ))}
                            </Flex>
                        </Box>
                    )}
                </Box>

                <CardContent className="p-5 space-y-4">
                    <Stack space={2}>
                        <Flex justify="between" align="start" gap={4}>
                            <Heading level={3} variant="card" className="group-hover:text-primary transition-colors line-clamp-1 flex-1 text-lg font-bold">
                                {establishment.name}
                            </Heading>
                            {establishment.average_rating !== null ? (
                                <Flex align="center" gap={1.5} className="bg-accent/10 px-2.5 py-1 rounded-lg flex-shrink-0">
                                    <Star size={14} className="text-accent fill-accent" />
                                    <Text variant="small" as="span" className="font-extrabold text-accent leading-none">{establishment.average_rating}</Text>
                                </Flex>
                            ) : (
                                <Flex align="center" gap={1.5} className="bg-gray-100 px-2.5 py-1 rounded-lg flex-shrink-0">
                                    <Star size={14} className="text-gray-400" />
                                    <Text variant="small" as="span" className="font-bold text-gray-400 leading-none text-[10px] uppercase">Nouveau</Text>
                                </Flex>
                            )}
                        </Flex>

                        <Flex align="center" gap={1.5}>
                            <MapPin size={16} className="text-primary/40" />
                            <Text variant="small" as="span" className="text-gray-500 font-medium">{establishment.city}</Text>
                        </Flex>
                    </Stack>

                    <Flex align="center" justify="between" gap={4} className="pt-4 border-t border-gray-50">
                        <Flex direction="col">
                            <Text variant="muted" className="text-[9px] uppercase tracking-widest font-black text-gray-400">À partir de</Text>
                            <Text variant="default" as="span" className="font-black text-primary text-xl">
                                {establishment.min_price ? `${establishment.min_price}€` : "N/A"}
                            </Text>
                        </Flex>
                        <Button
                            variant="primary"
                            size="md"
                            className="font-bold shadow-lg shadow-primary/20 group/btn cursor-pointer px-6 rounded-xl"
                        >
                            <Calendar size={18} className="group-hover/btn:scale-110 transition-transform" />
                            <Text variant="small" as="span" className="font-bold">Réserver</Text>
                        </Button>
                    </Flex>
                </CardContent>
            </Card>
        </Link>
    );
}
