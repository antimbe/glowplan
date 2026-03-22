"use client";

import { useState, useEffect } from "react";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle2,
  Mail,
  Smartphone,
  Info
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Card, Badge, Stack, Heading, Text, Switch, Separator } from "@/components/ui";

type SettingsTab = "account" | "notifications" | "security";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("account");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Password State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Notification Preferences State (Local for UI demo)
  const [notifPreferences, setNotifPreferences] = useState({
    email_new_booking: true,
    email_cancellation: true,
    app_new_booking: true,
    app_review: true,
    app_deposit: true
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);
      }
    };
    fetchUser();
  }, [supabase]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setSuccess(true);
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const togglePreference = (key: keyof typeof notifPreferences) => {
    setNotifPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-5xl mx-auto py-6 lg:py-10 px-4">
      <div className="mb-8 lg:mb-12">
        <Heading level={1} className="text-3xl lg:text-4xl font-black text-gray-900 mb-3 tracking-tight">
          Paramètres
        </Heading>
        <Text variant="muted" className="text-lg">
          Personnalisez votre expérience et gérez la sécurité de votre compte professionnel.
        </Text>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Navigation Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
            <button 
              onClick={() => setActiveTab("account")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === "account" 
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <User size={18} />
              <span>Mon Compte</span>
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === "notifications" 
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Bell size={18} />
              <span>Notifications</span>
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${
                activeTab === "security" 
                ? "bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]" 
                : "text-gray-500 hover:bg-gray-100"
              }`}
            >
              <Shield size={18} />
              <span>Sécurité</span>
            </button>
          </nav>
        </aside>

        {/* Tab Content */}
        <main className="flex-1 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === "account" && (
            <div className="space-y-8">
              {/* User Identity Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
                    <User size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Identité</h2>
                    <p className="text-sm text-gray-500 font-medium">Vos informations personnelles de connexion.</p>
                  </div>
                </div>

                <Card className="p-8 rounded-3xl border-gray-100/80 shadow-xl shadow-gray-200/40">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Adresse email</label>
                      <div className="flex items-center gap-2">
                        <Text className="font-bold text-gray-900">{userEmail || "chargement..."}</Text>
                        <Badge variant="secondary" className="bg-green-50 text-green-600 border-green-100 text-[10px] font-black uppercase tracking-wider px-2">Vérifié</Badge>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Rôle</label>
                      <div className="flex items-center gap-2">
                        <Text className="font-bold text-gray-900">Administrateur Établissement</Text>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-8 p-4 bg-gray-50 rounded-2xl border border-gray-100 flex items-start gap-3">
                    <Info size={18} className="text-gray-400 shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      L'email est utilisé pour vos factures et les notifications système importantes. 
                      Pour le modifier, contactez le support GlowPlan.
                    </p>
                  </div>
                </Card>
              </section>

              {/* Password Section */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shadow-sm border border-amber-100">
                    <Lock size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Authentification</h2>
                    <p className="text-sm text-gray-500 font-medium">Mettez à jour votre mot de passe régulièrement.</p>
                  </div>
                </div>

                <Card className="p-8 rounded-3xl border-gray-100/80 shadow-xl shadow-gray-200/40 overflow-hidden relative">
                  {success ? (
                    <div className="py-10 text-center animate-in fade-in zoom-in duration-500">
                      <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-green-500" />
                      </div>
                      <h4 className="text-2xl font-black text-gray-900 mb-2">Mot de passe sécurisé !</h4>
                      <p className="text-gray-500 font-medium">Votre nouveau sésame est maintenant actif.</p>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordChange} className="max-w-md space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Nouveau mot de passe</label>
                        <div className="relative group">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Min. 6 caractères"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-12 px-4 rounded-xl border-gray-200 focus:ring-primary/20 group-hover:border-gray-300 transition-all font-medium"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors p-1"
                          >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400">Confirmation</label>
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="h-12 px-4 rounded-xl border-gray-200 focus:ring-primary/20 font-medium"
                          required
                        />
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-xs text-red-600 font-bold flex items-center gap-2 animate-in slide-in-from-top-2">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full shrink-0" />
                          {error}
                        </div>
                      )}

                      <Button
                        type="submit"
                        disabled={loading}
                        className="h-12 px-8 rounded-xl bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25 text-white font-black uppercase tracking-wider text-xs transition-all hover:-translate-y-0.5"
                      >
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="animate-spin" size={16} /> Enregistrement...
                          </span>
                        ) : (
                          "Confirmer le changement"
                        )}
                      </Button>
                    </form>
                  )}
                </Card>
              </section>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
                    <Bell size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Préférences d'alertes</h2>
                    <p className="text-sm text-gray-500 font-medium">Choisissez comment vous souhaitez être informé.</p>
                  </div>
                </div>

                <Card className="rounded-3xl border-gray-100/80 shadow-xl shadow-gray-200/40 overflow-hidden">
                  <div className="divide-y divide-gray-50">
                    <div className="p-8">
                      <h3 className="text-xs uppercase tracking-widest font-black text-primary mb-6">Notifications par Email</h3>
                      <div className="space-y-8">
                        <div className="flex items-center justify-between group">
                          <div className="max-w-[80%]">
                            <p className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">Nouveau rendez-vous</p>
                            <p className="text-xs text-gray-500 font-medium">Recevoir un email récapitulatif pour chaque nouvelle réservation client.</p>
                          </div>
                          <Switch 
                            checked={notifPreferences.email_new_booking} 
                            onChange={() => togglePreference('email_new_booking')}
                          />
                        </div>
                        <div className="flex items-center justify-between group">
                          <div className="max-w-[80%]">
                            <p className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">RDV Annulé</p>
                            <p className="text-xs text-gray-500 font-medium">Être alerté immédiatement par email si un client annule sa séance.</p>
                          </div>
                          <Switch 
                            checked={notifPreferences.email_cancellation} 
                            onChange={() => togglePreference('email_cancellation')}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="p-8 bg-gray-50/30">
                      <h3 className="text-xs uppercase tracking-widest font-black text-primary mb-6">Notifications In-App</h3>
                      <div className="space-y-8">
                        <div className="flex items-center justify-between group">
                          <div className="max-w-[80%]">
                            <p className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">Alertes sur le dashboard</p>
                            <p className="text-xs text-gray-500 font-medium">Activer le badge rouge sur la cloche pour les nouveaux événements.</p>
                          </div>
                          <Switch 
                            checked={notifPreferences.app_new_booking} 
                            onChange={() => togglePreference('app_new_booking')}
                          />
                        </div>
                        <div className="flex items-center justify-between group">
                          <div className="max-w-[80%]">
                            <p className="font-bold text-gray-900 mb-1 group-hover:text-primary transition-colors">Sons de notification</p>
                            <p className="text-xs text-gray-500 font-medium">Émettre un signal sonore quand une nouvelle notification arrive.</p>
                          </div>
                          <Switch checked={true} />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-primary/5 border-t border-primary/10 text-center">
                    <p className="text-[10px] text-primary/60 font-black uppercase tracking-wider">
                      Note: Les notifications Push mobiles arrivent bientôt sur l'app native.
                    </p>
                  </div>
                </Card>
              </section>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-sm border border-purple-100">
                    <Shield size={24} strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-gray-900">Protection du compte</h2>
                    <p className="text-sm text-gray-500 font-medium">Gérez vos sessions et accès sécurisés.</p>
                  </div>
                </div>

                <Card className="p-8 rounded-3xl border-gray-100/80 shadow-xl shadow-gray-200/40">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">Double authentification (2FA)</p>
                        <p className="text-xs text-gray-500 font-medium mt-1">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-black uppercase border-gray-200 text-gray-400">Bientôt disponible</Badge>
                    </div>
                    
                    <Separator className="bg-gray-50" />

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-gray-900">Sessions actives</p>
                        <p className="text-xs text-gray-500 font-medium mt-1">Vous êtes actuellement connecté sur cet appareil.</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-bold text-gray-900">Session courante</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="mt-8 p-6 bg-red-50 rounded-3xl border border-red-100 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-red-900 uppercase tracking-tight">Zone de danger</h4>
                    <p className="text-xs text-red-600 font-medium mt-1">Suppression définitive de votre compte et de vos données.</p>
                  </div>
                  <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-xl font-bold text-xs uppercase tracking-widest px-6 h-10">
                    Supprimer
                  </Button>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
