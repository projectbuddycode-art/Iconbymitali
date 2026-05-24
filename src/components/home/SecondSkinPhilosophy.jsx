import React from "react";
import { motion } from "framer-motion";

export default function SecondSkinPhilosophy() {
  return (
    <section className="py-32 bg-[#414A37] relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 border-2 border-[#DBC2A6] rounded-full mx-auto mb-8 flex items-center justify-center"
          >
            <span 
              className="text-[#DBC2A6] text-2xl italic"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              SS
            </span>
          </motion.div>

          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl text-white mb-8"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            The{" "}
            <span className="italic text-[#DBC2A6]">Second Skin</span>{" "}
            Philosophy
          </h2>

          <div className="space-y-6 text-white/80 text-lg leading-relaxed max-w-3xl mx-auto">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Our signature collection embodies the essence of what we believe 
              clothing should be – a seamless extension of yourself. Like a second 
              skin, each piece moves with you, adapts to you, and feels completely natural.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              Crafted from the finest natural fibers and designed with an 
              understanding of the human form, our knitwear offers unparalleled 
              comfort without compromising on elegance.
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
            >
              The Second Skin collection represents our commitment to creating 
              pieces that you'll reach for time and time again – garments that 
              become an integral part of your personal style story.
            </motion.p>
          </div>

          {/* Decorative Line */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="w-32 h-px bg-[#DBC2A6] mx-auto mt-12"
          />
        </motion.div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-10 left-10 w-32 h-32 border border-white/10 rounded-full" />
      <div className="absolute bottom-10 right-10 w-24 h-24 border border-white/10 rounded-full" />
    </section>
  );
}