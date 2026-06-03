import React from "react";
import { motion } from "framer-motion";

export default function FounderSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative order-2 lg:order-1"
          >
            <div className="relative">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/a1d0a8e4d_WhatsAppImage2025-09-16at191400_f678ce00.jpg"
                alt="Mitali V. Dhumal - Founder"
                className="w-full h-[700px] object-cover rounded-2xl"
              />
              
              {/* Decorative Frame */}
              <div className="absolute inset-0 border-2 border-[#B9744A]/30 rounded-2xl transform translate-x-6 translate-y-6 -z-10" />
            </div>

            {/* Signature Element */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="absolute bottom-10 right-10 bg-[#414A37] text-white px-8 py-4 rounded-lg"
            >
              <p 
                className="text-2xl italic"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Mitali V. Dhumal
              </p>
              <p className="text-sm text-white/70 tracking-wider">Founder & Creative Director</p>
            </motion.div>
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
              Meet The Founder
            </span>
            <h2 
              className="text-4xl sm:text-5xl text-[#414A37] mb-8 leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              A Vision Born from{" "}
              <span className="italic text-[#B9744A]">Passion</span>
            </h2>
            
            <div className="space-y-6 text-[#414A37]/70 text-lg leading-relaxed">
              <p>
                Mitali V. Dhumal, the visionary behind ICON, brings together her deep 
                appreciation for India's textile heritage with a modern, minimalist 
                approach to fashion.
              </p>
              <p>
                With years of experience in the fashion industry and a profound 
                understanding of sustainable practices, Mitali has created a brand 
                that celebrates craftsmanship while embracing contemporary elegance.
              </p>
              <p>
                Her journey began with a simple belief: that luxury should be both 
                beautiful and responsible. Today, ICON stands as a testament to that 
                vision, offering pieces that are as timeless as they are thoughtfully made.
              </p>
            </div>

            {/* Quote */}
            <motion.blockquote
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-10 pl-6 border-l-4 border-[#B9744A]"
            >
              <p 
                className="text-2xl text-[#414A37] italic"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                "Fashion should feel like a second skin – effortless, natural, and uniquely yours."
              </p>
            </motion.blockquote>
          </motion.div>
        </div>
      </div>
    </section>
  );
}