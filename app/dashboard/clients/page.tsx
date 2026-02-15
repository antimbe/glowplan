"use client";

import { useState } from "react";
import { Users, Loader2 } from "lucide-react";
import { useClientsData } from "@/components/features/dashboard/clients/hooks/useClientsData";
import { ClientsFilters } from "@/components/features/dashboard/clients/ClientsFilters";
import { ClientsTable } from "@/components/features/dashboard/clients/ClientsTable";
import { SortField } from "@/components/features/dashboard/clients/types";

export default function ClientsPage() {
  const { clients, loading, blockClient, blockingClient } = useClientsData();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortField>("last_visit");

  const filteredClients = clients
    .filter(c => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        c.first_name.toLowerCase().includes(query) ||
        c.last_name.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone?.includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case "visits":
          return b.total_visits - a.total_visits;
        case "spent":
          return b.total_spent - a.total_spent;
        case "last_visit":
          if (!a.last_visit) return 1;
          if (!b.last_visit) return -1;
          return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime();
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ClientsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        sortBy={sortBy}
        setSortBy={setSortBy}
        totalClients={clients.length}
      />

      {filteredClients.length > 0 ? (
        <ClientsTable
          clients={filteredClients}
          onBlock={blockClient}
          blockingClient={blockingClient}
        />
      ) : (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <Users size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? "Aucun client trouvé" : "Aucun client enregistré"}
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? "Essayez avec d'autres termes de recherche"
              : "Les clients qui réservent avec un compte apparaîtront ici"
            }
          </p>
        </div>
      )}
    </div>
  );
}
