"use client";

import { useState, useEffect, useRef } from "react";
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
  Info,
  Palette,
  ImageIcon,
  RotateCcw
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Card, Badge, Heading, Text, Switch } from "@/components/ui";
import { useDashboardTheme, applyThemeColor } from "@/contexts/DashboardThemeContext";
import { useModal } from "@/contexts/ModalContext";

type SettingsTab = "account" | "notifications" | "security" | "appearance";

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

  // Notification Preferences State
  const [notifPreferences, setNotifPreferences] = useState({
    email_new_booking: true,
    email_cancellation: true,
    app_new_booking: true,
    app_review: true,
    app_deposit: true,
    email_ask_review_pro: true,
    app_ask_review_pro: true
  });
  const [loadingNotif, setLoadingNotif] = useState(false);
  const [successNotif, setSuccessNotif] = useState(false);
  const [errorNotif, setErrorNotif] = useState<string | null>(null);

  // Appearance State
  const [dashboardColor, setDashboardColorState] = useState("#32422c");

  const setDashboardColor = (color: string) => {
    setDashboardColorState(color);
    applyThemeColor(color);
    setGlobalTheme({ color });
  };
  const [dashboardLogoUrl, setDashboardLogoUrl] = useState("");
  const [loadingAppearance, setLoadingAppearance] = useState(false);
  const [successAppearance, setSuccessAppearance] = useState(false);
  const [establishmentId, setEstablishmentId] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const supabase = createClient();
  const { setTheme: setGlobalTheme } = useDashboardTheme();
  const { showError } = useModal();

  const handleDeleteAccount = async () => {
    if (deleteConfirmText.toLowerCase() !== "supprimer") return;
    setIsDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      // Déconnecter et rediriger vers l'accueil
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (err: any) {
      console.error("Erreur suppression compte:", err);
      showError(
        "Erreur de suppression",
        err.message || "Une erreur est survenue. Veuillez réessayer."
      );
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || null);

        const { data: prefs } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (prefs) {
          setNotifPreferences({
            email_new_booking: prefs.email_new_booking,
            email_cancellation: prefs.email_cancellation,
            app_new_booking: prefs.app_new_booking,
            app_review: prefs.app_review,
            app_deposit: prefs.app_deposit,
            email_ask_review_pro: prefs.email_ask_review_pro ?? true,
            app_ask_review_pro: prefs.app_ask_review_pro ?? true
          });
        }

        // Fetch appearance settings
        const { data: est } = await supabase
          .from("establishments")
          .select("id, dashboard_color, dashboard_logo_url")
          .eq("user_id", user.id)
          .single();

        if (est) {
          setEstablishmentId(est.id);
          if (est.dashboard_color) setDashboardColorState(est.dashboard_color);
          if (est.dashboard_logo_url) setDashboardLogoUrl(est.dashboard_logo_url);
        }
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

  const handleSaveNotifications = async () => {
    setLoadingNotif(true);
    setErrorNotif(null);

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("Non authentifié. Veuillez vous reconnecter.");

      const { error } = await supabase
        .from("notification_preferences")
        .upsert({ user_id: user.id, ...notifPreferences });

      if (error) throw error;

      setSuccessNotif(true);
      setTimeout(() => setSuccessNotif(false), 3000);
    } catch (err: any) {
      setErrorNotif(err.message || "Impossible d'enregistrer les préférences. Réessayez.");
    } finally {
      setLoadingNotif(false);
    }
  };

  const handleSaveAppearance = async () => {
    if (!establishmentId) return;
    setLoadingAppearance(true);
    const { error } = await supabase
      .from("establishments")
      .update({
        dashboard_color: dashboardColor,
        dashboard_logo_url: dashboardLogoUrl || null,
      })
      .eq("id", establishmentId);

    if (!error) {
      setSuccessAppearance(true);
      setTimeout(() => setSuccessAppearance(false), 3000);
    }
    setLoadingAppearance(false);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    if (file.size > MAX_SIZE) {
      setUploadError("Le fichier est trop volumineux (max 5 Mo).");
      return;
    }

    setUploadingLogo(true);
    setUploadError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUploadError("Utilisateur non connecté.");
      setUploadingLogo(false);
      return;
    }

    const ext = file.name.split(".").pop();
    // La policy RLS exige que le 1er segment du chemin soit l'UID
    const path = `${user.id}/logos/logo.${ext}`;

    const { error } = await supabase.storage
      .from("establishment-photos")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      console.error("[Logo upload error]", error);
      if (error.message?.includes("Bucket not found")) {
        setUploadError("Bucket de stockage introuvable. Contactez le support.");
      } else if (error.message?.includes("row-level security") || error.statusCode === "403") {
        setUploadError("Permission refusée. Vérifiez votre connexion.");
      } else if (error.message?.includes("mime type")) {
        setUploadError("Format non supporté. Utilisez JPG, PNG ou WEBP.");
      } else if (error.message?.includes("size")) {
        setUploadError("Fichier trop volumineux (max 10 Mo).");
      } else {
        setUploadError(`Erreur : ${error.message || "Réessayez."}`);
      }
      setUploadingLogo(false);
      return;
    }

    const { data: urlData } = supabase.storage
      .from("establishment-photos")
      .getPublicUrl(path);

    // Ajouter un cache-buster pour forcer le refresh de l'image
    const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;
    setDashboardLogoUrl(publicUrl);
    setGlobalTheme({ logoUrl: publicUrl });
    setUploadingLogo(false);
  };

  const PRESET_COLORS = [
    // Neutres
    { label: "Noir absolu",       value: "#0a0a0a" },
    { label: "Charbon",           value: "#1a1a1a" },
    { label: "Graphite",          value: "#2d2d2d" },
    { label: "Gris ardoise",      value: "#404040" },
    { label: "Gris moyen",        value: "#6b6b6b" },
    { label: "Taupe",             value: "#5a5048" },
    // Verts
    { label: "Vert forêt (défaut)", value: "#32422c" },
    { label: "Vert sauge",        value: "#4a5e3a" },
    { label: "Vert bouteille",    value: "#1e3a2f" },
    { label: "Kaki",              value: "#3d4a2e" },
    { label: "Olive",             value: "#4b5320" },
    { label: "Émeraude foncé",    value: "#1a3d2b" },
    // Bleus
    { label: "Bleu nuit",         value: "#1e2d4a" },
    { label: "Marine",            value: "#0d2137" },
    { label: "Ardoise bleue",     value: "#2c3e50" },
    { label: "Bleu roi",          value: "#1a3a6e" },
    { label: "Bleu pétrole",      value: "#1e3a4a" },
    { label: "Bleu canard",       value: "#1a3d4a" },
    // Rouges & Bordeaux
    { label: "Bordeaux",          value: "#5c1a2e" },
    { label: "Rouge rubis",       value: "#6b1a1a" },
    { label: "Grenat",            value: "#4a1020" },
    { label: "Terracotta foncé",  value: "#6b2d1a" },
    // Violets & Roses
    { label: "Violet profond",    value: "#2d1b4e" },
    { label: "Aubergine",         value: "#3d1a4a" },
    { label: "Prune",             value: "#4a1a3d" },
    { label: "Rose poudré foncé", value: "#4a2030" },
    // Marrons & Chauds
    { label: "Brun chaud",        value: "#3d2b1a" },
    { label: "Chocolat",          value: "#2e1a0e" },
    { label: "Caramel foncé",     value: "#4a3020" },
    { label: "Cuivre",            value: "#5c3d1a" },
  ];

  return (
    <div className="w-full max-w-6xl py-4 lg:py-8">
      <div className="mb-8 lg:mb-10">
        <Heading level={1} className="text-3xl font-bold text-gray-900 tracking-tight">
          Paramètres
        </Heading>
        <Text className="text-gray-500 mt-2">
          Gérez votre profil professionnel et vos préférences.
        </Text>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        {/* Navigation Sidebar */}
        <aside className="lg:w-64 shrink-0">
          <nav className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar border-b border-gray-200 lg:border-none mb-6 lg:mb-0">
            {[
              { id: "account", label: "Mon Compte", icon: User },
              { id: "notifications", label: "Notifications", icon: Bell },
              { id: "security", label: "Sécurité", icon: Shield },
              { id: "appearance", label: "Apparence", icon: Palette },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SettingsTab)}
                  className={`flex items-center gap-3 px-4 py-3 lg:rounded-xl text-sm font-medium transition-all whitespace-nowrap min-w-fit lg:min-w-0 border-b-2 lg:border-b-0 cursor-pointer ${
                    isActive 
                    ? "text-primary border-primary lg:bg-primary/10" 
                    : "text-gray-600 border-transparent hover:text-gray-900 lg:hover:bg-gray-100"
                  }`}
                >
                  <Icon size={18} className={isActive ? "text-primary" : "text-gray-400"} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Tab Content */}
        <main className="flex-1 w-full max-w-3xl">
          {activeTab === "account" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Identité</h2>
                </div>
                
                <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm rounded-2xl">
                  <div className="divide-y divide-gray-100">
                    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">Adresse email</p>
                        <p className="text-sm text-gray-500 mt-0.5">{userEmail || "chargement..."}</p>
                      </div>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 self-start sm:self-auto">
                        Adresse vérifiée
                      </Badge>
                    </div>

                    <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <p className="font-medium text-gray-900">Rôle</p>
                        <p className="text-sm text-gray-500 mt-0.5">Administrateur Établissement</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 px-6 py-4 flex items-start gap-3 border-t border-gray-100">
                    <Info size={16} className="text-gray-500 mt-0.5 shrink-0" />
                    <p className="text-sm text-gray-500">
                      L'email est utilisé pour vos factures et les notifications système importantes. 
                      Pour le modifier, veuillez contacter le support.
                    </p>
                  </div>
                </Card>
              </section>

              <section>
                 <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Authentification</h2>
                </div>

                <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm rounded-2xl">
                  {success ? (
                    <div className="p-10 text-center animate-in fade-in zoom-in duration-500">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={32} className="text-green-500" />
                      </div>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">Mot de passe sécurisé</h4>
                      <p className="text-gray-500">Votre nouveau mot de passe est enregistré et actif.</p>
                    </div>
                  ) : (
                    <div className="p-6 sm:p-8">
                       <form onSubmit={handlePasswordChange} className="space-y-6 max-w-lg">
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                            <div className="relative group">
                              <Input
                                type={showPassword ? "text" : "password"}
                                placeholder="Min. 6 caractères"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pr-10"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="••••••••"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                            />
                          </div>

                          {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-sm text-red-600 flex items-center gap-2">
                              {error}
                            </div>
                          )}

                          <div className="pt-2">
                            <Button
                              type="submit"
                              disabled={loading}
                              className="w-full sm:w-auto"
                            >
                              {loading ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="animate-spin" size={16} /> Enregistrement...
                                </span>
                              ) : (
                                "Mettre à jour"
                              )}
                            </Button>
                          </div>
                        </form>
                    </div>
                  )}
                </Card>
              </section>

            </div>
          )}

          {activeTab === "notifications" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
               <section>
                 <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Préférences d'alertes</h2>
                </div>

                <div className="space-y-6">
                  {/* Email Section */}
                  <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm rounded-2xl">
                    <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Notifications par Email</h3>
                    </div>
                    <div className="divide-y divide-gray-100 p-6">
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="pr-4">
                          <p className="font-medium text-gray-900">Nouveau rendez-vous</p>
                          <p className="text-sm text-gray-500 mt-1">Recevoir un email récapitulatif pour chaque réservation.</p>
                        </div>
                        <Switch 
                          checked={notifPreferences.email_new_booking} 
                          onChange={() => togglePreference('email_new_booking')}
                        />
                      </div>
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="pr-4">
                          <p className="font-medium text-gray-900">RDV Annulé</p>
                          <p className="text-sm text-gray-500 mt-1">Être alerté immédiatement par email en cas d'annulation.</p>
                        </div>
                        <Switch 
                          checked={notifPreferences.email_cancellation} 
                          onChange={() => togglePreference('email_cancellation')}
                        />
                      </div>
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="pr-4">
                          <p className="font-medium text-gray-900">Demande de confirmation (Ex: Lapin)</p>
                          <p className="text-sm text-gray-500 mt-1">Recevoir un email après chaque rendez-vous pour confirmer la présence du client.</p>
                        </div>
                        <Switch 
                          checked={notifPreferences.email_ask_review_pro} 
                          onChange={() => togglePreference('email_ask_review_pro')}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* App Section */}
                  <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm rounded-2xl">
                    <div className="bg-gray-50/50 px-6 py-3 border-b border-gray-100">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Notifications de l'application</h3>
                    </div>
                    <div className="divide-y divide-gray-100 p-6">
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="pr-4">
                          <p className="font-medium text-gray-900">Alertes sur le dashboard</p>
                          <p className="text-sm text-gray-500 mt-1">Activer le badge rouge sur la cloche pour les nouveaux événements.</p>
                        </div>
                        <Switch 
                          checked={notifPreferences.app_new_booking} 
                          onChange={() => togglePreference('app_new_booking')}
                        />
                      </div>
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="pr-4">
                          <p className="font-medium text-gray-900">Demande de confirmation (Ex: Lapin)</p>
                          <p className="text-sm text-gray-500 mt-1">Recevoir une notification web après chaque rendez-vous pour confirmer la présence du client.</p>
                        </div>
                        <Switch 
                          checked={notifPreferences.app_ask_review_pro} 
                          onChange={() => togglePreference('app_ask_review_pro')}
                        />
                      </div>
                      <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                        <div className="pr-4">
                          <p className="font-medium text-gray-900">Sons de notification</p>
                          <p className="text-sm text-gray-500 mt-1">Émettre un signal sonore quand une nouvelle notification arrive.</p>
                        </div>
                        <Switch defaultChecked={true} />
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="pt-4 flex flex-col items-end gap-3 mt-8 lg:mt-10">
                  {errorNotif && (
                    <div className="w-full p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium">
                      {errorNotif}
                    </div>
                  )}
                  <div className="flex items-center gap-4">
                  {successNotif && (
                    <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4">
                      <CheckCircle2 size={18} /> Modifications enregistrées
                    </span>
                  )}
                  <Button
                    variant="primary"
                    onClick={handleSaveNotifications}
                    disabled={loadingNotif}
                    className="rounded-xl px-6 h-11 text-sm font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-95"
                  >
                    {loadingNotif ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="animate-spin" size={16} /> Patientez...
                      </span>
                    ) : (
                      "Enregistrer les préférences"
                    )}
                  </Button>
                  </div>
                </div>
              </section>
            </div>
          )}

          {activeTab === "appearance" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">

              {/* Color picker */}
              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Couleur du tableau de bord</h2>
                </div>

                <Card className="p-6 border border-gray-200 shadow-sm rounded-2xl space-y-6">

                  {/* Aperçu couleur active */}
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div
                      className="w-14 h-14 rounded-xl shadow-md flex-shrink-0 transition-all duration-300"
                      style={{ backgroundColor: dashboardColor }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900">Couleur sélectionnée</p>
                      <p className="text-sm text-gray-500 font-mono">{dashboardColor.toUpperCase()}</p>
                    </div>
                    <button
                      onClick={() => setDashboardColor("#32422c")}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors cursor-pointer ml-auto shrink-0"
                      title="Remettre la couleur par défaut"
                    >
                      <RotateCcw size={13} />
                      Défaut
                    </button>
                  </div>

                  {/* Palette de présets */}
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Couleurs suggérées</p>
                    <div className="grid grid-cols-10 gap-2">
                      {PRESET_COLORS.map((c) => (
                        <button
                          key={c.value}
                          title={c.label}
                          onClick={() => setDashboardColor(c.value)}
                          className={`w-full aspect-square rounded-lg border-2 transition-all duration-150 cursor-pointer hover:scale-110 hover:shadow-md ${
                            dashboardColor === c.value
                              ? "border-gray-900 scale-110 shadow-md"
                              : "border-transparent"
                          }`}
                          style={{ backgroundColor: c.value }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Séparateur */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-gray-400 font-medium">ou choisissez une couleur personnalisée</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Color picker natif stylisé */}
                  <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-12 h-12 rounded-xl shadow-sm border border-gray-200 cursor-pointer overflow-hidden"
                        style={{ backgroundColor: dashboardColor }}
                        onClick={() => document.getElementById("custom-color-input")?.click()}
                      />
                      <input
                        id="custom-color-input"
                        type="color"
                        value={dashboardColor}
                        onChange={(e) => setDashboardColor(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Couleur libre</p>
                      <p className="text-xs text-gray-400">Cliquez sur le carré pour ouvrir le sélecteur de couleur</p>
                    </div>
                  </div>

                  <p className="text-xs text-gray-400 flex items-center gap-1.5">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
                    Les changements s'appliquent en temps réel — cliquez sur "Enregistrer" pour les conserver.
                  </p>
                </Card>
              </section>

              {/* Logo */}
              <section>
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Logo du tableau de bord</h2>
                </div>

                <Card className="p-6 border border-gray-200 shadow-sm rounded-2xl space-y-5">
                  {/* Aperçu + zone upload */}
                  <div className="flex items-center gap-5">
                    {/* Aperçu */}
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-dashed border-white/30 shadow-md"
                      style={{ backgroundColor: dashboardColor }}
                    >
                      {dashboardLogoUrl ? (
                        <img
                          src={dashboardLogoUrl}
                          alt="Logo aperçu"
                          className="w-full h-full object-contain p-2"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      ) : (
                        <ImageIcon size={28} className="text-white/40" />
                      )}
                    </div>

                    {/* Boutons */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-1">
                        {dashboardLogoUrl ? "Changer le logo" : "Ajouter un logo"}
                      </p>
                      <p className="text-xs text-gray-500 mb-3">PNG, SVG ou JPG recommandé — fond transparent idéal. Max 5 Mo.</p>

                      <input
                        ref={logoInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />

                      <div className="flex items-center gap-2 flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => logoInputRef.current?.click()}
                          disabled={uploadingLogo}
                          className="rounded-lg text-xs font-semibold cursor-pointer"
                        >
                          {uploadingLogo ? (
                            <span className="flex items-center gap-1.5">
                              <Loader2 size={13} className="animate-spin" /> Upload en cours...
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <ImageIcon size={13} />
                              {dashboardLogoUrl ? "Remplacer le logo" : "Choisir un fichier"}
                            </span>
                          )}
                        </Button>

                        {dashboardLogoUrl && (
                          <button
                            onClick={() => { setDashboardLogoUrl(""); setGlobalTheme({ logoUrl: null }); }}
                            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <RotateCcw size={12} />
                            Supprimer
                          </button>
                        )}
                      </div>

                      {uploadError && (
                        <p className="text-xs text-red-500 mt-2">{uploadError}</p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-start gap-3">
                    <Info size={15} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-gray-500 leading-relaxed">
                      Le logo s'affiche en haut à gauche du tableau de bord, sur le fond de la couleur choisie. Un logo avec fond transparent donnera le meilleur rendu.
                    </p>
                  </div>
                </Card>
              </section>

              {/* Save */}
              <div className="flex items-center justify-end gap-4">
                {successAppearance && (
                  <span className="text-sm font-semibold text-green-600 flex items-center gap-1.5 animate-in fade-in slide-in-from-right-4">
                    <CheckCircle2 size={18} /> Modifications enregistrées
                  </span>
                )}
                <Button
                  variant="primary"
                  onClick={handleSaveAppearance}
                  disabled={loadingAppearance}
                  className="rounded-xl px-6 h-11 text-sm font-semibold shadow-lg shadow-primary/20 transition-transform active:scale-95"
                >
                  {loadingAppearance ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} /> Patientez...
                    </span>
                  ) : (
                    "Enregistrer l'apparence"
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
              <section>
                 <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">Protection du compte</h2>
                </div>

                <Card className="p-0 overflow-hidden border border-gray-200 shadow-sm rounded-2xl mb-8">
                  <div className="divide-y divide-gray-100 p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 first:pt-0 gap-4">
                      <div>
                        <p className="font-medium text-gray-900">Double authentification (2FA)</p>
                        <p className="text-sm text-gray-500 mt-1">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                      </div>
                      <Badge variant="outline" className="text-xs bg-gray-50 text-gray-500 border-gray-200 self-start sm:self-auto">
                        Bientôt disponible
                      </Badge>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 last:pb-0 gap-4">
                      <div>
                        <p className="font-medium text-gray-900">Sessions actives</p>
                        <p className="text-sm text-gray-500 mt-1">Vous êtes actuellement connecté sur cet appareil.</p>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs font-semibold text-green-700">Appareil actuel</span>
                      </div>
                    </div>
                  </div>
                </Card>

                 <div className="mb-4">
                  <h2 className="text-lg font-semibold text-red-600 border-b border-gray-200 pb-2">Zone de danger</h2>
                </div>
                
                <Card className="p-6 border border-red-100 bg-red-50/30 shadow-none rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-medium text-red-900">Suppression du compte</h4>
                    <p className="text-sm text-red-600/80 mt-1">Toutes vos données seront supprimées définitivement.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-red-200 text-red-600 hover:bg-red-600 hover:text-white transition-all rounded-xl shrink-0 relative bg-white"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    Supprimer le compte
                  </Button>
                </Card>
              </section>
            </div>
          )}
        </main>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-2xl font-black text-gray-900 mb-4">Supprimer votre compte ?</h2>
            <p className="text-gray-600 mb-6 font-medium">
              Cette action est <strong className="text-red-600">irréversible</strong>. Toutes vos données seront supprimées définitivement.
              <br /><br />
              Veuillez taper <strong>supprimer</strong> pour confirmer.
            </p>
            <Input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Tapez 'supprimer'"
              className="mb-6 font-bold"
            />
            <div className="flex gap-3">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }} 
                className="flex-1 font-bold h-12"
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                onClick={handleDeleteAccount} 
                disabled={deleteConfirmText.toLowerCase() !== "supprimer" || isDeleting}
                className="flex-1 h-12 font-black bg-red-600 hover:bg-red-700 text-white border-none"
              >
                {isDeleting ? <Loader2 className="animate-spin" size={20} /> : "Confirmer"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
