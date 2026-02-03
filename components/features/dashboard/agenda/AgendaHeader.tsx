"use client";

import { Plus, Ban } from "lucide-react";
import { Button } from "@/components/ui";

interface AgendaHeaderProps {
  onNewAppointment: () => void;
  onNewUnavailability: () => void;
}

export default function AgendaHeader({ onNewAppointment, onNewUnavailability }: AgendaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <h1 className="text-xl lg:text-2xl font-bold text-primary">Mon Agenda</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onNewUnavailability}
          className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 text-xs lg:text-sm"
        >
          <Ban size={16} className="mr-1 lg:mr-2" />
          <span className="hidden sm:inline">Indisponibilité</span>
          <span className="sm:hidden">Indispo.</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onNewAppointment}
          className="bg-primary hover:bg-primary-dark text-xs lg:text-sm"
        >
          <Plus size={16} className="mr-1 lg:mr-2" />
          <span className="hidden sm:inline">Nouveau RDV</span>
          <span className="sm:hidden">RDV</span>
        </Button>
      </div>
    </div>
  );
}
