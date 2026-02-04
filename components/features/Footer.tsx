"use client";

import { Container, Logo, Link, Input, Button, Heading, Text, Box, Flex, List, ListItem, Stack } from "@/components/ui";
import { Facebook, Instagram, Twitter, Linkedin, ArrowRight, Globe, LifeBuoy } from "lucide-react";

const footerSections = [
  {
    title: "Produit",
    links: [
      { label: "Fonctionnalités", href: "#" },
      { label: "Tarifs", href: "#" },
      { label: "Pour les salons", href: "#" },
      { label: "Pour les indépendants", href: "#" },
    ],
  },
  {
    title: "Société",
    links: [
      { label: "À propos", href: "/about" },
      { label: "Blog", href: "#" },
      { label: "Carrières", href: "#" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Légal",
    links: [
      { label: "Confidentialité", href: "#rgpd" },
      { label: "Conditions d'utilisation", href: "#cgu" },
      { label: "Mentions légales", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <Box as="footer" className="bg-[#32422c] pt-28 pb-12 text-white/90 overflow-hidden relative">
      {/* Subtle background decoration */}
      <Box className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <Box className="absolute top-[10%] right-[-5%] w-[30%] h-[30%] bg-white/5 rounded-full blur-3xl" />
      </Box>

      <Container className="relative z-10">
        <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-24">
          {/* Brand Column */}
          <Box className="lg:col-span-4">
            <Stack space={10}>
              <Logo variant="light" size="xl" />
              <Text variant="lead" className="text-white/60 leading-relaxed max-w-sm text-balance">
                La plateforme tout-en-un qui sublime la gestion de votre activité beauté et bien-être avec élégance et simplicité.
              </Text>
              <Flex gap={4}>
                {[Instagram, Facebook, Twitter, Linkedin].map((Icon, i) => (
                  <Link 
                    key={i} 
                    href="#" 
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all border border-white/10 group"
                  >
                    <Icon size={22} className="text-white/60 group-hover:text-white transition-colors" />
                  </Link>
                ))}
              </Flex>
            </Stack>
          </Box>

          {/* Links Columns */}
          <Box className="lg:col-span-5 grid grid-cols-2 md:grid-cols-3 gap-10">
            {footerSections.map((section) => (
              <Stack key={section.title} space={8}>
                <Heading level={3} className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                  {section.title}
                </Heading>
                <List spacing="md">
                  {section.links.map((link) => (
                    <ListItem key={link.label}>
                      <Link
                        href={link.href}
                        className="hover:text-white transition-colors group flex items-center"
                      >
                        <Text variant="small" as="span" className="relative font-semibold text-white/60 group-hover:text-white transition-colors">
                          {link.label}
                          <Box as="span" className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent/50 transition-all duration-300 group-hover:w-full" />
                        </Text>
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Stack>
            ))}
          </Box>

          {/* Newsletter Column */}
          <Box className="lg:col-span-3">
            <Stack space={8}>
              <Stack space={4}>
                <Heading level={3} className="text-xs font-bold uppercase tracking-[0.2em] text-white/30">
                  Newsletter
                </Heading>
                <Text variant="small" className="text-white/60 font-semibold leading-relaxed text-balance">
                  Rejoignez notre newsletter pour recevoir des conseils exclusifs pour booster votre activité.
                </Text>
              </Stack>
              <Box className="relative group max-w-sm">
                <Input 
                  type="email" 
                  placeholder="votre@email.com" 
                  variant="ghost"
                  fullWidth
                  className="bg-white/5 border border-white/10 rounded-2xl py-5 pl-5 pr-14 text-sm outline-none focus:border-accent/30 focus:bg-white/10 transition-all font-semibold text-white placeholder:text-white/20 shadow-inner"
                />
                <Button 
                  variant="ghost"
                  className="absolute right-2 top-2 bottom-2 w-11 bg-accent/20 rounded-xl flex items-center justify-center hover:bg-accent hover:scale-105 transition-all p-0 h-auto min-w-0 group/btn shadow-lg"
                >
                  <ArrowRight size={20} className="text-white transition-transform group-hover/btn:translate-x-0.5" />
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>

        {/* Bottom Bar */}
        <Flex direction="col" align="center" justify="between" className="pt-10 border-t border-white/5 md:flex-row gap-8">
          <Box className="flex items-center gap-6 order-2 md:order-1">
            <Text variant="small" className="text-white/20 font-bold tracking-tight">
              2026 GlowPlan. All rights reserved.
            </Text>
          </Box>
          
          <Flex wrap="wrap" justify="center" gap={8} className="order-1 md:order-2">
            <Link href="#" className="flex items-center gap-2 group">
              <Globe size={14} className="text-white/20 group-hover:text-accent transition-colors" />
              <Text variant="small" as="span" className="text-[10px] font-bold uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">Français (FR)</Text>
            </Link>
            <Link href="#" className="flex items-center gap-2 group">
              <LifeBuoy size={14} className="text-white/20 group-hover:text-accent transition-colors" />
              <Text variant="small" as="span" className="text-[10px] font-bold uppercase tracking-widest text-white/30 group-hover:text-white transition-colors">Support Technique</Text>
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
}
