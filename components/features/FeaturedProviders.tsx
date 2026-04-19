"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowUpRight } from "lucide-react";
import { Container, Button } from "@/components/ui";
import ProviderCard from "./ProviderCard";
import Link from "next/link";

const providers = [
  {
    name: "L'Art du Rasoir",
    location: "Paris 11e",
    rating: 4.8,
    reviewCount: 127,
    services: ["Coiffure", "Barbe"],
    imageUrl:
      "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=2070&auto=format&fit=crop",
  },
  {
    name: "Lovely Nails Class",
    location: "Courbevoie",
    rating: 4.9,
    reviewCount: 203,
    services: ["Ongles", "Manucure"],
    imageUrl:
      "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=1974&auto=format&fit=crop",
  },
  {
    name: "Charme & Spa",
    location: "Montreuil",
    rating: 4.7,
    reviewCount: 89,
    services: ["Esthétique", "Soins"],
    imageUrl:
      "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
  },
];

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

          <Link href="#all-providers">
            <Button
              variant="outline"
              size="sm"
              className="border-[#32422c]/15 text-[#32422c] hover:text-[#c0a062] hover:border-[#c0a062]/30 hover:bg-[#c0a062]/5 rounded-xl font-bold"
            >
              Explorer tous les pros
              <ArrowUpRight size={15} className="transition-transform group-hover/shine:translate-x-0.5 group-hover/shine:-translate-y-0.5" />
            </Button>
          </Link>
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
            <motion.div key={provider.name} variants={cardVariants}>
              <ProviderCard {...provider} />
            </motion.div>
          ))}
        </motion.div>

      </Container>
    </section>
  );
}
