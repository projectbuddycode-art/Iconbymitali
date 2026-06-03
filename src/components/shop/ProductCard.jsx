import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Eye, ShoppingBag } from "lucide-react";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/api/apiClient";

export default function ProductCard({ product, onQuickView }) {
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(isInWishlist(product.id));
  }, [product.id]);

  const toggleWishlist = (e) => {
    e.stopPropagation();
    if (wishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
    setWishlisted(!wishlisted);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  const addToCart = (e) => {
    e.stopPropagation();
    const cart = JSON.parse(localStorage.getItem("icon_cart") || "[]");
    const existingItem = cart.find(
      (item) => item.product_id === product.id && item.size === "M"
    );
    if (existingItem) {
      existingItem.quantity += 1;
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

  const optimizeImage = (url) => {
    if (!url) return url;
    if (url.includes("supabase.co/storage/v1/object/public/")) {
      return url.replace("/object/public/", "/object/public/").replace(/\?.*$/, "") + "?width=600&quality=75&resize=cover";
    }
    return url;
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <div
      className="group cursor-pointer"
      onClick={() => onQuickView(product)}
    >
      <div className="relative overflow-hidden rounded-xl aspect-[3/4] bg-[#F9F7F4]">
        <img
          src={optimizeImage(product.images?.[0]) || "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600"}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

        <button
          onClick={toggleWishlist}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white"
        >
          <Heart
            className={`w-5 h-5 ${wishlisted ? "fill-[#B9744A] text-[#B9744A]" : "text-[#414A37]"}`}
          />
        </button>

        <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
            className="flex-1 bg-white py-3 rounded-lg flex items-center justify-center gap-2 text-[#414A37] text-sm font-medium hover:bg-[#F9F7F4] transition-colors"
          >
            <Eye className="w-4 h-4" /> Quick View
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addToCart}
            className="w-12 bg-[#B9744A] py-3 rounded-lg flex items-center justify-center text-white hover:bg-[#a5663f] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
          </motion.button>
        </div>

        {product.featured && (
          <div className="absolute top-4 left-4 bg-[#414A37] text-white text-xs uppercase tracking-wider px-3 py-1 rounded-full">
            Featured
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-[#B9744A] text-xs uppercase tracking-wider mb-1">
          {product.collection || product.category}
        </p>
        <h3
          className="text-lg text-[#414A37] mb-2 group-hover:text-[#B9744A] transition-colors"
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
        >
          {product.name}
        </h3>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-[#414A37] font-medium">{formatPrice(product.price)}</p>
          {product.original_price && product.original_price > product.price && (
            <>
              <p className="text-[#414A37]/50 text-sm line-through">{formatPrice(product.original_price)}</p>
              <span className="text-xs bg-[#B9744A] text-white px-2 py-0.5 rounded-full font-medium">
                {Math.round((1 - product.price / product.original_price) * 100)}% OFF
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}