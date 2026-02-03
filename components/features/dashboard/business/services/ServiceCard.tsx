"use client";

import { Clock, Euro, User, Edit2, Trash2, MoreVertical } from "lucide-react";
import { ServiceData } from "../types";
import { useState } from "react";

interface ServiceCardProps {
  service: ServiceData;
  onEdit: (service: ServiceData) => void;
  onDelete: (serviceId: string) => void;
}

export default function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h${mins}` : `${hours}h`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(price);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group relative">
      <div className="flex gap-4">
        {/* Image */}
        {service.image_url ? (
          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={service.image_url}
              alt={service.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <span className="text-primary text-2xl font-bold">
              {service.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-primary font-bold text-base truncate">
                {service.name}
              </h4>
              {service.description && (
                <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                  {service.description}
                </p>
              )}
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer lg:opacity-0 lg:group-hover:opacity-100"
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[140px]">
                    <button
                      onClick={() => {
                        onEdit(service);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 size={14} />
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        if (service.id) onDelete(service.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Euro size={14} />
              <span className="text-sm font-semibold text-primary">
                {formatPrice(service.price)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <Clock size={14} />
              <span className="text-sm">{formatDuration(service.duration)}</span>
            </div>
            {service.min_age && (
              <div className="flex items-center gap-1.5 text-gray-500">
                <User size={14} />
                <span className="text-sm">{service.min_age}+ ans</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
