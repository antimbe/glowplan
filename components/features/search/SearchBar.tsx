"use client";

import { Search, MapPin } from "lucide-react";
import { Button } from "@/components/ui";

interface SearchBarProps {
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    locationQuery: string;
    setLocationQuery: (query: string) => void;
    onSearch: () => void;
}

export function SearchBar({
    searchQuery,
    setSearchQuery,
    locationQuery,
    setLocationQuery,
    onSearch
}: SearchBarProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") onSearch();
    };

    return (
        <div className="bg-white border-b border-gray-100 pt-20 sm:pt-24">
            <div className="max-w-6xl mx-auto px-4 py-4">
                {/* Desktop Search Bar */}
                <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-full px-4 py-3 max-w-2xl mx-auto border border-gray-100 shadow-sm focus-within:border-primary/30 transition-all">
                    <Search size={20} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Prestation, établissement..."
                        className="flex-1 bg-transparent outline-none min-w-0 text-gray-900 placeholder:text-gray-400"
                    />
                    <div className="w-px h-6 bg-gray-300 flex-shrink-0" />
                    <MapPin size={20} className="text-gray-400 flex-shrink-0" />
                    <input
                        type="text"
                        value={locationQuery}
                        onChange={(e) => setLocationQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ville"
                        className="w-28 sm:w-40 bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
                    />
                    <Button size="md" onClick={onSearch} className="rounded-full cursor-pointer flex-shrink-0 font-bold">
                        Rechercher
                    </Button>
                </div>

                {/* Mobile Search Bar */}
                <div className="sm:hidden space-y-3">
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <Search size={20} className="text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Prestation, établissement..."
                            className="flex-1 bg-transparent outline-none min-w-0"
                        />
                    </div>
                    <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                        <MapPin size={20} className="text-gray-400 flex-shrink-0" />
                        <input
                            type="text"
                            value={locationQuery}
                            onChange={(e) => setLocationQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ville"
                            className="flex-1 bg-transparent outline-none min-w-0"
                        />
                    </div>
                    <Button size="md" onClick={onSearch} fullWidth className="rounded-xl cursor-pointer font-bold">
                        <Search size={18} className="mr-2" />
                        Rechercher
                    </Button>
                </div>
            </div>
        </div>
    );
}
