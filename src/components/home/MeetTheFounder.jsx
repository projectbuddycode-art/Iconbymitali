import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ArrowRight } from "lucide-react";

export default function MeetTheFounder() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Founder Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/a1d0a8e4d_WhatsAppImage2025-09-16at191400_f678ce00.jpg"
                alt="Mitali V. Dhumal"
                className="w-full h-[700px] object-cover"
              />
              
              {/* Overlay with Name */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-0 left-0 right-0 p-8"
              >
                <h3 
                  className="text-3xl sm:text-4xl text-white mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Mitali V. Dhumal
                </h3>
                <p className="text-white/80 text-lg tracking-wide">
                  Founder & Lead Designer
                </p>
              </motion.div>

              {/* Decorative Border */}
              <div className="absolute inset-0 border-4 border-[#B9744A]/20 rounded-2xl pointer-events-none" />
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="order-1 lg:order-2"
          >
            <span 
              className="text-[#B9744A] text-sm uppercase tracking-[0.3em] mb-6 inline-block"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Meet the Founder
            </span>
            <h2 
              className="text-4xl sm:text-5xl text-[#414A37] mb-8 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Crafting Stories{" "}
              <span className="italic text-[#B9744A]">in Thread</span>
            </h2>
            
            <div className="space-y-6 text-[#414A37]/80 text-lg leading-relaxed mb-10">
              <p>
                Mitali V. Dhumal's journey into the world of luxury knitwear began with 
                a simple revelation – that the most beautiful garments are those that make 
                you forget you're wearing anything at all.
              </p>
              <p>
                With a background in fashion design from NIFT Mumbai and years of experience 
                working with India's finest textile artisans, Mitali founded ICON to bridge 
                the gap between traditional craftsmanship and contemporary luxury.
              </p>
              <p>
                Every piece tells a story of dedication, precision, and passion for creating 
                knitwear that doesn't just clothe the body, but celebrates the individual.
              </p>
            </div>

            <Link
              to={createPageUrl("About")}
              className="inline-flex items-center gap-3 text-[#414A37] text-sm uppercase tracking-[0.15em] group border-b-2 border-[#B9744A] pb-2 hover:border-[#414A37] transition-colors"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              <span>Learn More About Us</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}