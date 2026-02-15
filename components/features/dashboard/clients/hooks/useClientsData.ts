"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClientStats } from "../types";

export function useClientsData() {
    const [clients, setClients] = useState<ClientStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);
    const [blockingClient, setBlockingClient] = useState<string | null>(null);
    const lastRequestId = useRef(0);
    const supabase = createClient();

    const loadClients = useCallback(async (estId: string) => {
        setLoading(true);
        const requestId = ++lastRequestId.current;

        try {
            // Parallel fetch: appointments and blocked clients
            const [appointmentsResponse, blockedResponse] = await Promise.all([
                supabase
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
                    .eq("establishment_id", estId)
                    .not("client_profile_id", "is", null),
                supabase
                    .from("blocked_clients")
                    .select("client_profile_id")
                    .eq("establishment_id", estId)
            ]);

            if (requestId !== lastRequestId.current) return;

            const appointments = appointmentsResponse.data;
            const blockedIds = new Set(blockedResponse.data?.map(b => b.client_profile_id) || []);

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
            if (requestId === lastRequestId.current) {
                setLoading(false);
            }
        }
    }, [supabase]);

    const blockClient = async (clientProfileId: string, block: boolean) => {
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
        }
    };

    useEffect(() => {
        const init = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("establishments")
                .select("id")
                .eq("user_id", user.id)
                .single();

            if (data) {
                setEstablishmentId(data.id);
                loadClients(data.id);
            }
        };
        init();
    }, [loadClients, supabase]);

    return {
        clients,
        loading,
        blockClient,
        blockingClient,
        refresh: () => establishmentId && loadClients(establishmentId),
    };
}
