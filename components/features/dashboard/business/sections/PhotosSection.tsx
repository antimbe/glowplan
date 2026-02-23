"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Image as ImageIcon, Camera, Plus, X, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TabProps } from "../types";
import { useModal } from "@/contexts/ModalContext";

const MAX_PHOTOS = 8;

interface GalleryPhoto {
  id: string;
  url: string;
  position: number;
}

interface PhotosSectionProps extends TabProps {
  establishmentId: string | null;
}

export default function PhotosSection({ formData, updateField, establishmentId }: PhotosSectionProps) {
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const galleryFileInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const supabase = createClient();
  const { showError } = useModal();

  const [uploadingMain, setUploadingMain] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [galleryPhotos, setGalleryPhotos] = useState<GalleryPhoto[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  // ─── Load existing gallery photos ────────────────────────────────────────
  const loadGalleryPhotos = useCallback(async () => {
    if (!establishmentId) return;
    setLoadingGallery(true);
    try {
      const { data, error } = await supabase
        .from("establishment_photos")
        .select("id, url, position")
        .eq("establishment_id", establishmentId)
        .eq("is_main", false)
        .order("position", { ascending: true });
      if (error) throw error;
      setGalleryPhotos(data ?? []);
    } catch (err) {
      console.error("Erreur chargement galerie:", err);
    } finally {
      setLoadingGallery(false);
    }
  }, [supabase, establishmentId]);

  useEffect(() => {
    loadGalleryPhotos();
  }, [loadGalleryPhotos]);

  // ─── Helpers ──────────────────────────────────────────────────────────────
  const extractStoragePath = (url: string): string | null => {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split("/storage/v1/object/public/establishment-photos/");
      return parts.length > 1 ? decodeURIComponent(parts[1]) : null;
    } catch {
      return null;
    }
  };

  const deleteFileFromStorage = async (photoUrl: string) => {
    const path = extractStoragePath(photoUrl);
    if (path) {
      await supabase.storage.from("establishment-photos").remove([path]);
    }
  };

  // ─── Main photo ───────────────────────────────────────────────────────────
  const handleMainPhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";

    setUploadingMain(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      if (formData.main_photo_url) {
        await deleteFileFromStorage(formData.main_photo_url);
      }

      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/main_photo_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("establishment-photos")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("establishment-photos")
        .getPublicUrl(fileName);

      updateField("main_photo_url", publicUrl);
    } catch (err) {
      console.error("Erreur upload photo principale:", err);
      showError("Erreur", "Impossible d'uploader la photo principale. Veuillez réessayer.");
    } finally {
      setUploadingMain(false);
    }
  };

  const removeMainPhoto = async () => {
    if (!formData.main_photo_url) return;
    await deleteFileFromStorage(formData.main_photo_url);
    updateField("main_photo_url", "");
  };

  // ─── Gallery photos ───────────────────────────────────────────────────────
  const handleGalleryPhotoChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    position: number // 1-indexed slot in the gallery (0 = main)
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    if (!establishmentId) {
      showError("Profil requis", "Veuillez d'abord enregistrer les informations générales de votre boutique avant d'ajouter des photos.");
      return;
    }

    setUploadingSlot(position);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const ext = file.name.split(".").pop();
      const fileName = `${user.id}/gallery_${position}_${Date.now()}.${ext}`;

      // Check if there's already a photo in this slot → delete it first
      const existing = galleryPhotos.find(p => p.position === position);
      if (existing) {
        await deleteFileFromStorage(existing.url);
        await supabase.from("establishment_photos").delete().eq("id", existing.id);
      }

      const { error: uploadError } = await supabase.storage
        .from("establishment-photos")
        .upload(fileName, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("establishment-photos")
        .getPublicUrl(fileName);

      const { data: inserted, error: insertError } = await supabase
        .from("establishment_photos")
        .insert({
          establishment_id: establishmentId,
          url: publicUrl,
          is_main: false,
          position,
        })
        .select("id, url, position")
        .single();

      if (insertError) throw insertError;

      setGalleryPhotos(prev => {
        const filtered = prev.filter(p => p.position !== position);
        return [...filtered, inserted].sort((a, b) => a.position - b.position);
      });
    } catch (err) {
      console.error("Erreur upload photo galerie:", err);
      showError("Erreur", "Impossible d'uploader la photo. Veuillez réessayer.");
    } finally {
      setUploadingSlot(null);
    }
  };

  const removeGalleryPhoto = async (photo: GalleryPhoto) => {
    try {
      await deleteFileFromStorage(photo.url);
      await supabase.from("establishment_photos").delete().eq("id", photo.id);
      setGalleryPhotos(prev => prev.filter(p => p.id !== photo.id));
    } catch (err) {
      console.error("Erreur suppression photo galerie:", err);
      showError("Erreur", "Impossible de supprimer la photo. Veuillez réessayer.");
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full bg-white rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
          <ImageIcon size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-primary text-base lg:text-lg font-bold">Photos &amp; Visuels</h2>
          <p className="text-gray-500 text-[10px] lg:text-xs">Ajoutez jusqu'à 8 photos pour votre vitrine</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6">
        {/* Format options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 lg:gap-4">
          <FormatOption
            label="Format logo"
            value={formData.logo_format}
            onChange={(value) => updateField("logo_format", value)}
          />
          <FormatOption
            label="Format photos"
            value={formData.photo_format}
            onChange={(value) => updateField("photo_format", value)}
          />
          <DisplayOption
            label="Affichage"
            value={formData.photo_display}
            onChange={(value) => updateField("photo_display", value)}
          />
        </div>

        {/* Hidden file inputs */}
        <input
          ref={mainFileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleMainPhotoChange}
        />
        {[...Array(MAX_PHOTOS - 1)].map((_, i) => (
          <input
            key={i}
            ref={(el) => { galleryFileInputRefs.current[i] = el; }}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleGalleryPhotoChange(e, i + 1)}
          />
        ))}

        {/* Photo grid */}
        <div className="grid grid-cols-4 gap-2 lg:gap-4">
          {/* Slot 0 – Main photo */}
          <PhotoSlot
            label="Photo principale *"
            photoUrl={formData.main_photo_url || null}
            uploading={uploadingMain}
            onClickEmpty={() => mainFileInputRef.current?.click()}
            onClickReplace={() => mainFileInputRef.current?.click()}
            onRemove={removeMainPhoto}
          />

          {/* Slots 1–7 – Gallery */}
          {[...Array(MAX_PHOTOS - 1)].map((_, i) => {
            const slot = i + 1;
            const photo = galleryPhotos.find(p => p.position === slot) ?? null;
            return (
              <PhotoSlot
                key={slot}
                label={`Photo ${slot + 1}`}
                photoUrl={photo?.url ?? null}
                uploading={uploadingSlot === slot || loadingGallery}
                onClickEmpty={() => {
                  if (!establishmentId) {
                    showError("Profil requis", "Enregistrez d'abord vos informations générales avant d'ajouter des photos supplémentaires.");
                    return;
                  }
                  galleryFileInputRefs.current[i]?.click();
                }}
                onClickReplace={() => galleryFileInputRefs.current[i]?.click()}
                onRemove={photo ? () => removeGalleryPhoto(photo) : undefined}
              />
            );
          })}
        </div>

        {!establishmentId && (
          <p className="text-center text-[10px] text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
            💡 Enregistrez d'abord vos informations générales pour pouvoir ajouter des photos supplémentaires.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Photo slot sub-component ────────────────────────────────────────────────

interface PhotoSlotProps {
  label: string;
  photoUrl: string | null;
  uploading: boolean;
  onClickEmpty: () => void;
  onClickReplace: () => void;
  onRemove?: () => void;
}

function PhotoSlot({ label, photoUrl, uploading, onClickEmpty, onClickReplace, onRemove }: PhotoSlotProps) {
  const hasPhoto = !!photoUrl;

  return (
    <div
      onClick={!hasPhoto && !uploading ? onClickEmpty : undefined}
      className={`
        aspect-square rounded-xl lg:rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden
        ${hasPhoto
          ? "border-primary bg-primary/5"
          : "border-gray-200 bg-gray-50 cursor-pointer hover:bg-white hover:border-primary/30"
        }
        ${uploading ? "pointer-events-none opacity-70" : ""}
      `}
    >
      {uploading ? (
        <Loader2 size={24} className="text-primary animate-spin" />
      ) : hasPhoto ? (
        <>
          <img
            src={photoUrl!}
            alt={label}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {/* Replace */}
            <button
              onClick={(e) => { e.stopPropagation(); onClickReplace(); }}
              className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-primary cursor-pointer"
              title="Remplacer"
            >
              <Camera size={14} />
            </button>
            {/* Delete */}
            {onRemove && (
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(); }}
                className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white cursor-pointer"
                title="Supprimer"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
            <Check size={12} className="text-white" />
          </div>
        </>
      ) : (
        <>
          <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1 lg:mb-2">
            <Plus size={14} className="text-gray-400 lg:hidden" />
            <Plus size={20} className="text-gray-400 hidden lg:block" />
          </div>
          <span className="text-gray-400 text-[8px] lg:text-[10px] text-center px-1">{label}</span>
        </>
      )}
    </div>
  );
}

// ─── Format / Display options ────────────────────────────────────────────────

interface FormatOptionProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function FormatOption({ label, value, onChange }: FormatOptionProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 lg:p-4 border border-gray-100">
      <p className="text-[10px] lg:text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 lg:mb-3">{label}</p>
      <div className="flex gap-1">
        <button
          onClick={() => onChange("generate")}
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${value === "generate" ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
        >
          Générer
        </button>
        <button
          onClick={() => onChange("fixed")}
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${value === "fixed" ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
        >
          Fixé
        </button>
      </div>
    </div>
  );
}

function DisplayOption({ label, value, onChange }: FormatOptionProps) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 lg:p-4 border border-gray-100">
      <p className="text-[10px] lg:text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 lg:mb-3">{label}</p>
      <div className="flex gap-1">
        <button
          onClick={() => onChange("fill")}
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${value === "fill" ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
        >
          Rempli
        </button>
        <button
          onClick={() => onChange("contain")}
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${value === "contain" ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
        >
          Entier
        </button>
      </div>
    </div>
  );
}
