import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ArrowRight } from "lucide-react";

export default function DesignedWithIntentionNew() {
  return (
    <section className="py-24 bg-[#414A37]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <span 
              className="text-[#C4A484] text-sm uppercase tracking-[0.3em] mb-6 inline-block"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Our Philosophy
            </span>
            <h2 
              className="text-4xl sm:text-5xl lg:text-6xl mb-8 leading-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Designed with{" "}
              <span className="italic text-[#C4A484]">Intention</span>
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-8">
              Every piece in our collection is thoughtfully designed to transcend seasons 
              and trends. We believe in creating garments that feel like an extension of 
              yourself – comfortable, elegant, and enduring.
            </p>
            <p className="text-white/70 text-base leading-relaxed mb-10">
              Our knitwear is crafted using traditional Indian techniques passed down 
              through generations, combined with contemporary design sensibilities that 
              speak to the modern individual who values both heritage and innovation.
            </p>
            
            <Link
              to={createPageUrl("Shop")}
              className="inline-flex items-center gap-3 text-white text-sm uppercase tracking-[0.15em] group border-b-2 border-[#B9744A] pb-2 hover:border-white transition-colors"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              <span>Explore the collection</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight className="w-5 h-5" />
              </motion.span>
            </Link>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&q=80"
                alt="Knitwear Texture"
                className="w-full h-[600px] object-cover rounded-2xl shadow-2xl"
              />
              
              {/* Decorative Frame */}
              <div className="absolute -bottom-6 -right-6 w-full h-full border-2 border-[#C4A484]/30 rounded-2xl -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-[#B9744A]/20 rounded-2xl -z-10" />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}