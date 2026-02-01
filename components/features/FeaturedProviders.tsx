"use client";

import { Container, Section, Button, Link, Heading, Text, Flex, Box, MotionBox, Stack } from "@/components/ui";
import ProviderCard from "./ProviderCard";
import { ChevronRight, Sparkles } from "lucide-react";

const providers = [
  {
    name: "L'Art du Rasoir",
    location: "Paris 11e",
    rating: 4.8,
    reviewCount: 127,
    services: ["Coiffure", "Barbe"],
    imageUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Lovely Nails Class",
    location: "Courbevoie",
    rating: 4.9,
    reviewCount: 203,
    services: ["Ongles", "Manucure"],
    imageUrl: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1974&auto=format&fit=crop",
  },
  {
    name: "Charme & Spa",
    location: "Montreuil",
    rating: 4.7,
    reviewCount: 89,
    services: ["Esthétique", "Soins"],
    imageUrl: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
  },
];

export default function FeaturedProviders() {
  return (
    <Section spacing="lg" className="bg-gray-50/50">
      <Container>
        <Flex direction="col" align="center" className="md:flex-row md:items-end justify-between mb-16 gap-6 text-balance">
          <MotionBox 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Stack space={4} className="text-center md:text-left">
              <Box className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary mx-auto md:mx-0 w-fit">
                <Sparkles size={14} className="text-accent" />
                <Text variant="small" as="span" className="font-bold tracking-wider uppercase text-[10px]">Sélection Premium</Text>
              </Box>
              <Heading level={2} variant="section" className="text-gray-900">
                Nos partenaires <Text as="span" className="text-primary italic font-serif font-medium">phares</Text>
              </Heading>
              <Text variant="muted" className="text-lg max-w-xl">
                Découvrez les établissements les mieux notés et les plus plébiscités par notre communauté.
              </Text>
            </Stack>
          </MotionBox>
          
          <MotionBox
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <Button variant="outline" size="md" className="group" asChild>
              <Link href="#all-providers" className="flex items-center gap-2">
                <Text variant="small" as="span" className="font-bold">Explorer tous les pros</Text>
                <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </MotionBox>
        </Flex>

        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {providers.map((provider, index) => (
            <MotionBox
              key={provider.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
            >
              <ProviderCard {...provider} />
            </MotionBox>
          ))}
        </Box>
      </Container>
    </Section>
  );
}
