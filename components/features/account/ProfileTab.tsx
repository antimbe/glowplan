"use client";

import { Mail, Phone, Instagram, Loader2, LogOut } from "lucide-react";
import { Button, Input } from "@/components/ui";

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
    onSignOut: () => void;
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
    onSignOut,
    saving
}: ProfileTabProps) {
    return (
        <div className="max-w-md">
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

                <div className="pt-6 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onSignOut}
                        className="w-full text-red-500 border-red-200 hover:bg-red-50 cursor-pointer"
                    >
                        <LogOut size={18} />
                        Se déconnecter
                    </Button>
                </div>
            </div>
        </div>
    );
}
