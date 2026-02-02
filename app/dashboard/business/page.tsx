"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { 
  Camera, Plus, Check, Building2, Mail, Phone, MapPin, 
  FileText, Clock, AlertCircle, Scissors, Image as ImageIcon, ChevronRight,
  Store, Hash, Shield
} from "lucide-react";

const tabs = [
  { id: "general", label: "Informations générales" },
  { id: "sections", label: "Sections de rendez-vous" },
  { id: "rappels", label: "Rappels et RDV" },
  { id: "horaires", label: "Horaires d'ouverture" },
  { id: "paiement", label: "Paiement et acompte" },
  { id: "offres", label: "Offres et prestations" },
  { id: "avancee", label: "Avancée" },
];

const secteurActivite = [
  { id: "coiffure", label: "Coupes & coiffures" },
  { id: "ongles", label: "Ongles" },
  { id: "sourcils", label: "Sourcils & cils" },
  { id: "massage", label: "Massage" },
  { id: "barbier", label: "Barbier" },
  { id: "epilation", label: "Épilation" },
  { id: "soins", label: "Soins du corps" },
  { id: "protheses", label: "Prothèses capillaires" },
  { id: "tatouage", label: "Tatouage & piercing" },
  { id: "maquillage", label: "Maquillage" },
  { id: "medical", label: "Médical & dentaire" },
];

const cardStyle = "w-full bg-white rounded-2xl p-6 border border-gray-200 shadow-sm";
const inputStyle = "w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3626]/20 focus:border-[#2a3626]/40 transition-all";
const labelStyle = "text-xs font-semibold text-gray-600 uppercase tracking-wider";

export default function BusinessPage() {
  const [activeTab, setActiveTab] = useState("general");
  const [selectedSecteurs, setSelectedSecteurs] = useState<string[]>([]);
  const [logoType, setLogoType] = useState<"generate" | "fixed">("generate");
  const [photoFormat, setPhotoFormat] = useState<"generate" | "fixed">("generate");
  const [photoDisplay, setPhotoDisplay] = useState<"fill" | "contain">("fill");

  const toggleSecteur = (id: string) => {
    setSelectedSecteurs(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="w-full bg-white rounded-2xl border border-gray-200 mb-4 overflow-x-auto shadow-sm">
        <div className="flex min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-6 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 cursor-pointer
                ${activeTab === tab.id 
                  ? "text-[#2a3626] border-[#2a3626] bg-[#2a3626]/5" 
                  : "text-gray-500 border-transparent hover:text-[#2a3626] hover:bg-gray-50"
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {activeTab !== "general" ? (
        <div className={cardStyle}>
          <div className="flex flex-col items-center gap-6 py-16">
            <div className="w-16 h-16 rounded-2xl bg-[#2a3626]/10 flex items-center justify-center">
              <span className="text-3xl">🚧</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <h2 className="text-[#2a3626] text-xl font-bold">Section en construction</h2>
              <p className="text-gray-500 text-sm text-center max-w-md">
                Cette fonctionnalité sera bientôt disponible.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex flex-col gap-4">
          {/* Section 1: Informations de l'établissement */}
          <div className={cardStyle}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg shadow-[#2a3626]/20">
                <Store size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-[#2a3626] text-lg font-bold">Informations de l'établissement</h2>
                <p className="text-[#2a3626]/60 text-xs">Les champs marqués d'un * sont obligatoires</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Building2 size={14} className="text-[#2a3626]/50" />
                    <label className={labelStyle}>Nom de la boutique *</label>
                  </div>
                  <input type="text" placeholder="Mon Salon" className={inputStyle} />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <Hash size={14} className="text-[#2a3626]/50" />
                    <label className={labelStyle}>Siret</label>
                  </div>
                  <input type="text" placeholder="123 456 789 00012" className={inputStyle} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Description *</label>
                </div>
                <textarea
                  placeholder="Décrivez votre établissement..."
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2a3626]/20 focus:border-[#2a3626]/40 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Coordonnées */}
          <div className={cardStyle}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg ">
                <Mail size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-[#2a3626] text-lg font-bold">Coordonnées</h2>
                <p className="text-gray-500 text-xs">Comment vos clients peuvent vous contacter</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Email *</label>
                </div>
                <input type="email" placeholder="contact@monsalon.fr" className={inputStyle} />
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Téléphone</label>
                </div>
                <input type="tel" placeholder="06 12 34 56 78" className={inputStyle} />
              </div>
            </div>
          </div>

          {/* Section 3: Localisation */}
          <div className={cardStyle}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg ">
                <MapPin size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-[#2a3626] text-lg font-bold">Localisation</h2>
                <p className="text-gray-500 text-xs">Où se trouve votre établissement</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Adresse *</label>
                </div>
                <input type="text" placeholder="10 rue d'Alembert" className={inputStyle} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className={labelStyle}>Ville *</label>
                  <input type="text" placeholder="Lille" className={inputStyle} />
                </div>
                <div className="flex flex-col gap-2">
                  <label className={labelStyle}>Code postal</label>
                  <input type="text" placeholder="59000" className={inputStyle} />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className={labelStyle}>Complément d'adresse</label>
                <input type="text" placeholder="Bâtiment A, 2ème étage..." className={inputStyle} />
              </div>

              <div className="bg-amber-50 border border-amber-200/50 rounded-xl p-4">
                <div className="flex items-start gap-4">
                  <input type="checkbox" className="mt-0.5 w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500 cursor-pointer" />
                  <div>
                    <p className="text-amber-800 font-semibold text-sm">
Masquer l'adresse exacte</p>
                    <p className="text-amber-700/70 text-xs">Seule la ville sera affichée publiquement. L'adresse exacte sera envoyée au client 24h avant le rendez-vous dans le mail de rappel.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Paramètres & Règles */}
          <div className={cardStyle}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg ">
                <Shield size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-[#2a3626] text-lg font-bold">Paramètres & Règles</h2>
                <p className="text-gray-500 text-xs">Configurez vos préférences de gestion</p>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="bg-gradient-to-r from-[#2a3626]/5 to-[#2a3626]/10 border border-[#2a3626]/15 rounded-xl p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[#2a3626] flex items-center justify-center flex-shrink-0">
                    <Clock size={18} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-[#2a3626] font-bold text-sm">Confirmation automatique des RDV</p>
                      <div className="relative">
                        <input type="checkbox" className="sr-only peer" id="auto-confirm" />
                        <label 
                          htmlFor="auto-confirm"
                          className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2a3626] cursor-pointer block"
                        />
                      </div>
                    </div>
                    <p className="text-[#2a3626]/60 text-xs mt-2">
                      Les demandes seront automatiquement confirmées pour les clients réguliers (2+ visites).
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Conditions générales & règles</label>
                </div>
                <textarea
                  placeholder="Ex: Pour le 1er RDV : 50% d'acompte requis..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/40 transition-all resize-none"
                />
                <div className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500 cursor-pointer" />
                  <span className="text-gray-500 text-xs">Afficher sur ma vitrine en ligne</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} className="text-[#2a3626]/50" />
                  <label className={labelStyle}>Contact en cas d'urgence</label>
                </div>
                <input type="text" placeholder="Numéro ou email pour les annulations" className={inputStyle} />
              </div>
            </div>
          </div>

          {/* Section 5: Secteur d'activité */}
          <div className={cardStyle}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg ">
                <Scissors size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-[#2a3626] text-lg font-bold">Secteur d'activité</h2>
                <p className="text-gray-500 text-xs">Sélectionnez un ou plusieurs secteurs</p>
              </div>
              {selectedSecteurs.length > 0 && (
                <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-xs font-bold">
                  {selectedSecteurs.length} sélectionné{selectedSecteurs.length > 1 ? "s" : ""}
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {secteurActivite.map((secteur) => (
                <button
                  key={secteur.id}
                  onClick={() => toggleSecteur(secteur.id)}
                  className={`
                    flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 transition-all text-left cursor-pointer
                    ${selectedSecteurs.includes(secteur.id)
                      ? "bg-[#2a3626] border-[#2a3626] text-white shadow-lg"
                      : "bg-gray-50 border-gray-100 text-gray-700 hover:border-[#2a3626]/30 hover:bg-white"
                    }
                  `}
                >
                  <div className={`
                    w-5 h-5 rounded-md border-2 flex items-center justify-center
                    ${selectedSecteurs.includes(secteur.id) ? "border-white bg-white" : "border-gray-300"}
                  `}>
                    {selectedSecteurs.includes(secteur.id) && <Check size={14} className="text-[#2a3626]" />}
                  </div>
                  <span className="text-sm font-medium">{secteur.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 6: Photos & Visuels */}
          <div className={cardStyle}>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-[#2a3626] flex items-center justify-center shadow-lg">
                <ImageIcon size={22} className="text-white" />
              </div>
              <div>
                <h2 className="text-[#2a3626] text-lg font-bold">Photos & Visuels</h2>
                <p className="text-gray-500 text-xs">Ajoutez jusqu'à 8 photos pour votre vitrine</p>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Format du logo</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setLogoType("generate")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        logoType === "generate" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Générer
                    </button>
                    <button
                      onClick={() => setLogoType("fixed")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        logoType === "fixed" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Fixé
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Format photos</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPhotoFormat("generate")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        photoFormat === "generate" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Générer
                    </button>
                    <button
                      onClick={() => setPhotoFormat("fixed")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        photoFormat === "fixed" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Fixé
                    </button>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Affichage</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPhotoDisplay("fill")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        photoDisplay === "fill" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Rempli
                    </button>
                    <button
                      onClick={() => setPhotoDisplay("contain")}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        photoDisplay === "contain" ? "bg-[#2a3626] text-white" : "bg-white text-gray-600 border border-gray-200"
                      }`}
                    >
                      Entier
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="aspect-square bg-[#2a3626]/10 rounded-2xl border-2 border-dashed border-[#2a3626]/40 flex flex-col items-center justify-center cursor-pointer hover:bg-[#2a3626]/20 transition-all">
                  <div className="w-14 h-14 rounded-full bg-white shadow-lg flex items-center justify-center mb-3">
                    <Camera size={24} className="text-[#2a3626]" />
                  </div>
                  <span className="text-[#2a3626] text-xs font-semibold">Photo principale</span>
                </div>
                
                {[...Array(7)].map((_, i) => (
                  <div 
                    key={i}
                    className="aspect-square bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-[#2a3626]/30 transition-all"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                      <Plus size={20} className="text-gray-400" />
                    </div>
                    <span className="text-gray-400 text-[10px]">Photo {i + 2}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="w-full flex justify-end mt-2">
            <Button
              variant="primary"
              className="bg-[#2a3626] hover:bg-[#1a2318] rounded-xl px-8 h-12 font-semibold shadow-lg shadow-[#2a3626]/20 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span>Enregistrer</span>
                <ChevronRight size={18} />
              </div>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
