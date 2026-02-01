"use client";

import Header from "@/components/features/Header";
import Footer from "@/components/features/Footer";
import AboutHero from "@/components/features/about/AboutHero";
import AboutStory from "@/components/features/about/AboutStory";
import AboutValues from "@/components/features/about/AboutValues";
import AboutCarousel from "@/components/features/about/AboutCarousel";
import CTASection from "@/components/features/CTASection";
import { Box } from "@/components/ui";

export default function AboutPage() {
  return (
    <Box as="main">
      <Header />
      <AboutHero />
      <AboutStory />
      <AboutValues />
      <AboutCarousel />
      <CTASection />
      <Footer />
    </Box>
  );
}
