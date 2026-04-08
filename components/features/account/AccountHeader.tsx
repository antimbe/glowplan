"use client";

import { Button } from "@/components/ui";
import { LogOut } from "lucide-react";

interface AccountHeaderProps {
    firstName: string | undefined;
    lastName: string | undefined;
    email: string | undefined;
    onSignOut: () => void;
}

export function AccountHeader({ firstName, lastName, email, onSignOut }: AccountHeaderProps) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-bold">
                        {firstName?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">
                            {firstName} {lastName}
                        </h1>
                        <p className="text-gray-500">{email}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={onSignOut}
                    className="self-start md:self-auto text-gray-600 border-gray-200 hover:bg-red-50 hover:text-red-600"
                >
                    <LogOut size={16} />
                    Déconnexion
                </Button>
            </div>
        </div>
    );
}
