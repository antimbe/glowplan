"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Share2, Heart, Star, MapPin, Clock, Phone, Globe,
  Instagram, ChevronRight, AlertCircle, MessageSquare,
  ArrowLeft, X, LogIn, Loader2, Sparkles
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui";
import Header from "@/components/features/Header";
import { cn } from "@/lib/utils/cn";
import { Service, OpeningHour, ClientInfo, BookingStep, AvailableSlot } from "@/components/features/booking/types";
import { EstablishmentReviews } from "@/components/features/establishment/EstablishmentReviews";
import { EstablishmentSidebar } from "@/components/features/establishment/EstablishmentSidebar";
import { Establishment, Review, Photo } from "@/components/features/establishment/types";
import { useEstablishmentActions } from "@/components/features/establishment/hooks/useEstablishmentActions";

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

/* ─── Skeleton ─────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <Header />
      <div className="pt-24 pb-12 max-w-6xl mx-auto px-4">
        <div className="h-4 w-48 bg-gray-200 rounded-full mb-6 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-80 sm:h-96 bg-gray-200 rounded-3xl animate-pulse" />
            <div className="flex gap-3">
              {[1,2,3,4].map(i => <div key={i} className="w-20 h-20 bg-gray-200 rounded-2xl animate-pulse flex-shrink-0" />)}
            </div>
            <div className="h-64 bg-gray-200 rounded-3xl animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
            <div className="h-48 bg-gray-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────────────────────── */
export default function EstablishmentPage() {
  const { id } = useParams();
  const establishmentId = id as string;
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
  const [loginPromptContext, setLoginPromptContext] = useState<"favorite" | "review" | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasAlreadyReviewed, setHasAlreadyReviewed] = useState(false);
  const [clientProfileId, setClientProfileId] = useState<string | null>(null);
  const [initialClientInfo, setInitialClientInfo] = useState<Partial<ClientInfo>>({});
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { isFavorite, toggleFavorite } = useEstablishmentActions(establishmentId);

  const loadEstablishment = useCallback(async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) setLoading(true);
      const { data: est, error: estError } = await supabase
        .from("establishments").select("*").eq("id", establishmentId).single();
      if (estError || !est) throw new Error("Établissement introuvable");
      if (!est.is_profile_complete)
        throw new Error("Cet établissement n'est pas encore prêt à recevoir des réservations.");
      setEstablishment(est as Establishment);

      const { data: servs } = await supabase.from("services").select("*")
        .eq("establishment_id", establishmentId).order("price");
      setServices((servs as Service[]) || []);
      if (!servs || servs.length === 0)
        throw new Error("Cet établissement n'a pas encore configuré ses prestations.");

      const { data: hours } = await supabase.from("opening_hours").select("*")
        .eq("establishment_id", establishmentId);
      setOpeningHours((hours as OpeningHour[]) || []);

      const { data: revs } = await supabase.from("reviews").select(`
        id, rating, comment, created_at, client_name, provider_reply, replied_at,
        client_profiles(first_name, last_name)
      `).eq("establishment_id", establishmentId).order("created_at", { ascending: false });

      const formattedReviews: Review[] = (revs || []).map((r: any) => {
        const profile = Array.isArray(r.client_profiles) ? r.client_profiles[0] : r.client_profiles;
        return {
          id: r.id, rating: r.rating, comment: r.comment, created_at: r.created_at,
          provider_reply: r.provider_reply, replied_at: r.replied_at,
          client_name: profile
            ? `${profile.first_name} ${profile.last_name?.charAt(0) || ""}.`
            : (r.client_name || "Utilisateur"),
          client_profiles: profile
        };
      });
      setReviews(formattedReviews);

      const { data: gallery } = await supabase.from("establishment_photos").select("*")
        .eq("establishment_id", establishmentId).order("position", { ascending: true });

      if (formattedReviews.length > 0) {
        const avg = formattedReviews.reduce((s, r) => s + r.rating, 0) / formattedReviews.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
      setEstablishment(prev => prev ? { ...prev, photos: (gallery as Photo[]) || [] } : null);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from("client_profiles")
          .select("id, first_name, last_name, phone, instagram").eq("user_id", user.id).single();
        if (profile) {
          setClientProfileId(profile.id);
          setInitialClientInfo({
            firstName: profile.first_name || "", lastName: profile.last_name || "",
            email: user.email || "", phone: profile.phone || "", instagram: profile.instagram || ""
          });
          const { data: existingReview } = await supabase.from("reviews").select("id")
            .eq("client_profile_id", profile.id).eq("establishment_id", establishmentId).limit(1);
          setHasAlreadyReviewed((existingReview?.length || 0) > 0);
          const { data: blocks } = await supabase.from("blocked_clients").select("id")
            .eq("establishment_id", establishmentId).eq("client_profile_id", profile.id);
          if (blocks && blocks.length > 0) setBlockedError(true);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [establishmentId, supabase]);

  useEffect(() => { loadEstablishment(false); }, [loadEstablishment]);
  useEffect(() => {
    if (establishment?.main_photo_url && !activePhotoUrl)
      setActivePhotoUrl(establishment.main_photo_url);
  }, [establishment, activePhotoUrl]);

  const handleToggleFavorite = async () => {
    const res = await toggleFavorite();
    if (res.error === "authentication_required") {
      setLoginPromptContext("favorite");
      setShowLoginPrompt(true);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleOpenReviewModal = () => {
    if (!clientProfileId) { setLoginPromptContext("review"); setShowLoginPrompt(true); return; }
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) return;
    setSubmittingReview(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("client_profiles").select("id").eq("user_id", user.id).single();
      if (!profile) return;
      const { data: insertedReview, error } = await supabase.from("reviews").insert({
        client_profile_id: profile.id, establishment_id: establishmentId,
        rating: reviewRating, comment: reviewComment || null,
      }).select("id").single();
      if (error) throw error;
      if (insertedReview) {
        fetch("/api/reviews/notify", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "new_review", reviewId: insertedReview.id })
        }).catch(() => {});
      }
      setShowReviewModal(false);
      loadEstablishment();
    } catch (err) {
      console.error("Error submitting review:", err);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Skeleton />;

  if (error || !establishment) {
    return (
      <div className="min-h-screen bg-[#f7f5f2] flex flex-col items-center justify-center p-4 text-center">
        <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-red-400" />
        </div>
        <h1 className="text-xl font-black text-gray-900 mb-2">Établissement introuvable</h1>
        <p className="text-gray-500 mb-6 font-medium max-w-sm">{error || "Une erreur inconnue est survenue"}</p>
        <Link href="/search">
          <Button variant="primary" className="px-8 font-bold rounded-2xl">← Retour à la recherche</Button>
        </Link>
      </div>
    );
  }

  const allPhotos = [
    ...(establishment.main_photo_url ? [{ id: "main", url: establishment.main_photo_url }] : []),
    ...(establishment.photos || []),
  ];

  return (
    <div className="min-h-screen bg-[#f7f5f2]">
      <Header />

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">

          {/* Breadcrumb */}
          <motion.div
            className="flex items-center gap-2 mb-6"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease }}
          >
            <Link href="/search" className="flex items-center gap-1.5 text-[13px] font-bold text-gray-400 hover:text-[#32422c] transition-colors group">
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
              Recherche
            </Link>
            <ChevronRight size={12} className="text-gray-300" />
            <span className="text-[13px] font-bold text-gray-700 truncate max-w-[200px]">{establishment.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* ── Left column ─────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Hero photo */}
              <motion.div
                className="relative group rounded-3xl overflow-hidden bg-white shadow-xl shadow-gray-200/60"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease }}
              >
                <div className="h-72 sm:h-[26rem] w-full relative">
                  {(activePhotoUrl || establishment.main_photo_url) ? (
                    <img
                      src={activePhotoUrl || establishment.main_photo_url || ""}
                      alt={establishment.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#32422c]/5 flex items-center justify-center">
                      <Sparkles size={64} className="text-[#32422c]/20" />
                    </div>
                  )}
                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
                </div>

                {/* Action buttons — top right */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <AnimatePresence>
                    {copied && (
                      <motion.span
                        initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                        className="text-[11px] font-bold text-white bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full"
                      >
                        Lien copié !
                      </motion.span>
                    )}
                  </AnimatePresence>
                  <button
                    onClick={handleShare}
                    className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-gray-700 hover:bg-white shadow-md transition-all hover:scale-105 cursor-pointer"
                    aria-label="Partager"
                  >
                    <Share2 size={16} />
                  </button>
                  <button
                    onClick={handleToggleFavorite}
                    className={cn(
                      "w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center shadow-md transition-all hover:scale-105 cursor-pointer",
                      isFavorite ? "bg-red-500 text-white" : "bg-white/90 text-gray-700 hover:bg-white"
                    )}
                    aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                  >
                    <Heart size={16} className={isFavorite ? "fill-white" : ""} />
                  </button>
                </div>

                {/* Info overlay — bottom */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {establishment.activity_sectors?.map((sector) => (
                      <span key={sector} className="text-[10px] font-black uppercase tracking-[0.14em] bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full">
                        {sector}
                      </span>
                    ))}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-[-0.02em] drop-shadow-sm mb-3">
                    {establishment.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                      <MapPin size={13} className="text-white/80" />
                      <span className="text-[13px] font-bold">{establishment.city}</span>
                    </div>
                    {averageRating && (
                      <div className="flex items-center gap-1.5 bg-black/25 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
                        <Star size={13} className="text-[#c0a062] fill-[#c0a062]" />
                        <span className="text-[13px] font-bold">{averageRating}</span>
                        <span className="text-[12px] text-white/60">({reviews.length})</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Gallery thumbnails */}
              {allPhotos.length > 1 && (
                <motion.div
                  className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.15 }}
                >
                  {allPhotos.map((photo, i) => (
                    <button
                      key={photo.id}
                      onClick={() => setActivePhotoUrl(photo.url)}
                      className={cn(
                        "relative w-[72px] h-[72px] sm:w-20 sm:h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all duration-200 cursor-pointer",
                        activePhotoUrl === photo.url
                          ? "border-[#32422c] ring-2 ring-[#32422c]/20 scale-105"
                          : "border-transparent hover:border-gray-300 hover:scale-[1.03]"
                      )}
                    >
                      <img src={photo.url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Booking tunnel */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease }}
              >
                <EstablishmentSidebar
                  establishment={establishment}
                  services={services}
                  openingHours={openingHours}
                  onBookingComplete={() => loadEstablishment(true)}
                  blockedError={blockedError}
                  mode="booking"
                  clientProfileId={clientProfileId}
                  initialClientInfo={initialClientInfo}
                />
              </motion.div>

              {/* Description */}
              {establishment.description && (
                <motion.div
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xl shadow-gray-200/50"
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, ease }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-[#32422c]/8 flex items-center justify-center">
                      <Sparkles size={15} className="text-[#32422c]" />
                    </div>
                    <h2 className="text-lg font-black text-gray-900">À propos</h2>
                  </div>
                  <p className="text-gray-600 font-medium leading-relaxed text-[15px]">
                    {establishment.description}
                  </p>
                </motion.div>
              )}

              {/* Reviews */}
              <EstablishmentReviews
                reviews={reviews}
                averageRating={averageRating}
                onAddReview={hasAlreadyReviewed ? undefined : handleOpenReviewModal}
              />
            </div>

            {/* ── Right sidebar ────────────────────────────────────── */}
            <div className="lg:col-span-1">
              <EstablishmentSidebar
                establishment={establishment}
                services={services}
                openingHours={openingHours}
                onBookingComplete={() => {}}
                blockedError={false}
                mode="info"
                clientProfileId={clientProfileId}
                initialClientInfo={initialClientInfo}
              />
            </div>

          </div>
        </div>
      </div>

      {/* ── Login prompt modal ───────────────────────────────────────── */}
      <AnimatePresence>
        {showLoginPrompt && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease }}
            >
              <div className="w-12 h-12 rounded-2xl bg-[#32422c]/8 flex items-center justify-center mb-4">
                {loginPromptContext === "favorite" ? <Heart size={22} className="text-[#32422c]" /> : <MessageSquare size={22} className="text-[#32422c]" />}
              </div>
              <h2 className="text-xl font-black text-gray-900 mb-2">
                {loginPromptContext === "favorite" ? "Ajouter aux favoris" : "Laisser un avis"}
              </h2>
              <p className="text-gray-500 font-medium mb-7 text-[14px]">
                {loginPromptContext === "favorite"
                  ? "Connectez-vous pour sauvegarder cet établissement dans vos favoris."
                  : "Connectez-vous pour partager votre expérience avec la communauté."}
              </p>
              <div className="flex flex-col gap-3">
                <Link href={`/auth/client/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "")}`}>
                  <Button variant="primary" className="w-full h-12 font-bold rounded-2xl">
                    <LogIn size={17} className="mr-2" /> Se connecter
                  </Button>
                </Link>
                <button
                  onClick={() => { setShowLoginPrompt(false); setLoginPromptContext(null); }}
                  className="text-[13px] font-bold text-gray-400 hover:text-gray-600 transition-colors cursor-pointer py-2"
                >
                  Plus tard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Review modal ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl"
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-gray-900">Votre avis</h2>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Stars */}
              <div className="mb-6">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-3">Note globale</p>
                <div className="flex gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setReviewRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        size={34}
                        className={cn(
                          "transition-all duration-150",
                          star <= reviewRating ? "text-[#c0a062] fill-[#c0a062]" : "text-gray-200 fill-gray-200 hover:text-[#c0a062]/40"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="mb-7">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.18em] mb-3">Commentaire (optionnel)</p>
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Partagez votre expérience..."
                  rows={4}
                  className="w-full px-4 py-3.5 rounded-2xl border border-gray-150 bg-gray-50 focus:bg-white focus:border-[#32422c]/30 focus:ring-2 focus:ring-[#32422c]/8 outline-none resize-none font-medium text-[14px] transition-all"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="flex-1 h-12 rounded-2xl border border-gray-200 text-gray-500 hover:bg-gray-50 font-bold text-[14px] transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <Button
                  variant="primary"
                  onClick={handleSubmitReview}
                  disabled={submittingReview || reviewRating === 0}
                  className="flex-1 h-12 font-black rounded-2xl"
                >
                  {submittingReview ? <Loader2 className="animate-spin" size={18} /> : "Publier l'avis"}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
