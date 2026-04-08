"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle, CalendarClock } from "lucide-react";
import { Button, Badge, Heading, Separator } from "@/components/ui";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/features/Header";
import { CancelModal } from "@/components/features/account/CancelModal";
import { RescheduleModal } from "@/components/features/account/RescheduleModal";

// Helper function to get status text & color
const getStatusDisplay = (status: string) => {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmé', color: 'bg-green-100 text-green-800 border-green-200', icon: <CheckCircle2 size={14} className="mr-1" /> };
    case 'pending':
      return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: <AlertCircle size={14} className="mr-1" /> };
    case 'pending_deposit':
      return { label: 'Attente Acompte', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <AlertCircle size={14} className="mr-1" /> };
    case 'cancelled':
      return { label: 'Annulé', color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle size={14} className="mr-1" /> };
    case 'refused':
      return { label: 'Refusé', color: 'bg-red-100 text-red-800 border-red-200', icon: <XCircle size={14} className="mr-1" /> };
    case 'completed':
      return { label: 'Honoré', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: <CheckCircle2 size={14} className="mr-1" /> };
    case 'no_show':
      return { label: 'Non honoré', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: <XCircle size={14} className="mr-1" /> };
    default:
      return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200', icon: null };
  }
};

export default function BookingDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [appointment, setAppointment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // States for cancellation
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // States for reschedule
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchBookingData();
  }, [id]);

  const fetchBookingData = async () => {
    try {
      setLoading(true);
      
      const { data, error: fetchError } = await supabase
        .from("appointments")
        .select(`
          *,
          services (*),
          establishments (*)
        `)
        .eq("id", id)
        .single();

      if (fetchError || !data) {
        setError("Réservation introuvable ou vous n'avez pas l'autorisation d'y accéder.");
        setLoading(false);
        return;
      }

      setAppointment(data);
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors du chargement de la réservation.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!appointment) return;
    
    setCancelling(true);
    try {
      const response = await fetch("/api/booking/cancel-by-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          reason: cancelReason || null,
        }),
      });

      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Failed to cancel appointment");
      }

      setAppointment((prev: any) => ({ ...prev, status: "cancelled" }));
      setShowCancelModal(false);
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
         <div className="bg-white p-8 rounded-2xl shadow-sm border border-red-100 max-w-md w-full text-center">
            <XCircle className="mx-auto text-red-500 mb-4" size={48} />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/account">
               <Button variant="primary" className="w-full">Retour à mon compte</Button>
            </Link>
         </div>
      </div>
    );
  }

  const startDate = new Date(appointment.start_time);
  const endDate = new Date(appointment.end_time);
  const isFuture = endDate > new Date();
  
  let displayStatus = appointment.status;
  if (displayStatus === "confirmed" && !isFuture) {
    displayStatus = "completed";
  }

  const statusInfo = getStatusDisplay(displayStatus);
  const hasCancelableStatus = appointment.status === "confirmed" || appointment.status === "pending" || appointment.status === "pending_deposit";
  const canCancel = isFuture && hasCancelableStatus;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <Header />
      
      <div className="pt-24">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Link href="/">
               <Button 
                  variant="ghost" 
                  className="text-gray-500 hover:text-primary transition-colors font-bold group px-0"
               >
                  <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                  Retour
               </Button>
            </Link>
          </div>
          
          <div className="bg-white rounded-[2.5rem] shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
            {/* Hero Banner Section */}
            <div className="relative h-48 md:h-64 lg:h-80 w-full bg-gray-200">
               {appointment.establishments?.main_photo_url ? (
                  <Image 
                     src={appointment.establishments.main_photo_url} 
                     alt={appointment.establishments.name}
                     fill
                     className="object-cover"
                     priority
                  />
               ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                     <span className="text-primary/40 font-black text-2xl uppercase tracking-tighter opacity-50">{appointment.establishments?.name}</span>
                  </div>
               )}
               {/* Overlay items */}
               <div className="absolute top-6 right-6">
                  <Badge variant="outline" className={`${statusInfo.color} flex w-max items-center font-bold px-4 py-2 text-sm shadow-lg backdrop-blur-md rounded-full border-white/20`}>
                     {statusInfo.icon}
                     {statusInfo.label}
                  </Badge>
               </div>
               
               {/* Bottom curve/fade */}
               <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
            </div>

            <div className="relative px-6 md:px-12 pb-12 -mt-12">
               <div className="flex flex-col lg:flex-row gap-12">
                  {/* Main Content Area */}
                  <div className="flex-1 space-y-10">
                     
                     {/* Establishment Header Info */}
                     <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div className="space-y-2">
                           <Heading level={1} className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                              {appointment.establishments?.name}
                           </Heading>
                           <div className="flex items-center gap-2 text-gray-500">
                               <MapPin size={18} className="text-primary shrink-0" />
                               {appointment.establishments?.hide_exact_address && 
                                (new Date(appointment.start_time).getTime() - new Date().getTime() > 24 * 60 * 60 * 1000) ? (
                                   <div className="space-y-1">
                                      <p className="text-base font-medium">{appointment.establishments?.city} {appointment.establishments?.zip_code}</p>
                                      <p className="text-xs text-primary font-bold italic bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
                                         L'adresse exacte vous sera communiquée 24h avant votre rendez-vous.
                                      </p>
                                   </div>
                                ) : (
                                   <p className="text-base font-medium">{appointment.establishments?.address}, {appointment.establishments?.city}</p>
                                )}
                           </div>
                           <p className="text-gray-400 text-xs font-medium tracking-widest uppercase">Réf: {appointment.id.slice(0, 8)}</p>
                        </div>
                        
                        {canCancel && (
                           <div className="flex flex-col sm:flex-row gap-3">
                              <Button
                                 variant="outline"
                                 className="text-primary border-primary/20 hover:bg-primary/5 hover:border-primary/40 rounded-2xl transition-all px-6 py-6 h-auto text-base font-bold shadow-sm"
                                 onClick={() => setShowRescheduleModal(true)}
                              >
                                 <CalendarClock className="mr-2" size={20} />
                                 Modifier le créneau
                              </Button>
                              <Button 
                                 variant="outline" 
                                 className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 rounded-2xl transition-all px-6 py-6 h-auto text-base font-bold shadow-sm"
                                 onClick={() => setShowCancelModal(true)}
                              >
                                 <XCircle className="mr-2" size={20} />
                                 Annuler
                              </Button>
                           </div>
                        )}
                     </div>

                     <Separator className="bg-gray-100" />

                     {/* Prestation Section avec GRANDE IMAGE */}
                     <section className="bg-gray-50/50 p-6 md:p-8 rounded-[2rem] border border-gray-100">
                        <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 text-center md:text-left">Détails de la prestation</h2>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                           {appointment.services?.image_url ? (
                              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-primary/10 bg-white ring-8 ring-white flex-shrink-0 group">
                                 <Image 
                                    src={appointment.services.image_url}
                                    alt={appointment.services.name || "Prestation"}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                 />
                              </div>
                           ) : (
                              <div className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] bg-primary/10 flex items-center justify-center text-primary flex-shrink-0 ring-8 ring-white shadow-xl">
                                 <CheckCircle2 size={64} className="opacity-30" />
                              </div>
                           )}
                           <div className="text-center md:text-left space-y-3">
                              <p className="font-extrabold text-gray-900 text-2xl md:text-3xl leading-none">{appointment.services?.name || "Prestation personnalisée"}</p>
                              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                                 {appointment.services?.duration && (
                                    <Badge variant="secondary" className="bg-white border-gray-100 text-gray-600 px-3 py-1.5 rounded-xl font-bold">
                                       <Clock size={14} className="mr-2 text-primary" />
                                       {appointment.services.duration} minutes
                                    </Badge>
                                 )}
                                 <Badge variant="secondary" className="bg-primary/10 border-transparent text-primary px-3 py-1.5 rounded-xl font-bold">
                                    {appointment.services?.price ? `${appointment.services.price}€` : "—"}
                                 </Badge>
                              </div>
                              {appointment.services?.description && appointment.services.description !== "Mystère" && (
                                 <p className="text-gray-500 max-w-md text-sm leading-relaxed mt-4 italic border-l-2 border-primary/10 pl-4">{appointment.services.description}</p>
                              )}
                           </div>
                        </div>
                     </section>

                     {/* Date, Heure et Facturation */}
                     <div className="grid md:grid-cols-2 gap-8">
                        <section className="space-y-4">
                           <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Rendez-vous</h2>
                           <div className="space-y-4">
                              <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm shadow-gray-100">
                                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Calendar size={24} />
                                 </div>
                                 <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Date</p>
                                    <p className="font-black text-gray-900 text-lg uppercase">{formatDateFull(startDate)}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm shadow-gray-100">
                                 <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                                    <Clock size={24} />
                                 </div>
                                 <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mb-0.5">Heure de début</p>
                                    <p className="font-black text-gray-900 text-2xl tracking-tight">{formatTime(startDate)}</p>
                                 </div>
                              </div>
                           </div>
                        </section>

                        <section className="space-y-4">
                           <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Paiement</h2>
                           <div className="bg-white border-2 border-primary/5 rounded-[2.5rem] p-8 shadow-xl shadow-gray-200/40 relative overflow-hidden group">
                              {/* Background pattern elements */}
                              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
                              
                              <div className="relative z-10 space-y-6">
                                 <div className="flex justify-between items-center text-gray-500">
                                    <span className="text-sm font-bold uppercase tracking-widest">Total prestation</span>
                                    <span className="text-xl font-black">{appointment.services?.price ? `${appointment.services.price}€` : "—"}</span>
                                 </div>
                                 
                                 {appointment.deposit_amount && (
                                    <>
                                       <Separator className="bg-gray-100" />
                                       <div className="flex justify-between items-center">
                                          <div className="space-y-1">
                                             <span className="text-primary text-xs font-black uppercase tracking-widest">Acompte payé</span>
                                             <p className="text-xs text-gray-400 italic">Réservé en ligne</p>
                                          </div>
                                          <Badge className="bg-primary/10 text-primary border-0 px-4 py-2 rounded-xl font-black text-lg">
                                             -{appointment.deposit_amount}€
                                          </Badge>
                                       </div>
                                       <div className="pt-4 mt-4 border-t border-dashed border-gray-100">
                                          <div className="flex justify-between items-end">
                                             <span className="text-sm font-bold uppercase tracking-widest mb-1 text-gray-900">Reste à payer</span>
                                             <span className="text-4xl font-black text-primary tracking-tighter">
                                                {appointment.services?.price ? `${appointment.services.price - (appointment.deposit_amount || 0)}€` : "—"}
                                             </span>
                                          </div>
                                          <p className="text-right text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-widest">À régler sur place au salon</p>
                                       </div>
                                    </>
                                 )}
                                 
                                 {!appointment.deposit_amount && (
                                    <div className="pt-4">
                                       <div className="flex justify-between items-end">
                                          <span className="text-sm font-bold uppercase tracking-widest mb-1 text-gray-900">À régler sur place</span>
                                          <span className="text-4xl font-black text-primary tracking-tighter">
                                             {appointment.services?.price ? `${appointment.services.price}€` : "—"}
                                          </span>
                                       </div>
                                    </div>
                                 )}
                              </div>
                           </div>
                        </section>
                     </div>

                     {/* Timeline - Track de la réservation */}
                     {appointment.deposit_amount && displayStatus !== "cancelled" && displayStatus !== "refused" && displayStatus !== "no_show" && (
                       <section className="pt-8">
                          <h2 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-8 text-center">Progression de la réservation</h2>
                          <div className="max-w-md mx-auto">
                             <div className="flex items-center justify-between relative px-2">
                               {/* Ligne de fond */}
                               <div className="absolute top-5 left-10 right-10 h-0.5 bg-gray-200 -z-0"></div>
                               {/* Ligne de progression */}
                               <div className={`absolute top-5 left-10 h-0.5 bg-primary -z-0 transition-all duration-1000 ease-out ${
                                 displayStatus === 'pending_deposit' ? 'w-0' :
                                 (displayStatus === 'confirmed' ? 'w-1/2' : 'w-[calc(100%-80px)]')
                               }`}></div>

                               {/* Étape 1 */}
                               <div className="flex flex-col items-center z-10 w-20">
                                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                                    displayStatus !== 'pending_deposit' 
                                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                                      : 'bg-white text-primary border-2 border-primary shadow-sm'
                                 }`}>
                                    {displayStatus !== 'pending_deposit' ? <CheckCircle2 size={20} /> : "1"}
                                 </div>
                                 <p className={`text-[10px] mt-3 font-black uppercase tracking-widest text-center ${displayStatus !== 'pending_deposit' ? 'text-gray-900' : 'text-primary'}`}>Payé</p>
                               </div>

                               {/* Étape 2 */}
                               <div className="flex flex-col items-center z-10 w-20">
                                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                                    displayStatus === 'completed' 
                                      ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                      : (displayStatus === 'confirmed' ? 'bg-white text-primary border-2 border-primary scale-110 shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-400')
                                 }`}>
                                    {displayStatus === 'completed' ? <CheckCircle2 size={20} /> : "2"}
                                 </div>
                                 <p className={`text-[10px] mt-3 font-black uppercase tracking-widest text-center ${
                                   displayStatus === 'completed' ? 'text-gray-900' : 
                                   (displayStatus === 'confirmed' ? 'text-primary animate-pulse' : 'text-gray-400')
                                 }`}>Confirmé</p>
                               </div>

                               {/* Étape 3 */}
                               <div className="flex flex-col items-center z-10 w-20">
                                 <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                                    displayStatus === 'completed' 
                                      ? 'bg-white text-primary border-2 border-primary scale-110 shadow-lg shadow-primary/20' 
                                      : 'bg-gray-100 text-gray-400'
                                 }`}>
                                    {displayStatus === 'completed' ? <CheckCircle2 size={18} className="animate-bounce" /> : "3"}
                                 </div>
                                 <p className={`text-[10px] mt-3 font-black uppercase tracking-widest text-center ${displayStatus === 'completed' ? 'text-primary' : 'text-gray-400'}`}>Honoré</p>
                               </div>
                             </div>
                          </div>
                       </section>
                     )}
                  </div>
               </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
             <Link href={`/establishment/${appointment.establishments?.id}`}>
                <Button variant="ghost" className="text-gray-500 hover:text-primary transition-colors font-bold group">
                   Une question ? Contacter l'établissement
                   <ArrowLeft className="ml-2 rotate-180 group-hover:translate-x-1 transition-transform" size={16} />
                </Button>
             </Link>
          </div>
        </div>
      </div>

      {showCancelModal && appointment && (
        <CancelModal
          appointment={appointment}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelAppointment}
          reason={cancelReason}
          setReason={setCancelReason}
          cancelling={cancelling}
          formatDate={(d) => formatDateFull(new Date(d))}
          formatTime={(d) => formatTime(new Date(d))}
        />
      )}

      {showRescheduleModal && appointment && (
        <RescheduleModal
          appointment={appointment}
          onClose={() => setShowRescheduleModal(false)}
          onSuccess={(newStart, newEnd) => {
            setAppointment((prev: any) => ({
              ...prev,
              start_time: newStart,
              end_time: newEnd,
            }));
            setShowRescheduleModal(false);
          }}
        />
      )}
    </div>
  );
}
