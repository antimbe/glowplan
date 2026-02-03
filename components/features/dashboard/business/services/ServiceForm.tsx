"use client";

import { useState, useRef } from "react";
import { X, Upload, Clock, Euro, User, FileText, Loader2 } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import FormInput from "../FormInput";
import FormTextarea from "../FormTextarea";
import { ServiceData } from "../types";
import { createClient } from "@/lib/supabase/client";

interface ServiceFormProps {
  service?: ServiceData | null;
  establishmentId: string;
  onSave: (service: ServiceData) => void;
  onCancel: () => void;
}

const HOURS_OPTIONS = Array.from({ length: 13 }, (_, i) => i); // 0-12 heures
const MINUTES_OPTIONS = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

export default function ServiceForm({ service, establishmentId, onSave, onCancel }: ServiceFormProps) {
  const [formData, setFormData] = useState<ServiceData>({
    name: service?.name || "",
    description: service?.description || "",
    price: service?.price || 0,
    duration: service?.duration || 60,
    min_age: service?.min_age || null,
    image_url: service?.image_url || null,
    is_active: service?.is_active ?? true,
    position: service?.position || 0,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const updateField = (field: keyof ServiceData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${establishmentId}/services/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("service-images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("service-images")
        .getPublicUrl(fileName);

      updateField("image_url", publicUrl);
    } catch (error) {
      console.error("Erreur upload:", error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = () => {
    updateField("image_url", null);
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.price <= 0 || formData.duration <= 0) return;

    setSaving(true);
    try {
      const serviceData = {
        ...formData,
        establishment_id: establishmentId,
      };

      if (service?.id) {
        const { error } = await supabase
          .from("services")
          .update(serviceData)
          .eq("id", service.id);

        if (error) throw error;
        onSave({ ...serviceData, id: service.id });
      } else {
        const { data, error } = await supabase
          .from("services")
          .insert(serviceData)
          .select()
          .single();

        if (error) throw error;
        onSave(data);
      }
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
    } finally {
      setSaving(false);
    }
  };

  const isValid = formData.name.trim() !== "" && formData.price > 0 && formData.duration > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-primary text-lg font-bold">
          {service ? "Modifier la prestation" : "Nouvelle prestation"}
        </h3>
        <button
          onClick={onCancel}
          className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {/* Image upload */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Image (optionnel)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {formData.image_url ? (
            <div className="relative w-32 h-32 rounded-xl overflow-hidden border border-gray-200">
              <img
                src={formData.image_url}
                alt="Service"
                className="w-full h-full object-cover"
              />
              <button
                onClick={removeImage}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-32 h-32 rounded-xl border-2 border-dashed border-gray-200 hover:border-primary/30 flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              {uploading ? (
                <Loader2 size={24} className="text-primary animate-spin" />
              ) : (
                <>
                  <Upload size={24} className="text-gray-400" />
                  <span className="text-xs text-gray-400">Ajouter</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Nom */}
        <FormInput
          label="Nom de la prestation"
          icon={FileText}
          placeholder="Ex: Coupe femme"
          value={formData.name}
          onChange={(value) => updateField("name", value)}
          required
        />

        {/* Description */}
        <FormTextarea
          label="Description"
          icon={FileText}
          placeholder="Décrivez votre prestation..."
          value={formData.description}
          onChange={(value) => updateField("description", value)}
          rows={3}
        />

        {/* Prix et Durée */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Euro size={14} />
              Prix (€) *
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={formData.price || ""}
              onChange={(e) => updateField("price", parseFloat(e.target.value) || 0)}
              placeholder="0.00"
              className="h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base font-medium"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Clock size={14} />
              Durée *
            </label>
            <div className="flex items-center gap-2">
              <select
                value={Math.floor(formData.duration / 60)}
                onChange={(e) => {
                  const hours = parseInt(e.target.value);
                  const minutes = formData.duration % 60;
                  updateField("duration", hours * 60 + minutes);
                }}
                className="h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base font-medium bg-white cursor-pointer flex-1"
              >
                {HOURS_OPTIONS.map((h) => (
                  <option key={h} value={h}>
                    {h}h
                  </option>
                ))}
              </select>
              <span className="text-gray-400 font-medium">:</span>
              <select
                value={formData.duration % 60}
                onChange={(e) => {
                  const hours = Math.floor(formData.duration / 60);
                  const minutes = parseInt(e.target.value);
                  updateField("duration", hours * 60 + minutes);
                }}
                className="h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base font-medium bg-white cursor-pointer flex-1"
              >
                {MINUTES_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m.toString().padStart(2, "0")} min
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Âge minimum */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <User size={14} />
            Âge minimum (optionnel)
          </label>
          <input
            type="number"
            min="0"
            max="99"
            value={formData.min_age || ""}
            onChange={(e) => updateField("min_age", e.target.value ? parseInt(e.target.value) : null)}
            placeholder="Aucun"
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all text-base font-medium w-32"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={onCancel}
            className="px-6"
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValid || saving}
            className="px-6 bg-primary hover:bg-primary-dark"
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span>Enregistrement...</span>
              </div>
            ) : (
              <span>{service ? "Modifier" : "Créer"}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
