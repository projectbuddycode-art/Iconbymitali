import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { getProducts, getWishlist, removeFromWishlist } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Heart, ShoppingBag, Trash2, ArrowRight } from "lucide-react";

export default function Wishlist() {
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    setWishlistIds(getWishlist());
  }, []);

  // Keep in sync with changes from other tabs/components
  useEffect(() => {
    const sync = () => setWishlistIds(getWishlist());
    window.addEventListener("wishlistUpdated", sync);
    return () => window.removeEventListener("wishlistUpdated", sync);
  }, []);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleRemove = (productId) => {
    removeFromWishlist(productId);
    setWishlistIds(getWishlist());
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const addToCart = (product) => {
    const cart = JSON.parse(localStorage.getItem("icon_cart") || "[]");
    const existing = cart.find((i) => i.product_id === product.id && i.size === "M");
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        size: "M",
        quantity: 1,
        image: product.images?.[0] || "",
      });
    }
    localStorage.setItem("icon_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#F9F7F4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B9744A]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#F9F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl text-[#414A37] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            My Wishlist
          </h1>
          <p className="text-[#414A37]/70">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? "item" : "items"} saved
          </p>
        </motion.div>

        {wishlistProducts.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Heart className="w-16 h-16 text-[#DBC2A6] mx-auto mb-6" />
            <h2 className="text-2xl text-[#414A37] mb-4">Your wishlist is empty</h2>
            <p className="text-[#414A37]/70 mb-8">Save items you love for later.</p>
            <Link to={createPageUrl("Shop")} className="inline-flex items-center gap-2 px-8 py-4 bg-[#B9744A] text-white rounded-lg hover:bg-[#a5663f] transition-colors">
              Explore Shop <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            <AnimatePresence>
              {wishlistProducts.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl overflow-hidden shadow-sm group"
                >
                  <div className="relative aspect-[3/4]">
                    <img
                      src={product.images?.[0] || "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemove(product.id)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-5 h-5 text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <p className="text-[#B9744A] text-xs uppercase tracking-wider mb-1">
                      {product.collection || product.category}
                    </p>
                    <h3 className="text-lg text-[#414A37] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                      {product.name}
                    </h3>
                    <p className="text-[#414A37] font-medium mb-4">{formatPrice(product.price)}</p>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => addToCart(product)}
                      className="w-full py-3 bg-[#414A37] text-white text-sm uppercase tracking-wider rounded-lg flex items-center justify-center gap-2 hover:bg-[#353d2d] transition-colors"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to Cart
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}