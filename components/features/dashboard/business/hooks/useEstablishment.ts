"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EstablishmentData } from "../types";
import { useModal } from "@/contexts/ModalContext";

const REQUIRED_FIELDS = [
    { key: "name", label: "Nom de l'établissement" },
    { key: "description", label: "Description" },
    { key: "email", label: "Email de contact" },
    { key: "address", label: "Adresse" },
    { key: "city", label: "Ville" },
    { key: "activity_sectors", label: "Secteurs d'activité" },
    { key: "main_photo_url", label: "Photo principale" },
] as const;

const INITIAL_FORM_DATA: EstablishmentData = {
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
};

export function useEstablishment() {
    const router = useRouter();
    const { showSuccess, showError } = useModal();
    const supabase = useMemo(() => createClient(), []);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [establishmentId, setEstablishmentId] = useState<string | null>(null);
    const [isProfileComplete, setIsProfileComplete] = useState(false);
    const [missingFields, setMissingFields] = useState<string[]>([]);
    const [isEditMode, setIsEditMode] = useState<boolean | null>(null);

    const [formData, setFormData] = useState<EstablishmentData>(INITIAL_FORM_DATA);

    const getMissingFields = useCallback((data: EstablishmentData) => {
        const missing: string[] = [];
        REQUIRED_FIELDS.forEach(field => {
            const value = data[field.key as keyof EstablishmentData];
            if (!value || (Array.isArray(value) && value.length === 0)) {
                missing.push(field.label);
            }
        });
        return missing;
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

            // Use .order + .maybeSingle() instead of .single() to avoid errors when
            // duplicate records exist (e.g. from a previous bug). We always pick the
            // most recent one.
            const { data, error } = await supabase
                .from("establishments")
                .select("*")
                .eq("user_id", user.id)
                .order("created_at", { ascending: false })
                .limit(1)
                .maybeSingle();

            if (error) {
                throw error;
            }

            if (!data) {
                if (userType !== "pro") {
                    router.push("/account");
                } else {
                    // Just set edit mode to force user to enter info
                    setIsEditMode(true);
                    setIsProfileComplete(false);
                    // No data in DB, so fields are missing based on initial state
                    setMissingFields(getMissingFields(INITIAL_FORM_DATA));
                }
                return;
            }

            setEstablishmentId(data.id);

            const currentFormData: EstablishmentData = {
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
            };

            const missing = getMissingFields(currentFormData);
            const profileComplete = missing.length === 0;

            setIsProfileComplete(profileComplete);
            setMissingFields(missing);
            setIsEditMode(!profileComplete);
            setFormData(currentFormData);
        } catch (error) {
            console.error("Error loading establishment:", error);
            showError("Erreur", "Impossible de charger les informations de votre établissement.");
            setIsEditMode(true);
        } finally {
            setLoading(false);
        }
    }, [supabase, router, showError, getMissingFields]);

    const saveEstablishment = async () => {
        setSaving(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const missing = getMissingFields(formData);
            const isComplete = missing.length === 0;

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
                // Safety check: before inserting, make sure no record exists for this user.
                // This prevents duplication if establishmentId was lost (e.g. due to a bug).
                const { data: existingData } = await supabase
                    .from("establishments")
                    .select("id")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: false })
                    .limit(1)
                    .maybeSingle();

                if (existingData) {
                    // Record exists but ID wasn't in state — update it instead of inserting
                    setEstablishmentId(existingData.id);
                    const { error } = await supabase
                        .from("establishments")
                        .update(establishmentData)
                        .eq("id", existingData.id);
                    if (error) throw error;
                } else {
                    const { data, error } = await supabase
                        .from("establishments")
                        .insert(establishmentData)
                        .select()
                        .maybeSingle();
                    if (error) throw error;
                    if (data) setEstablishmentId(data.id);
                }
            }

            setIsProfileComplete(isComplete);
            setMissingFields(missing);
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
        missingFields,
        isEditMode,
        updateField,
        saveEstablishment,
        toggleEditMode,
        refresh: loadEstablishment
    };
}
