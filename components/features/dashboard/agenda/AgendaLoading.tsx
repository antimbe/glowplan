"use client";

import { Loader2 } from "lucide-react";

export default function AgendaLoading() {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-100px)]">
      <Loader2 className="animate-spin text-primary" size={40} />
    </div>
  );
}
