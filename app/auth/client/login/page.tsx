"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container, Section, Heading, Text, Box, Stack, Flex, MotionBox, Button, Card, Logo, Input } from "@/components/ui";
import { ArrowLeft, User, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useModal } from "@/contexts/ModalContext";

function ClientLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect");
  const signupMode = searchParams.get("signup") === "true";
  
  const [isLogin, setIsLogin] = useState(!signupMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  const supabase = createClient();
  const { showSuccess } = useModal();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Vérifier si c'est un compte client
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", data.user.id)
          .single();

        if (!clientProfile) {
          // Vérifier si c'est un compte pro
          const { data: establishment } = await supabase
            .from("establishments")
            .select("id")
            .eq("user_id", data.user.id)
            .single();

          if (establishment) {
            await supabase.auth.signOut();
            throw new Error("Ce compte est un compte professionnel. Veuillez utiliser la connexion pro.");
          }

          // Créer le profil client s'il n'existe pas (migration d'ancien compte)
          await supabase.from("client_profiles").insert({
            user_id: data.user.id,
            first_name: "Client",
            last_name: "",
            user_type: "client",
          });
        }

        router.push(redirectUrl || "/search");
      } else {
        if (password !== confirmPassword) {
          throw new Error("Les mots de passe ne correspondent pas");
        }
        if (!firstName || !lastName) {
          throw new Error("Le prénom et le nom sont requis");
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              user_type: "client",
              first_name: firstName,
              last_name: lastName,
              phone: phone || null,
            },
          },
        });
        if (error) throw error;

        // Créer le profil client immédiatement (confirmation email désactivée)
        if (data.user) {
          await supabase.from("client_profiles").insert({
            user_id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            user_type: "client",
          });
          
          router.push(redirectUrl || "/search");
        } else {
          showSuccess("Inscription réussie", "Vous pouvez maintenant vous connecter !");
          setIsLogin(true);
        }
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

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
          {/* Header Area */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="w-full flex flex-col items-center"
          >
            <Link href="/auth/select-space" className="group inline-flex items-center gap-2 text-white/50 hover:text-white transition-all mb-6 cursor-pointer">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <Text variant="small" className="font-bold tracking-widest uppercase text-[9px]">Retour</Text>
            </Link>
            <Logo variant="light" size="lg" className="h-10 md:h-12" />
          </MotionBox>

          {/* Main Card */}
          <Box className="w-full">
            <Card className="bg-white border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] w-full overflow-hidden" padding="lg">
              <Stack space={8} align="center" className="w-full">
                {/* Title Section */}
                <Stack space={4} align="center" className="text-center w-full">
                  <Box className="w-14 h-14 rounded-2xl bg-primary/5 flex items-center justify-center">
                    <User size={28} className="text-primary" strokeWidth={1.5} />
                  </Box>
                  <Stack space={1} align="center" className="w-full">
                    <Heading level={2} className="text-primary text-xl md:text-2xl font-bold tracking-tight text-center">
                      {isLogin ? "Connexion Client" : "Inscription Client"}
                    </Heading>
                    <Text className="text-primary/60 text-sm font-medium text-center">
                      {isLogin 
                        ? "Accédez à vos réservations et favoris" 
                        : "Créez votre compte pour réserver facilement"}
                    </Text>
                  </Stack>
                </Stack>

                <form onSubmit={handleAuth} className="w-full">
                  <Stack space={5} align="center" className="w-full">
                    {!isLogin && (
                      <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                          <Stack space={2} align="center" className="text-center">
                            <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Prénom *</Text>
                            <Input 
                              type="text"
                              placeholder="Jean" 
                              fullWidth 
                              required
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="bg-gray-50/50 border-gray-100 rounded-xl h-12 px-4 focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-base font-medium text-center"
                            />
                          </Stack>
                          <Stack space={2} align="center" className="text-center">
                            <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Nom *</Text>
                            <Input 
                              type="text"
                              placeholder="Dupont" 
                              fullWidth 
                              required
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="bg-gray-50/50 border-gray-100 rounded-xl h-12 px-4 focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-base font-medium text-center"
                            />
                          </Stack>
                        </div>

                        <Stack space={2} align="center" className="w-full text-center">
                          <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Téléphone (optionnel)</Text>
                          <Input 
                            type="tel"
                            placeholder="06 12 34 56 78" 
                            fullWidth 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-gray-50/50 border-gray-100 rounded-xl h-12 px-4 focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-base font-medium text-center"
                          />
                        </Stack>
                      </>
                    )}

                    <Stack space={2} align="center" className="w-full text-center">
                      <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Email</Text>
                      <Input 
                        type="email"
                        placeholder="votre@email.com" 
                        fullWidth 
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-gray-50/50 border-gray-100 rounded-xl h-12 px-4 focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-base font-medium text-center"
                      />
                    </Stack>

                    <Stack space={2} align="center" className="w-full text-center">
                      <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Mot de passe</Text>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        fullWidth 
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-50/50 border-gray-100 rounded-xl h-12 px-4 focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-base font-medium text-center"
                      />
                    </Stack>

                    {!isLogin && (
                      <Stack space={2} align="center" className="w-full text-center">
                        <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.2em]">Confirmer le mot de passe</Text>
                        <Input 
                          type="password"
                          placeholder="••••••••" 
                          fullWidth 
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-gray-50/50 border-gray-100 rounded-xl h-12 px-4 focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-base font-medium text-center"
                        />
                      </Stack>
                    )}

                    {error && (
                      <Text className="text-red-500 text-sm font-medium text-center">{error}</Text>
                    )}

                    {isLogin && (
                      <Flex justify="center" className="w-full">
                        <Link href="/coming-soon" className="text-primary/60 hover:text-primary text-xs font-bold underline underline-offset-4 transition-colors cursor-pointer">
                          Mot de passe oublié ?
                        </Link>
                      </Flex>
                    )}

                    <Button 
                      type="submit"
                      variant="primary" 
                      size="xl" 
                      fullWidth
                      disabled={loading}
                      className="bg-primary hover:bg-primary-dark rounded-xl font-bold h-14 text-sm shadow-2xl shadow-primary/20 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {loading ? (
                        <Flex align="center" gap={2}>
                          <Loader2 className="animate-spin" size={20} />
                          <span>Traitement en cours...</span>
                        </Flex>
                      ) : (
                        isLogin ? "Se connecter" : "Créer mon compte"
                      )}
                    </Button>
                  </Stack>
                </form>

                <Box className="pt-6 border-t border-gray-100 w-full">
                  <Flex justify="center" align="center" gap={3}>
                    <Text className="text-primary/60 text-sm font-medium">
                      {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    </Text>
                    <Button
                      variant="ghost"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-primary hover:text-primary-dark font-bold text-sm underline underline-offset-4 p-0 h-auto min-w-0 cursor-pointer"
                    >
                      {isLogin ? "Créer un compte" : "Se connecter"}
                    </Button>
                  </Flex>
                </Box>
              </Stack>
            </Card>
          </Box>

          {/* Footer Terms */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-center"
          >
            <Text className="text-white/30 text-[10px] font-medium tracking-wider leading-relaxed max-w-md mx-auto">
              En continuant, vous acceptez nos <br className="hidden sm:block" />
              <Link href="/terms" className="underline hover:text-white transition-colors">conditions d'utilisation</Link> et notre <Link href="/privacy" className="underline hover:text-white transition-colors">politique de confidentialité</Link>.
            </Text>
          </MotionBox>
        </Stack>
      </Container>
    </Section>
  );
}

export default function ClientLoginPage() {
  return (
    <Suspense fallback={
      <Section className="relative min-h-screen flex items-center justify-center bg-primary">
        <Loader2 className="animate-spin text-white" size={32} />
      </Section>
    }>
      <ClientLoginContent />
    </Suspense>
  );
}
