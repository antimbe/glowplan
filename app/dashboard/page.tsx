"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Container, Section, Heading, Text, Box, Stack, Flex, MotionBox, Button, Card, Logo } from "@/components/ui";
import { LogOut, User, Loader2 } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/pro/login");
  };

  if (loading) {
    return (
      <Section spacing="none" className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Flex align="center" gap={3}>
          <Loader2 className="animate-spin text-[#2a3626]" size={32} />
          <Text className="text-[#2a3626] font-medium">Chargement...</Text>
        </Flex>
      </Section>
    );
  }

  return (
    <Section spacing="none" className="min-h-screen bg-gray-50">
      {/* Header */}
      <Box className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <Container>
          <Flex justify="between" align="center" className="py-4">
            <Logo variant="dark" size="md" />
            <Flex align="center" gap={4}>
              <Flex align="center" gap={2}>
                <Box className="w-10 h-10 rounded-full bg-[#2a3626]/10 flex items-center justify-center">
                  <User size={20} className="text-[#2a3626]" />
                </Box>
                <Text className="text-[#2a3626] font-medium text-sm hidden md:block">
                  {user?.email}
                </Text>
              </Flex>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-[#2a3626]/60 hover:text-[#2a3626] hover:bg-[#2a3626]/5"
              >
                <Flex align="center" gap={2}>
                  <LogOut size={18} />
                  <span className="hidden md:inline">Déconnexion</span>
                </Flex>
              </Button>
            </Flex>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container className="py-12">
        <Stack space={8}>
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Stack space={2}>
              <Heading level={1} className="text-[#2a3626] text-3xl md:text-4xl font-bold">
                Bienvenue sur votre Dashboard
              </Heading>
              <Text className="text-[#2a3626]/60 text-lg">
                Gérez votre activité professionnelle en toute simplicité.
              </Text>
            </Stack>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white border border-gray-100 shadow-sm" padding="lg">
                <Stack space={4}>
                  <Box className="w-12 h-12 rounded-xl bg-[#2a3626]/5 flex items-center justify-center">
                    <Text className="text-2xl">📅</Text>
                  </Box>
                  <Stack space={1}>
                    <Heading level={3} className="text-[#2a3626] text-lg font-bold">
                      Rendez-vous
                    </Heading>
                    <Text className="text-[#2a3626]/60 text-sm">
                      Gérez vos rendez-vous et votre agenda.
                    </Text>
                  </Stack>
                  <Text className="text-[#2a3626]/40 text-xs font-medium uppercase tracking-wider">
                    Bientôt disponible
                  </Text>
                </Stack>
              </Card>

              <Card className="bg-white border border-gray-100 shadow-sm" padding="lg">
                <Stack space={4}>
                  <Box className="w-12 h-12 rounded-xl bg-[#2a3626]/5 flex items-center justify-center">
                    <Text className="text-2xl">👥</Text>
                  </Box>
                  <Stack space={1}>
                    <Heading level={3} className="text-[#2a3626] text-lg font-bold">
                      Clients
                    </Heading>
                    <Text className="text-[#2a3626]/60 text-sm">
                      Consultez et gérez votre clientèle.
                    </Text>
                  </Stack>
                  <Text className="text-[#2a3626]/40 text-xs font-medium uppercase tracking-wider">
                    Bientôt disponible
                  </Text>
                </Stack>
              </Card>

              <Card className="bg-white border border-gray-100 shadow-sm" padding="lg">
                <Stack space={4}>
                  <Box className="w-12 h-12 rounded-xl bg-[#2a3626]/5 flex items-center justify-center">
                    <Text className="text-2xl">💰</Text>
                  </Box>
                  <Stack space={1}>
                    <Heading level={3} className="text-[#2a3626] text-lg font-bold">
                      Revenus
                    </Heading>
                    <Text className="text-[#2a3626]/60 text-sm">
                      Suivez vos revenus et statistiques.
                    </Text>
                  </Stack>
                  <Text className="text-[#2a3626]/40 text-xs font-medium uppercase tracking-wider">
                    Bientôt disponible
                  </Text>
                </Stack>
              </Card>
            </Box>
          </MotionBox>

          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-[#2a3626] border-none" padding="lg">
              <Flex justify="between" align="center" className="flex-col md:flex-row gap-6">
                <Stack space={2}>
                  <Heading level={3} className="text-white text-xl font-bold">
                    Votre compte est actif !
                  </Heading>
                  <Text className="text-white/70">
                    Vous êtes connecté avec : <strong className="text-white">{user?.email}</strong>
                  </Text>
                </Stack>
                <Button
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10 rounded-xl"
                >
                  Compléter mon profil
                </Button>
              </Flex>
            </Card>
          </MotionBox>
        </Stack>
      </Container>
    </Section>
  );
}
