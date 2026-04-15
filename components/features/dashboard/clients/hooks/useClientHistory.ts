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

export function useClientHistory(
    clientProfileId: string | null,
    establishmentId: string | null,
    clientEmail?: string | null
) {
    const [appointments, setAppointments] = useState<ClientHistoryAppointment[]>([]);
    const [loading, setLoading] = useState(false);
    const supabase = createClient();

    const loadHistory = useCallback(async () => {
        if (!establishmentId) return;
        if (!clientProfileId && !clientEmail) return;

        setLoading(true);
        try {
            let query = supabase
                .from("appointments")
                .select(`
                    id,
                    start_time,
                    status,
                    cancelled_by_client,
                    services (name, price)
                `)
                .eq("establishment_id", establishmentId)
                .order("start_time", { ascending: false });

            if (clientProfileId) {
                query = query.eq("client_profile_id", clientProfileId);
            } else if (clientEmail) {
                query = query.eq("client_email", clientEmail);
            }

            const { data, error } = await query;
            if (error) throw error;

            setAppointments((data || []).map((apt: any) => ({
                id: apt.id,
                start_time: apt.start_time,
                status: apt.status,
                cancelled_by_client: apt.cancelled_by_client,
                service_name: Array.isArray(apt.services) ? apt.services[0]?.name : apt.services?.name || "Service inconnu",
                price: Array.isArray(apt.services) ? apt.services[0]?.price : apt.services?.price || 0,
            })));
        } catch (error) {
            console.error("Error loading client history:", error);
        } finally {
            setLoading(false);
        }
    }, [clientProfileId, clientEmail, establishmentId, supabase]);

    useEffect(() => {
        loadHistory();
    }, [loadHistory]);

    return { appointments, loading, refresh: loadHistory };
}
