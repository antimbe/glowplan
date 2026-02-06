"use client";

import { useSearchParams } from "next/navigation";
import { Construction, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";

const PAGE_TITLES: Record<string, string> = {
  etablissement: "Mon établissement",
  portefeuille: "Portefeuille",
  abonnements: "Mes abonnements",
};

export default function ConstructionPage() {
  const searchParams = useSearchParams();
  const page = searchParams.get("page") || "";
  const title = PAGE_TITLES[page] || "Cette page";

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
        <Construction size={40} className="text-primary" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {title} - En construction
      </h1>
      <p className="text-gray-500 max-w-md mb-8">
        Cette fonctionnalité est en cours de développement et sera bientôt disponible. 
        Merci de votre patience !
      </p>
      <Link href="/dashboard/business">
        <Button variant="primary">
          <ArrowLeft size={16} className="mr-2" />
          Retour au dashboard
        </Button>
      </Link>
    </div>
  );
}
