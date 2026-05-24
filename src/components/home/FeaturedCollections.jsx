import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const collectionImages = [
  {
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/153ca4bfb_NEW_0380.jpg",
    title: "Autumn Essence",
    collection: "Second Skin"
  },
  {
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/91853f9fd_NEW_0369.jpg",
    title: "Urban Grace",
    collection: "Knitwear"
  },
  {
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/ef1c9fe26_NEW_0334.jpg",
    title: "Timeless Elegance",
    collection: "Second Skin"
  },
  {
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/9a5af2ef1_DSC_9534.jpg",
    title: "Soft Luxe",
    collection: "Outerwear"
  },
  {
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/42640d97b_DSC_8261.jpg",
    title: "Natural Beauty",
    collection: "Knitwear"
  },
  {
    url: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/b1065c1c8_DSC_8228.jpg",
    title: "Modern Classic",
    collection: "Accessories"
  }
];

export default function FeaturedCollections() {
  const scrollRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isAutoScrolling, setIsAutoScrolling] = useState(true);

  useEffect(() => {
    let interval;
    if (isAutoScrolling && scrollRef.current) {
      interval = setInterval(() => {
        const container = scrollRef.current;
        if (container.scrollLeft >= container.scrollWidth - container.clientWidth) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 350, behavior: "smooth" });
        }
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isAutoScrolling]);

  const scroll = (direction) => {
    setIsAutoScrolling(false);
    const container = scrollRef.current;
    const scrollAmount = direction === "left" ? -350 : 350;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    setTimeout(() => setIsAutoScrolling(true), 10000);
  };

  return (
    <section className="py-24 bg-[#F9F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 
            className="text-4xl sm:text-5xl text-[#414A37] mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Featured Collections
          </h2>
          <p className="text-[#414A37]/70 tracking-wider">
            Discover our curated selection of luxury knitwear
          </p>
        </motion.div>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors -ml-6"
          >
            <ChevronLeft className="w-6 h-6 text-[#414A37]" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/90 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors -mr-6"
          >
            <ChevronRight className="w-6 h-6 text-[#414A37]" />
          </button>

          {/* Scrollable Container */}
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
            style={{ scrollSnapType: "x mandatory" }}
            onMouseEnter={() => setIsAutoScrolling(false)}
            onMouseLeave={() => setIsAutoScrolling(true)}
          >
            {collectionImages.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex-shrink-0 w-[320px] group cursor-pointer"
                style={{ scrollSnapAlign: "start" }}
              >
                <div className="relative overflow-hidden rounded-lg aspect-[3/4]">
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500" />
                  
                  {/* Quick View Button */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    whileHover={{ scale: 1.05 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white px-6 py-3 rounded-full flex items-center gap-2 text-[#414A37] text-sm"
                    onClick={() => setSelectedImage(item)}
                  >
                    <Eye className="w-4 h-4" /> Quick View
                  </motion.button>

                  {/* Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
                    <p className="text-[#DBC2A6] text-xs uppercase tracking-wider mb-1">
                      {item.collection}
                    </p>
                    <h3 
                      className="text-white text-xl"
                      style={{ fontFamily: "'Cormorant Garamond', serif" }}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          {selectedImage && (
            <div className="grid md:grid-cols-2">
              <img
                src={selectedImage.url}
                alt={selectedImage.title}
                className="w-full h-full object-cover"
              />
              <div className="p-8 flex flex-col justify-center">
                <p className="text-[#B9744A] text-sm uppercase tracking-wider mb-2">
                  {selectedImage.collection}
                </p>
                <h3 
                  className="text-3xl text-[#414A37] mb-4"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {selectedImage.title}
                </h3>
                <p className="text-[#414A37]/70 mb-6">
                  Discover the artistry of luxury flat knitwear, where every stitch tells a story of craftsmanship and elegance.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

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