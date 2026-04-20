"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui";
import Image from "next/image";
import Link from "next/link";

const categories = [
  { name: "Coiffure",        image: "/coupes.jpg",    sectorId: "coiffure"  },
  { name: "Ongles",          image: "/ongles.jpg",    sectorId: "ongles"    },
  { name: "Sourcils & cils", image: "/sourcils.jpg",  sectorId: "sourcils"  },
  { name: "Massage",         image: "/massages.jpg",  sectorId: "massage"   },
  { name: "Barber",          image: "/barber.jpg",    sectorId: "barbier"   },
  { name: "Épilation",       image: "/epilation.jpg", sectorId: "epilation" },
];

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden:   { opacity: 0, y: 32, scale: 0.94 },
  visible:  { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.6, ease } },
};

export default function ServiceCategories() {
  const router = useRouter();

  return (
    <section className="bg-white py-28 overflow-hidden">
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
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#c0a062] mb-3">
              Nos prestations
            </p>
            <h2 className="text-[clamp(2rem,4vw,3rem)] font-black tracking-[-0.03em] text-gray-900 leading-tight">
              Choisissez votre{" "}
              <span className="text-[#32422c] italic font-serif">univers</span>
            </h2>
          </div>

          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#32422c] hover:text-[#c0a062] transition-colors group"
          >
            Explorer tout le catalogue
            <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </motion.div>

        {/* Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
        >
          {categories.map((cat) => (
            <motion.div
              key={cat.sectorId}
              variants={itemVariants}
              className="group cursor-pointer"
              onClick={() => router.push(`/search?sector=${cat.sectorId}`)}
            >
              {/* Circle image */}
              <div className="relative mx-auto mb-4 w-[100px] h-[100px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden ring-2 ring-transparent group-hover:ring-[#c0a062]/50 transition-all duration-500 shadow-lg group-hover:shadow-xl group-hover:shadow-[#32422c]/15">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-[#32422c]/20 group-hover:bg-[#32422c]/0 transition-colors duration-500" />
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>

              {/* Label */}
              <div className="text-center">
                <p className="text-[13px] font-bold text-gray-800 group-hover:text-[#32422c] transition-colors leading-tight">
                  {cat.name}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </Container>
    </section>
  );
}
