"use client";

import { Bell, Calendar, Star, X, Check, CreditCard, ChevronRight } from "lucide-react";
import { useNotifications, Notification } from "./hooks/useNotifications";
import { cn } from "@/lib/utils/cn";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import Link from "next/link";

interface NotificationDropdownProps {
  establishmentId: string | null;
  onClose: () => void;
}

export default function NotificationDropdown({ establishmentId, onClose }: NotificationDropdownProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, loading } = useNotifications(establishmentId);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'appointment_new': return <Calendar size={16} className="text-blue-500" />;
      case 'appointment_cancelled': return <X size={16} className="text-red-500" />;
      case 'deposit_paid': return <CreditCard size={16} className="text-green-500" />;
      case 'review_new': return <Star size={16} className="text-amber-500" />;
      default: return <Bell size={16} className="text-gray-500" />;
    }
  };

  const handleNotificationClick = (n: Notification) => {
    markAsRead(n.id);
    onClose();
  };

  return (
    <div className="absolute top-12 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
      <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-primary/10 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
              {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
          >
            <Check size={14} />
            Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Chargement...
          </div>
        ) : notifications.length > 0 ? (
          <div className="divide-y divide-gray-50">
            {notifications.map((n) => (
              <Link
                key={n.id}
                href={n.link || "#"}
                onClick={() => handleNotificationClick(n)}
                className={cn(
                  "flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group relative",
                  !n.is_read && "bg-primary/[0.02]"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105",
                  n.is_read ? "bg-gray-100" : "bg-white shadow-sm border border-primary/10"
                )}>
                  {getIcon(n.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <p className={cn("text-sm truncate", n.is_read ? "text-gray-600 font-medium" : "text-gray-900 font-bold")}>
                      {n.title}
                    </p>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">
                      {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <p className={cn("text-xs line-clamp-2", n.is_read ? "text-gray-400" : "text-gray-600")}>
                    {n.content}
                  </p>
                </div>

                {!n.is_read && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight size={14} className="text-primary" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell size={24} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">Aucune notification pour le moment.</p>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-gray-100 bg-gray-50/50 text-center">
        <p className="text-[10px] text-gray-400">
          Vous recevrez des alertes pour chaque nouveau RDV ou avis.
        </p>
      </div>
    </div>
  );
}
