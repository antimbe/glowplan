"use client";

import { Plus, Ban, Calendar } from "lucide-react";
import { Button } from "@/components/ui";

interface AgendaHeaderProps {
  onNewAppointment: () => void;
  onNewUnavailability: () => void;
}

export default function AgendaHeader({ onNewAppointment, onNewUnavailability }: AgendaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-primary/5 to-transparent p-3 lg:p-4 rounded-xl lg:rounded-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-xl lg:rounded-2xl bg-primary/10 flex items-center justify-center">
          <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-lg lg:text-xl font-bold text-gray-900">Mon Agenda</h1>
          <p className="text-xs lg:text-sm text-gray-500 hidden sm:block">Gérez vos rendez-vous et disponibilités</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewUnavailability}
          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs lg:text-sm shadow-sm"
        >
          <Ban size={16} className="mr-1.5" />
          <span className="hidden sm:inline">Indisponibilité</span>
          <span className="sm:hidden">Indispo.</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onNewAppointment}
          className="bg-primary hover:bg-primary-dark text-xs lg:text-sm shadow-md hover:shadow-lg transition-shadow"
        >
          <Plus size={16} className="mr-1.5" />
          <span className="hidden sm:inline">Nouveau RDV</span>
          <span className="sm:hidden">+ RDV</span>
        </Button>
      </div>
    </div>
  );
}
