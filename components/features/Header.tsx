"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Container, Button, Logo, Link, Text, Box, Flex } from "@/components/ui";
import { Menu, X, User, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

// Pages with a dark hero — navbar starts transparent
const DARK_HERO_ROUTES = ["/", "/about", "/pros", "/contact", "/categories", "/search"];

const navigationLinks = [
  { label: "Accueil", href: "/" },
  { label: "Qui sommes-nous", href: "/about" },
  { label: "Pour les pros", href: "/pros" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  // Transparent only on pages that have a dark hero
  const hasDarkHero = DARK_HERO_ROUTES.includes(pathname);

  // Force solid bg when mobile menu is open (prevents transparent bar over menu)
  const showSolidBg = scrolled || !hasDarkHero || mobileMenuOpen;

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
        
        // Vérifier le type d'utilisateur : métadonnées OU présence d'établissement
        const userType = user.user_metadata?.user_type;
        
        if (userType === "pro") {
          setIsPro(true);
        } else if (userType === "client") {
          setIsPro(false);
        } else {
          // Fallback : vérifier si a un établissement
          const { data: establishment } = await supabase
            .from("establishments")
            .select("id")
            .eq("user_id", user.id)
            .single();
          setIsPro(!!establishment);
        }
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
        showSolidBg
          ? "bg-[#32422c]/95 backdrop-blur-xl py-3 shadow-lg shadow-black/10"
          : "bg-transparent py-6"
      )}
    >
      <Container>
        <Flex as="nav" align="center" justify="between">
          {/* Logo Section */}
          <Box className="flex-shrink-0 transition-all duration-500">
            <Link href="/">
              <Logo 
                variant="light" 
                size={scrolled ? "md" : "lg"} 
                className={cn(
                  "w-auto transition-all duration-500",
                  scrolled ? "h-8" : "h-10"
                )} 
              />
            </Link>
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
            <Link href={isLoggedIn ? (isPro ? "/dashboard" : "/account") : "/auth/select-space"}>
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

        {/* Mobile Menu Overlay — full-screen, animated */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="md:hidden fixed inset-0 top-0 z-40 bg-[#1a2414] flex flex-col"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Header row inside overlay */}
              <Flex align="center" justify="between" className="px-5 py-4 border-b border-white/10">
                <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                  <Logo variant="light" size="md" className="h-8 w-auto" />
                </Link>
                <Button
                  variant="ghost"
                  className="text-white p-2 hover:bg-white/10 rounded-xl transition-colors min-w-0"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Fermer le menu"
                >
                  <X size={26} />
                </Button>
              </Flex>

              {/* Nav links — staggered */}
              <Flex direction="col" className="flex-1 px-6 py-8" gap={2}>
                {navigationLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.06 + i * 0.06 }}
                  >
                    <Link
                      href={link.href}
                      className="text-white/80 hover:text-white text-2xl font-black py-3 border-b border-white/[0.07] flex items-center justify-between group transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Text as="span">{link.label}</Text>
                      <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 text-[#c0a062] transition-opacity" />
                    </Link>
                  </motion.div>
                ))}
              </Flex>

              {/* Bottom CTA */}
              <motion.div
                className="px-6 pb-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: 0.28 }}
              >
                <Link href={isLoggedIn ? (isPro ? "/dashboard" : "/account") : "/auth/select-space"} onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="white" fullWidth size="lg" className="gap-3 font-bold cursor-pointer">
                    <User size={20} strokeWidth={2.5} />
                    <Text as="span">Mon compte</Text>
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
}
