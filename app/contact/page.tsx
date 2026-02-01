"use client";

import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";
import ContactHero from "@/components/features/contact/ContactHero";
import ContactFormSection from "@/components/features/contact/ContactFormSection";
import ContactQuickLinks from "@/components/features/contact/ContactQuickLinks";
import { Box } from "@/components/ui";

export default function ContactPage() {
  return (
    <Box as="main">
      <Header />
      <ContactHero />
      <ContactFormSection />
      <ContactQuickLinks />
      <Footer />
    </Box>
  );
}
