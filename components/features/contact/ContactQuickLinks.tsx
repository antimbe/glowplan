"use client";

import { Container, Section, Heading, Box, Flex, MotionBox, Card, Text, Stack } from "@/components/ui";
import { ChevronRight, Home, Layout, Users, Sparkles } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const links = [
  { 
    title: "Accueil", 
    subtitle: "L'expérience GlowPlan complète",
    href: "/", 
    icon: Home,
    color: "bg-primary", 
    textColor: "text-white",
    iconColor: "bg-white/10 text-white group-hover:bg-white group-hover:text-primary"
  },
  { 
    title: "Nos Offres", 
    subtitle: "Des solutions pour chaque expert",
    href: "#", 
    icon: Layout,
    color: "bg-[#f4f1ea]", 
    textColor: "text-primary",
    iconColor: "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white"
  },
  { 
    title: "Qui sommes-nous", 
    subtitle: "Découvrez notre vision unique",
    href: "/about", 
    icon: Users,
    color: "bg-[#6a845c]", 
    textColor: "text-white",
    iconColor: "bg-white/10 text-white group-hover:bg-white group-hover:text-primary-light"
  },
];

export default function ContactQuickLinks() {
  return (
    <Section spacing="none" className="bg-[#fcfbf9] pb-64 relative">
      <Container>
        <Stack space={16}>
          <Flex align="end" justify="between" wrap="wrap" gap={8}>
            <Stack space={4} className="max-w-xl">
              <Flex align="center" gap={3} className="text-primary/40">
                <Sparkles size={16} />
                <Text variant="small" className="font-bold uppercase tracking-[0.4em] text-[10px]">Continuer la visite</Text>
              </Flex>
              <Heading level={2} className="text-primary text-5xl md:text-6xl font-bold tracking-tighter">
                Explorer <Box as="span" className="text-primary italic font-serif">plus loin</Box>.
              </Heading>
            </Stack>
            <Box className="h-px flex-1 bg-gray-100 hidden lg:block mb-6 mx-12" />
          </Flex>

          <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {links.map((link, i) => (
              <Link key={link.title} href={link.href} className="block group h-full">
                <MotionBox
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="h-full"
                >
                  <Card 
                    className={cn(
                      "rounded-[3.5rem] p-12 h-[400px] flex flex-col justify-between transition-all duration-1000 border-none shadow-[0_40px_80px_-20px_rgba(0,0,0,0.06)] group-hover:shadow-[0_60px_100px_-20px_rgba(0,0,0,0.12)] group-hover:-translate-y-6 relative overflow-hidden",
                      link.color
                    )}
                  >
                    {/* Abstract high-end background elements */}
                    <Box className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-150 transition-transform duration-1000" />
                    <link.icon className={cn("absolute -bottom-12 -right-12 w-56 h-56 opacity-[0.04] transition-all duration-1000 group-hover:scale-110 group-hover:-rotate-12", link.textColor)} />

                    <Stack space={4} className="relative z-10">
                      <Heading level={3} className={cn("text-4xl md:text-5xl font-bold tracking-tighter leading-none", link.textColor)}>
                        {link.title}
                      </Heading>
                      <Text className={cn("text-xl font-medium opacity-50 max-w-[200px]", link.textColor)}>
                        {link.subtitle}
                      </Text>
                    </Stack>

                    <Flex align="center" justify="between" className="relative z-10 pt-12">
                      <Box className={cn(
                        "w-20 h-20 rounded-[2rem] flex items-center justify-center transition-all duration-700 group-hover:scale-110 shadow-2xl group-hover:rotate-6",
                        link.iconColor
                      )}>
                        <ChevronRight size={40} strokeWidth={2.5} className="transition-transform duration-700 group-hover:translate-x-2" />
                      </Box>
                      <Box className={cn("h-px flex-1 ml-10 opacity-10", link.textColor === "text-white" ? "bg-white" : "bg-primary")} />
                    </Flex>
                  </Card>
                </MotionBox>
              </Link>
            ))}
          </Box>
        </Stack>
      </Container>
    </Section>
  );
}
