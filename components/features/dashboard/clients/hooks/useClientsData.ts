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
            const [appointmentsResponse, blockedResponse] = await Promise.all([
                supabase
                    .from("appointments")
                    .select(`
                        client_profile_id,
                        client_name,
                        client_first_name,
                        client_last_name,
                        client_email,
                        client_phone,
                        client_instagram,
                        status,
                        cancelled_by_client,
                        start_time,
                        end_time,
                        services(price)
                    `)
                    .eq("establishment_id", estId),
                supabase
                    .from("blocked_clients")
                    .select("client_profile_id, client_email, client_phone")
                    .eq("establishment_id", estId)
            ]);

            if (requestId !== lastRequestId.current) return;

            const appointments = appointmentsResponse.data || [];

            // Build blocked sets for profile IDs and emails
            const blockedProfileIds = new Set<string>();
            const blockedEmails = new Set<string>();
            for (const b of blockedResponse.data || []) {
                if (b.client_profile_id) blockedProfileIds.add(b.client_profile_id);
                if (b.client_email) blockedEmails.add(b.client_email.toLowerCase());
            }

            const isBlocked = (profileId: string | null, email: string) =>
                (profileId ? blockedProfileIds.has(profileId) : false) ||
                blockedEmails.has(email.toLowerCase());

            const clientMap = new Map<string, ClientStats>();

            appointments.forEach(apt => {
                const profileId = apt.client_profile_id ?? null;
                const email = apt.client_email || "";
                if (!email && !profileId) return; // pas de clé identifiable

                // Clé unique : profileId en priorité, sinon email
                const key = profileId || `guest_${email}`;

                const existing = clientMap.get(key);
                const isCompleted = apt.status === "completed" || (apt.status === "confirmed" && new Date(apt.end_time) < new Date());
                const isCancelledByClient = apt.status === "cancelled" && apt.cancelled_by_client === true;
                const isNoShow = apt.status === "no_show";
                const price = (apt.services as any)?.price || 0;

                if (existing) {
                    if (isCompleted) {
                        existing.total_visits++;
                        existing.total_spent += price;
                        if (!existing.last_visit || new Date(apt.start_time) > new Date(existing.last_visit)) {
                            existing.last_visit = apt.start_time;
                        }
                    }
                    if (isCancelledByClient) existing.total_cancellations++;
                    if (isNoShow) existing.no_show_count++;
                } else {
                    clientMap.set(key, {
                        id: key,
                        client_profile_id: profileId,
                        first_name: apt.client_first_name || (apt.client_name ? apt.client_name.split(" ")[0] : ""),
                        last_name: apt.client_last_name || (apt.client_name ? apt.client_name.split(" ").slice(1).join(" ") : ""),
                        email,
                        phone: apt.client_phone || null,
                        instagram: apt.client_instagram || null,
                        total_visits: isCompleted ? 1 : 0,
                        total_spent: isCompleted ? price : 0,
                        total_cancellations: isCancelledByClient ? 1 : 0,
                        last_visit: isCompleted ? apt.start_time : null,
                        is_blocked: isBlocked(profileId, email),
                        no_show_count: isNoShow ? 1 : 0,
                        is_guest: !profileId,
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

    const blockClient = async (client: ClientStats, block: boolean) => {
        if (!establishmentId) return;
        setBlockingClient(client.id);

        try {
            if (block) {
                await supabase.from("blocked_clients").insert({
                    establishment_id: establishmentId,
                    client_profile_id: client.client_profile_id || null,
                    client_email: client.email || null,
                    client_phone: client.phone || null,
                });
            } else {
                // Pour les guests : supprimer par email
                if (!client.client_profile_id && client.email) {
                    await supabase
                        .from("blocked_clients")
                        .delete()
                        .eq("establishment_id", establishmentId)
                        .eq("client_email", client.email);
                } else {
                    await supabase
                        .from("blocked_clients")
                        .delete()
                        .eq("establishment_id", establishmentId)
                        .eq("client_profile_id", client.client_profile_id!);
                }
            }

            setClients(prev => prev.map(c =>
                c.id === client.id ? { ...c, is_blocked: block } : c
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
        establishmentId,
        blockClient,
        blockingClient,
        refresh: () => establishmentId && loadClients(establishmentId),
    };
}
