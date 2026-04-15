"use client";

import { useRouter } from "next/navigation";
import { Container, Section, Button, Link, Heading, Text, Box, Flex, Stack } from "@/components/ui";
import { ChevronRight } from "lucide-react";
import Image from "next/image";

const categories = [
  { name: "Coiffure", image: "/coupes.jpg", sectorId: "coiffure" },
  { name: "Ongles", image: "/ongles.jpg", sectorId: "ongles" },
  { name: "Sourcils & cils", image: "/sourcils.jpg", sectorId: "sourcils" },
  { name: "Massage", image: "/massages.jpg", sectorId: "massage" },
  { name: "Barber", image: "/barber.jpg", sectorId: "barbier" },
  { name: "Épilation", image: "/epilation.jpg", sectorId: "epilation" },
];

export default function ServiceCategories() {
  const router = useRouter();

  return (
    <Section spacing="lg" className="bg-white">
      <Container>
        <Flex align="end" justify="between" className="mb-16">
          <Stack space={3}>
            <Heading level={2} variant="section" className="text-gray-900">
              Nos prestations <Text as="span" className="text-primary/30">phare</Text>
            </Heading>
            <Text variant="muted" className="text-lg text-balance">Découvrez l'univers qui vous correspond</Text>
          </Stack>

          <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5 group" asChild>
            <Link href="/search" className="flex items-center gap-2">
              <Text variant="small" as="span">Explorer tout le catalogue</Text>
              <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </Flex>

        <Box className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 md:gap-12">
          {categories.map((category) => (
            <Flex
              key={category.sectorId}
              direction="col"
              align="center"
              gap={5}
              className="group cursor-pointer"
              onClick={() => router.push(`/search?sector=${category.sectorId}`)}
            >
              <Box className="relative w-28 h-28 md:w-36 md:h-36 aspect-square rounded-full overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-primary/20">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <Box className="absolute inset-0 bg-primary/10 group-hover:bg-transparent transition-colors duration-500" />
                <Box className="absolute inset-0 border-2 border-primary/5 group-hover:border-primary/20 rounded-full transition-all duration-500" />
              </Box>
              <Text variant="default" as="span" className="font-bold text-gray-900 transition-all group-hover:text-primary group-hover:scale-105">
                {category.name}
              </Text>
            </Flex>
          ))}
        </Box>
      </Container>
    </Section>
  );
}
