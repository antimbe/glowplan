"use client";

import { useState } from "react";
import {
    Phone, Mail, Ban, Euro, Clock, XCircle, MoreVertical, UserCheck, Loader2
} from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { MONTHS_LOWER } from "@/lib/utils/formatters";
import { ClientStats } from "./types";

const MONTHS_SHORT = MONTHS_LOWER.map(m => m.substring(0, 4) + ".");

interface ClientsTableProps {
    clients: ClientStats[];
    onBlock: (clientProfileId: string, block: boolean) => Promise<void>;
    blockingClient: string | null;
}

export function ClientsTable({ clients, onBlock, blockingClient }: ClientsTableProps) {
    const [actionMenuOpen, setActionMenuOpen] = useState<string | null>(null);

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        const date = new Date(dateStr);
        return `${date.getDate()} ${MONTHS_SHORT[date.getMonth()]} ${date.getFullYear()}`;
    };

    return (
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
                        {clients.map((client) => (
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
                                                        onClick={() => {
                                                            onBlock(client.client_profile_id, !client.is_blocked);
                                                            setActionMenuOpen(null);
                                                        }}
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
