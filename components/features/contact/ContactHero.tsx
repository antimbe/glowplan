"use client";

import { Container, Section, Heading, Text, Box, Flex, MotionBox, Stack } from "@/components/ui";
import { Sparkles } from "lucide-react";
import Image from "next/image";

export default function ContactHero() {
  return (
    <Section spacing="xl" className="pt-40 pb-20 relative overflow-hidden min-h-[60vh] flex items-center">
      {/* Background Image */}
      <Box className="absolute inset-0 z-0">
        <Image
          src="/111c2f206_adam-winger-VjRpkGtS55w-unsplash.jpg"
          alt="GlowPlan Contact Background"
          fill
          className="object-cover"
          priority
        />
        {/* Slight dark overlay for text readability */}
        <Box className="absolute inset-0 bg-black/40" />
      </Box>

      {/* Decorative background elements */}
      <Box className="absolute inset-0 pointer-events-none z-1">
        <MotionBox 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3] 
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-white/5 rounded-full blur-3xl" 
        />
        <MotionBox 
          animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2] 
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-black/20 rounded-full blur-3xl" 
        />
      </Box>

      <Container className="relative z-10">
        <Stack space={12} align="center" className="text-center max-w-4xl mx-auto">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Flex align="center" gap={2} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6 mx-auto w-fit">
              <Sparkles size={16} className="text-accent" />
              <Text variant="small" as="span" className="font-bold tracking-widest uppercase text-[10px] md:text-xs">Contact</Text>
            </Flex>
          </MotionBox>

          <Stack space={6}>
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Heading level={1} variant="hero" className="text-white text-balance">
                Contactez-nous
              </Heading>
            </MotionBox>
            
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Text variant="lead" className="text-white/80 max-w-2xl mx-auto font-medium">
                Une question ? Notre équipe est là pour te répondre !
              </Text>
            </MotionBox>
          </Stack>
        </Stack>
      </Container>
    </Section>
  );
}
