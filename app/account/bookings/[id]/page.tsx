"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, ArrowLeft, Calendar, Clock, MapPin, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { Button, Card, Badge, Stack, Heading, Text, Separator } from "@/components/ui";
import { formatDateFull, formatTime } from "@/lib/utils/formatters";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/features/Header";
import { CancelModal } from "@/components/features/account/CancelModal";

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
      // 1. Mettre à jour en base
      const { error } = await supabase
        .from("appointments")
        .update({
          status: "cancelled",
          cancelled_by_client: true,
          cancelled_at: new Date().toISOString(),
          cancellation_reason: cancelReason || null,
        })
        .eq("id", appointment.id);

      if (error) throw error;

      // 2. Envoyer la notification email via l'API
      await fetch("/api/booking/cancel-by-client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: appointment.id,
          reason: cancelReason || null,
        }),
      });

      // Mettre à jour l'état local
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
               <Button variant="primary" fullWidth>Retour à mon compte</Button>
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="pt-24 pb-12">
        <div className="max-w-3xl mx-auto px-4">
          <button onClick={() => router.back()} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
            <ArrowLeft size={16} className="mr-1" />
            Retour
          </button>
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header / État */}
            <div className="bg-primary/5 p-6 md:p-8 flex items-start justify-between border-b border-gray-100">
               <div>
                  <Badge variant="outline" className={`${statusInfo.color} mb-3 flex w-max items-center font-semibold px-2.5 py-1`}>
                     {statusInfo.icon}
                     {statusInfo.label}
                  </Badge>
                  <Heading level={1} className="text-2xl md:text-3xl font-black text-gray-900 mb-1">Détails de la réservation</Heading>
                  <p className="text-gray-500 text-sm">Réf: <span className="uppercase text-gray-700 font-mono">{appointment.id.slice(0, 8)}</span></p>
               </div>
               
               {canCancel && (
                  <Button 
                     variant="outline" 
                     className="text-red-500 border-red-200 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-xl transition-colors"
                     onClick={() => setShowCancelModal(true)}
                  >
                     Annuler le rendez-vous
                  </Button>
               )}
            </div>

            <div className="p-6 md:p-8">
               <div className="flex flex-col md:flex-row gap-8">
                  {/* Left Column: Infos */}
                  <div className="flex-1 space-y-8">
                     
                     {/* Deposit Timeline */}
                     {appointment.deposit_amount && displayStatus !== "cancelled" && displayStatus !== "refused" && displayStatus !== "no_show" && (
                       <section>
                          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Suivi de la réservation</h2>
                          <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 overflow-hidden">
                             <div className="flex items-center justify-between mt-2 mb-2 relative">
                               {/* Ligne de fond */}
                               <div className="absolute top-4 left-6 right-6 h-1 bg-gray-200 -z-0"></div>
                               {/* Ligne de progression */}
                               <div className={`absolute top-4 left-6 h-1 bg-primary -z-0 transition-all ${
                                 displayStatus === 'pending_deposit' ? 'w-0' :
                                 (displayStatus === 'confirmed' ? 'w-1/2' : 'w-full')
                               }`}></div>

                               {/* Étape 1 */}
                               <div className="flex flex-col items-center z-10 w-20">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                    displayStatus !== 'pending_deposit' 
                                      ? 'bg-primary text-white' 
                                      : 'bg-primary/10 text-primary border-2 border-primary'
                                 }`}>
                                    {displayStatus !== 'pending_deposit' ? <CheckCircle2 size={16} /> : "1"}
                                 </div>
                                 <p className={`text-[10px] mt-2 font-medium text-center ${displayStatus !== 'pending_deposit' ? 'text-gray-900' : 'text-primary'}`}>Acompte payé</p>
                               </div>

                               {/* Étape 2 */}
                               <div className="flex flex-col items-center z-10 w-20">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                    displayStatus === 'completed' 
                                      ? 'bg-primary text-white' 
                                      : (displayStatus === 'confirmed' ? 'bg-primary/10 text-primary border-2 border-primary' : 'bg-gray-200 text-gray-400')
                                 }`}>
                                    {displayStatus === 'completed' ? <CheckCircle2 size={16} /> : "2"}
                                 </div>
                                 <p className={`text-[10px] mt-2 font-medium text-center ${
                                   displayStatus === 'completed' ? 'text-gray-900' : 
                                   (displayStatus === 'confirmed' ? 'text-primary' : 'text-gray-400')
                                 }`}>Confirmé</p>
                               </div>

                               {/* Étape 3 */}
                               <div className="flex flex-col items-center z-10 w-20">
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                                    displayStatus === 'completed' 
                                      ? 'bg-primary/10 text-primary border-2 border-primary' 
                                      : 'bg-gray-200 text-gray-400'
                                 }`}>
                                    3
                                 </div>
                                 <p className={`text-[10px] mt-2 font-medium text-center ${displayStatus === 'completed' ? 'text-primary' : 'text-gray-400'}`}>Honoré</p>
                               </div>
                             </div>
                          </div>
                       </section>
                     )}

                     <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Prestation</h2>
                        <div className="flex items-center gap-4">
                           {appointment.services?.image_url ? (
                              <div className="w-12 h-12 rounded-xl relative overflow-hidden bg-gray-100 flex-shrink-0">
                                 <Image 
                                    src={appointment.services.image_url}
                                    alt={appointment.services.name || "Prestation"}
                                    fill
                                    className="object-cover"
                                 />
                              </div>
                           ) : (
                              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                 <CheckCircle2 size={24} />
                              </div>
                           )}
                           <div>
                              <p className="font-bold text-gray-900 text-lg">{appointment.services?.name || "Prestation personnalisée"}</p>
                              {appointment.services?.duration && (
                                 <p className="text-gray-500 text-sm">{appointment.services.duration} minutes</p>
                              )}
                           </div>
                        </div>
                     </section>

                     <section>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Date et Heure</h2>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <Calendar className="text-primary" size={20} />
                              <div>
                                 <p className="text-xs text-gray-500 font-medium mb-0.5">Date</p>
                                 <p className="font-bold text-gray-900">{formatDateFull(startDate)}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <Clock className="text-primary" size={20} />
                              <div>
                                 <p className="text-xs text-gray-500 font-medium mb-0.5">Heure</p>
                                 <p className="font-bold text-gray-900">{formatTime(startDate)}</p>
                              </div>
                           </div>
                        </div>
                     </section>
                     
                     <section>
                         <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Facturation</h2>
                         <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                           <div className="flex justify-between items-center mb-3">
                              <span className="text-gray-600 font-medium">Prix de la prestation</span>
                              <span className="font-bold text-gray-900">{appointment.services?.price ? `${appointment.services.price}€` : "—"}</span>
                           </div>
                           
                           {appointment.deposit_amount && (
                              <>
                                 <div className="flex justify-between items-center text-primary mb-3">
                                    <span className="font-medium">Acompte à payer</span>
                                    <span className="font-bold">{appointment.deposit_amount}€</span>
                                 </div>
                                 <Separator className="my-3 border-gray-200" />
                                 <div className="flex justify-between items-center">
                                    <span className="text-gray-900 font-bold">Reste à payer sur place</span>
                                    <span className="font-bold text-xl text-gray-900">
                                       {appointment.services?.price ? `${appointment.services.price - appointment.deposit_amount}€` : "—"}
                                    </span>
                                 </div>
                              </>
                           )}
                         </div>
                     </section>
                  </div>

                  {/* Right Column: Établissement */}
                  <div className="md:w-72 shrink-0">
                     <div className="bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden sticky top-24">
                        {appointment.establishments?.main_photo_url ? (
                           <div className="aspect-video relative bg-gray-200">
                              <Image 
                                 src={appointment.establishments.main_photo_url} 
                                 alt={appointment.establishments.name}
                                 fill
                                 className="object-cover"
                              />
                           </div>
                        ) : (
                           <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <span className="text-primary/40 font-bold">{appointment.establishments?.name}</span>
                           </div>
                        )}
                        <div className="p-5">
                           <h3 className="font-bold text-gray-900 text-lg mb-2">{appointment.establishments?.name}</h3>
                           <div className="flex items-start gap-2 text-gray-600 text-sm mb-4">
                              <MapPin size={16} className="shrink-0 mt-0.5 text-primary" />
                              <p>{appointment.establishments?.address}, <br/> {appointment.establishments?.city}</p>
                           </div>
                           <Link href={`/establishment/${appointment.establishments?.id}`}>
                              <Button variant="outline" fullWidth className="rounded-xl">Voir la page pro</Button>
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
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
    </div>
  );
}
