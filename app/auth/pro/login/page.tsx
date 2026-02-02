"use client";

import { useState } from "react";
import { Container, Section, Heading, Text, Box, Stack, Flex, MotionBox, Button, Card, Logo, Input } from "@/components/ui";
import { ArrowLeft, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function ProLoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Section spacing="none" className="min-h-[100dvh] relative overflow-x-hidden bg-[#2a3626] flex flex-col items-center justify-center">
      {/* Background Atmosphere - Fixed */}
      <Box className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/111c2f206_adam-winger-VjRpkGtS55w-unsplash.jpg"
          alt="GlowPlan Background"
          fill
          className="object-cover opacity-30 grayscale"
          priority
        />
        <Box className="absolute inset-0 bg-gradient-to-b from-[#2a3626]/95 via-[#2a3626]/90 to-[#2a3626]/95" />
        
        {/* Decorative Blur */}
        <MotionBox 
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-[#6a845c] rounded-full blur-[150px]" 
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
            <Link href="/auth/select-space" className="group inline-flex items-center gap-2 text-white/50 hover:text-white transition-all mb-6">
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              <Text variant="small" className="font-bold tracking-widest uppercase text-[9px]">Retour</Text>
            </Link>
            <Logo variant="light" size="lg" className="h-10 md:h-12" />
          </MotionBox>

          {/* Main Card */}
          <MotionBox
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="w-full"
          >
            <Card className="bg-white border-none shadow-[0_40px_100px_-20px_rgba(0,0,0,0.4)] w-full overflow-hidden" padding="lg">
              <Stack space={8} align="center" className="w-full">
                {/* Title Section */}
                <Stack space={4} align="center" className="text-center w-full">
                  <Box className="w-14 h-14 rounded-2xl bg-[#2a3626]/5 flex items-center justify-center">
                    <Briefcase size={28} className="text-[#2a3626]" strokeWidth={1.5} />
                  </Box>
                  <Stack space={1} align="center" className="w-full">
                    <Heading level={2} className="text-[#2a3626] text-xl md:text-2xl font-bold tracking-tight text-center">
                      {isLogin ? "Connexion Professionnelle" : "Inscription Professionnelle"}
                    </Heading>
                    <Text className="text-[#2a3626]/60 text-sm font-medium text-center">
                      {isLogin 
                        ? "Accédez à votre espace de gestion" 
                        : "Commencez votre aventure avec GlowPlan"}
                    </Text>
                  </Stack>
                </Stack>

                <form onSubmit={(e) => e.preventDefault()} className="w-full">
                  <Stack space={6} align="center" className="w-full">
                    {!isLogin && (
                      <Stack space={6} align="center" className="w-full">
                        <Box className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                          <Stack space={3} align="center" className="w-full text-center">
                            <Text className="text-[10px] font-bold text-[#2a3626]/40 uppercase tracking-[0.2em]">Prénom</Text>
                            <Input 
                              placeholder="Votre prénom" 
                              fullWidth 
                              className="bg-gray-50/50 border-gray-100 rounded-xl h-14 px-5 focus:bg-white focus:ring-2 focus:ring-[#2a3626]/5 transition-all text-base font-medium text-center"
                            />
                          </Stack>
                          <Stack space={3} align="center" className="w-full text-center">
                            <Text className="text-[10px] font-bold text-[#2a3626]/40 uppercase tracking-[0.2em]">Nom</Text>
                            <Input 
                              placeholder="Votre nom" 
                              fullWidth 
                              className="bg-gray-50/50 border-gray-100 rounded-xl h-14 px-5 focus:bg-white focus:ring-2 focus:ring-[#2a3626]/5 transition-all text-base font-medium text-center"
                            />
                          </Stack>
                        </Box>

                        <Stack space={3} align="center" className="w-full text-center">
                          <Text className="text-[10px] font-bold text-[#2a3626]/40 uppercase tracking-[0.2em]">Nom de l'établissement</Text>
                          <Input 
                            placeholder="Salon, Institut, Cabinet..." 
                            fullWidth 
                            className="bg-gray-50/50 border-gray-100 rounded-xl h-14 px-5 focus:bg-white focus:ring-2 focus:ring-[#2a3626]/5 transition-all text-base font-medium text-center"
                          />
                        </Stack>

                        <Stack space={3} align="center" className="w-full text-center">
                          <Text className="text-[10px] font-bold text-[#2a3626]/40 uppercase tracking-[0.2em]">Téléphone</Text>
                          <Input 
                            type="tel"
                            placeholder="+33 6 12 34 56 78" 
                            fullWidth 
                            className="bg-gray-50/50 border-gray-100 rounded-xl h-14 px-5 focus:bg-white focus:ring-2 focus:ring-[#2a3626]/5 transition-all text-base font-medium text-center"
                          />
                        </Stack>
                      </Stack>
                    )}

                    <Stack space={3} align="center" className="w-full text-center">
                      <Text className="text-[10px] font-bold text-[#2a3626]/40 uppercase tracking-[0.2em]">Email professionnel</Text>
                      <Input 
                        type="email"
                        placeholder="votre@email.com" 
                        fullWidth 
                        className="bg-gray-50/50 border-gray-100 rounded-xl h-14 px-5 focus:bg-white focus:ring-2 focus:ring-[#2a3626]/5 transition-all text-base font-medium text-center"
                      />
                    </Stack>

                    <Stack space={3} align="center" className="w-full text-center">
                      <Text className="text-[10px] font-bold text-[#2a3626]/40 uppercase tracking-[0.2em]">Mot de passe</Text>
                      <Input 
                        type="password"
                        placeholder="••••••••" 
                        fullWidth 
                        className="bg-gray-50/50 border-gray-100 rounded-xl h-14 px-5 focus:bg-white focus:ring-2 focus:ring-[#2a3626]/5 transition-all text-base font-medium text-center"
                      />
                    </Stack>

                    {isLogin && (
                      <Flex justify="center" className="w-full">
                        <Link href="/coming-soon" className="text-[#2a3626]/60 hover:text-[#2a3626] text-xs font-bold underline underline-offset-4 transition-colors">
                          Mot de passe oublié ?
                        </Link>
                      </Flex>
                    )}

                    <Button 
                      type="submit"
                      variant="primary" 
                      size="xl" 
                      fullWidth
                      className="bg-[#2a3626] hover:bg-[#1a2318] rounded-xl font-bold h-14 text-sm shadow-2xl shadow-[#2a3626]/20 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] mt-2"
                    >
                      {isLogin ? "Se connecter au dashboard" : "Créer mon compte professionnel"}
                    </Button>
                  </Stack>
                </form>

                <Box className="pt-6 border-t border-gray-100 w-full">
                  <Flex justify="center" align="center" gap={3}>
                    <Text className="text-[#2a3626]/60 text-sm font-medium">
                      {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
                    </Text>
                    <Button
                      variant="ghost"
                      onClick={() => setIsLogin(!isLogin)}
                      className="text-[#2a3626] hover:text-[#1a2318] font-bold text-sm underline underline-offset-4 p-0 h-auto min-w-0"
                    >
                      {isLogin ? "Créer un compte" : "Se connecter"}
                    </Button>
                  </Flex>
                </Box>
              </Stack>
            </Card>
          </MotionBox>

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
