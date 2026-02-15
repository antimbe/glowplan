"use client";

import { Search } from "lucide-react";
import { Input, Select } from "@/components/ui";
import { SortField } from "./types";

interface ClientsFiltersProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    sortBy: SortField;
    setSortBy: (field: SortField) => void;
    totalClients: number;
}

export function ClientsFilters({
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    totalClients
}: ClientsFiltersProps) {
    return (
        <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            Mes Clients
                        </h1>
                        <p className="text-gray-500 mt-1">
                            {totalClients} client{totalClients > 1 ? "s" : ""} enregistré{totalClients > 1 ? "s" : ""}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <Input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-11 h-12"
                        fullWidth
                    />
                </div>
                <div className="flex gap-2">
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        options={[
                            { value: "last_visit", label: "Dernière visite" },
                            { value: "name", label: "Nom" },
                            { value: "visits", label: "Nb de visites" },
                            { value: "spent", label: "Dépenses" },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
