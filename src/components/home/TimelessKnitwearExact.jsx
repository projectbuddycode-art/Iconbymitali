import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const fallbackItems = [
  { title: "Ivory Block Knit Top", description: "Relaxed V-neck cap sleeve in textured block knit", image: "https://media.base44.com/images/public/697e263b19f8bcf929a8b036/d1f739834_IMG_8970.png", collection: "Knitwear" },
  { title: "Sage Halter Maxi", description: "Open-knit halter maxi in soft sage — effortless resort style", image: "https://media.base44.com/images/public/697e263b19f8bcf929a8b036/b519c065b_Gemini_Generated_Image_es9dqmes9dqmes9d1.png", collection: "Resort" },
  { title: "Coastal Crochet Set", description: "Crochet bralette with ruffled knit mini skirt — made for the shore", image: "https://media.base44.com/images/public/697e263b19f8bcf929a8b036/5a0879b40_Gemini_Generated_Image_uenfv7uenfv7uenf1.png", collection: "Coastal" },
  { title: "Lemon Ruffle Skirt", description: "Butter yellow textured mini skirt with a signature ruffle hem", image: "https://media.base44.com/images/public/697e263b19f8bcf929a8b036/c222de8f7_Gemini_Generated_Image_j18yw0j18yw0j18y1.png", collection: "Summer Edit" },
  { title: "Olive Wave Knit Top", description: "Asymmetric one-shoulder knit in earthy olive — Mediterranean chic", image: "https://media.base44.com/images/public/697e263b19f8bcf929a8b036/9908c8070_Gemini_Generated_Image_gb6skjgb6skjgb6s.png", collection: "Resort" },
  { title: "Mocha Asymmetric Crop", description: "Wave-textured one-shoulder crop top in warm mocha", image: "https://media.base44.com/images/public/697e263b19f8bcf929a8b036/6eceb9eba_Gemini_Generated_Image_h1wbfah1wbfah1wb.png", collection: "Knitwear" }
];

export default function TimelessKnitwearExact() {
  const { data: dbItems = [] } = useQuery({
    queryKey: ["knitwear-items"],
    queryFn: () => base44.entities.KnitwearItem.list("sort_order", 50),
  });
  const knitwearItems = dbItems.length > 0 ? dbItems : fallbackItems;
  const scrollRef = useRef(null);
  const [isPaused, setIsPaused] = React.useState(false);
  const [animationTrigger, setAnimationTrigger] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setAnimationTrigger(prev => prev + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="flex items-center justify-center gap-4 sm:gap-6">
          {/* Left Animation */}
          <motion.div
            key={`left-line-${animationTrigger}`}
            initial={{ opacity: 0, x: -40, scaleX: 0 }}
            animate={{ opacity: 1, x: 0, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden sm:block h-1 w-12 bg-gradient-to-r from-[#b2985d] to-transparent rounded-full"
          />
          <motion.div
            key={`left-dot-${animationTrigger}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
            className="hidden sm:block w-2 h-2 rounded-full bg-[#b2985d]"
          />

          {/* Title Text */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.04,
                  delayChildren: 0.1
                }
              }
            }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#1a2a20] mb-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {"Timeless Knitwear".split("").map((char, i) => (
              <motion.span
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { type: "spring", stiffness: 120, damping: 12 }
                  }
                }}
                style={{ display: char === " " ? "inline" : "inline-block", marginRight: char === " " ? "0.25em" : "0" }}
              >
                {char}
              </motion.span>
            ))}
          </motion.div>

          {/* Right Animation */}
          <motion.div
            key={`right-dot-${animationTrigger}`}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3, type: "spring" }}
            className="hidden sm:block w-2 h-2 rounded-full bg-[#b2985d]"
          />
          <motion.div
            key={`right-line-${animationTrigger}`}
            initial={{ opacity: 0, x: 40, scaleX: 0 }}
            animate={{ opacity: 1, x: 0, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden sm:block h-1 w-12 bg-gradient-to-l from-[#b2985d] to-transparent rounded-full"
          />
        </div>
        <motion.p 
          initial={{ opacity: 0, y: -15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-[#b2985d] text-base sm:text-lg tracking-wider uppercase" 
          style={{ fontFamily: "'Lato', sans-serif" }}
        >
          Crafted for Eternity
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
            {[...knitwearItems, ...knitwearItems].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -50, rotateX: -20, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: index * 0.15, 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100,
                  damping: 15
                }}
                className="flex-shrink-0 w-[70vw] sm:w-[50vw] md:w-[35vh] lg:w-[45vh] group cursor-pointer"
                style={{ scrollSnapAlign: "start", perspective: "1000px" }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  rotateY: 5,
                  transition: { duration: 0.4, type: "spring", stiffness: 300 }
                }}
                animate={isPaused ? { scale: 1.02, y: -5 } : { scale: 1, y: 0 }}
              >
                <motion.div 
                  className="relative overflow-hidden rounded-xl aspect-[4/5] bg-[#F9F7F4] shadow-xl"
                  whileHover={{ 
                    boxShadow: "0 30px 60px -15px rgba(178, 152, 93, 0.5)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <motion.img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                    width="600"
                    height="750"
                    whileHover={{ scale: 1.2, rotate: 2 }}
                    transition={{ duration: 0.7, ease: [0.43, 0.13, 0.23, 0.96] }}
                  />
                  
                  {/* Gradient Overlay */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"
                    initial={{ opacity: 0.7 }}
                    whileHover={{ opacity: 0.5 }}
                    transition={{ duration: 0.3 }}
                  />

                  {/* Shine Effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full"
                    whileHover={{ 
                      translateX: ["0%", "200%"],
                      transition: { duration: 1, ease: "easeInOut" }
                    }}
                  />

                  {/* Animated Border */}
                  <motion.div
                    className="absolute inset-0 border-2 border-[#b2985d] rounded-xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { duration: 0.3 }
                    }}
                  />
                  
                  {/* Collection Badge */}
                  <motion.div 
                    className="absolute top-4 left-4"
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.3 }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <span className="bg-[#b2985d] text-white text-xs uppercase tracking-wider px-3 py-1 rounded-full shadow-lg">
                      {item.collection}
                    </span>
                  </motion.div>

                  {/* Corner Accents */}
                  <motion.div
                    className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-white/40 rounded-tr-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { duration: 0.3, delay: 0.1 }
                    }}
                  />
                  <motion.div
                    className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-white/40 rounded-bl-lg"
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: { duration: 0.3, delay: 0.1 }
                    }}
                  />

                  {/* Info */}
                  <motion.div 
                    className="absolute bottom-0 left-0 right-0 p-4 sm:p-6"
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.4 }}
                  >
                    <motion.h3 
                      className="text-white text-xl sm:text-2xl mb-2 font-semibold"
                      style={{ 
                        fontFamily: "'Playfair Display', serif",
                        textShadow: "2px 2px 8px rgba(0,0,0,0.4)"
                      }}
                      whileHover={{ 
                        x: 5,
                        textShadow: "3px 3px 12px rgba(0,0,0,0.6)",
                        transition: { duration: 0.2 }
                      }}
                    >
                      {item.title}
                    </motion.h3>
                    <motion.p 
                      className="text-white/90 text-xs sm:text-sm font-medium"
                      style={{ textShadow: "1px 1px 4px rgba(0,0,0,0.4)" }}
                      whileHover={{ 
                        x: 5,
                        transition: { duration: 0.2 }
                      }}
                    >
                      {item.description}
                    </motion.p>
                  </motion.div>

                  {/* Hover Glow */}
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    initial={{ opacity: 0 }}
                    whileHover={{ 
                      opacity: 1,
                      background: "radial-gradient(circle at center, rgba(178, 152, 93, 0.15) 0%, transparent 70%)",
                      transition: { duration: 0.4 }
                    }}
                  />
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      {/* Philosophy Card */}
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ 
            duration: 0.7,
            type: "spring",
            stiffness: 100
          }}
          whileHover={{ 
            scale: 1.02,
            boxShadow: "0 20px 40px -15px rgba(178, 152, 93, 0.3)",
            transition: { duration: 0.3 }
          }}
          className="mt-12 sm:mt-16 bg-gradient-to-br from-[#F9F7F4] to-[#E5D4B5] rounded-2xl p-6 sm:p-8 md:p-12 text-center shadow-lg"
        >
          <div className="max-w-3xl mx-auto">
            <h3 
              className="text-2xl sm:text-3xl md:text-4xl text-[#1a2a20] mb-4 sm:mb-6"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Crafted for Generations
            </h3>
            <p className="text-[#1a2a20]/80 text-base sm:text-lg leading-relaxed mb-3 sm:mb-4">
              Our knitwear transcends fleeting trends. Each piece is designed with an understanding 
              that true luxury lies in garments that improve with time, becoming softer, more 
              comfortable, and more uniquely yours with every wear.
            </p>
            <p className="text-[#1a2a20]/70 text-sm sm:text-base leading-relaxed">
              Using only the finest natural fibers and time-honored techniques, we create pieces 
              that celebrate both heritage and innovation, ensuring they remain relevant season 
              after season, year after year.
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