"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { startOfMonth, endOfMonth, subMonths, subDays, endOfDay } from "date-fns";

export type TimeFilter = "this_month" | "last_month" | "last_30_days" | "all_time";

export interface ServiceStat {
  serviceName: string;
  count: number;          // all active bookings
  completedCount: number; // honored only
  revenue: number;        // from completed only
  averagePrice: number;
  bookingRate: number;
}

export interface ChartDataPoint {
  name: string;
  reservations: number;  // all active
  honores: number;       // completed only
  revenus: number;
}

export interface StatisticsData {
  totalBookings: number;     // pending + confirmed + pending_deposit + completed
  completedBookings: number; // honored (completed)
  pendingBookings: number;   // pending + pending_deposit
  confirmedBookings: number; // confirmed (upcoming)
  totalRevenue: number;      // from completed only
  expectedRevenue: number;   // from confirmed (not yet completed)
  chartData: ChartDataPoint[];
  topServices: ServiceStat[];
}

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
          endDate = endOfMonth(now);
          break;
        case "last_month":
          const lastMonth = subMonths(now, 1);
          startDate = startOfMonth(lastMonth);
          endDate = endOfMonth(lastMonth);
          break;
        case "last_30_days":
          startDate = subDays(now, 30);
          endDate = endOfDay(now);
          break;
        case "all_time":
        default:
          startDate = new Date(2000, 0, 1);
          endDate = endOfDay(now);
          break;
      }

      const { data: apts, error } = await supabase
        .from("appointments")
        .select(`id, start_time, status, services(name, price)`)
        .eq("establishment_id", establishmentId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString());

      if (error) throw error;

      interface RawApt {
        id: string;
        start_time: string;
        status: string;
        services: { name: string; price: number } | null | any;
      }

      const all = (apts || []) as unknown as RawApt[];

      // Active = tout sauf cancelled / refused
      const activeApts = all.filter(a =>
        !["cancelled", "refused", "pending_external_action"].includes(a.status)
      );

      const completedApts   = activeApts.filter(a => a.status === "completed");
      const confirmedApts   = activeApts.filter(a => a.status === "confirmed");
      const pendingApts     = activeApts.filter(a => ["pending", "pending_deposit", "no_show"].includes(a.status));

      const totalBookings     = activeApts.length;
      const completedBookings = completedApts.length;
      const confirmedBookings = confirmedApts.length;
      const pendingBookings   = pendingApts.length;

      // Revenu réel = honorés uniquement
      let totalRevenue = 0;
      completedApts.forEach(a => {
        const s = Array.isArray(a.services) ? a.services[0] : a.services;
        if (s?.price) totalRevenue += s.price;
      });

      // Revenu attendu = confirmés (pas encore passés)
      let expectedRevenue = 0;
      confirmedApts.forEach(a => {
        const s = Array.isArray(a.services) ? a.services[0] : a.services;
        if (s?.price) expectedRevenue += s.price;
      });

      // Chart
      const chartMap = new Map<string, { reservations: number; honores: number; revenus: number }>();

      activeApts.forEach(a => {
        const d = new Date(a.start_time);
        const isCompleted = a.status === "completed";
        const s = Array.isArray(a.services) ? a.services[0] : a.services;
        const price = isCompleted && s?.price ? s.price : 0;

        const key = filter === "all_time"
          ? `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`
          : `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}`;

        const existing = chartMap.get(key) || { reservations: 0, honores: 0, revenus: 0 };
        existing.reservations += 1;
        if (isCompleted) existing.honores += 1;
        existing.revenus += price;
        chartMap.set(key, existing);
      });

      const chartData: ChartDataPoint[] = Array.from(chartMap.keys())
        .sort()
        .map(k => ({ name: k, ...chartMap.get(k)! }));

      // Top services
      const serviceMap = new Map<string, { count: number; completedCount: number; revenue: number; name: string }>();

      activeApts.forEach(a => {
        const s = Array.isArray(a.services) ? a.services[0] : a.services;
        if (!s) return;
        const isCompleted = a.status === "completed";
        const price = isCompleted && s.price ? s.price : 0;

        const existing = serviceMap.get(s.name) || { count: 0, completedCount: 0, revenue: 0, name: s.name };
        existing.count += 1;
        if (isCompleted) existing.completedCount += 1;
        existing.revenue += price;
        serviceMap.set(s.name, existing);
      });

      const topServices: ServiceStat[] = Array.from(serviceMap.values())
        .map(stat => ({
          serviceName: stat.name,
          count: stat.count,
          completedCount: stat.completedCount,
          revenue: stat.revenue,
          averagePrice: stat.completedCount > 0 ? stat.revenue / stat.completedCount : 0,
          bookingRate: totalBookings > 0 ? (stat.count / totalBookings) * 100 : 0,
        }))
        .sort((a, b) => b.count - a.count);

      setData({
        totalBookings,
        completedBookings,
        confirmedBookings,
        pendingBookings,
        totalRevenue,
        expectedRevenue,
        chartData,
        topServices,
      });

    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  }, [establishmentId, filter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { filter, setFilter, data, loading };
}
