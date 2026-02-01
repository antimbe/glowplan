"use client";

import { Container, Section, Heading, Text, Box, Stack, Flex, MotionBox, Input, Textarea, Button, Card } from "@/components/ui";
import { Phone, Mail, Twitter, Instagram, Globe, ArrowRight } from "lucide-react";

export default function ContactFormSection() {
  return (
    <Section className="bg-[#fcfbf9] py-40 -mt-24 relative z-20">
      <Container>
        <Box className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          {/* Left Side: Information Card */}
          <MotionBox
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 flex"
          >
            <Card 
              className="bg-[#2a3626] border-none shadow-[0_40px_80px_-15px_rgba(42,54,38,0.25)] w-full relative overflow-hidden flex flex-col justify-between" 
              padding="lg"
            >
              {/* Refined decorative elements */}
              <Box className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#6a845c]/10 rounded-full -mr-64 -mt-64 blur-3xl pointer-events-none" />
              <Box className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-black/20 rounded-full -ml-32 -mb-32 blur-3xl pointer-events-none" />

              <Stack space={16} className="relative z-10">
                <Stack space={6}>
                  <Heading level={2} className="text-white text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
                    Coordonnées
                  </Heading>
                  <Text className="text-white/60 text-base md:text-lg font-medium leading-relaxed">
                    N'hésite pas, écris-nous ! <br className="hidden sm:block" /> On est là pour toi.
                  </Text>
                </Stack>

                <Stack space={10}>
                  <Flex align="center" gap={6} className="group">
                    <Box className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center transition-all duration-500 group-hover:bg-white/20 group-hover:scale-110 shadow-lg shadow-black/10">
                      <Phone size={24} className="text-white" />
                    </Box>
                    <Stack space={1}>
                      <Text variant="small" className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Téléphone</Text>
                      <Text className="text-white font-bold text-lg tracking-tight">+33 6 64 73 93 35</Text>
                    </Stack>
                  </Flex>

                  <Flex align="center" gap={6} className="group">
                    <Box className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center transition-all duration-500 group-hover:bg-white/20 group-hover:scale-110 shadow-lg shadow-black/10">
                      <Mail size={24} className="text-white" />
                    </Box>
                    <Stack space={1}>
                      <Text variant="small" className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px]">Email</Text>
                      <Text className="text-white font-bold text-lg tracking-tight">glowplan000@gmail.com</Text>
                    </Stack>
                  </Flex>
                </Stack>

                <Flex gap={4} className="pt-12">
                  {[Twitter, Instagram, Globe].map((Icon, i) => (
                    <Box 
                      key={i}
                      className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:border-white/30 cursor-pointer transition-all duration-500 hover:-translate-y-1 shadow-lg"
                    >
                      <Icon size={20} className="text-white" />
                    </Box>
                  ))}
                </Flex>
              </Stack>
            </Card>
          </MotionBox>

          {/* Right Side: Interactive Form */}
          <MotionBox
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="lg:col-span-7 flex"
          >
            <Card 
              className="bg-white border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] w-full" 
              padding="xl"
            >
              <form onSubmit={(e) => e.preventDefault()} className="h-full">
                <Stack space={12} className="h-full">
                  <Stack space={10}>
                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <Box className="space-y-3">
                        <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em] ml-1">Prénom</Text>
                        <Input placeholder="Joé" fullWidth className="bg-gray-50/30 border-gray-100 border-b-2 border-x-0 border-t-0 rounded-none px-0 h-14 focus:bg-transparent focus:border-primary transition-all text-xl font-medium" />
                      </Box>
                      <Box className="space-y-3">
                        <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em] ml-1">Nom</Text>
                        <Input placeholder="Joé" fullWidth className="bg-gray-50/30 border-gray-100 border-b-2 border-x-0 border-t-0 rounded-none px-0 h-14 focus:bg-transparent focus:border-primary transition-all text-xl font-medium" />
                      </Box>
                    </Box>
                    
                    <Box className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <Box className="space-y-3">
                        <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em] ml-1">Email</Text>
                        <Input type="email" placeholder="" fullWidth className="bg-gray-50/30 border-gray-100 border-b-2 border-x-0 border-t-0 rounded-none px-0 h-14 focus:bg-transparent focus:border-primary transition-all text-xl font-medium" />
                      </Box>
                      <Box className="space-y-3">
                        <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em] ml-1">Numéro de téléphone</Text>
                        <Input placeholder="+33 6 12 56 34 12" fullWidth className="bg-gray-50/30 border-gray-100 border-b-2 border-x-0 border-t-0 rounded-none px-0 h-14 focus:bg-transparent focus:border-primary transition-all text-xl font-medium" />
                      </Box>
                    </Box>

                    <Stack space={6}>
                      <Text className="text-[10px] font-bold text-primary/40 uppercase tracking-[0.3em] ml-1">Sélectionner un sujet</Text>
                      <Box className="group cursor-pointer flex items-center gap-6 py-6 px-10 rounded-[2rem] bg-[#2a3626]/5 border-2 border-transparent hover:border-[#2a3626] hover:bg-white transition-all duration-500 shadow-sm hover:shadow-xl w-fit">
                        <Box className="w-4 h-4 rounded-full border-2 border-[#2a3626] flex items-center justify-center p-0.5">
                          <Box className="w-full h-full rounded-full bg-[#2a3626]" />
                        </Box>
                        <Text className="text-lg font-bold text-[#2a3626]">Booker un appel pour une démo</Text>
                      </Box>
                    </Stack>

                    <Box className="w-full">
                      <Textarea 
                        label="Message" 
                        placeholder="Écrivez votre message..." 
                        fullWidth 
                        className="bg-gray-50/50 border-gray-100 rounded-[2rem] min-h-[200px] p-8 focus:bg-white transition-all text-lg font-medium resize-none w-full" 
                      />
                    </Box>
                  </Stack>

                  <Flex justify="end">
                    <Button 
                      variant="primary" 
                      size="xl" 
                      className="bg-[#2a3626] hover:bg-[#1a2318] px-20 rounded-2xl font-bold h-16 text-lg shadow-2xl shadow-[#2a3626]/20 transition-all duration-500 hover:scale-[1.02] active:scale-[0.98] group"
                    >
                      <Flex align="center" gap={3}>
                        <span>Envoyez</span>
                        <ArrowRight size={24} className="transition-transform duration-500 group-hover:translate-x-2" />
                      </Flex>
                    </Button>
                  </Flex>
                </Stack>
              </form>
            </Card>
          </MotionBox>
        </Box>
      </Container>
    </Section>
  );
}
