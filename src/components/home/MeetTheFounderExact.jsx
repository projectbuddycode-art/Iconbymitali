import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ArrowRight, X } from "lucide-react";

export default function MeetTheFounderExact() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-32 bg-white relative overflow-hidden">
      {/* Background Pattern */}
      <motion.div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 15% 85%, rgba(178, 152, 93, 0.03) 0%, transparent 50%),
                           radial-gradient(circle at 85% 15%, rgba(178, 152, 93, 0.03) 0%, transparent 50%)`,
          backgroundSize: "40px 40px"
        }}
        animate={{ opacity: [0, 0.03, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          {/* Founder Image */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative order-2 lg:order-1 cursor-pointer"
            onClick={() => setIsModalOpen(true)}
          >
            <motion.div 
              className="relative rounded-2xl overflow-hidden shadow-2xl"
              whileHover={{
                scale: 1.02,
                rotateY: 5,
                rotateX: -5
              }}
              transition={{ duration: 0.5 }}
            >
              <motion.img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/64305d305_WhatsAppImage2026-02-03at120015AM.jpeg"
                alt="Mitali V. Dhumal"
                className="w-full h-[500px] sm:h-[600px] md:h-[700px] object-cover object-center"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute bottom-0 left-0 right-0 p-6 sm:p-8"
              >
                <h3 
                  className="text-2xl sm:text-3xl md:text-4xl text-white mb-2"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Mitali V. Dhumal
                </h3>
                <p className="text-white/80 text-base sm:text-lg tracking-wide">
                  Founder & Lead Designer
                </p>
              </motion.div>

              {/* Decorative Border */}
              <div className="absolute inset-0 border-4 border-[#b2985d]/20 rounded-2xl pointer-events-none" />
            </motion.div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <motion.span 
              initial={{ opacity: 0, y: -15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-[#b2985d] text-xs sm:text-sm uppercase tracking-[0.3em] mb-4 sm:mb-6 inline-block"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Meet the Founder
            </motion.span>
            <motion.h2 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-3xl sm:text-4xl md:text-5xl text-[#1a2a20] mb-6 sm:mb-8 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Founder's{" "}
              <span className="italic text-[#b2985d]">Story</span>
            </motion.h2>
            
            <div className="space-y-4 sm:space-y-6 text-[#1a2a20]/80 text-base sm:text-lg leading-relaxed mb-8 sm:mb-10">
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.5 }}
              >
                I stumbled into knitwear without really knowing what it was and quickly found myself fascinated by it. The more I learned, the more I realized that knits weren't just fabrics, but structures you could design, engineer, and sculpt into something that feels alive on the body. Flat knits, especially, captured me with their mix of creativity and precision, every loop and stitch became a way to problem-solve and create.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, duration: 0.5 }}
              >
                What started as curiosity soon grew into expertise. During my Bachelor's in Design at NIFT Mumbai, I immersed myself in the technicalities of knitwear, mastering the balance between imagination and craft. Knits turned from a subject into my passion, teaching me patience, innovation, and the art of creating clothes that feel like a second skin.
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45, duration: 0.5 }}
              >
                With ICON, I carry forward that journey, building modern flat-knit garments that merge comfort, luxury, and individuality.
              </motion.p>
            </div>

            <Link
              to={createPageUrl("About")}
              className="inline-flex items-center gap-3 text-[#1a2a20] text-xs sm:text-sm uppercase tracking-[0.15em] group border-b-2 border-[#b2985d] pb-2 hover:border-[#1a2a20] transition-colors"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              <span>Learn More About Us</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.span>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.button
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              whileHover={{ scale: 1.15, rotate: 90 }}
              className="absolute top-6 right-6 w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </motion.button>

            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 50 }}
              transition={{ damping: 25, stiffness: 300, type: "spring" }}
              className="max-w-4xl w-full bg-white rounded-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="grid md:grid-cols-2">
                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/64305d305_WhatsAppImage2026-02-03at120015AM.jpeg"
                  alt="Mitali V. Dhumal"
                  className="w-full h-full object-cover"
                />
                <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-center">
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="text-2xl sm:text-3xl text-[#1a2a20] mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Mitali V. Dhumal
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-[#B9744A] mb-4 sm:mb-6"
                  >
                    Founder & Lead Designer
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-[#414A37]/80 text-sm sm:text-base leading-relaxed"
                  >
                    I stumbled into knitwear without really knowing what it was and quickly found myself fascinated by it. The more I learned, the more I realized that knits weren't just fabrics, but structures you could design, engineer, and sculpt into something that feels alive on the body.
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}