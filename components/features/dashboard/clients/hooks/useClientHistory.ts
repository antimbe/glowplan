"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export interface ClientHistoryAppointment {
    id: string;
    start_time: string;
    status: string;
    cancelled_by_client: boolean | null;
    service_name: string;
    price: number;
}

export function useClientHistory(clientProfileId: string | null, establishmentId: string | null) {
    const [appointments, setAppointments] = useState<ClientHistoryAppointment[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const loadHistory = useCallback(async () => {
        if (!clientProfileId || !establishmentId) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("appointments")
                .select(`
                    id,
                    start_time,
                    status,
                    cancelled_by_client,
                    services (
                        name,
                        price
                    )
                `)
                .eq("client_profile_id", clientProfileId)
                .eq("establishment_id", establishmentId)
                .order("start_time", { ascending: false });

            if (error) throw error;

            const formatted = data.map((apt: any) => ({
                id: apt.id,
                start_time: apt.start_time,
                status: apt.status,
                cancelled_by_client: apt.cancelled_by_client,
                service_name: apt.services?.name || "Service inconnu",
                price: apt.services?.price || 0,
            }));

            setAppointments(formatted);
        } catch (error) {
            console.error("Error loading client history:", error);
        } finally {
            setLoading(false);
        }
    }, [clientProfileId, establishmentId, supabase]);

    useEffect(() => {
        if (clientProfileId && establishmentId) {
            loadHistory();
        }
    }, [clientProfileId, establishmentId, loadHistory]);

    return { appointments, loading, refresh: loadHistory };
}
