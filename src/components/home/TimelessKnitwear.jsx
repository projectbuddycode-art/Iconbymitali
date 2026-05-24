import React from "react";
import { motion } from "framer-motion";

const knitwearImages = [
  {
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/7394fedee_ChatGPTImageNov24202508_05_03AM.png",
    title: "Crafted Excellence"
  },
  {
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/4413c9f2f_ChatGPTImageNov24202508_01_20AM.png",
    title: "Artisan Touch"
  },
  {
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/ad234de21_ChatGPTImageNov24202507_57_34AM.png",
    title: "Pure Comfort"
  }
];

export default function TimelessKnitwear() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-block text-[#B9744A] text-sm uppercase tracking-[0.3em] mb-4"
            style={{ fontFamily: "'Lato', sans-serif" }}
          >
            The Collection
          </motion.span>
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl text-[#414A37] mb-6"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Timeless{" "}
            <span 
              className="italic"
              style={{ 
                background: "linear-gradient(135deg, #B9744A, #D4A574)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Knitwear
            </span>
          </h2>
          <p className="text-[#414A37]/70 max-w-2xl mx-auto text-lg">
            Each piece is meticulously crafted to become a cherished part of your wardrobe for years to come.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {knitwearImages.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
                <img
                  src={item.url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#414A37]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Content */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 + 0.3 }}
                  className="absolute bottom-0 left-0 right-0 p-6"
                >
                  <h3 
                    className="text-2xl text-white opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    {item.title}
                  </h3>
                </motion.div>

                {/* Decorative Corner */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border border-white/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                </div>
              </div>

              {/* Number Badge */}
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#DBC2A6] rounded-full flex items-center justify-center shadow-lg">
                <span 
                  className="text-[#414A37] text-lg font-medium"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  0{index + 1}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}