"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { startOfMonth, endOfMonth, subMonths, subDays, startOfDay, endOfDay, isWithinInterval, isSameMonth } from "date-fns";

export type TimeFilter = "this_month" | "last_month" | "last_30_days" | "all_time";

export interface ServiceStat {
  serviceName: string;
  count: number;
  revenue: number;
  averagePrice: number;
  bookingRate: number; // percentage of total bookings
}

export interface ChartDataPoint {
  name: string; // Date or month name
  reservations: number;
  revenus: number;
}

export interface StatisticsData {
  totalBookings: number;
  confirmedBookings: number;
  totalRevenue: number;
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
          startDate = new Date(2000, 0, 1); // Way back
          endDate = endOfDay(now);
          break;
      }

      // Fetch appointments with their service details
      const { data: apts, error } = await supabase
        .from("appointments")
        .select(`
          id, start_time, status,
          services(name, price)
        `)
        .eq("establishment_id", establishmentId)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString());

      if (error) throw error;

      // Define expected type since Supabase can infer plural name as array
      interface RawApt {
        id: string;
        start_time: string;
        status: string;
        services: { name: string; price: number } | null | any;
      }

      const validApts = (apts || []) as unknown as RawApt[];
      const totalBookings = validApts.length;
      
      const confirmedApts = validApts.filter(a => ["confirmed", "completed", "pending", "pending_deposit"].includes(a.status));
      // Revenu et réservations officiellement validées (donc confirmées ou déjà effectuées)
      const strictlyConfirmedApts = validApts.filter(a => ["confirmed", "completed"].includes(a.status));
      const confirmedBookingsCount = strictlyConfirmedApts.length;

      // Revenus
      let totalRevenue = 0;
      strictlyConfirmedApts.forEach(a => {
        const s = Array.isArray(a.services) ? a.services[0] : a.services;
        if (s && typeof s.price === 'number') {
          totalRevenue += s.price;
        }
      });

      // Chart Data
      // Group by day for <= 30 days periods, group by month for all_time
      const chartMap = new Map<string, { reservations: number, revenus: number }>();
      
      validApts.forEach(a => {
        const d = new Date(a.start_time);
        const isOfficial = ["confirmed", "completed"].includes(a.status);
        const s = Array.isArray(a.services) ? a.services[0] : a.services;
        const price = (isOfficial && s?.price) ? s.price : 0;
        
        let key = "";
        if (filter === "all_time") {
          key = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, '0')}`;
        } else {
          key = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}`;
        }

        const existing = chartMap.get(key) || { reservations: 0, revenus: 0 };
        existing.reservations += 1;
        existing.revenus += price;
        chartMap.set(key, existing);
      });

      // Sort map keys to create ordered chart data
      const sortedKeys = Array.from(chartMap.keys()).sort();
      const chartData: ChartDataPoint[] = sortedKeys.map(k => ({
        name: k,
        reservations: chartMap.get(k)!.reservations,
        revenus: chartMap.get(k)!.revenus,
      }));

      // Top Services
      const serviceMap = new Map<string, { count: number, revenue: number, name: string }>();
      validApts.forEach(a => {
        const s = Array.isArray(a.services) ? a.services[0] : a.services;
        if (!s) return;
        const sName = s.name;
        const isOfficial = ["confirmed", "completed"].includes(a.status);
        const price = (isOfficial && s.price) ? s.price : 0;

        const existing = serviceMap.get(sName) || { count: 0, revenue: 0, name: sName };
        existing.count += 1;
        existing.revenue += price;
        serviceMap.set(sName, existing);
      });

      const topServices: ServiceStat[] = Array.from(serviceMap.values())
        .map(stat => ({
          serviceName: stat.name,
          count: stat.count,
          revenue: stat.revenue,
          averagePrice: 0, // Calculated below
          bookingRate: totalBookings > 0 ? (stat.count / totalBookings) * 100 : 0
        }))
        .sort((a, b) => b.count - a.count);

      // Fix average price strictly: it's better to just use revenue / confirmed bookings for that service.
      topServices.forEach(stat => {
        const confirmedForService = strictlyConfirmedApts.filter(ap => {
          const aps = Array.isArray(ap.services) ? ap.services[0] : ap.services;
          return aps?.name === stat.serviceName;
        }).length;
        stat.averagePrice = confirmedForService > 0 ? stat.revenue / confirmedForService : 0;
      });

      setData({
        totalBookings,
        confirmedBookings: confirmedBookingsCount,
        totalRevenue,
        chartData,
        topServices
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
