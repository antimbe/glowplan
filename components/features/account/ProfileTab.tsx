"use client";

import { useState } from "react";
import { Mail, Phone, Instagram, Loader2, Trash2, Save, User, AtSign } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { useModal } from "@/contexts/ModalContext";
import { motion } from "framer-motion";

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

function FieldGroup({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em]">
                <Icon size={11} className="text-[#c0a062]/70" />
                {label}
            </label>
            {children}
        </div>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-center gap-3 mb-4">
            <span className="text-sm font-black text-gray-700 uppercase tracking-[0.12em]">{children}</span>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent" />
        </div>
    );
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
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="space-y-8"
            >
                {/* Section — Identité */}
                <div>
                    <SectionTitle>Identité</SectionTitle>
                    <div className="grid grid-cols-2 gap-4">
                        <FieldGroup label="Prénom" icon={User}>
                            <Input
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full rounded-xl bg-gray-50/60 border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/10 h-11"
                            />
                        </FieldGroup>
                        <FieldGroup label="Nom" icon={User}>
                            <Input
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full rounded-xl bg-gray-50/60 border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/10 h-11"
                            />
                        </FieldGroup>
                    </div>
                </div>

                {/* Section — Contact */}
                <div>
                    <SectionTitle>Contact</SectionTitle>
                    <div className="space-y-4">
                        <FieldGroup label="Email" icon={Mail}>
                            <div className="relative">
                                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                <Input
                                    value={email || ""}
                                    disabled
                                    className="w-full pl-10 rounded-xl bg-gray-50 border-gray-100 text-gray-400 h-11 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[10px] text-gray-300 font-medium">L'email ne peut pas être modifié</p>
                        </FieldGroup>

                        <FieldGroup label="Téléphone" icon={Phone}>
                            <div className="relative">
                                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                <Input
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="06 12 34 56 78"
                                    className="w-full pl-10 rounded-xl bg-gray-50/60 border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/10 h-11"
                                />
                            </div>
                        </FieldGroup>

                        <FieldGroup label="Instagram" icon={AtSign}>
                            <div className="relative">
                                <Instagram size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
                                <Input
                                    value={instagram}
                                    onChange={(e) => setInstagram(e.target.value)}
                                    placeholder="@votre_instagram"
                                    className="w-full pl-10 rounded-xl bg-gray-50/60 border-gray-100 focus:bg-white focus:ring-2 focus:ring-primary/10 h-11"
                                />
                            </div>
                        </FieldGroup>
                    </div>
                </div>

                {/* Save button */}
                <Button
                    variant="primary"
                    onClick={onSave}
                    disabled={saving}
                    className="w-full h-12 rounded-xl font-bold cursor-pointer gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
                >
                    {saving ? (
                        <>
                            <Loader2 className="animate-spin" size={17} />
                            Enregistrement...
                        </>
                    ) : (
                        <>
                            <Save size={15} />
                            Enregistrer les modifications
                        </>
                    )}
                </Button>

                {/* Zone de danger */}
                <div>
                    <SectionTitle>Zone de danger</SectionTitle>
                    <div className="rounded-2xl border border-red-100 bg-red-50/30 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <p className="font-bold text-gray-800 text-sm">Supprimer mon compte</p>
                            <p className="text-xs text-gray-400 mt-0.5">Cette action est irréversible. Toutes vos données seront supprimées.</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-red-200 text-red-500 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all rounded-xl shrink-0 bg-white cursor-pointer gap-2"
                            onClick={() => setShowDeleteModal(true)}
                        >
                            <Trash2 size={14} />
                            Supprimer le compte
                        </Button>
                    </div>
                </div>
            </motion.div>

            {/* Modal confirmation suppression */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-md animate-in fade-in duration-300">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
                    >
                        {/* Top red accent */}
                        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-transparent via-red-400 to-transparent" />

                        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-5">
                            <Trash2 size={22} className="text-red-500" />
                        </div>

                        <h2 className="text-xl font-black text-gray-900 mb-3">Supprimer votre compte ?</h2>
                        <p className="text-gray-500 mb-6 text-sm leading-relaxed">
                            Cette action est <strong className="text-red-600">irréversible</strong>. Toutes vos réservations, favoris et avis seront définitivement supprimés.
                            <br /><br />
                            Tapez <span className="font-black text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded">supprimer</span> pour confirmer.
                        </p>
                        <Input
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Tapez 'supprimer'"
                            className="mb-5 font-bold rounded-xl h-12 focus:ring-2 focus:ring-red-200"
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => { setShowDeleteModal(false); setDeleteConfirmText(""); }}
                                className="flex-1 h-12 font-bold rounded-xl cursor-pointer"
                                disabled={isDeleting}
                            >
                                Annuler
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText.toLowerCase() !== "supprimer" || isDeleting}
                                className="flex-1 h-12 font-black bg-red-600 hover:bg-red-700 text-white border-none rounded-xl cursor-pointer shadow-lg shadow-red-500/20"
                            >
                                {isDeleting ? <Loader2 className="animate-spin" size={20} /> : "Confirmer la suppression"}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </>
    );
}
