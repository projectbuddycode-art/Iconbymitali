import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ArrowRight } from "lucide-react";

export default function DesignedWithIntention() {
  return (
    <section className="py-24 bg-[#F9F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span 
              className="text-[#B9744A] text-sm uppercase tracking-[0.3em] mb-6 inline-block"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              Our Philosophy
            </span>
            <h2 
              className="text-4xl sm:text-5xl lg:text-6xl text-[#414A37] mb-8 leading-tight"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              Designed with{" "}
              <span className="italic text-[#B9744A]">Intention</span>
            </h2>
            <p className="text-[#414A37]/70 text-lg leading-relaxed mb-8">
              Every piece in our collection is thoughtfully designed to transcend seasons 
              and trends. We believe in creating garments that feel like an extension of 
              yourself – comfortable, elegant, and enduring.
            </p>
            <p className="text-[#414A37]/70 text-lg leading-relaxed mb-10">
              Our knitwear is crafted using traditional Indian techniques passed down 
              through generations, combined with contemporary design sensibilities that 
              speak to the modern woman.
            </p>
            
            <Link
              to={createPageUrl("Shop")}
              className="inline-flex items-center gap-3 text-[#414A37] text-sm uppercase tracking-[0.15em] group"
              style={{ fontFamily: "'Lato', sans-serif" }}
            >
              <span className="border-b-2 border-[#B9744A] pb-1 group-hover:border-[#414A37] transition-colors">
                Explore Collection
              </span>
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
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/153ca4bfb_NEW_0380.jpg"
                alt="Designed with Intention"
                className="w-full h-[600px] object-cover rounded-2xl"
              />
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -left-6 w-48 h-48 border-2 border-[#DBC2A6] rounded-2xl -z-10" />
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#DBC2A6]/30 rounded-2xl -z-10" />
            </div>

            {/* Stats Box */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -bottom-10 left-10 bg-white rounded-xl shadow-xl p-6"
            >
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p 
                    className="text-4xl text-[#B9744A]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    100%
                  </p>
                  <p className="text-xs text-[#414A37]/70 uppercase tracking-wider">Natural</p>
                </div>
                <div className="w-px h-12 bg-[#DBC2A6]" />
                <div className="text-center">
                  <p 
                    className="text-4xl text-[#B9744A]"
                    style={{ fontFamily: "'Cormorant Garamond', serif" }}
                  >
                    Made
                  </p>
                  <p className="text-xs text-[#414A37]/70 uppercase tracking-wider">In India</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}