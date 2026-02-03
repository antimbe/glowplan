"use client";

import { Calendar } from "lucide-react";

export default function AgendaEmpty() {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] text-center">
      <Calendar size={48} className="text-gray-300 mb-4" />
      <p className="text-gray-500">Veuillez d'abord configurer votre établissement.</p>
    </div>
  );
}
