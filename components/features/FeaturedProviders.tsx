"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Container, Button } from "@/components/ui";
import ProviderCard from "./ProviderCard";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

interface Provider {
  id: string;
  name: string;
  city: string;
  main_photo_url: string | null;
  rating: number | null;
  reviewCount: number;
  services: string[];
  minPrice: number | null;
}

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
};

export default function FeaturedProviders() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProviders() {
      const supabase = createClient();

      // Fetch les 3 établissements mis en avant par l'équipe GlowPlan
      const { data: establishments } = await supabase
        .from("establishments")
        .select("id, name, city, main_photo_url")
        .eq("is_featured", true)
        .eq("is_profile_complete", true)
        .limit(3);

      if (!establishments || establishments.length === 0) {
        setLoading(false);
        return;
      }

      const ids = establishments.map((e) => e.id);

      // Fetch reviews for average rating
      const { data: reviews } = await supabase
        .from("reviews")
        .select("establishment_id, rating")
        .in("establishment_id", ids);

      // Fetch services (top 3 per establishment)
      const { data: services } = await supabase
        .from("services")
        .select("establishment_id, name, price")
        .in("establishment_id", ids);

      // Build providers list
      const result: Provider[] = establishments.map((est) => {
        const estReviews = reviews?.filter((r) => r.establishment_id === est.id) ?? [];
        const avgRating =
          estReviews.length > 0
            ? Math.round((estReviews.reduce((sum, r) => sum + r.rating, 0) / estReviews.length) * 10) / 10
            : null;

        const estServices = services?.filter((s) => s.establishment_id === est.id) ?? [];
        const serviceNames = [...new Set(estServices.map((s) => s.name))].slice(0, 3);
        const prices = estServices.map((s) => s.price).filter(Boolean) as number[];
        const minPrice = prices.length > 0 ? Math.min(...prices) : null;

        return {
          id: est.id,
          name: est.name,
          city: est.city || "",
          main_photo_url: est.main_photo_url,
          rating: avgRating,
          reviewCount: estReviews.length,
          services: serviceNames,
          minPrice,
        };
      });

      setProviders(result);
      setLoading(false);
    }

    fetchProviders();
  }, []);

  if (loading) {
    return (
      <section className="bg-[#f7f5f2] py-28">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </Container>
      </section>
    );
  }

  if (providers.length === 0) return null;

  return (
    <section className="bg-[#f7f5f2] py-28 overflow-hidden">
      <Container>

        {/* Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#32422c]/6 border border-[#32422c]/10 mb-4">
              <Sparkles size={13} className="text-[#c0a062]" />
              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-[#32422c]/70">
                Sélection Premium
              </span>
            </div>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.03em] text-gray-900 leading-tight">
              Nos partenaires{" "}
              <span className="text-[#32422c] italic font-serif font-medium">phares</span>
            </h2>
            <p className="mt-3 text-base text-gray-500 font-medium max-w-md">
              Les établissements les mieux notés et plébiscités par notre communauté.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-[#32422c]/15 text-[#32422c] hover:text-[#c0a062] hover:border-[#c0a062]/30 hover:bg-[#c0a062]/5 rounded-xl font-bold"
            onClick={() => window.location.href = "/search"}
          >
            Explorer tous les pros
            <ArrowUpRight size={15} className="transition-transform group-hover/shine:translate-x-0.5 group-hover/shine:-translate-y-0.5" />
          </Button>
        </motion.div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
        >
          {providers.map((provider) => (
            <motion.div key={provider.id} variants={cardVariants}>
              <ProviderCard
                id={provider.id}
                name={provider.name}
                location={provider.city}
                rating={provider.rating ?? undefined}
                reviewCount={provider.reviewCount}
                services={provider.services}
                imageUrl={provider.main_photo_url ?? undefined}
                minPrice={provider.minPrice ?? undefined}
              />
            </motion.div>
          ))}
        </motion.div>

      </Container>
    </section>
  );
}
