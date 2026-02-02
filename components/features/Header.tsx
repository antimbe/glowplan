"use client";

import { useState, useEffect } from "react";
import { Container, Button, Logo, Link, Text, Box, Flex, MotionBox } from "@/components/ui";
import { Menu, X, User } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { AnimatePresence } from "framer-motion";

const navigationLinks = [
  { label: "Accueil", href: "/" },
  { label: "Qui sommes-nous", href: "/about" },
  { label: "Pour les pros", href: "/coming-soon" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
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
          <MotionBox 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex-shrink-0 transition-all duration-500"
          >
            <Logo 
              variant="light" 
              size={scrolled ? "md" : "lg"} 
              className={cn(
                "w-auto transition-all duration-500",
                scrolled ? "h-8" : "h-10"
              )} 
            />
          </MotionBox>

          {/* Desktop Navigation */}
          <Flex align="center" gap={8} className="hidden md:flex">
            {navigationLinks.map((link, index) => (
              <MotionBox
                key={link.href}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  href={link.href}
                  variant="underline"
                  className="text-white/80 hover:text-white"
                >
                  <Text variant="small" as="span" className="tracking-wide font-bold">
                    {link.label}
                  </Text>
                </Link>
              </MotionBox>
            ))}
          </Flex>

          {/* Desktop CTA */}
          <MotionBox 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden md:block"
          >
            <Link href="/auth/select-space">
              <Button 
                variant="white" 
                size="sm" 
                className="gap-2.5 font-bold shadow-xl shadow-black/10 hover:scale-105 transition-transform"
              >
                <User size={18} strokeWidth={2.5} />
                <Text variant="small" as="span">Mon compte</Text>
              </Button>
            </Link>
          </MotionBox>

          {/* Mobile Menu Button */}
          <MotionBox
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="md:hidden"
          >
            <Button
              variant="ghost"
              className="text-white p-2 hover:bg-white/10 rounded-xl transition-colors min-w-0"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </Button>
          </MotionBox>
        </Flex>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <MotionBox
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <Flex direction="col" className="py-8" gap={6}>
                {navigationLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white/90 text-xl font-bold py-2 flex items-center justify-between group"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Text as="span">{link.label}</Text>
                    <MotionBox 
                      initial={{ x: -10, opacity: 0 }}
                      whileHover={{ x: 0, opacity: 1 }}
                    >
                      <User size={20} />
                    </MotionBox>
                  </Link>
                ))}
                <Box className="pt-6 border-t border-white/10">
                  <Link href="/auth/select-space" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="white" fullWidth size="lg" className="gap-3 font-bold">
                      <User size={20} strokeWidth={2.5} />
                      <Text as="span">Mon compte</Text>
                    </Button>
                  </Link>
                </Box>
              </Flex>
            </MotionBox>
          )}
        </AnimatePresence>
      </Container>
    </Box>
  );
}
