import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const collections = [
  {
    title: "Royal Azure Set",
    description: "Elegant azure blue knitwear set crafted with luxurious Italian wool",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/64347dffa_IMG_6371.jpg",
    collection: "Second Skin"
  },
  {
    title: "Cobalt Dreams",
    description: "Deep cobalt tones merge with soft textures for ultimate comfort",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/76f43ec19_IMG_6375.jpg",
    collection: "Second Skin"
  },
  {
    title: "Checkered Infinity",
    description: "Timeless checkered patterns reimagined in contemporary knitwear",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/807c43155_IMG_6373.jpg",
    collection: "Second Skin"
  },
  {
    title: "Monochrome Poetry",
    description: "Black and white sophistication in every stitch",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/9a5af2ef1_DSC_9534.jpg",
    collection: "Second Skin"
  },
  {
    title: "Shadow Play",
    description: "Subtle grey tones create depth and dimension",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/42640d97b_DSC_8261.jpg",
    collection: "Second Skin"
  },
  {
    title: "Midnight Structure",
    description: "Architectural silhouettes in deep midnight hues",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/b1065c1c8_DSC_8228.jpg",
    collection: "Second Skin"
  },
  {
    title: "Ensemble Harmony",
    description: "A stunning collection of knitwear in earth tones and vibrant greens",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/4eb303846_IMG_6369.jpg",
    collection: "Second Skin"
  },
  {
    title: "Olive Elegance",
    description: "Contemporary knitwear with dramatic silhouettes in olive and gold",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/665684b67_IMG_4919JPG1.jpg",
    collection: "Second Skin"
  }
];

export default function FeaturedCollectionsExact() {
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let animationId;
    let scrollPosition = 0;

    const scroll = () => {
      if (!isPaused && container) {
        scrollPosition += 1.5;
        
        // Reset scroll position for infinite loop
        if (scrollPosition >= container.scrollWidth / 2) {
          scrollPosition = 0;
          container.scrollLeft = 0;
        } else {
          container.scrollLeft = scrollPosition;
        }
      }
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(animationId);
  }, [isPaused]);

  return (
    <section className="py-10 sm:py-13 md:py-16 lg:py-26 bg-white">
      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.4 }}
        className="text-center mb-12 sm:mb-16 px-4"
      >
        <motion.h2 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a2a20] mb-3"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Designer Spotlight
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: -15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-[#b2985d] text-base sm:text-lg tracking-wider uppercase" 
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          Latest Creations
        </motion.p>
      </motion.div>

      {/* Scrollable Gallery */}
      <div className="relative">
          {/* Navigation Hint */}
          {isPaused && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-12 z-20 bg-[#b2985d] text-white px-4 py-2 rounded-full text-xs shadow-lg"
            >
              Scroll to explore ← →
            </motion.div>
          )}
          {/* Scrollable Container */}
          <motion.div
            ref={scrollRef}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.4 }}
            className="flex gap-2 sm:gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-4"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            animate={{ 
              filter: isPaused ? "brightness(1.1)" : "brightness(1)"
            }}
            transition={{ duration: 0.4 }}
          >
            {[...collections, ...collections].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className="flex-shrink-0 w-[70vw] sm:w-[50vw] md:w-[35vh] lg:w-[45vh] group cursor-pointer"
                style={{ scrollSnapAlign: "start" }}
                whileHover={{ scale: 1.03 }}
                animate={isPaused ? { scale: 1.02, y: -5 } : { scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              >
                <div className="relative overflow-hidden rounded-xl aspect-[4/5] bg-[#F9F7F4]">
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center transition-transform duration-500"
                    loading="lazy"
                    width="600"
                    height="750"
                    whileHover={{ scale: 1.15 }}
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  {/* Collection Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#b2985d] text-white text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                      {item.collection}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h3 
                      className="text-white text-xl sm:text-2xl mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      {/* Second Skin Philosophy Card */}
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mt-12 sm:mt-16 bg-gradient-to-br from-[#1a2a20] to-[#0f1a14] rounded-2xl p-6 sm:p-8 md:p-12 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-[#c4b078] rounded-full mx-auto mb-4 sm:mb-6 flex items-center justify-center">
              <span 
                className="text-[#c4b078] text-xl sm:text-2xl italic"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                SS
              </span>
            </div>
            <h3 
              className="text-2xl sm:text-3xl md:text-4xl text-white mb-4 sm:mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The Second Skin Collection
            </h3>
            <p className="text-white/80 text-base sm:text-lg leading-relaxed mb-3 sm:mb-4">
              Our signature collection embodies the essence of what we believe clothing should be – 
              a seamless extension of yourself. Like a second skin, each piece moves with you, 
              adapts to you, and feels completely natural.
            </p>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed">
              Crafted from the finest natural fibers and designed with an understanding of the human form, 
              our knitwear offers unparalleled comfort without compromising on elegance.
            </p>
          </div>
        </motion.div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}