"use client";

import { useState, useEffect } from "react";
import { Container, Button, Logo, Link, Text, Box, Flex } from "@/components/ui";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";

const navigationLinks = [
  { label: "Accueil", href: "/" },
  { label: "Qui sommes-nous", href: "/about" },
  { label: "Pour les pros", href: "/coming-soon" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    
    // Check auth status
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setIsLoggedIn(true);
        // Check if client
        const { data: clientProfile } = await supabase
          .from("client_profiles")
          .select("id")
          .eq("user_id", user.id)
          .single();
        setIsClient(!!clientProfile);
      }
    };
    checkAuth();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Box
      as="header"
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled 
          ? "bg-[#32422c]/90 backdrop-blur-xl py-3 shadow-lg shadow-black/5 border-b border-white/5" 
          : "bg-[#32422c] py-6"
      )}
    >
      <Container>
        <Flex as="nav" align="center" justify="between">
          {/* Logo Section */}
          <Box className="flex-shrink-0 transition-all duration-500">
            <Logo 
              variant="light" 
              size={scrolled ? "md" : "lg"} 
              className={cn(
                "w-auto transition-all duration-500",
                scrolled ? "h-8" : "h-10"
              )} 
            />
          </Box>

          {/* Desktop Navigation */}
          <Flex align="center" gap={8} className="hidden md:flex">
            {navigationLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                variant="underline"
                className="text-white/80 hover:text-white transition-colors"
              >
                <Text variant="small" as="span" className="tracking-wide font-bold">
                  {link.label}
                </Text>
              </Link>
            ))}
          </Flex>

          {/* Desktop CTA */}
          <Box className="hidden md:block">
            <Link href={isLoggedIn && isClient ? "/account" : isLoggedIn ? "/dashboard" : "/auth/select-space"}>
              <Button 
                variant="white" 
                size="sm" 
                className="gap-2.5 font-bold shadow-xl shadow-black/10 hover:scale-105 transition-transform cursor-pointer"
              >
                <User size={18} strokeWidth={2.5} />
                <Text variant="small" as="span">Mon compte</Text>
              </Button>
            </Link>
          </Box>

          {/* Mobile Menu Button */}
          <Box className="md:hidden">
            <Button
              variant="ghost"
              className="text-white p-2 hover:bg-white/10 rounded-xl transition-colors min-w-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </Button>
          </Box>
        </Flex>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <Box className="md:hidden overflow-hidden">
            <Flex direction="col" className="py-8" gap={6}>
              {navigationLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-white/90 text-xl font-bold py-2 flex items-center justify-between group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Text as="span">{link.label}</Text>
                </Link>
              ))}
              <Box className="pt-6 border-t border-white/10">
                <Link href={isLoggedIn && isClient ? "/account" : isLoggedIn ? "/dashboard" : "/auth/select-space"} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="white" fullWidth size="lg" className="gap-3 font-bold cursor-pointer">
                    <User size={20} strokeWidth={2.5} />
                    <Text as="span">Mon compte</Text>
                  </Button>
                </Link>
              </Box>
            </Flex>
          </Box>
        )}
      </Container>
    </Box>
  );
}
