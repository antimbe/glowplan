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
  ArrowUpRight
} from "lucide-react";
import { useStatistics, TimeFilter } from "@/components/features/dashboard/statistics/useStatistics";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';

export default function StatisticsPage() {
  const router = useRouter();
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEst = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/pro/login");
        return;
      }
      try {
        const { data: est } = await supabase
          .from("establishments")
          .select("id")
          .eq("user_id", user.id)
          .single();
        
        if (est) {
          setEstablishmentId(est.id);
        }
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

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 pb-20 p-4 sm:p-6 lg:p-0">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary">
              <TrendingUp size={24} strokeWidth={2.5} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Mes statistiques</h1>
              <p className="text-sm sm:text-base text-gray-500 font-medium">Analysez vos performances et vos revenus</p>
            </div>
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

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Réservations Totales */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl group-hover:bg-blue-100 transition-colors" />
          <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
            <div className="p-2 sm:p-3 bg-blue-100 text-blue-600 rounded-lg sm:rounded-xl">
              <Calendar size={18} className="sm:w-5 sm:h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Réservations</p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900">{data.totalBookings}</h3>
          </div>
        </div>

        {/* Réservations Confirmées */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-green-50 rounded-full blur-2xl group-hover:bg-green-100 transition-colors" />
          <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
            <div className="p-2 sm:p-3 bg-green-100 text-green-600 rounded-lg sm:rounded-xl">
              <CheckCircle2 size={18} className="sm:w-5 sm:h-5" />
            </div>
            <div className="text-[10px] sm:text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-md sm:rounded-lg flex items-center gap-1">
              {data.totalBookings > 0 ? Math.round((data.confirmedBookings / data.totalBookings) * 100) : 0}% du total
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Confirmées / Achevées</p>
            <h3 className="text-3xl sm:text-4xl font-black text-gray-900">{data.confirmedBookings}</h3>
          </div>
        </div>

        {/* Chiffre d'Affaires */}
        <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-primary-light/20 shadow-xl shadow-primary/30 relative overflow-hidden text-white group">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
            <div className="p-2 sm:p-3 bg-white/20 text-white rounded-lg sm:rounded-xl backdrop-blur-md">
              <CreditCard size={18} className="sm:w-5 sm:h-5" />
            </div>
            <ArrowUpRight size={20} className="sm:w-6 sm:h-6 text-white/50" />
          </div>
          <div className="relative z-10">
            <p className="text-[10px] sm:text-xs font-bold text-primary-light uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
            <h3 className="text-3xl sm:text-4xl font-black text-white">{data.totalRevenue} €</h3>
          </div>
        </div>
      </div>

      {/* Charts Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Evolution des réservations */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="flex gap-2 sm:gap-3 items-center mb-6 sm:mb-8">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-600"><BarChart3 size={16} className="sm:w-[18px] sm:h-[18px]" /></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Évolution des Réservations</h3>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                />
                <Area type="monotone" dataKey="reservations" name="Réservations" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRes)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Evolution du CA */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-xl shadow-gray-200/40">
          <div className="flex gap-2 sm:gap-3 items-center mb-6 sm:mb-8">
            <div className="p-2 bg-primary/10 rounded-lg text-primary"><CreditCard size={16} className="sm:w-[18px] sm:h-[18px]" /></div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900">Revenus Générés</h3>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#111827', marginBottom: '4px' }}
                  formatter={(value: any) => [`${value} €`, 'Revenu']}
                />
                <Bar dataKey="revenus" name="Revenus" fill="#E2A684" radius={[6, 6, 6, 6]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Prestations Table */}
      <div className="bg-white rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 shadow-xl shadow-gray-200/40">
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Top Prestations</h3>
          <p className="text-[11px] sm:text-sm text-gray-500 mt-1">Vos services les plus populaires pour la période sélectionnée</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[500px] sm:min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-[10px] sm:text-xs uppercase tracking-widest">
                <th className="p-3 sm:p-4 font-bold border-b border-gray-100">Prestation</th>
                <th className="p-3 sm:p-4 font-bold border-b border-gray-100">Réservations</th>
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
                        Représente {Math.round(service.bookingRate)}% du volume
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-gray-100 text-gray-700 font-bold text-sm">
                        {service.count}
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
                  <td colSpan={4} className="p-8 text-center text-gray-500 font-medium">
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
