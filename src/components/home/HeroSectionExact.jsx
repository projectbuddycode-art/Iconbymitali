import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ChevronDown, ShoppingBag } from "lucide-react";
import { letterAnimation } from "../animations";

export default function HeroSectionExact() {
  const { scrollYProgress } = useScroll();
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);



  const titleWords = ["As", "Iconic", "as", "YOU!"];

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* Background with Scroll Transform */}
      <link rel="preload" as="image" href="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/9ef2d08b4_ChatGPTImageFeb8202611_51_18PM.png" />
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/9ef2d08b4_ChatGPTImageFeb8202611_51_18PM.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          y
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a2a20]/70 via-[#1a2a20]/50 to-[#1a2a20]/70" />
      </motion.div>

      {/* Content */}
      <motion.div 
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
        style={{ opacity }}
      >
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="text-xs sm:text-sm text-white/90 mb-6 uppercase tracking-[0.3em]"
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          Luxury Flat Knitwear crafted in India
        </motion.p>

        {/* Title with Letter Animation */}
        <div className="mb-4">
          <div className="flex flex-wrap justify-center gap-4">
            {titleWords.map((word, wordIndex) => (
              <div key={wordIndex} className="flex">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={letterIndex}
                    custom={wordIndex * 0.1 + letterIndex * 0.05}
                    initial="hidden"
                    animate="visible"
                    variants={letterAnimation}
                    className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl inline-block"
                    style={{ 
                      fontFamily: "'Playfair Display', serif",
                      background: "linear-gradient(135deg, #C4A484 0%, #D4A574 50%, #B9744A 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text"
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </div>
            ))}
          </div>
          
          {/* Gold Underline Animation */}
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 2.5, duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="h-1 w-full max-w-3xl mx-auto mt-6 overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-[#B9744A] via-[#C4A484] to-[#B9744A]"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                boxShadow: [
                  "0 0 20px rgba(185, 116, 74, 0.4)",
                  "0 0 40px rgba(185, 116, 74, 0.8)",
                  "0 0 20px rgba(185, 116, 74, 0.4)"
                ]
              }}
              transition={{ 
                backgroundPosition: { duration: 3, repeat: Infinity, ease: "linear" },
                boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
              style={{ backgroundSize: "200% 100%" }}
            />
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="text-sm sm:text-base md:text-lg text-white/80 mb-8 sm:mb-10 max-w-2xl leading-relaxed px-4"
          style={{ fontFamily: "'Open Sans', sans-serif" }}
        >
          Discover meticulously crafted knitwear that celebrates individuality 
          through fine artisanal detail and modern design.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link
            to={createPageUrl("Shop")}
            className="inline-flex items-center gap-3 px-8 sm:px-10 py-3 sm:py-4 bg-[#B9744A] text-white text-xs sm:text-sm uppercase tracking-[0.2em] hover:bg-[#a5663f] transition-all duration-300 shadow-lg"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.div>
            Shop Now
          </Link>
        </motion.div>
      </motion.div>

      {/* Floating Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4 }}
        className="absolute bottom-8 sm:bottom-10 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center"
        >
          <span className="text-white/60 text-xs mb-2 uppercase tracking-wider">Scroll</span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 text-white/60" />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}