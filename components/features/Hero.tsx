"use client";

import { Search, MapPin, Sparkles } from "lucide-react";
import { Container, Section, Button, Input, Heading, Text, Box, Flex, Separator, Stack, MotionBox } from "@/components/ui";

export default function Hero() {
  return (
    <Section className="relative min-h-[90vh] flex items-center pt-20 overflow-hidden bg-gray-50">
      {/* Background with advanced gradient overlay */}
      <Box 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=2074&auto=format&fit=crop')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Box className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-primary/30" />
        <Box className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50" />
      </Box>
      
      <Container className="relative z-10 w-full">
        <Flex direction="col" align="center" className="text-center max-w-4xl mx-auto space-y-10">
          
          <MotionBox
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <Stack space={6} align="center">
              <Flex align="center" gap={2} className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-4 mx-auto">
                <Sparkles size={16} className="text-accent" />
                <Text variant="small" as="span" className="font-bold tracking-widest uppercase text-[10px] md:text-xs">Votre beauté, simplifiée</Text>
              </Flex>

              <Flex align="center" justify="center" gap={4} className="text-white drop-shadow-2xl text-balance text-5xl md:text-6xl lg:text-7xl flex-wrap">
                <Heading level={1} variant="hero" className="text-white">Révélez votre</Heading>
                <Heading level={1} variant="hero" as="span" className="text-accent italic font-serif">éclat</Heading>
                <Heading level={1} variant="hero" className="text-white">en un seul clic.</Heading>
              </Flex>
              
              <Text variant="lead" className="text-white/90 max-w-2xl mx-auto drop-shadow-sm font-medium text-balance">
                Découvrez et réservez les meilleurs soins beauté & bien-être auprès de professionnels passionnés près de chez vous.
              </Text>
            </Stack>
          </MotionBox>

          {/* Floating Search Bar with Premium Design */}
          <MotionBox 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="w-full max-w-3xl mt-4 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] p-2 flex flex-col md:flex-row items-center gap-2 transform transition-all hover:shadow-[0_30px_60px_rgba(0,0,0,0.2)]"
          >
            <Box className="flex-1 w-full group">
              <Input 
                variant="ghost"
                placeholder="Prestation (coiffure, massage...)" 
                leftIcon={<Search className="text-primary/40 group-focus-within:text-primary transition-colors w-5 h-5" />}
                fullWidth
                className="h-16 font-semibold text-lg"
              />
            </Box>
            
            <Separator orientation="vertical" variant="muted" className="hidden md:block h-10" />

            <Box className="flex-1 w-full group">
              <Input 
                variant="ghost"
                placeholder="Où ? (Ville, CP)" 
                leftIcon={<MapPin className="text-primary/40 group-focus-within:text-primary transition-colors w-5 h-5" />}
                fullWidth
                className="h-16 font-semibold text-lg"
              />
            </Box>

            <Button size="xl" className="h-16 px-12 shadow-lg shadow-primary/20 rounded-2xl w-full md:w-auto font-bold text-lg">
              Trouver un pro
            </Button>
          </MotionBox>
          
          <MotionBox 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <Flex wrap="wrap" justify="center" gap={4} className="pt-4">
              {["Coiffure", "Ongles", "Soins visage", "Massage"].map((tag) => (
                <Text 
                  key={tag}
                  variant="small" 
                  as="span" 
                  className="px-5 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-full border border-white/10 text-white font-bold cursor-pointer transition-all hover:border-white/30"
                >
                  {tag}
                </Text>
              ))}
            </Flex>
          </MotionBox>

        </Flex>
      </Container>
    </Section>
  );
}
