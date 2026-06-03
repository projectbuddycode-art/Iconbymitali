import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getLookbookProducts } from "@/api/apiClient";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

const fallbackImages = [
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/64347dffa_IMG_6371.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/76f43ec19_IMG_6375.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/807c43155_IMG_6373.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/9a5af2ef1_DSC_9534.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/42640d97b_DSC_8261.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/b1065c1c8_DSC_8228.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/4eb303846_IMG_6369.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/665684b67_IMG_4919JPG1.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/93ef8efe7_Look4gaboonviper.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/cc1b15a48_DSC_9895.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/8dc2f7295_DSC_9679.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/2c1964195_DSC_9884.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/65b200d90_Look4gaboonviper.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/99db9b4b4_DSC_9895.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/eca36d70c_DSC_9884.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/1fa055af1_DSC_9679.jpg",
];

export default function Lookbook() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // GET /api/products?show_in_lookbook=true
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["lookbook-products"],
    queryFn: getLookbookProducts,
  });

  const optimizeImage = (url) => {
    if (!url) return url;
    if (url.includes("supabase.co/storage/v1/object/public/")) {
      return url.replace(/\?.*$/, "") + "?width=600&quality=75&resize=cover";
    }
    return url;
  };

  const apiImages = products.flatMap((p) => p.images || []).filter(Boolean);
  const rawImages = apiImages.length > 0 ? apiImages : fallbackImages;
  const displayImages = rawImages.map(optimizeImage);

  const openLightbox = (index) => { setCurrentIndex(index); setSelectedImage(displayImages[index]); };
  const closeLightbox = () => setSelectedImage(null);
  const nextImage = () => { const i = (currentIndex + 1) % displayImages.length; setCurrentIndex(i); setSelectedImage(displayImages[i]); };
  const prevImage = () => { const i = (currentIndex - 1 + displayImages.length) % displayImages.length; setCurrentIndex(i); setSelectedImage(displayImages[i]); };

  return (
    <div className="min-h-screen">
      <section className="pt-32 pb-16 bg-[#F9F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl sm:text-6xl text-[#1a2a20] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Lookbook
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[#1a2a20]/70 text-lg max-w-2xl mx-auto">
            Explore our collections through curated imagery
          </motion.p>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => <div key={i} className="aspect-[3/4] bg-[#F9F7F4] rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.04 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayImages.map((img, index) => (
                <motion.div
                  key={index}
                  variants={{ hidden: { opacity: 0, y: -30, scale: 0.9 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                  transition={{ duration: 0.5, delay: Math.min(index * 0.04, 0.4), type: "spring", stiffness: 80 }}
                  whileHover={{ y: -12, scale: 1.03, transition: { duration: 0.4 } }}
                  className="group relative overflow-hidden rounded-xl cursor-pointer aspect-[3/4] shadow-lg hover:shadow-2xl transition-shadow duration-300"
                  onClick={() => openLightbox(index)}
                  style={{ perspective: "1000px" }}
                >
                  <motion.img src={img} alt={`Lookbook ${index + 1}`} loading="lazy" decoding="async" className="w-full h-full object-cover object-center" whileHover={{ scale: 1.2, rotate: 2 }} transition={{ duration: 0.7, ease: "easeOut" }} />
                  <motion.div initial={{ opacity: 0 }} whileHover={{ opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" initial={{ x: "-100%", opacity: 0 }} whileHover={{ x: "100%", opacity: 1 }} transition={{ duration: 0.8 }} />
                  <motion.div className="absolute inset-0 border-2 border-[#b2985d] rounded-xl" initial={{ opacity: 0, scale: 0.95 }} whileHover={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} />
                  <motion.div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#b2985d] rounded-tl-lg" initial={{ opacity: 0, scale: 0 }} whileHover={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }} />
                  <motion.div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#b2985d] rounded-br-lg" initial={{ opacity: 0, scale: 0 }} whileHover={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, delay: 0.1 }} />
                  <motion.div initial={{ opacity: 0, scale: 0.5 }} whileHover={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0 flex items-center justify-center">
                    <motion.div whileHover={{ scale: 1.2, rotate: 90 }} transition={{ duration: 0.4 }} className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl">
                      <ZoomIn className="w-7 h-7 text-[#1a2a20]" />
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center" onClick={closeLightbox}>
            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={closeLightbox} className="absolute top-6 right-6 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <X className="w-6 h-6 text-white" />
            </motion.button>
            <motion.button initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.1, x: -5 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>
            <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.1, x: 5 }} whileTap={{ scale: 0.9 }} onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
            <motion.img key={selectedImage} initial={{ opacity: 0, scale: 0.85, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.85, y: 20 }} transition={{ duration: 0.4, ease: "easeOut" }} src={selectedImage} alt="Lookbook" loading="lazy" decoding="async" className="max-w-[90vw] max-h-[90vh] object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}