"use client";

import { useState } from "react";
import { Mail, Phone, Instagram, Loader2, Trash2 } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useModal } from "@/contexts/ModalContext";

interface ProfileTabProps {
    email: string | undefined;
    firstName: string;
    setFirstName: (val: string) => void;
    lastName: string;
    setLastName: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
    instagram: string;
    setInstagram: (val: string) => void;
    onSave: () => void;
    saving: boolean;
}

export function ProfileTab({
    email,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    instagram,
    setInstagram,
    onSave,
    saving
}: ProfileTabProps) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);

    const supabase = createClient();
    const { showError } = useModal();

    const handleDeleteAccount = async () => {
        if (deleteConfirmText.toLowerCase() !== "supprimer") return;
        setIsDeleting(true);
        try {
            const res = await fetch("/api/account/delete", { method: "DELETE" });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Erreur lors de la suppression");
            await supabase.auth.signOut();
            window.location.href = "/";
        } catch (err: any) {
            showError("Erreur de suppression", err.message || "Une erreur est survenue. Veuillez réessayer.");
            setIsDeleting(false);
        }
    };

    return (
        <>
            <div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={email || ""}
                                disabled
                                className="w-full pl-10 bg-gray-50"
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1">L'email ne peut pas être modifié</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                        <div className="relative">
                            <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="06 12 34 56 78"
                                className="w-full pl-10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Instagram</label>
                        <div className="relative">
                            <Instagram size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <Input
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                                placeholder="@votre_instagram"
                                className="w-full pl-10"
                            />
                        </div>
                    </div>

                    <Button
                        variant="primary"
                        onClick={onSave}
                        disabled={saving}
                        className="w-full cursor-pointer"
                    >
                        {saving ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="animate-spin" size={18} />
                                Enregistrement...
                            </span>
                        ) : (
                            "Enregistrer les modifications"
                        )}
                    </Button>

                    {/* Zone de danger */}
                    <div className="pt-6 mt-2 border-t border-gray-100">
                        <h3 className="text-base font-semibold text-red-600 mb-3">Zone de danger</h3>
                        <div className="rounded-2xl border border-red-100 bg-red-50/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p className="font-bold text-gray-800 text-sm">Supprimer mon compte</p>
                                <p className="text-xs text-gray-500 mt-0.5">Cette action est irréversible. Toutes vos données seront supprimées.</p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-xl shrink-0 bg-white cursor-pointer gap-2"
                                onClick={() => setShowDeleteModal(true)}
                            >
                                <Trash2 size={15} />
                                Supprimer le compte
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal confirmation suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h2 className="text-2xl font-black text-gray-900 mb-4">Supprimer votre compte ?</h2>
                        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                            Cette action est <strong className="text-red-600">irréversible</strong>. Toutes vos réservations, favoris et avis seront définitivement supprimés.
                            <br /><br />
                            Veuillez taper <strong>supprimer</strong> pour confirmer.
                        </p>
                        <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Tapez 'supprimer'"
                            className="mb-6 font-bold"
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                                className="flex-1 h-12 font-bold"
                                disabled={isDeleting}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText.toLowerCase() !== "supprimer" || isDeleting}
                                className="flex-1 h-12 font-black bg-red-600 hover:bg-red-700 text-white border-none"
                            >
                                {isDeleting ? <Loader2 className="animate-spin" size={20} /> : "Confirmer"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
