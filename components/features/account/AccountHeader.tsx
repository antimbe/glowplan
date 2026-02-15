"use client";

interface AccountHeaderProps {
    firstName: string | undefined;
    lastName: string | undefined;
    email: string | undefined;
}

export function AccountHeader({ firstName, lastName, email }: AccountHeaderProps) {
    return (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 mb-6">
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
        </div>
    );
}
