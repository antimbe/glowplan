"use client";

import { History, Calendar, Clock, Euro, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import FormModal from "@/components/ui/FormModal";
import { useClientHistory } from "./hooks/useClientHistory";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";

interface ClientHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientName: string;
    clientProfileId: string;
    establishmentId: string;
}

export function ClientHistoryModal({
    isOpen,
    onClose,
    clientName,
    clientProfileId,
    establishmentId
}: ClientHistoryModalProps) {
    const { appointments, loading } = useClientHistory(clientProfileId, establishmentId);

    const getStatusInfo = (status: string, cancelledByClient: boolean | null) => {
        const now = new Date();
        const past = (startTime: string) => new Date(startTime) < now;

        switch (status) {
            case "confirmed":
                return {
                    label: (startTime: string) => past(startTime) ? "Effectué" : "Confirmé",
                    icon: (startTime: string) => past(startTime) ? CheckCircle2 : Calendar,
                    color: (startTime: string) => past(startTime) ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                };
            case "cancelled":
                return {
                    label: () => cancelledByClient ? "Annulé (Client)" : "Annulé (Pro)",
                    icon: () => XCircle,
                    color: () => "bg-red-100 text-red-700"
                };
            case "pending":
                return {
                    label: () => "En attente",
                    icon: () => AlertCircle,
                    color: () => "bg-yellow-100 text-yellow-700"
                };
            default:
                return {
                    label: () => status,
                    icon: () => AlertCircle,
                    color: () => "bg-gray-100 text-gray-700"
                };
        }
    };

    return (
        <FormModal
            isOpen={isOpen}
            onClose={onClose}
            title={`Historique de ${clientName}`}
            subtitle="Historique complet des réservations"
            icon={<History className="text-white" size={20} />}
            maxWidth="lg"
        >
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                        <Loader2 className="animate-spin text-primary" size={32} />
                        <p className="text-sm text-gray-500">Chargement de l'historique...</p>
                    </div>
                ) : appointments.length > 0 ? (
                    <div className="divide-y divide-gray-50">
                        {appointments.map((apt) => {
                            const statusInfo = getStatusInfo(apt.status, apt.cancelled_by_client);
                            const StatusIcon = statusInfo.icon(apt.start_time);
                            const startTime = new Date(apt.start_time);

                            return (
                                <div key={apt.id} className="py-4 first:pt-0 last:pb-0 group">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <h4 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                                {apt.service_name}
                                            </h4>
                                            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar size={14} className="text-gray-400" />
                                                    {format(startTime, "d MMMM yyyy", { locale: fr })}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock size={14} className="text-gray-400" />
                                                    {format(startTime, "HH:mm")}
                                                </div>
                                                <div className="flex items-center gap-1.5 font-medium text-gray-900 bg-gray-50 px-2 py-0.5 rounded">
                                                    <Euro size={14} className="text-primary" />
                                                    {apt.price}€
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap",
                                            statusInfo.color(apt.start_time)
                                        )}>
                                            <StatusIcon size={14} />
                                            {statusInfo.label(apt.start_time)}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-3xl">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="text-gray-300" size={32} />
                        </div>
                        <h5 className="text-gray-900 font-semibold mb-1">Aucune réservation</h5>
                        <p className="text-sm text-gray-500">Ce client n'a pas encore de réservations enregistrées.</p>
                    </div>
                )}
            </div>
        </FormModal>
    );
}
