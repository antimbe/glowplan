import Header from "@/components/features/Header";
import Hero from "@/components/features/Hero";
import ServiceCategories from "@/components/features/ServiceCategories";
import FeaturedProviders from "@/components/features/FeaturedProviders";
import WhyGlowPlan from "@/components/features/WhyGlowPlan";
import CTASection from "@/components/features/CTASection";
import Footer from "@/components/features/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <ServiceCategories />
      <FeaturedProviders />
      <WhyGlowPlan />
      <CTASection />
      <Footer />
    </>
  );
}
