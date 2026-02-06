"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Users, Search, Phone, Mail, Calendar, Ban, Plus, 
  Loader2, Euro, Clock, XCircle, MoreVertical, UserCheck,
  ChevronDown, Filter
} from "lucide-react";
import { Button, Input, Select } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { MONTHS_LOWER } from "@/lib/utils/formatters";

interface ClientStats {
  id: string;
  client_profile_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  instagram: string | null;
  total_visits: number;
  total_spent: number;
  total_cancellations: number;
  last_visit: string | null;
  is_blocked: boolean;
}

const MONTHS_SHORT = MONTHS_LOWER.map(m => m.substring(0, 4) + ".");

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "visits" | "spent" | "last_visit">("last_visit");
  const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);
  const [blockingClient, setBlockingClient] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    loadEstablishment();
  }, []);

  useEffect(() => {
    if (establishmentId) {
      loadClients();
    }
  }, [establishmentId]);

  const loadEstablishment = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from("establishments")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (data) {
      setEstablishmentId(data.id);
    }
  };

  const loadClients = async () => {
    if (!establishmentId) return;
    setLoading(true);

    try {
      // Get all appointments with client_profile_id for this establishment
      const { data: appointments, error: aptError } = await supabase
        .from("appointments")
        .select(`
          client_profile_id,
          client_first_name,
          client_last_name,
          client_email,
          client_phone,
          client_instagram,
          status,
          cancelled_by_client,
          start_time,
          services(price)
        `)
        .eq("establishment_id", establishmentId)
        .not("client_profile_id", "is", null);

      if (aptError) throw aptError;

      // Get blocked clients
      const { data: blockedClients } = await supabase
        .from("blocked_clients")
        .select("client_profile_id")
        .eq("establishment_id", establishmentId);

      const blockedIds = new Set(blockedClients?.map(b => b.client_profile_id) || []);

      // Aggregate stats per client
      const clientMap = new Map<string, ClientStats>();

      appointments?.forEach(apt => {
        if (!apt.client_profile_id) return;

        const existing = clientMap.get(apt.client_profile_id);
        const isCompleted = apt.status === "confirmed" && new Date(apt.start_time) < new Date();
        const isCancelledByClient = apt.status === "cancelled" && apt.cancelled_by_client === true;
        const price = (apt.services as any)?.price || 0;

        if (existing) {
          if (isCompleted) {
            existing.total_visits++;
            existing.total_spent += price;
            if (!existing.last_visit || new Date(apt.start_time) > new Date(existing.last_visit)) {
              existing.last_visit = apt.start_time;
            }
          }
          if (isCancelledByClient) {
            existing.total_cancellations++;
          }
        } else {
          clientMap.set(apt.client_profile_id, {
            id: apt.client_profile_id,
            client_profile_id: apt.client_profile_id,
            first_name: apt.client_first_name || "",
            last_name: apt.client_last_name || "",
            email: apt.client_email || "",
            phone: apt.client_phone,
            instagram: apt.client_instagram,
            total_visits: isCompleted ? 1 : 0,
            total_spent: isCompleted ? price : 0,
            total_cancellations: isCancelledByClient ? 1 : 0,
            last_visit: isCompleted ? apt.start_time : null,
            is_blocked: blockedIds.has(apt.client_profile_id),
          });
        }
      });

      setClients(Array.from(clientMap.values()));
    } catch (error) {
      console.error("Error loading clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlockClient = async (clientProfileId: string, block: boolean) => {
    if (!establishmentId) return;
    setBlockingClient(clientProfileId);

    try {
      if (block) {
        await supabase.from("blocked_clients").insert({
          establishment_id: establishmentId,
          client_profile_id: clientProfileId,
        });
      } else {
        await supabase
          .from("blocked_clients")
          .delete()
          .eq("establishment_id", establishmentId)
          .eq("client_profile_id", clientProfileId);
      }

      setClients(prev => prev.map(c => 
        c.client_profile_id === clientProfileId 
          ? { ...c, is_blocked: block }
          : c
      ));
    } catch (error) {
      console.error("Error blocking/unblocking client:", error);
    } finally {
      setBlockingClient(null);
      setActionMenuOpen(null);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
  };

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
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Users className="text-primary" size={28} />
              Mes Clients
            </h1>
            <p className="text-gray-500 mt-1">
              {clients.length} client{clients.length > 1 ? "s" : ""} enregistré{clients.length > 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
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

      {/* Clients List */}
      {filteredClients.length > 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visites</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Dépensé</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Annulations</th>
                  <th className="text-center px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Dernière visite</th>
                  <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClients.map((client) => (
                  <tr 
                    key={client.id} 
                    className={cn(
                      "hover:bg-gray-50/50 transition-colors",
                      client.is_blocked && "bg-red-50/30"
                    )}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm",
                          client.is_blocked 
                            ? "bg-red-100 text-red-600"
                            : "bg-primary/10 text-primary"
                        )}>
                          {client.first_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">
                              {client.first_name} {client.last_name}
                            </span>
                            {client.is_blocked && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-600">
                                <Ban size={10} />
                                Bloqué
                              </span>
                            )}
                          </div>
                          <span className="text-sm text-gray-500 lg:hidden">{client.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {client.email}
                        </div>
                        {client.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={14} className="text-gray-400" />
                            {client.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-700">
                        <UserCheck size={14} />
                        {client.total_visits}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                        <Euro size={14} className="text-primary" />
                        {client.total_spent.toFixed(0)}€
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center hidden lg:table-cell">
                      <span className={cn(
                        "inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold",
                        client.total_cancellations > 2 
                          ? "bg-red-100 text-red-700"
                          : client.total_cancellations > 0
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-500"
                      )}>
                        <XCircle size={14} />
                        {client.total_cancellations}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center hidden md:table-cell">
                      <span className="text-sm text-gray-600">
                        {formatDate(client.last_visit)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2 relative">
                        {client.phone && (
                          <a
                            href={`tel:${client.phone}`}
                            className="w-8 h-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200 transition-colors"
                            title="Appeler"
                          >
                            <Phone size={16} />
                          </a>
                        )}
                        <a
                          href={`mailto:${client.email}`}
                          className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center hover:bg-blue-200 transition-colors"
                          title="Envoyer un email"
                        >
                          <Mail size={16} />
                        </a>
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setActionMenuOpen(actionMenuOpen === client.id ? null : client.id)}
                            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 p-0 min-w-0"
                          >
                            <MoreVertical size={16} />
                          </Button>
                          {actionMenuOpen === client.id && (
                            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-10">
                              <Button
                                variant="ghost"
                                onClick={() => handleBlockClient(client.client_profile_id, !client.is_blocked)}
                                disabled={blockingClient === client.client_profile_id}
                                className={cn(
                                  "w-full px-4 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 justify-start rounded-none",
                                  client.is_blocked ? "text-green-600" : "text-red-600"
                                )}
                              >
                                {blockingClient === client.client_profile_id ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Ban size={14} />
                                )}
                                {client.is_blocked ? "Débloquer" : "Bloquer"}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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

      {/* Click outside to close menu */}
      {actionMenuOpen && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setActionMenuOpen(null)}
        />
      )}
    </div>
  );
}
