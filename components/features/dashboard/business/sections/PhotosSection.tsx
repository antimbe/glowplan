"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Camera, Plus, X, Check, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { TabProps } from "../types";
import { useModal } from "@/contexts/ModalContext";

export default function PhotosSection({ formData, updateField }: TabProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const { showError } = useModal();

  const handleMainPhotoClick = () => {
    fileInputRef.current?.click();
  };

  const deleteFileFromStorage = async (photoUrl: string) => {
    try {
      const supabase = createClient();
      const url = new URL(photoUrl);
      const pathParts = url.pathname.split("/storage/v1/object/public/establishment-photos/");
      if (pathParts.length > 1) {
        const filePath = decodeURIComponent(pathParts[1]);
        await supabase.storage.from("establishment-photos").remove([filePath]);
      }
    } catch (error) {
      console.error("Erreur suppression fichier:", error);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      // Supprimer l'ancienne photo si elle existe
      if (formData.main_photo_url) {
        await deleteFileFromStorage(formData.main_photo_url);
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/main_photo_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("establishment-photos")
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("establishment-photos")
        .getPublicUrl(fileName);

      updateField("main_photo_url", publicUrl);
    } catch (error) {
      console.error("Erreur upload:", error);
      showError("Erreur", "Une erreur est survenue lors de l'upload de la photo. Veuillez réessayer.");
    } finally {
      setUploading(false);
    }
  };

  const removeMainPhoto = async () => {
    if (!formData.main_photo_url) return;
    
    await deleteFileFromStorage(formData.main_photo_url);
    updateField("main_photo_url", "");
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 lg:p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 lg:gap-4 mb-4 lg:mb-6">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
          <ImageIcon size={20} className="text-white" />
        </div>
        <div>
          <h2 className="text-primary text-base lg:text-lg font-bold">Photos & Visuels</h2>
          <p className="text-gray-500 text-[10px] lg:text-xs">Ajoutez jusqu'à 8 photos pour votre vitrine</p>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:gap-6">
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

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="grid grid-cols-4 gap-2 lg:gap-4">
          {/* Photo principale */}
          <div 
            onClick={!formData.main_photo_url && !uploading ? handleMainPhotoClick : undefined}
            className={`
              aspect-square rounded-xl lg:rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all relative overflow-hidden
              ${formData.main_photo_url 
                ? "border-primary bg-primary/5" 
                : "border-primary/40 bg-primary/10 cursor-pointer hover:bg-primary/20"
              }
            `}
          >
            {uploading ? (
              <Loader2 size={24} className="text-primary animate-spin" />
            ) : formData.main_photo_url ? (
              <>
                <img 
                  src={formData.main_photo_url} 
                  alt="Photo principale" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button
                    onClick={(e) => { e.stopPropagation(); removeMainPhoto(); }}
                    className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>
                <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                  <Check size={12} className="text-white" />
                </div>
              </>
            ) : (
              <>
                <div className="w-8 h-8 lg:w-14 lg:h-14 rounded-full bg-white shadow-lg flex items-center justify-center mb-1 lg:mb-3">
                  <Camera size={16} className="text-primary lg:hidden" />
                  <Camera size={24} className="text-primary hidden lg:block" />
                </div>
                <span className="text-primary text-[8px] lg:text-xs font-semibold text-center px-1">Photo principale *</span>
              </>
            )}
          </div>
          
          {[...Array(7)].map((_, i) => (
            <div 
              key={i}
              className="aspect-square bg-gray-50 rounded-xl lg:rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-primary/30 transition-all"
            >
              <div className="w-6 h-6 lg:w-10 lg:h-10 rounded-full bg-gray-100 flex items-center justify-center mb-1 lg:mb-2">
                <Plus size={14} className="text-gray-400 lg:hidden" />
                <Plus size={20} className="text-gray-400 hidden lg:block" />
              </div>
              <span className="text-gray-400 text-[8px] lg:text-[10px]">Photo {i + 2}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

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
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
            value === "generate" ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Générer
        </button>
        <button
          onClick={() => onChange("fixed")}
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
            value === "fixed" ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
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
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
            value === "fill" ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Rempli
        </button>
        <button
          onClick={() => onChange("contain")}
          className={`flex-1 px-2 py-1.5 lg:py-2 rounded-lg text-[10px] lg:text-xs font-semibold transition-all cursor-pointer ${
            value === "contain" ? "bg-primary text-white" : "bg-white text-gray-600 border border-gray-200"
          }`}
        >
          Entier
        </button>
      </div>
    </div>
  );
}
