"use client";

import { Container, Section, Heading, Text, Box, Stack, Flex, MotionBox } from "@/components/ui";
import Image from "next/image";

export default function AboutStory() {
  return (
    <Section spacing="xl" className="bg-secondary/30">
      <Container>
        <Box className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <MotionBox
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Box className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl">
              <Image 
                src="/image1-quisommesnous.jpg"
                alt="L'essentiel des pros"
                fill
                className="object-cover"
              />
              <Box className="absolute inset-0 bg-primary/10 mix-blend-multiply" />
            </Box>
          </MotionBox>

          <Stack space={10}>
            <Stack space={6}>
              <Heading level={2} variant="section" className="text-[#32422c] leading-tight">L'essentiel des pros, en une seule plateforme</Heading>
              <Text className="text-gray-600 text-lg leading-relaxed">
                Glow Plan Pro a été fait pour les professionnels du secteur de la beauté et du bien-être qui cherchent à simplifier leur quotidien.
                Que vous soyez coiffeur(se), esthéticien(ne), maquilleur(se), barbier, nous avons conçu une solution tout-en-un : réservations, gestions des clients, statistiques et marketing, le tout depuis une plateforme intuitive.
                Notre objectif ? Vous permettre de vous concentrer sur ce que vous faites de mieux : embellir vos clients !
              </Text>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Section>
  );
}
