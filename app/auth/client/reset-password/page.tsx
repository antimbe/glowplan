"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container, Section, Heading, Text, Box, Stack, Flex, MotionBox, Button, Card, Input } from "@/components/ui";
import { Heart, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useModal } from "@/contexts/ModalContext";

function ResetPasswordForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const [tokenChecking, setTokenChecking] = useState(true);

  const supabase = createClient();
  const { showSuccess } = useModal();

  // Vérifier que l'utilisateur a un token valide (via fragment URL ou code query param)
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Supabase ajoute automatiquement le token au fragment URL (#access_token=...)
        // On vérifie juste que l'utilisateur est en session de reset
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          // Pas de session trouvée - cela peut être normal si on vient d'un lien email
          // Nous allons attendre que l'utilisateur se soumette pour vérifier
          setIsValidToken(true);
        } else {
          setIsValidToken(true);
        }
      } catch (err) {
        console.error("Token check error:", err);
        setIsValidToken(true); // Laisser quand même passer pour que l'utilisateur puisse essayer
      } finally {
        setTokenChecking(false);
      }
    };

    checkToken();
  }, [supabase.auth]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (password.length < 6) {
        throw new Error("Le mot de passe doit contenir au moins 6 caractères");
      }

      if (password !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      showSuccess(
        "Mot de passe réinitialisé ✓",
        "Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter."
      );

      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        router.push("/auth/client/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (tokenChecking) {
    return (
      <Card className="bg-white border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] w-full overflow-hidden" padding="lg">
        <Stack space={8} align="center" className="w-full">
          <Flex align="center" gap={3}>
            <Loader2 className="animate-spin text-primary" size={20} />
            <Text className="text-primary/60">Chargement...</Text>
          </Flex>
        </Stack>
      </Card>
    );
  }

  if (!isValidToken) {
    return (
      <Card className="bg-white border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] w-full overflow-hidden" padding="lg">
        <Stack space={8} align="center" className="w-full">
          <Stack space={4} align="center" className="text-center w-full">
            <Box className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <Heart size={28} className="text-red-500" strokeWidth={1.5} />
            </Box>
            <Stack space={1} align="center" className="w-full">
              <Heading level={2} className="text-gray-900 text-xl md:text-2xl font-bold tracking-tight text-center">
                Lien expiré
              </Heading>
              <Text className="text-gray-600 text-sm font-medium text-center">
                Ce lien de réinitialisation n'est plus valide
              </Text>
            </Stack>
          </Stack>

          <Stack space={4} align="center" className="w-full">
            <Text className="text-gray-600 text-center text-sm">
              Veuillez demander un nouveau lien de réinitialisation.
            </Text>

            <Link href="/auth/client/forgot-password" className="w-full">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="h-12 font-medium"
              >
                Demander un nouveau lien
              </Button>
            </Link>

            <Link href="/auth/client/login" className="w-full">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                className="border-gray-200 hover:border-primary h-12 font-medium"
              >
                Retour à la connexion
              </Button>
            </Link>
          </Stack>
        </Stack>
      </Card>
    );
  }

  return (
    <Card className="bg-white border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] w-full overflow-hidden" padding="lg">
      <Stack space={8} align="center" className="w-full">
        {/* Title Section */}
        <Stack space={4} align="center" className="text-center w-full">
          <Box className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
            <Heart size={28} className="text-primary" strokeWidth={1.5} />
          </Box>
          <Stack space={1} align="center" className="w-full">
            <Heading level={2} className="text-primary text-xl md:text-2xl font-bold tracking-tight text-center">
              Réinitialiser le mot de passe
            </Heading>
            <Text className="text-primary/60 text-sm font-medium text-center">
              Créez un nouveau mot de passe sécurisé
            </Text>
          </Stack>
        </Stack>

        <form onSubmit={handleResetPassword} className="w-full">
          <Stack space={6} align="center" className="w-full">
            <Stack space={3} align="center" className="w-full text-center">
              <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Nouveau mot de passe</Text>
              <Input
                type="password"
                placeholder="••••••••"
                fullWidth
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-50/50 border-gray-100 rounded-xl h-14 px-5 focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-base font-medium text-center"
              />
            </Stack>

            <Stack space={3} align="center" className="w-full text-center">
              <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Confirmer le mot de passe</Text>
              <Input
                type="password"
                placeholder="••••••••"
                fullWidth
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-gray-50/50 border-gray-100 rounded-xl h-14 px-5 focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-base font-medium text-center"
              />
            </Stack>

            {error && (
              <Text className="text-red-500 text-sm font-medium text-center">{error}</Text>
            )}

            <Button
              type="submit"
              variant="primary"
              size="xl"
              fullWidth
              disabled={loading}
              className="bg-primary hover:bg-primary-dark rounded-xl font-bold h-14 text-sm shadow-2xl shadow-primary/20 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Flex align="center" gap={2}>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Mise à jour en cours...</span>
                </Flex>
              ) : (
                "Réinitialiser le mot de passe"
              )}
            </Button>
          </Stack>
        </form>

        <Box className="pt-6 border-t border-gray-100 w-full">
          <Link href="/auth/client/login" className="text-center block text-primary/60 hover:text-primary text-xs font-bold underline underline-offset-4 transition-colors">
            ← Retour à la connexion
          </Link>
        </Box>
      </Stack>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <Section spacing="none" className="min-h-[100dvh] relative overflow-x-hidden bg-primary flex flex-col items-center justify-center">
      {/* Background Atmosphere - Fixed */}
      <Box className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/111c2f206_adam-winger-VjRpkGtS55w-unsplash.jpg"
          alt="GlowPlan Background"
          fill
          className="object-cover opacity-30 grayscale"
          priority
        />
        <Box className="absolute inset-0 bg-gradient-to-b from-primary/95 via-primary/90 to-primary/95" />

        {/* Decorative Blur */}
        <MotionBox
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary-light rounded-full blur-[150px]"
        />
      </Box>

      {/* Main Content Area */}
      <Container className="relative z-10 w-full flex flex-col items-center justify-center py-12 md:py-20">
        <Stack space={8} align="center" className="w-full max-w-lg mx-auto">
          <ResetPasswordForm />
        </Stack>
      </Container>
    </Section>
  );
}
