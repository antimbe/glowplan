"use client";

import { Container, Section, Card, Heading, Text, Box, Flex, List, ListItem, MotionBox, Stack } from "@/components/ui";
import { cn } from "@/lib/utils/cn";
import { Calendar, Shield, TrendingUp, Clock, CheckCircle2, Sparkles } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Gestion simplifiée",
    description: "Un calendrier intuitif pour organiser vos journées sans stress.",
    color: "bg-blue-500",
  },
  {
    icon: Shield,
    title: "Sécurité totale",
    description: "Vos données et celles de vos clients sont protégées et cryptées.",
    color: "bg-green-500",
  },
  {
    icon: TrendingUp,
    title: "Croissance boostée",
    description: "Suivez vos revenus et identifiez vos leviers de croissance.",
    color: "bg-orange-500",
  },
  {
    icon: Clock,
    title: "Gain de temps",
    description: "Automatisez vos rappels et réduisez les rendez-vous non honorés.",
    color: "bg-purple-500",
  },
];

export default function WhyGlowPlan() {
  return (
    <Section spacing="xl" className="bg-[#32422c] relative overflow-hidden">
      {/* Background Decorative Elements */}
      <Box className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-64 -mt-64 blur-3xl" />
      <Box className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-black/20 rounded-full -ml-64 -mb-64 blur-3xl" />
      
      <Container className="relative z-10">
        <Box className="grid lg:grid-cols-2 gap-20 items-center">
          <MotionBox 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <Stack space={10} className="text-white">
              <Stack space={6}>
                <MotionBox 
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <Flex align="center" gap={2} className="inline-flex px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                    <Sparkles size={16} className="text-accent" />
                    <Text variant="small" as="span" className="font-bold tracking-widest uppercase">Expertise Beauté</Text>
                  </Flex>
                </MotionBox>
                
                <Heading level={2} variant="hero" className="text-white leading-tight text-balance">
                  L'allié indispensable de votre <Text as="span" className="text-accent italic font-serif">réussite</Text>.
                </Heading>
                
                <Text variant="lead" className="text-white/70 max-w-lg font-medium text-balance">
                  GlowPlan a été conçu spécifiquement pour les professionnels de la beauté. Simple, élégant et redoutablement efficace pour propulser votre activité.
                </Text>
              </Stack>

              <List spacing="lg">
                {[
                  "Zéro frais d'installation", 
                  "Support client expert 7j/7", 
                  "Interface mobile-first intuitive"
                ].map((item, index) => (
                  <MotionBox 
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <ListItem 
                      icon={
                        <Box className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30">
                          <CheckCircle2 className="text-accent w-4 h-4" />
                        </Box>
                      }
                      className="text-white/90 font-bold"
                    >
                      <Text as="span" className="text-lg tracking-wide">{item}</Text>
                    </ListItem>
                  </MotionBox>
                ))}
              </List>
            </Stack>
          </MotionBox>

          <Box className="grid sm:grid-cols-2 gap-6 md:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MotionBox
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.6 }}
                >
                  <Card 
                    key={feature.title} 
                    variant="glass" 
                    padding="lg" 
                    className={cn(
                      "group/card h-full transition-all duration-500 hover:bg-white/15",
                      index % 2 === 1 
                        ? "lg:translate-y-12 hover:lg:translate-y-10" 
                        : "hover:-translate-y-2"
                    )}
                  >
                    <Flex direction="col" gap={6}>
                      <Box className={cn(
                        "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-500 group-hover/card:scale-110 group-hover/card:rotate-3 shadow-lg bg-white/10"
                      )}>
                        <Icon className="text-white w-7 h-7" />
                      </Box>
                      <Box className="space-y-3">
                        <Heading level={3} variant="card" className="text-white text-xl">
                          {feature.title}
                        </Heading>
                        <Text variant="small" className="text-white/60 leading-relaxed font-semibold">
                          {feature.description}
                        </Text>
                      </Box>
                    </Flex>
                  </Card>
                </MotionBox>
              );
            })}
          </Box>
        </Box>
      </Container>
    </Section>
  );
}
