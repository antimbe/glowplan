"use client";

import { Container, Section, Heading, Text, Box, Stack, Flex, MotionBox, Button, Card, Logo } from "@/components/ui";
import { User, Briefcase } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function SelectSpacePage() {
  return (
    <Section spacing="none" className="min-h-screen relative overflow-x-hidden bg-primary flex flex-col items-center justify-center p-4 md:p-8">
      {/* Background Atmosphere - Fixed to stay in place while scrolling */}
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
      <Container size="sm" className="relative z-10 w-full flex flex-col items-center justify-center">
        <Stack space={8} align="center" className="w-full">
          {/* Logo Section */}
          <MotionBox
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <Logo variant="light" size="lg" className="h-10 md:h-12 mb-4 mx-auto" />
          </MotionBox>

          <Stack space={4} align="center" className="text-center">
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Heading level={1} className="text-white text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Bienvenue sur GlowPlan
              </Heading>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Text className="text-white/70 text-lg md:text-xl font-medium">
                Choisissez comment vous souhaitez continuer
              </Text>
            </MotionBox>
          </Stack>

          <Box className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
            <MotionBox
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <Card 
                className="bg-white border-none shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 h-full"
                padding="xl"
              >
                <Stack space={10} align="center" className="text-center h-full justify-between">
                  <Stack space={8} align="center">
                    <Box className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center">
                      <User size={40} className="text-primary" strokeWidth={2} />
                    </Box>
                    
                    <Stack space={4} align="center">
                      <Heading level={3} className="text-primary text-2xl font-bold">
                        Je suis Client(e)
                      </Heading>
                      <Text className="text-gray-600 text-base font-medium leading-relaxed">
                        Réservez vos rendez-vous beauté et bien-être en quelques clics
                      </Text>
                    </Stack>
                  </Stack>

                  <Link href="/auth/client/login" className="w-full">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      fullWidth
                      className="bg-primary hover:bg-primary-dark rounded-2xl font-bold h-14 text-base shadow-xl transition-all duration-500 hover:scale-[1.02] cursor-pointer">
                      Connexion / Inscription Client
                    </Button>
                  </Link>
                </Stack>
              </Card>
            </MotionBox>

            <MotionBox
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              <Card 
                className="bg-white border-none shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 h-full"
                padding="xl"
              >
                <Stack space={10} align="center" className="text-center h-full justify-between">
                  <Stack space={8} align="center">
                    <Box className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center">
                      <Briefcase size={40} className="text-primary" strokeWidth={2} />
                    </Box>
                    
                    <Stack space={4} align="center">
                      <Heading level={3} className="text-primary text-2xl font-bold">
                        Je suis Professionnel(le)
                      </Heading>
                      <Text className="text-gray-600 text-base font-medium leading-relaxed">
                        Gérez votre activité et développez votre clientèle
                      </Text>
                    </Stack>
                  </Stack>

                  <Link href="/auth/pro/login" className="w-full">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      fullWidth
                      className="bg-primary hover:bg-primary-dark rounded-2xl font-bold h-14 text-base shadow-xl transition-all duration-500 hover:scale-[1.02]">
                      Connexion / Inscription Pro
                    </Button>
                  </Link>
                </Stack>
              </Card>
            </MotionBox>
          </Box>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="pt-4"
          >
            <Link href="/" className="text-white/40 hover:text-white text-xs font-bold tracking-widest uppercase underline underline-offset-8 transition-all">
              Continuer sans compte vers l'accueil
            </Link>
          </MotionBox>
        </Stack>
      </Container>
    </Section>
  );
}
