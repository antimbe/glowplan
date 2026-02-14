"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EstablishmentData } from "../types";
import { useModal } from "@/contexts/ModalContext";

export function useEstablishment() {
    const router = useRouter();
    const { showSuccess, showError } = useModal();
    const supabase = createClient();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [isEditMode, setIsEditMode] = useState<boolean | null>(null);

    const [formData, setFormData] = useState<EstablishmentData>({
        name: "",
        siret: "",
        description: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        postal_code: "",
        address_complement: "",
        hide_exact_address: false,
        auto_confirm_appointments: false,
        general_conditions: "",
        show_conditions_online: false,
        emergency_contact: "",
        activity_sectors: [],
        logo_format: "generate",
        photo_format: "generate",
        photo_display: "fill",
        main_photo_url: "",
    });

    const checkProfileCompletion = useCallback((data: EstablishmentData) => {
        return !!(
            data.name &&
            data.description &&
            data.email &&
            data.address &&
            data.city &&
            data.activity_sectors.length > 0 &&
            data.main_photo_url
        );
    }, []);

    const loadEstablishment = useCallback(async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth/pro/login");
                return;
            }

            const userType = user.user_metadata?.user_type;

            const { data, error } = await supabase
                .from("establishments")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 is code for 'no rows returned'
                throw error;
            }

            if (!data) {
                if (userType !== "pro") {
                    router.push("/account");
                } else {
                    // Just set edit mode to force user to enter info
                    setIsEditMode(true);
                    setIsProfileComplete(false);
                }
                return;
            }

            setEstablishmentId(data.id);
            const profileComplete = data.is_profile_complete || false;
            setIsProfileComplete(profileComplete);
            setIsEditMode(!profileComplete);

            setFormData({
                name: data.name || "",
                siret: data.siret || "",
                description: data.description || "",
                email: data.email || "",
                phone: data.phone || "",
                address: data.address || "",
                city: data.city || "",
                postal_code: data.postal_code || "",
                address_complement: data.address_complement || "",
                hide_exact_address: data.hide_exact_address || false,
                auto_confirm_appointments: data.auto_confirm_appointments || false,
                general_conditions: data.general_conditions || "",
                show_conditions_online: data.show_conditions_online || false,
                emergency_contact: data.emergency_contact || "",
                activity_sectors: data.activity_sectors || [],
                logo_format: data.logo_format || "generate",
                photo_format: data.photo_format || "generate",
                photo_display: data.photo_display || "fill",
                main_photo_url: data.main_photo_url || "",
            });
        } catch (error) {
            console.error("Error loading establishment:", error);
            showError("Erreur", "Impossible de charger les informations de votre établissement.");
            setIsEditMode(true);
        } finally {
            setLoading(false);
        }
    }, [supabase, router, showError]);

    const saveEstablishment = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const isComplete = checkProfileCompletion(formData);

            const establishmentData = {
                user_id: user.id,
                ...formData,
                is_profile_complete: isComplete,
            };

            if (establishmentId) {
                const { error } = await supabase
                    .from("establishments")
                    .update(establishmentData)
                    .eq("id", establishmentId);
                if (error) throw error;
            } else {
                const { data, error } = await supabase
                    .from("establishments")
                    .insert(establishmentData)
                    .select()
                    .single();
                if (error) throw error;
                if (data) setEstablishmentId(data.id);
            }

            setIsProfileComplete(isComplete);
            showSuccess("Succès", "Vos informations ont été enregistrées avec succès !");
            setIsEditMode(false);
        } catch (error) {
            console.error("Error saving establishment:", error);
            showError("Erreur", "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
        } finally {
            setSaving(false);
        }
    };

    const updateField = <K extends keyof EstablishmentData>(field: K, value: EstablishmentData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleEditMode = (mode: boolean) => setIsEditMode(mode);

    useEffect(() => {
        loadEstablishment();
    }, [loadEstablishment]);

    return {
        formData,
        loading,
        saving,
        establishmentId,
        isProfileComplete,
        isEditMode,
        updateField,
        saveEstablishment,
        toggleEditMode,
        refresh: loadEstablishment
    };
}
