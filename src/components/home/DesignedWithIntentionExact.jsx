import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ArrowRight } from "lucide-react";

export default function DesignedWithIntentionExact() {
  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-[#1a2a20] relative overflow-hidden">
      {/* Background Orbs */}
      <motion.div
        className="absolute top-0 left-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-[#b2985d]/10 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-0 right-0 w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-[#d4c4a8]/10 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, 50, 0],
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 sm:w-48 sm:h-48 bg-[#c4b078]/5 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.5, 1],
          rotate: [0, 180, 360],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-white"
          >
            <motion.span 
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-[#c4b078] text-xs sm:text-sm uppercase tracking-[0.3em] mb-4 sm:mb-6 inline-block"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Our Philosophy
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-6 sm:mb-8 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Designed with{" "}
              <span className="italic text-[#c4b078]">Intention</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="text-white/80 text-base sm:text-lg leading-relaxed mb-6 sm:mb-8"
            >
              Every piece in our collection is thoughtfully designed to transcend seasons 
              and trends. We believe in creating garments that feel like an extension of 
              yourself – comfortable, elegant, and enduring.
            </motion.p>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="text-white/70 text-sm sm:text-base leading-relaxed mb-8 sm:mb-10"
            >
              Our knitwear is crafted with modern technology which uses Computerised Knitting Machine, combined with contemporary design sensibilities that 
              speak to the modern individual who values both heritage and innovation.
            </motion.p>
            
            <Link
              to={createPageUrl("Shop")}
              className="inline-flex items-center gap-3 text-white text-xs sm:text-sm uppercase tracking-[0.15em] group border-b-2 border-[#b2985d] pb-2 hover:border-white transition-colors"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              <span>Explore the collection</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.span>
            </Link>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/1055e069c_Screenshot2026-02-03at122122AM.png"
                alt="Knitwear Collection"
                className="w-full h-[400px] sm:h-[500px] md:h-[600px] object-cover object-center transition-transform duration-300 hover:scale-105"
                loading="lazy"
                width="800"
                height="600"
              />
              
              {/* Decorative Frame */}
              <div className="absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 w-full h-full border-2 border-[#c4b078]/30 rounded-2xl -z-10" />
              <div className="absolute -top-4 sm:-top-6 -left-4 sm:-left-6 w-20 h-20 sm:w-32 sm:h-32 bg-[#b2985d]/20 rounded-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}