"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { startOfMonth, endOfMonth, subMonths, subDays, endOfDay } from "date-fns";

export type TimeFilter = "this_month" | "last_month" | "last_30_days" | "all_time";

export interface ServiceStat {
  serviceName: string;
  count: number;
  completedCount: number;
  revenue: number;
  averagePrice: number;
  bookingRate: number;
}

export interface ChartDataPoint {
  name: string;
  reservations: number;
  honores: number;
  revenus: number;
}

export interface StatisticsData {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  uniqueClients: number;
  totalRevenue: number;
  expectedRevenue: number;
  cancellationRate: number;
  noShowRate: number;
  revenueGrowth: number | null;   // % vs période précédente, null si all_time
  bookingsGrowth: number | null;
  chartData: ChartDataPoint[];
  topServices: ServiceStat[];
}

/* ── helpers ─────────────────────────────────────────────────────────── */

function getPreviousPeriod(filter: TimeFilter, now: Date): { start: Date; end: Date } | null {
  switch (filter) {
    case "this_month": {
      const prev = subMonths(now, 1);
      return { start: startOfMonth(prev), end: endOfMonth(prev) };
    }
    case "last_month": {
      const prev = subMonths(now, 2);
      return { start: startOfMonth(prev), end: endOfMonth(prev) };
    }
    case "last_30_days":
      return { start: subDays(now, 60), end: subDays(now, 30) };
    case "all_time":
    default:
      return null;
  }
}

function growth(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 100);
}

/* ── hook ────────────────────────────────────────────────────────────── */

export function useStatistics(establishmentId: string) {
  const [filter, setFilter] = useState<TimeFilter>("this_month");
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<StatisticsData | null>(null);

  const loadData = useCallback(async () => {
    if (!establishmentId) return;

    setLoading(true);
    const supabase = createClient();
    try {
      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      switch (filter) {
        case "this_month":
          startDate = startOfMonth(now);
          endDate   = endOfMonth(now);
          break;
        case "last_month": {
          const lm = subMonths(now, 1);
          startDate = startOfMonth(lm);
          endDate   = endOfMonth(lm);
          break;
        }
        case "last_30_days":
          startDate = subDays(now, 30);
          endDate   = endOfDay(now);
          break;
        case "all_time":
        default:
          startDate = new Date(2000, 0, 1);
          endDate   = endOfDay(now);
          break;
      }

      // ── Fetch période courante ──────────────────────────────────────
      const { data: apts, error } = await supabase
        .from("appointments")
        .select("id, start_time, status, client_profile_id, services(name, price)")
        .eq("establishment_id", establishmentId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString());

      if (error) throw error;

      interface RawApt {
        id: string;
        start_time: string;
        status: string;
        client_profile_id: string | null;
        services: { name: string; price: number } | null | any;
      }

      const all = (apts || []) as unknown as RawApt[];

      // Actifs (hors cancelled / refused)
      const activeApts    = all.filter(a => !["cancelled", "refused", "pending_external_action"].includes(a.status));
      const completedApts = activeApts.filter(a => a.status === "completed");
      const confirmedApts = activeApts.filter(a => a.status === "confirmed");
      const pendingApts   = activeApts.filter(a => ["pending", "pending_deposit"].includes(a.status));
      const cancelledApts = all.filter(a => ["cancelled", "refused"].includes(a.status));
      const noShowApts    = all.filter(a => a.status === "no_show");

      const totalBookings     = all.length;
      const completedBookings = completedApts.length;
      const confirmedBookings = confirmedApts.length;
      const pendingBookings   = pendingApts.length;
      const cancelledBookings = cancelledApts.length;
      const noShowBookings    = noShowApts.length;

      // Clients uniques (parmi les actifs)
      const uniqueClients = new Set(
        activeApts.map(a => a.client_profile_id).filter(Boolean)
      ).size;

      // Taux d'annulation et no-show
      const cancellationRate = totalBookings > 0 ? Math.round((cancelledBookings / totalBookings) * 100) : 0;
      const noShowRate       = totalBookings > 0 ? Math.round((noShowBookings    / totalBookings) * 100) : 0;

      // Revenus réels (honorés) + attendus (confirmés)
      let totalRevenue    = 0;
      let expectedRevenue = 0;
      completedApts.forEach(a => {
        const s = Array.isArray(a.services) ? a.services[0] : a.services;
        if (s?.price) totalRevenue += s.price;
      });
      confirmedApts.forEach(a => {
        const s = Array.isArray(a.services) ? a.services[0] : a.services;
        if (s?.price) expectedRevenue += s.price;
      });

      // ── Période précédente pour croissance ─────────────────────────
      let revenueGrowth: number | null  = null;
      let bookingsGrowth: number | null = null;

      const prevPeriod = getPreviousPeriod(filter, now);
      if (prevPeriod) {
        const { data: prevApts } = await supabase
          .from("appointments")
          .select("id, status, services(price)")
          .eq("establishment_id", establishmentId)
          .gte("start_time", prevPeriod.start.toISOString())
          .lte("start_time", prevPeriod.end.toISOString());

        const prevAll       = (prevApts || []) as any[];
        const prevActive    = prevAll.filter(a => !["cancelled", "refused"].includes(a.status));
        const prevCompleted = prevActive.filter(a => a.status === "completed");

        let prevRevenue = 0;
        prevCompleted.forEach(a => {
          const s = Array.isArray(a.services) ? a.services[0] : a.services;
          if (s?.price) prevRevenue += s.price;
        });

        revenueGrowth  = growth(totalRevenue,  prevRevenue);
        bookingsGrowth = growth(activeApts.length, prevActive.length);
      }

      // ── Chart ──────────────────────────────────────────────────────
      const chartMap = new Map<string, { reservations: number; honores: number; revenus: number }>();
      activeApts.forEach(a => {
        const d   = new Date(a.start_time);
        const isC = a.status === "completed";
        const s   = Array.isArray(a.services) ? a.services[0] : a.services;
        const price = isC && s?.price ? s.price : 0;

        const key = filter === "all_time"
          ? `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
          : `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;

        const ex = chartMap.get(key) || { reservations: 0, honores: 0, revenus: 0 };
        ex.reservations += 1;
        if (isC) ex.honores += 1;
        ex.revenus += price;
        chartMap.set(key, ex);
      });

      const chartData: ChartDataPoint[] = Array.from(chartMap.keys())
        .sort()
        .map(k => ({ name: k, ...chartMap.get(k)! }));

      // ── Top services ───────────────────────────────────────────────
      const serviceMap = new Map<string, { count: number; completedCount: number; revenue: number }>();
      activeApts.forEach(a => {
        const s   = Array.isArray(a.services) ? a.services[0] : a.services;
        if (!s) return;
        const isC = a.status === "completed";
        const price = isC && s.price ? s.price : 0;
        const ex  = serviceMap.get(s.name) || { count: 0, completedCount: 0, revenue: 0 };
        ex.count += 1;
        if (isC) ex.completedCount += 1;
        ex.revenue += price;
        serviceMap.set(s.name, ex);
      });

      const topServices: ServiceStat[] = Array.from(serviceMap.entries())
        .map(([name, stat]) => ({
          serviceName:   name,
          count:         stat.count,
          completedCount: stat.completedCount,
          revenue:       stat.revenue,
          averagePrice:  stat.completedCount > 0 ? stat.revenue / stat.completedCount : 0,
          bookingRate:   activeApts.length > 0 ? (stat.count / activeApts.length) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      setData({
        totalBookings,
        completedBookings,
        confirmedBookings,
        pendingBookings,
        cancelledBookings,
        noShowBookings,
        uniqueClients,
        totalRevenue,
        expectedRevenue,
        cancellationRate,
        noShowRate,
        revenueGrowth,
        bookingsGrowth,
        chartData,
        topServices,
      });

    } catch (err) {
      console.error("Error loading statistics:", err);
    } finally {
      setLoading(false);
    }
  }, [establishmentId, filter]);

  useEffect(() => { loadData(); }, [loadData]);

  return { filter, setFilter, data, loading };
}
