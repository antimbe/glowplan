"use client";

import { Container, Section, Heading, Text, Box, Stack, MotionBox, Button, Flex } from "@/components/ui";
import { Sparkles, ArrowLeft, Construction } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ComingSoon() {
  return (
    <Section spacing="none" className="h-screen relative overflow-hidden flex items-center justify-center bg-primary">
      {/* Cinematic Background Atmosphere */}
      <Box className="absolute inset-0 z-0">
        <Image
          src="/111c2f206_adam-winger-VjRpkGtS55w-unsplash.jpg"
          alt="GlowPlan Background"
          fill
          className="object-cover opacity-40 grayscale"
          priority
        />
        <Box className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/70 to-primary" />
      </Box>

      {/* Dynamic Background Elements */}
      <Box className="absolute inset-0 pointer-events-none z-1">
        <MotionBox 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, 30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary-light rounded-full blur-[150px]" 
        />
        <MotionBox 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
            x: [0, -40, 0]
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-white rounded-full blur-[120px]" 
        />
      </Box>

      <Container className="relative z-10 h-full flex items-center justify-center">
        <Stack space={12} align="center" className="text-center w-full max-w-4xl">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Flex align="center" gap={3} className="px-6 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-white mb-4 mx-auto w-fit shadow-2xl">
              <Construction size={20} className="text-accent" />
              <Text variant="small" as="span" className="font-bold tracking-[0.3em] uppercase text-xs">Site en construction</Text>
            </Flex>
          </MotionBox>

          <Stack space={8} align="center" className="w-full">
            <MotionBox
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="w-full"
            >
              <Heading level={1} variant="hero" className="text-white text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[1.1] text-center w-full">
                Bientôt <br /> <Box as="span" className="text-accent italic font-serif">disponible</Box>.
              </Heading>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="w-full"
            >
              <Text variant="lead" className="text-white/60 text-xl md:text-2xl font-medium max-w-2xl mx-auto leading-relaxed text-center">
                Nous préparons quelque chose d'exceptionnel pour sublimer votre quotidien professionnel. Restez connectés.
              </Text>
            </MotionBox>
          </Stack>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="pt-8"
          >
            <Link href="/">
              <Button 
                variant="outline" 
                size="xl" 
                className="rounded-2xl border-white/20 text-white hover:bg-white hover:text-primary group transition-all duration-500 px-10 h-16 text-lg font-bold"
              >
                <Flex align="center" gap={3}>
                  <ArrowLeft size={20} className="transition-transform duration-500 group-hover:-translate-x-2" />
                  <span>Retour à l'accueil</span>
                </Flex>
              </Button>
            </Link>
          </MotionBox>
        </Stack>
      </Container>

      {/* Footer copyright for coming soon page */}
      <Box className="absolute bottom-10 left-0 right-0 text-center z-10">
        <Text className="text-white/30 text-sm font-medium tracking-widest uppercase">
          &copy; 2026 GlowPlan Pro. Tous droits réservés.
        </Text>
      </Box>
    </Section>
  );
}
