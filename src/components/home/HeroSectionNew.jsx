import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ChevronDown, ShoppingBag } from "lucide-react";

export default function HeroSectionNew() {
  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/7cde4c841_ChatGPTImageOct23202506_39_28PM.png')`
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#414A37]/70 via-[#414A37]/50 to-[#414A37]/70" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-sm sm:text-base text-white/90 mb-6 uppercase tracking-[0.3em]"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          Luxury Flat Knitwear crafted in India
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mb-4"
        >
          <h1
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-white mb-4"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              background: "linear-gradient(135deg, #C4A484 0%, #D4A574 50%, #B9744A 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}
          >
            As iconic as <span className="italic">YOU!</span>
          </h1>
          
          {/* Gold Underline Animation */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="h-1 w-48 mx-auto bg-gradient-to-r from-[#B9744A] to-[#C4A484]"
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8 }}
          className="text-base sm:text-lg text-white/80 mb-10 max-w-2xl leading-relaxed"
          style={{ fontFamily: "'Open Sans', sans-serif" }}
        >
          Discover meticulously crafted knitwear that celebrates individuality 
          through fine artisanal detail and modern design.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <Link
            to={createPageUrl("Shop")}
            className="inline-flex items-center gap-3 px-10 py-4 bg-[#B9744A] text-white text-sm uppercase tracking-[0.2em] hover:bg-[#a5663f] transition-all duration-300 shadow-lg"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            <ShoppingBag className="w-5 h-5" />
            Shop Now
          </Link>
        </motion.div>
      </div>

      {/* Floating Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <span className="text-white/60 text-xs mb-2 uppercase tracking-wider">Scroll</span>
          <ChevronDown className="w-6 h-6 text-white/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}