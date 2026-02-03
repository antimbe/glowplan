"use client";

import { useState } from "react";
import { Container, Section, Heading, Text, Box, MotionBox, Stack, List, ListItem, Button, Flex } from "@/components/ui";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";

const slides = [
  {
    id: "pros",
    title: "Pour les pros :",
    points: [
      "Gestion agenda, clients & stocks",
      "Visibilité & audience qualifiée",
      "Automatisation & gain de temps",
      "Fidélisation client intégrée",
      "Statistiques & performances",
      "Interface simple, mobile & desktop"
    ]
  },
  {
    id: "clients",
    title: "Pour les client(e)s :",
    points: [
      "Le bon pro en 2 clics selon tes envies et disponibilités",
      "Réserve 24/7 sans passer par Instagram ou WhatsApp",
      "Avis vérifiés pour choisir en toute confiance",
      "Prestations sur mesure selon tes besoins",
      "Suivi clair : historique, paiements, statistiques"
    ]
  }
];

export default function AboutCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <Section spacing="xl" className="bg-white">
      <Container>
        <Flex direction="col" align="center" gap={12}>
          <Box className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch w-full">
            {/* Image side - Occupies more space for better proportions */}
            <MotionBox
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7 flex"
            >
              <Box className="relative w-full min-h-[400px] lg:min-h-[550px] rounded-[3rem] overflow-hidden shadow-2xl flex-1">
                <Image 
                  src="/image2-quisommesnous.png"
                  alt="GlowPlan App Experience"
                  fill
                  className="object-cover"
                />
              </Box>
            </MotionBox>

            {/* Content side - Occupies less space, stable height */}
            <Box className="lg:col-span-5 flex flex-col">
              <Box className="bg-primary rounded-[3rem] p-10 lg:p-14 h-full relative overflow-hidden flex flex-col justify-center shadow-2xl">
                <AnimatePresence mode="wait">
                  <MotionBox
                    key={currentSlide}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.5 }}
                    className="w-full"
                  >
                    <Stack space={8}>
                      <Heading level={2} className="text-white text-3xl md:text-4xl font-bold">
                        {slides[currentSlide].title}
                      </Heading>
                      
                      <List spacing="lg">
                        {slides[currentSlide].points.map((point, i) => (
                          <ListItem 
                            key={i} 
                            icon={<Box className="w-2 h-2 rounded-full bg-white mt-2.5 shrink-0" />}
                            className="text-white/90 items-start gap-4"
                          >
                            <Text className="text-white/90 text-lg font-medium leading-snug">
                              {point}
                            </Text>
                          </ListItem>
                        ))}
                      </List>
                    </Stack>
                  </MotionBox>
                </AnimatePresence>
              </Box>
            </Box>
          </Box>

          {/* Navigation Controls moved outside to not affect card size */}
          <Flex justify="center" align="center" gap={6}>
            <Button
              variant="outline"
              size="sm"
              onClick={prevSlide}
              className="rounded-full w-12 h-12 p-0 border-primary text-primary hover:bg-primary hover:text-white"
            >
              <ChevronLeft size={24} />
            </Button>
            
            <Flex gap={2}>
              {slides.map((_, index) => (
                <Box 
                  key={index}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === index ? "w-8 bg-primary" : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </Flex>

            <Button
              variant="outline"
              size="sm"
              onClick={nextSlide}
              className="rounded-full w-12 h-12 p-0 border-primary text-primary hover:bg-primary hover:text-white"
            >
              <ChevronRight size={24} />
            </Button>
          </Flex>
        </Flex>
      </Container>
    </Section>
  );
}
