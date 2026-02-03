"use client";

import { useState, useEffect } from "react";
import { Plus, Package, Loader2 } from "lucide-react";
import { Button, Modal } from "@/components/ui";
import { ServiceForm, ServiceCard } from "../services";
import { ServiceData } from "../types";
import { createClient } from "@/lib/supabase/client";
import SectionCard from "../SectionCard";

interface ServicesTabProps {
  establishmentId: string;
}

export default function ServicesTab({ establishmentId }: ServicesTabProps) {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<ServiceData | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; serviceId: string | null }>({
    open: false,
    serviceId: null,
  });

  const supabase = createClient();

  useEffect(() => {
    loadServices();
  }, [establishmentId]);

  const loadServices = async () => {
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("position", { ascending: true });

      if (error) throw error;
      setServices(data || []);
    } catch (error) {
      console.error("Erreur chargement services:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (service: ServiceData) => {
    if (editingService) {
      setServices(prev => prev.map(s => s.id === service.id ? service : s));
    } else {
      setServices(prev => [...prev, service]);
    }
    setShowForm(false);
    setEditingService(null);
  };

  const handleEdit = (service: ServiceData) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteModal.serviceId) return;

    try {
      // Récupérer le service pour avoir l'URL de l'image
      const serviceToDelete = services.find(s => s.id === deleteModal.serviceId);
      
      // Supprimer l'image du bucket si elle existe
      if (serviceToDelete?.image_url) {
        const url = new URL(serviceToDelete.image_url);
        const pathParts = url.pathname.split("/service-images/");
        if (pathParts[1]) {
          const filePath = decodeURIComponent(pathParts[1]);
          await supabase.storage.from("service-images").remove([filePath]);
        }
      }

      // Supprimer le service de la base de données
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", deleteModal.serviceId);

      if (error) throw error;
      setServices(prev => prev.filter(s => s.id !== deleteModal.serviceId));
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setDeleteModal({ open: false, serviceId: null });
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingService(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        icon={Package}
        title="Offres et prestations"
        subtitle="Gérez vos services et leurs tarifs"
      >
        {showForm ? (
          <ServiceForm
            service={editingService}
            establishmentId={establishmentId}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {/* Liste des services */}
            {services.length > 0 ? (
              <div className="flex flex-col gap-3">
                {services.map((service) => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onEdit={handleEdit}
                    onDelete={(id) => setDeleteModal({ open: true, serviceId: id })}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Package size={32} className="text-primary" />
                </div>
                <p className="text-gray-500 text-sm mb-4">
                  Vous n'avez pas encore de prestation.<br />
                  Créez votre première offre pour commencer.
                </p>
              </div>
            )}

            {/* Bouton ajouter */}
            <Button
              variant="outline"
              onClick={() => setShowForm(true)}
              className="w-full h-12 border-dashed border-2 border-primary/30 text-primary hover:text-primary hover:bg-primary/5 hover:border-primary"
            >
              <Plus size={20} className="mr-2" />
              Ajouter une prestation
            </Button>
          </div>
        )}
      </SectionCard>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, serviceId: null })}
        title="Supprimer la prestation"
        message="Êtes-vous sûr de vouloir supprimer cette prestation ? Cette action est irréversible."
        variant="error"
        confirmText="Supprimer"
        cancelText="Annuler"
        showCancel
        onConfirm={handleDelete}
      />
    </div>
  );
}
