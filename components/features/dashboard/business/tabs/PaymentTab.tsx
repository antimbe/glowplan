"use client";

import { CreditCard, Link as LinkIcon, Plus, Trash2, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { EstablishmentData } from "../types";

interface PaymentTabProps {
  formData: EstablishmentData;
  updateField: <K extends keyof EstablishmentData>(field: K, value: EstablishmentData[K]) => void;
  saveEstablishment: () => void;
  saving?: boolean;
}

export default function PaymentTab({ formData, updateField, saveEstablishment, saving }: PaymentTabProps) {
  const handleAddLink = () => {
    const currentLinks = Array.isArray(formData.payment_links) ? [...formData.payment_links] : [];
    updateField("payment_links", [...currentLinks, { provider: "", url: "" }]);
  };

  const handleRemoveLink = (index: number) => {
    const currentLinks = Array.isArray(formData.payment_links) ? [...formData.payment_links] : [];
    currentLinks.splice(index, 1);
    updateField("payment_links", currentLinks);
  };

  const handleUpdateLink = (index: number, field: "provider" | "url", value: string) => {
    const currentLinks = Array.isArray(formData.payment_links) ? [...formData.payment_links] : [];
    currentLinks[index] = { ...currentLinks[index], [field]: value };
    updateField("payment_links", currentLinks);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Paiement et Acompte</h2>
            <p className="text-gray-500 text-sm mt-1">Configurez vos règles d'acompte et fournissez vos liens de paiement (Paypal, Lydia, Wero, etc.).</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Acompte Obligatoire Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="pr-4">
              <h3 className="font-semibold text-gray-900">Exiger un acompte</h3>
              <p className="text-sm text-gray-500 mt-1">Si activé, le client verra le montant de l'acompte et les liens de paiement lors de sa réservation.</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={formData.require_deposit || false}
                onChange={(e) => {
                  const isChecked = e.target.checked;
                  updateField("require_deposit", isChecked);
                  if (isChecked && !formData.payment_instructions) {
                    updateField("payment_instructions", "IMPORTANT : Indiquez obligatoirement votre Nom, Prénom et la date du RDV dans le libellé/motif du transfert.");
                  }
                }}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>

          {formData.require_deposit && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-300">
              {/* Montant de l'acompte */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Montant de l'acompte</label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.deposit_amount || ""}
                    onChange={(e) => updateField("deposit_amount", e.target.value)}
                    placeholder="Ex: 20€ ou 30%"
                    className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Info size={16} />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">Précisez le montant fixe ou le pourcentage requis pour bloquer le créneau.</p>
              </div>

              {/* Instructions de paiement */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Instructions pour le client</label>
                <textarea
                  value={formData.payment_instructions || ""}
                  onChange={(e) => updateField("payment_instructions", e.target.value)}
                  placeholder="Ex: Merci de faire le virement avec nom et prénom en libellé..."
                  rows={3}
                  className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-y"
                />
              </div>

              {/* Liens de paiement */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-semibold text-gray-900">Liens de paiement</label>
                  <Button variant="outline" size="sm" onClick={handleAddLink} type="button" className="text-xs h-8">
                    <Plus size={14} className="mr-1" /> Ajouter un lien
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {(!formData.payment_links || formData.payment_links.length === 0) ? (
                    <div className="text-center p-6 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
                      <p className="text-sm text-gray-500">Aucun lien de paiement configuré. Ajoutez-en un (ex: Paypal, Wero).</p>
                    </div>
                  ) : (
                    formData.payment_links.map((link, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-gray-50 p-3 rounded-xl border border-gray-100 relative group">
                        <div className="w-full sm:w-1/3">
                          <input
                            type="text"
                            placeholder="Nom (ex: Paypal)"
                            value={link.provider || ""}
                            onChange={(e) => handleUpdateLink(index, "provider", e.target.value)}
                            className="w-full p-2.5 text-sm rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                        </div>
                        <div className="w-full sm:flex-1 relative flex items-center">
                          <div className="absolute left-3 text-gray-400 pointer-events-none">
                            <LinkIcon size={14} />
                          </div>
                          <input
                            type="url"
                            placeholder="URL (ex: https://paypal.me/...)"
                            value={link.url || ""}
                            onChange={(e) => handleUpdateLink(index, "url", e.target.value)}
                            className="w-full pl-9 p-2.5 text-sm rounded-lg border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveLink(index)}
                          className="absolute -right-2 -top-2 sm:static sm:right-auto sm:top-auto p-2 bg-white sm:bg-transparent shadow-sm sm:shadow-none rounded-full text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Supprimer ce lien"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 z-10 sm:static sm:bg-transparent sm:border-none sm:p-0">
        <p className="text-xs text-gray-500 hidden sm:block mr-auto">
          N'oubliez pas d'enregistrer vos modifications.
        </p>
        <Button
          variant="primary"
          onClick={saveEstablishment}
          disabled={saving}
          className="w-full sm:w-auto px-8"
        >
          {saving ? (
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin" size={16} /> Enregistrement...
            </span>
          ) : "Enregistrer les paramètres"}
        </Button>
      </div>
    </div>
  );
}
