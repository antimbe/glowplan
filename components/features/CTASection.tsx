"use client";

import { Container, Section, Button, Heading, Text, Box, Flex, Stack } from "@/components/ui";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTASection() {
  return (
    <Section spacing="xl" className="bg-white overflow-hidden">
      <Container>
          <Box className="bg-[#32422c] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(50,66,44,0.3)]">
            {/* Decorative sophisticated shapes */}
            <Box className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <Box className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-white/5 rounded-full blur-3xl" />
              <Box className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-black/20 rounded-full blur-3xl" />
            </Box>
            
            <Flex direction="col" align="center" gap={12} className="relative z-10 max-w-4xl mx-auto">
              <Flex align="center" gap={2} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white">
                <Sparkles size={16} className="text-accent" />
                <Text variant="small" as="span" className="font-bold tracking-widest uppercase">Prêt à décoller ?</Text>
              </Flex>

              <Stack space={6}>
                <Heading level={2} variant="hero" className="text-white leading-tight">
                  Faites briller votre <Box as="span" className="text-accent italic font-serif">expertise</Box> avec GlowPlan
                </Heading>
                <Text variant="lead" className="text-white/80 max-w-2xl mx-auto font-medium">
                  Rejoignez la communauté des professionnels de la beauté qui ont choisi l'excellence pour la gestion de leur activité.
                </Text>
              </Stack>

              <Flex direction="col" align="center" gap={6} className="sm:flex-row pt-4">
                <Button variant="white" size="xl" className="font-bold min-w-[260px] group">
                  Essayer gratuitement
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="outline" size="xl" className="border-white/30 text-white hover:bg-white hover:text-[#32422c] font-bold min-w-[260px]">
                  Prendre rendez-vous
                </Button>
              </Flex>
            </Flex>
          </Box>
      </Container>
    </Section>
  );
}

