import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getPageSettings } from "@/api/apiClient";
import ProductCard from "../components/shop/ProductCard";
import QuickViewModal from "../components/shop/QuickViewModal";
import { Filter, X } from "lucide-react";

export default function Shop() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceRange, setSelectedPriceRange] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [heroMedia, setHeroMedia] = useState({ type: "image", url: "" });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  useEffect(() => {
    getPageSettings("shop").then((settings) => {
      const setting = Array.isArray(settings) ? settings[0] : settings;
      if (setting?.hero_video_url) {
        setHeroMedia({ type: "video", url: setting.hero_video_url });
      } else if (setting?.hero_image_url) {
        setHeroMedia({ type: "image", url: setting.hero_image_url });
      }
    }).catch(() => {});
  }, []);

  const categories = [
    { value: "all", label: "All" },
    { value: "knitwear", label: "Knitwear" },
    { value: "outerwear", label: "Outerwear" },
    { value: "accessories", label: "Accessories" },
  ];

  const priceRanges = [
    { value: "all", label: "All Prices" },
    { value: "under15k", label: "Under ₹15,000" },
    { value: "15to20k", label: "₹15,000 - ₹20,000" },
    { value: "over20k", label: "Over ₹20,000" },
  ];

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      selectedCategory === "all" || product.category === selectedCategory;
    let priceMatch = true;
    if (selectedPriceRange === "under15k") priceMatch = product.price < 15000;
    else if (selectedPriceRange === "15to20k")
      priceMatch = product.price >= 15000 && product.price <= 20000;
    else if (selectedPriceRange === "over20k") priceMatch = product.price > 20000;
    return categoryMatch && priceMatch;
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative h-[50vh] overflow-hidden"
      >
        {heroMedia.type === "video" && heroMedia.url ? (
          <motion.video
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover object-center"
          >
            <source src={heroMedia.url} type="video/mp4" />
          </motion.video>
        ) : (
          <motion.div
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0 bg-gradient-to-r from-[#1a2a20] via-[#2a4a38] to-[#1a2a20]"
          />
        )}
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl md:text-7xl text-white mb-4"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Shop
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-white/80 text-lg tracking-wider"
          >
            Discover our curated collection of luxury knitwear
          </motion.p>
        </div>
      </motion.section>

      {/* Filters */}
      <motion.section
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="sticky top-20 z-40 bg-white/95 backdrop-blur-md border-b border-[#DBC2A6]/30"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="hidden md:flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#414A37]" />
                <span className="text-sm text-[#414A37] uppercase tracking-wider">Filter:</span>
              </div>
              <div className="flex gap-4">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm uppercase tracking-wider transition-all duration-300 ${
                      selectedCategory === cat.value
                        ? "text-[#B9744A] border-b-2 border-[#B9744A]"
                        : "text-[#414A37]/70 hover:text-[#414A37]"
                    }`}
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
              <div className="w-px h-6 bg-[#DBC2A6]" />
              <div className="flex gap-4">
                {priceRanges.map((range) => (
                  <motion.button
                    key={range.value}
                    onClick={() => setSelectedPriceRange(range.value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`text-sm tracking-wider transition-all duration-300 ${
                      selectedPriceRange === range.value
                        ? "text-[#B9744A] border-b-2 border-[#B9744A]"
                        : "text-[#414A37]/70 hover:text-[#414A37]"
                    }`}
                  >
                    {range.label}
                  </motion.button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden flex items-center gap-2 text-[#414A37]"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
            </button>
            <p className="text-sm text-[#414A37]/60">{filteredProducts.length} products</p>
          </div>
        </div>
      </motion.section>

      {/* Mobile Filter Modal */}
      {isFilterOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/50 md:hidden"
          onClick={() => setIsFilterOpen(false)}
        >
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            className="absolute right-0 top-0 h-full w-80 bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-medium text-[#414A37]">Filters</h3>
              <button onClick={() => setIsFilterOpen(false)}>
                <X className="w-6 h-6 text-[#414A37]" />
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm uppercase tracking-wider text-[#414A37] mb-4">Category</h4>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`block w-full text-left py-2 ${
                      selectedCategory === cat.value ? "text-[#B9744A]" : "text-[#414A37]/70"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
              <div>
                <h4 className="text-sm uppercase tracking-wider text-[#414A37] mb-4">Price</h4>
                {priceRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => setSelectedPriceRange(range.value)}
                    className={`block w-full text-left py-2 ${
                      selectedPriceRange === range.value ? "text-[#B9744A]" : "text-[#414A37]/70"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Products Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] bg-[#F9F7F4] rounded-xl mb-4" />
                  <div className="h-4 bg-[#F9F7F4] rounded w-1/3 mb-2" />
                  <div className="h-5 bg-[#F9F7F4] rounded w-2/3 mb-2" />
                  <div className="h-4 bg-[#F9F7F4] rounded w-1/4" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#414A37]/60 text-lg">No products found matching your criteria.</p>
            </div>
          ) : (
            <motion.div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              {filteredProducts.map((product) => (
                <div key={product.id}>
                  <ProductCard product={product} onQuickView={setSelectedProduct} />
                </div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <QuickViewModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}