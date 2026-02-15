"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Share2,
  Heart,
  Star,
  MapPin,
  Clock,
  Phone,
  Globe,
  Instagram,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Info,
  StarHalf,
  MessageSquare,
  Calendar,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  User,
  X,
  LogIn,
  UserPlus,
  FileText,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button, Card, CardContent, Badge, Heading, Text, Box, Flex, Stack, Input } from "@/components/ui";
import Header from "@/components/features/Header";
import { cn } from "@/lib/utils/cn";
import { Service, OpeningHour, ClientInfo, BookingStep, AvailableSlot } from "@/components/features/booking/types";
import { EstablishmentReviews } from "@/components/features/establishment/EstablishmentReviews";
import { EstablishmentSidebar } from "@/components/features/establishment/EstablishmentSidebar";
import { Establishment, Review } from "@/components/features/establishment/types";
import { useEstablishmentActions } from "@/components/features/establishment/hooks/useEstablishmentActions";

export default function EstablishmentPage() {
  const { id } = useParams();
  const establishmentId = id as string;
  const router = useRouter();
  const supabase = createClient();

  const [establishment, setEstablishment] = useState<Establishment | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [blockedError, setBlockedError] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);

  // Actions hook (favorites)
  const { isFavorite, toggleFavorite, hasProfile } = useEstablishmentActions(establishmentId);

  const loadEstablishment = useCallback(async () => {
    try {
      setLoading(true);
      const { data: est, error: estError } = await supabase
        .from("establishments")
        .select("*")
        .eq("id", establishmentId)
        .single();

      if (estError || !est) throw new Error("Établissement introuvable");
      setEstablishment(est as Establishment);

      // Fetch services
      const { data: servs } = await supabase
        .from("services")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("price");
      setServices((servs as Service[]) || []);

      // Fetch opening hours
      const { data: hours } = await supabase
        .from("opening_hours")
        .select("*")
        .eq("establishment_id", establishmentId);
      setOpeningHours((hours as OpeningHour[]) || []);

      // Fetch reviews with client names
      const { data: revs } = await supabase
        .from("reviews")
        .select(`
          id, rating, comment, created_at,
          client_profiles(first_name, last_name)
        `)
        .eq("establishment_id", establishmentId)
        .order("created_at", { ascending: false });

      const formattedReviews: Review[] = (revs || []).map((r: any) => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
        client_name: r.client_profiles
          ? `${r.client_profiles.first_name} ${r.client_profiles.last_name?.charAt(0)}.`
          : "Utilisateur"
      }));

      setReviews(formattedReviews);

      if (formattedReviews.length > 0) {
        const avg = formattedReviews.reduce((sum, r) => sum + r.rating, 0) / formattedReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }

      // Check for user-specific data (blocks, already reviewed)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();

        if (profile) {
          const { data: existingReview } = await supabase
            .from("reviews")
            .select("id")
            .eq("client_id", profile.id)
            .eq("establishment_id", establishmentId)
            .limit(1);
          setHasAlreadyReviewed((existingReview?.length || 0) > 0);

          const { data: block } = await supabase
            .from("blocked_clients")
            .select("id")
            .eq("establishment_id", establishmentId)
            .eq("client_id", profile.id)
            .single();
          if (block) setBlockedError(true);
        }
      }

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [establishmentId, supabase]);

  useEffect(() => {
    loadEstablishment();
  }, [loadEstablishment]);

  const handleToggleFavorite = async () => {
    const res = await toggleFavorite();
    if (res.error === "authentication_required") {
      setShowLoginPrompt(true);
    }
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return;

    setSubmittingReview(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!profile) return;

      const { error } = await supabase.from("reviews").insert({
        client_id: profile.id,
        establishment_id: establishmentId,
        rating: reviewRating,
        comment: reviewComment || null,
      });

      if (error) throw error;

      setShowReviewModal(false);
      loadEstablishment();
    } catch (error) {
      console.error("Error submitting review:", error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  if (error || !establishment) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2 tracking-tight">Impossible de charger l'établissement</h1>
        <p className="text-gray-500 mb-6 font-medium">{error || "Une erreur inconnue est survenue"}</p>
        <Link href="/search">
          <Button variant="primary" className="px-8 font-bold">Retour à la recherche</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />

      <div className="pt-24 pb-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-6 font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
            <ChevronRight size={14} />
            <Link href="/search" className="hover:text-primary transition-colors">Recherche</Link>
            <ChevronRight size={14} />
            <span className="text-gray-900 font-bold truncate">{establishment.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="relative group rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-xl shadow-gray-200/50">
                <div className="h-64 sm:h-96 w-full relative">
                  {establishment.main_photo_url ? (
                    <img
                      src={establishment.main_photo_url}
                      alt={establishment.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center">
                      <Star size={64} className="text-primary/20" />
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                </div>

                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="p-2 rounded-full backdrop-blur-md bg-white/90 text-gray-900 shadow-sm h-10 w-10 min-w-0"><Share2 size={18} /></Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "p-2 rounded-full backdrop-blur-md transition-all h-10 w-10 min-w-0 shadow-sm",
                      isFavorite ? "bg-red-50 text-red-500 hover:bg-red-100" : "bg-white/90 text-gray-900 hover:text-red-500"
                    )}
                    onClick={handleToggleFavorite}
                  >
                    <Heart size={20} className={isFavorite ? "fill-red-500" : ""} />
                  </Button>
                </div>

                <div className="absolute bottom-6 left-6 right-6 text-white text-shadow-sm">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    {establishment.activity_sectors?.map((sector) => (
                      <Badge key={sector} variant="secondary" className="bg-white/20 backdrop-blur-md text-white border-none py-1 px-3 font-bold text-[10px] uppercase">
                        {sector}
                      </Badge>
                    ))}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black">{establishment.name}</h1>
                  <div className="flex flex-wrap items-center gap-4 mt-3 font-bold text-white/90">
                    <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-xl">
                      <MapPin size={16} className="text-primary" />
                      <span>{establishment.city}</span>
                    </div>
                    {averageRating && (
                      <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-3 py-1 rounded-xl">
                        <Star size={16} className="text-accent fill-accent" />
                        <span>{averageRating} ({reviews.length} avis)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black text-gray-900 mb-4">À propos de l'établissement</h2>
                <div className="text-gray-600 font-medium leading-relaxed">
                  {establishment.description || "Aucune description disponible."}
                </div>
              </div>

              <EstablishmentReviews
                reviews={reviews}
                averageRating={averageRating}
                onAddReview={hasAlreadyReviewed ? undefined : () => setShowReviewModal(true)}
              />
            </div>

            <div className="lg:col-span-1">
              <EstablishmentSidebar
                establishment={establishment}
                services={services}
                openingHours={openingHours}
                onBookingComplete={() => {
                  loadEstablishment();
                  router.push("/account?tab=reservations");
                }}
                blockedError={blockedError}
              />
            </div>
          </div>
        </div>
      </div>

      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-2">Ajouter aux favoris</h2>
            <p className="text-gray-600 mb-8 font-medium">Connectez-vous pour sauvegarder cet établissement.</p>
            <div className="flex flex-col gap-3">
              <Link href={`/auth/client/login?redirect=${encodeURIComponent(window.location.pathname)}`}>
                <Button variant="primary" className="w-full h-12 font-bold rounded-xl"><LogIn size={20} className="mr-2" /> Se connecter</Button>
              </Link>
              <Button variant="ghost" onClick={() => setShowLoginPrompt(false)} className="font-bold">Plus tard</Button>
            </div>
          </div>
        </div>
      )}

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Laisser un avis</h2>

            <div className="mb-6">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px] mb-3">Votre note</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setReviewRating(star)} className="cursor-pointer">
                    <Star size={32} className={cn("transition-all", star <= reviewRating ? "text-accent fill-accent" : "text-gray-200")} />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-bold text-gray-700 uppercase tracking-widest text-[10px] mb-3">Commentaire</p>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Votre avis nous intéresse..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-primary/30 outline-none resize-none font-medium"
              />
            </div>

            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowReviewModal(false)} className="flex-1 font-bold h-12">Annuler</Button>
              <Button variant="primary" onClick={handleSubmitReview} disabled={submittingReview || reviewRating === 0} className="flex-1 h-12 font-black">
                {submittingReview ? <Loader2 className="animate-spin" size={20} /> : "Publier"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
