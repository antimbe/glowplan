"use client";

import { Container, Section, Heading, Text, Box, MotionBox, Stack, List, ListItem } from "@/components/ui";
import { Calendar, Eye, Heart, CheckCircle2 } from "lucide-react";

const valueCards = [
  {
    icon: Calendar,
    title: "NOTRE MISSION",
    points: [
      "Relier pros de la beauté et clients",
      "Simplifier la prise de rendez-vous",
      "Valoriser l'expertise des professionnels"
    ]
  },
  {
    icon: Eye,
    title: "NOTRE VISION",
    points: [
      "La référence de la réservation beauté",
      "Mettre en avant le savoir-faire",
      "Créer une communauté engagée"
    ]
  },
  {
    icon: Heart,
    title: "NOS VALEURS",
    points: [
      "Simplicité : On vous facilite la vie",
      "Engagement : On vous accompagne",
      "Excellence : Une expérience au top"
    ]
  }
];

export default function AboutValues() {
  return (
    <Section spacing="xl" className="bg-primary">
      <Container>
        <Box className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {valueCards.map((card, index) => (
            <MotionBox
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="bg-[#3d4a39] rounded-[2rem] p-8 border border-white/5"
            >
              <Stack space={8}>
                <Box className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center text-white">
                  <card.icon size={32} strokeWidth={1.5} />
                </Box>
                
                <Stack space={6}>
                  <Heading level={3} className="text-white text-xl font-bold tracking-wider">
                    {card.title}
                  </Heading>
                  
                  <List spacing="md">
                    {card.points.map((point, i) => (
                      <ListItem 
                        key={i} 
                        icon={<CheckCircle2 size={18} className="text-white/60" />}
                        className="text-white/80"
                      >
                        <Text variant="small" className="font-medium text-white/90">
                          {point}
                        </Text>
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </Stack>
            </MotionBox>
          ))}
        </Box>
      </Container>
    </Section>
  );
}
