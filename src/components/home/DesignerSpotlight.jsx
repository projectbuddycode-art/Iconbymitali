import React, { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const collections = [
  {
    title: "Royal Azure Set",
    description: "Elegant azure blue knitwear set crafted with luxurious Italian wool",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/153ca4bfb_NEW_0380.jpg",
    collection: "Second Skin"
  },
  {
    title: "Cobalt Dreams",
    description: "Deep cobalt tones merge with soft textures for ultimate comfort",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/91853f9fd_NEW_0369.jpg",
    collection: "Second Skin"
  },
  {
    title: "Checkered Infinity",
    description: "Timeless checkered patterns reimagined in contemporary knitwear",
    image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/ef1c9fe26_NEW_0334.jpg",
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
  }
];

export default function DesignerSpotlight() {
  const scrollRef = useRef(null);
  const autoScrollRef = useRef(null);
  const pausedRef = useRef(false);
  const resumeTimerRef = useRef(null);

  const startAutoScroll = () => {
    if (autoScrollRef.current) clearInterval(autoScrollRef.current);
    autoScrollRef.current = setInterval(() => {
      if (pausedRef.current || !scrollRef.current) return;
      const container = scrollRef.current;
      if (container.scrollLeft >= container.scrollWidth - container.clientWidth - 10) {
        container.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        container.scrollBy({ left: 350, behavior: "smooth" });
      }
    }, 4000);
  };

  const pause = () => {
    pausedRef.current = true;
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
  };

  const resume = (delay = 0) => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      pausedRef.current = false;
    }, delay);
  };

  useEffect(() => {
    startAutoScroll();
    return () => {
      if (autoScrollRef.current) clearInterval(autoScrollRef.current);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    pause();
    const container = scrollRef.current;
    container.scrollLeft += direction === "left" ? -300 : 300;
    resume(2000);
  };

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            className="text-4xl sm:text-5xl lg:text-6xl text-[#414A37] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Designer Spotlight
          </h2>
          <p className="text-[#B9744A] text-lg tracking-wider uppercase" style={{ fontFamily: "'Lato', sans-serif" }}>
            Latest Creations
          </p>
        </motion.div>

        {/* Scrollable Gallery */}
        <div className="relative group">
          {/* Navigation Arrows - Hidden on Mobile */}
          <button
            onClick={() => scroll("left")}
            className="hidden sm:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 sm:w-12 h-10 sm:h-12 bg-white/95 rounded-full shadow-xl items-center justify-center hover:bg-white transition-colors -ml-4 sm:-ml-6"
          >
            <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6 text-[#414A37]" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 sm:w-12 h-10 sm:h-12 bg-white/95 rounded-full shadow-xl items-center justify-center hover:bg-white transition-colors -mr-4 sm:-mr-6"
          >
            <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6 text-[#414A37]" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth"
            style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
            onMouseEnter={() => pause()}
            onMouseLeave={() => resume(0)}
            onTouchStart={() => pause()}
            onTouchEnd={() => resume(2000)}
          >
            {collections.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[280px] sm:w-[320px] group cursor-pointer"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#F9F7F4]">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  
                  {/* Collection Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#B9744A] text-white text-xs uppercase tracking-wider px-3 py-1 rounded-full">
                      {item.collection}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <h3 
                      className="text-white text-2xl mb-2"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Second Skin Philosophy Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 bg-gradient-to-br from-[#414A37] to-[#2d3326] rounded-2xl p-8 md:p-12 text-center"
        >
          <div className="max-w-3xl mx-auto">
            <div className="w-16 h-16 border-2 border-[#C4A484] rounded-full mx-auto mb-6 flex items-center justify-center">
              <span 
                className="text-[#C4A484] text-2xl italic"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                SS
              </span>
            </div>
            <h3 
              className="text-3xl sm:text-4xl text-white mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The Second Skin Collection
            </h3>
            <p className="text-white/80 text-lg leading-relaxed mb-4">
              Our signature collection embodies the essence of what we believe clothing should be – 
              a seamless extension of yourself. Like a second skin, each piece moves with you, 
              adapts to you, and feels completely natural.
            </p>
            <p className="text-white/70 leading-relaxed">
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