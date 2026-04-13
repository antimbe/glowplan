"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container, Section, Heading, Text, Box, Stack, Flex, MotionBox, Button, Card, Logo, Input } from "@/components/ui";
import { ArrowLeft, Briefcase, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useModal } from "@/contexts/ModalContext";
import { isValidEmail } from "@/lib/utils/validation";

function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const supabase = createClient();
  const { showSuccess } = useModal();

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isValidEmail(email)) {
        throw new Error("Veuillez entrer une adresse email valide");
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${location.origin}/auth/pro/reset-password`,
      });

      if (error) throw error;

      setSubmitted(true);
      showSuccess(
        "Email envoyé 📬",
        "Un lien de réinitialisation a été envoyé à " + email + ". Cliquez sur le lien pour réinitialiser votre mot de passe."
      );
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <Card className="bg-white border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] w-full overflow-hidden" padding="lg">
        <Stack space={8} align="center" className="w-full">
          <Stack space={4} align="center" className="text-center w-full">
            <Box className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
              <Briefcase size={28} className="text-primary" strokeWidth={1.5} />
            </Box>
            <Stack space={1} align="center" className="w-full">
              <Heading level={2} className="text-primary text-xl md:text-2xl font-bold tracking-tight text-center">
                Email envoyé ✓
              </Heading>
              <Text className="text-primary/60 text-sm font-medium text-center">
                Vérifiez votre boîte mail pour continuer
              </Text>
            </Stack>
          </Stack>

          <Stack space={4} align="center" className="w-full">
            <Text className="text-primary/60 text-center text-sm leading-relaxed">
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>. Cliquez sur le lien pour créer un nouveau mot de passe.
            </Text>

            <Link href="/auth/pro/login" className="w-full">
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
            <Briefcase size={28} className="text-primary" strokeWidth={1.5} />
          </Box>
          <Stack space={1} align="center" className="w-full">
            <Heading level={2} className="text-primary text-xl md:text-2xl font-bold tracking-tight text-center">
              Mot de passe oublié
            </Heading>
            <Text className="text-primary/60 text-sm font-medium text-center">
              Entrez votre email pour recevoir un lien de réinitialisation
            </Text>
          </Stack>
        </Stack>

        <form onSubmit={handleForgotPassword} className="w-full">
          <Stack space={6} align="center" className="w-full">
            <Stack space={3} align="center" className="w-full text-center">
              <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Email professionnel</Text>
              <Input
                type="email"
                placeholder="votre@email.com"
                fullWidth
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                  <span>Envoi en cours...</span>
                </Flex>
              ) : (
                "Envoyer le lien de réinitialisation"
              )}
            </Button>
          </Stack>
        </form>

        <Box className="pt-6 border-t border-gray-100 w-full">
          <Link href="/auth/pro/login" className="text-center block text-primary/60 hover:text-primary text-xs font-bold underline underline-offset-4 transition-colors">
            ← Retour à la connexion
          </Link>
        </Box>
      </Stack>
    </Card>
  );
}

export default function ForgotPasswordPage() {
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
          <ForgotPasswordForm />
        </Stack>
      </Container>
    </Section>
  );
}
