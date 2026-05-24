import React from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const knitwearItems = [
  {
    title: "Classic Cashmere",
    description: "Timeless cashmere pieces that define luxury",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/7394fedee_ChatGPTImageNov24202508_05_03AM.png"
  },
  {
    title: "Essential Silhouettes",
    description: "Modern cuts that celebrate the feminine form",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/4413c9f2f_ChatGPTImageNov24202508_01_20AM.png"
  },
  {
    title: "Heritage Techniques",
    description: "Traditional craftsmanship meets contemporary design",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/ad234de21_ChatGPTImageNov24202507_57_34AM.png"
  }
];

export default function TimelessKnitwearNew() {
  return (
    <section className="py-24 bg-[#F9F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title with Star Decorations */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <Sparkles className="w-6 h-6 text-[#B9744A]" />
            <h2 
              className="text-4xl sm:text-5xl lg:text-6xl"
              style={{ 
                fontFamily: "'Playfair Display', serif",
                background: "linear-gradient(135deg, #B9744A 0%, #C4A484 50%, #D4A574 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text"
              }}
            >
              Timeless Knitwear
            </h2>
            <Sparkles className="w-6 h-6 text-[#B9744A]" />
          </div>
          <p className="text-[#414A37]/70 text-lg max-w-2xl mx-auto">
            Each piece is meticulously crafted to become a cherished part of your wardrobe for years to come
          </p>
        </motion.div>

        {/* Three Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {knitwearItems.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 }}
              className="group relative"
            >
              <div className="relative overflow-hidden rounded-2xl aspect-[3/4] shadow-lg">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#414A37]/90 via-[#414A37]/30 to-transparent" />
                
                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 transform transition-transform duration-500 group-hover:translate-y-0">
                  <h3 
                    className="text-2xl sm:text-3xl text-white mb-2"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-white/80 text-sm">
                    {item.description}
                  </p>
                </div>

                {/* Decorative Corner */}
                <div className="absolute top-4 right-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="w-10 h-10 border-2 border-[#C4A484]/40 rounded-full"
                  />
                </div>
              </div>

              {/* Number Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 + 0.3, type: "spring" }}
                className="absolute -top-4 -left-4 w-14 h-14 bg-gradient-to-br from-[#B9744A] to-[#C4A484] rounded-full flex items-center justify-center shadow-lg"
              >
                <span 
                  className="text-white text-xl font-medium"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  0{index + 1}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}