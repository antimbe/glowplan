"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import {
  TrendingUp,
  Calendar,
  CreditCard,
  CheckCircle2,
  Loader2,
  ChevronDown,
  BarChart3,
  Clock,
  Info,
  Users,
  XCircle,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from "lucide-react";
import { useStatistics, TimeFilter } from "@/components/features/dashboard/statistics/useStatistics";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend,
} from "recharts";

export default function StatisticsPage() {
  const router = useRouter();
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEst = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/pro/login"); return; }
      try {
        const { data: est } = await supabase
          .from("establishments")
          .select("id")
          .eq("user_id", user.id)
          .single();
        if (est) setEstablishmentId(est.id);
      } catch (error) {
        console.error("Error fetching establishment:", error);
      }
    };
    fetchEst();
  }, [router]);

  const { filter, setFilter, data, loading } = useStatistics(establishmentId || "");

  if (loading || !establishmentId) {
    return (
      <div className="w-full flex-1 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
        <p className="text-gray-500 mt-4 font-medium animate-pulse">Chargement de vos statistiques...</p>
      </div>
    );
  }

  if (!data) return null;

  const honoredRate = data.totalBookings > 0
    ? Math.round((data.completedBookings / data.totalBookings) * 100)
    : 0;

  // Helper badge croissance
  const GrowthBadge = ({ value }: { value: number | null }) => {
    if (value === null) return null;
    if (value === 0) return (
      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-gray-50 text-gray-400 px-2 py-1 rounded-lg">
        <Minus size={10} /> Stable
      </span>
    );
    const positive = value > 0;
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${positive ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
        {positive ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
        {positive ? "+" : ""}{value}% vs période préc.
      </span>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 pb-20 p-4 sm:p-6 lg:p-0">

      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary">
            <TrendingUp size={24} strokeWidth={2.5} className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Mes statistiques</h1>
            <p className="text-sm sm:text-base text-gray-500 font-medium">Analysez vos performances et vos revenus</p>
          </div>
        </div>

        <div className="relative inline-block text-left min-w-[200px]">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as TimeFilter)}
            className="block w-full appearance-none bg-white border border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl font-bold hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer shadow-sm"
          >
            <option value="this_month">Ce mois-ci</option>
            <option value="last_month">Le mois dernier</option>
            <option value="last_30_days">Les 30 derniers jours</option>
            <option value="all_time">Depuis toujours</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
            <ChevronDown size={18} />
          </div>
        </div>
      </div>

      {/* Légende contextuelle */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 items-start">
        <Info size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700 space-y-1">
          <p><span className="font-bold">Réservations prises</span> — tous les RDV actifs (en attente, confirmés et honorés).</p>
          <p><span className="font-bold">RDV honorés</span> — uniquement les RDV que vous avez marqués comme réalisés.</p>
          <p><span className="font-bold">Chiffre d'affaires</span> — calculé uniquement sur les RDV honorés. Le revenu attendu (RDV confirmés à venir) est affiché séparément.</p>
        </div>
      </div>

      {/* KPI Cards — ligne 1 : 3 cartes principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">

        {/* Réservations prises */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors" />
          <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
            <div className="p-2 sm:p-3 bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl">
              <Calendar size={18} className="sm:w-5 sm:h-5" />
            </div>
            <GrowthBadge value={data.bookingsGrowth} />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Réservations prises</p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">{data.totalBookings}</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {data.confirmedBookings > 0 && (
                <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-lg">
                  {data.confirmedBookings} confirmé{data.confirmedBookings > 1 ? "s" : ""}
                </span>
              )}
              {data.pendingBookings > 0 && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-600 px-2 py-1 rounded-lg">
                  {data.pendingBookings} en attente
                </span>
              )}
              {data.completedBookings > 0 && (
                <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded-lg">
                  {data.completedBookings} honoré{data.completedBookings > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RDV honorés */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-50 rounded-full blur-2xl group-hover:bg-green-100 transition-colors" />
          <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
            <div className="p-2 sm:p-3 bg-green-100 text-green-600 rounded-lg sm:rounded-xl">
              <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md sm:rounded-lg">
              {honoredRate}% du total
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">RDV honorés</p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-2">{data.completedBookings}</h3>
            <p className="text-[10px] text-gray-400 font-medium">RDV marqués comme réalisés</p>
          </div>
        </div>

        {/* CA */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-primary-light/20 shadow-xl shadow-primary/30 relative overflow-hidden text-white group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
            <div className="p-2 sm:p-3 bg-white/20 text-white rounded-lg sm:rounded-xl backdrop-blur-md">
              <CreditCard size={18} className="sm:w-5 sm:h-5" />
            </div>
            {data.revenueGrowth !== null && (
              <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-lg ${data.revenueGrowth >= 0 ? "bg-white/20 text-white" : "bg-red-400/30 text-white"}`}>
                {data.revenueGrowth >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {data.revenueGrowth >= 0 ? "+" : ""}{data.revenueGrowth}%
              </span>
            )}
          </div>
          <div className="relative z-10">
            <p className="text-[10px] sm:text-xs font-bold text-primary-light uppercase tracking-widest mb-1">Chiffre d'affaires</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white mb-2">{data.totalRevenue.toFixed(2)} €</h3>
            {data.expectedRevenue > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                <Clock size={12} className="text-white/50" />
                <p className="text-[10px] text-white/60 font-medium">
                  + {data.expectedRevenue.toFixed(2)} € attendus (RDV confirmés)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards — ligne 2 : clients uniques + taux annulation + no-show */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Clients uniques */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0">
            <Users size={20} className="text-violet-500" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Clients uniques</p>
            <p className="text-2xl font-black text-gray-900">{data.uniqueClients}</p>
            <p className="text-[10px] text-gray-400">clients distincts sur la période</p>
          </div>
        </div>

        {/* Taux annulation */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${data.cancellationRate > 20 ? "bg-red-50" : "bg-gray-50"}`}>
            <XCircle size={20} className={data.cancellationRate > 20 ? "text-red-400" : "text-gray-400"} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Taux d'annulation</p>
            <p className={`text-2xl font-black ${data.cancellationRate > 20 ? "text-red-500" : "text-gray-900"}`}>
              {data.cancellationRate}%
            </p>
            <p className="text-[10px] text-gray-400">{data.cancelledBookings} annulation{data.cancelledBookings > 1 ? "s" : ""}</p>
          </div>
        </div>

        {/* Taux absent */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${data.noShowRate > 10 ? "bg-orange-50" : "bg-gray-50"}`}>
            <TrendingDown size={20} className={data.noShowRate > 10 ? "text-orange-400" : "text-gray-400"} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Taux absent (lapin)</p>
            <p className={`text-2xl font-black ${data.noShowRate > 10 ? "text-orange-500" : "text-gray-900"}`}>
              {data.noShowRate}%
            </p>
            <p className="text-[10px] text-gray-400">{data.noShowBookings} RDV non honoré{data.noShowBookings > 1 ? "s" : ""}</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">

        {/* Évolution réservations + honorés */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="flex gap-2 sm:gap-3 items-center mb-2">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600"><BarChart3 size={16} /></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Évolution des Réservations</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6 ml-10">Réservations prises vs RDV honorés</p>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                  labelStyle={{ fontWeight: "bold", color: "#111827", marginBottom: "4px" }}
                />
                <Legend
                  formatter={(value) => value === "reservations" ? "Prises" : "Honorées"}
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                />
                <Area type="monotone" dataKey="reservations" name="reservations" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRes)" />
                <Area type="monotone" dataKey="honores" name="honores" stroke="#22c55e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHon)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenus */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="flex gap-2 sm:gap-3 items-center mb-2">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><CreditCard size={16} /></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Revenus Générés</h3>
          </div>
          <p className="text-xs text-gray-400 mb-6 ml-10">Calculé sur les RDV honorés uniquement</p>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ borderRadius: "16px", border: "none", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}
                  labelStyle={{ fontWeight: "bold", color: "#111827", marginBottom: "4px" }}
                  formatter={(value: any) => [`${value} €`, "Revenu"]}
                />
                <Bar dataKey="revenus" name="Revenus" fill="#E2A684" radius={[6, 6, 6, 6]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Prestations */}
      <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/40">
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Top Prestations</h3>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">Vos services les plus populaires pour la période sélectionnée</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[560px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] sm:text-xs uppercase tracking-widest">
                <th className="p-3 sm:p-4 font-bold border-b border-gray-100">Prestation</th>
                <th className="p-3 sm:p-4 font-bold border-b border-gray-100">Prises</th>
                <th className="p-3 sm:p-4 font-bold border-b border-gray-100">Honorées</th>
                <th className="p-3 sm:p-4 font-bold border-b border-gray-100">Tarif moyen</th>
                <th className="p-3 sm:p-4 font-bold border-b border-gray-100 text-right">Revenus générés</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.topServices.length > 0 ? (
                data.topServices.map((service, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-900">{service.serviceName}</div>
                      <div className="text-xs text-gray-500 font-medium mt-1">
                        {Math.round(service.bookingRate)}% du volume total
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-sm">
                        {service.count}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-green-50 text-green-700 font-bold text-sm">
                        {service.completedCount}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-600">
                      {Math.round(service.averagePrice)} €
                    </td>
                    <td className="p-4 text-right">
                      <span className="font-black text-primary text-lg">{service.revenue} €</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    Aucune réservation pour cette période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
