import React, { useState } from "react";
import { X as XIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/api/apiClient";

export default function QuickViewModal({ product, isOpen, onClose }) {
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  React.useEffect(() => {
    if (product) {
      setSelectedSize(null);
      setCurrentImageIndex(0);
      setWishlisted(isInWishlist(product.id));
      setShowSizeChart(false);
    }
  }, [product?.id]);

  if (!product) return null;

  const images = product.images || [];

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(price);

  const addToCart = () => {
    if (!selectedSize) { alert("Please select a size"); return; }
    const cart = JSON.parse(localStorage.getItem("icon_cart") || "[]");
    const existing = cart.find((i) => i.product_id === product.id && i.size === selectedSize);
    if (existing) { existing.quantity += 1; }
    else {
      cart.push({ product_id: product.id, product_name: product.name, price: product.price, size: selectedSize, quantity: 1, image: images[0] || "" });
    }
    localStorage.setItem("icon_cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
    onClose();
  };

  const toggleWishlist = () => {
    if (wishlisted) { removeFromWishlist(product.id); }
    else { addToWishlist(product.id); }
    setWishlisted(!wishlisted);
    window.dispatchEvent(new Event("wishlistUpdated"));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 bg-white/90 rounded-full flex items-center justify-center hover:bg-white shadow"
            >
              <X className="w-5 h-5 text-[#414A37]" />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Image Gallery */}
              <div className="relative aspect-[3/4] bg-[#F9F7F4] rounded-t-2xl md:rounded-l-2xl md:rounded-tr-none overflow-hidden">
                {images.length > 0 ? (
                  <img
                    key={`${product.id}-${currentImageIndex}`}
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#414A37]/40">No image</div>
                )}
                {images.length > 1 && (
                  <>
                    <button onClick={() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => setCurrentImageIndex((i) => (i + 1) % images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                      {images.map((_, i) => (
                        <button key={i} onClick={() => setCurrentImageIndex(i)}
                          className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? "bg-white" : "bg-white/50"}`} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Product Details */}
              <div className="p-6 flex flex-col gap-4">
                <div>
                  <p className="text-[#B9744A] text-xs uppercase tracking-wider mb-1">{product.collection || product.category}</p>
                  <h2 className="text-2xl text-[#414A37] mb-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>{product.name}</h2>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xl font-medium text-[#414A37]">{formatPrice(product.price)}</span>
                    {product.original_price && product.original_price > product.price && (
                      <>
                        <span className="text-sm text-[#414A37]/50 line-through">{formatPrice(product.original_price)}</span>
                        <span className="text-xs bg-[#B9744A] text-white px-2 py-0.5 rounded-full">
                          {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {product.description && (
                  <p className="text-sm text-[#414A37]/70 leading-relaxed">{product.description}</p>
                )}

                {/* Size Selection */}
                {product.sizes?.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm uppercase tracking-wider text-[#414A37]">Size</p>
                      <button onClick={() => setShowSizeChart(true)} className="text-xs text-[#B9744A] underline underline-offset-2">
                        Size Chart
                      </button>
                    </div>

                    {/* Inline Size Chart */}
                    {showSizeChart && (
                      <div className="relative border border-[#DBC2A6] rounded-xl p-4 bg-[#F9F7F4] mb-2">
                        <button onClick={() => setShowSizeChart(false)} className="absolute top-2 right-2 text-[#414A37]/50 hover:text-[#414A37]">
                          <XIcon className="w-4 h-4" />
                        </button>
                        <p className="text-xs font-semibold text-[#414A37] uppercase tracking-wider mb-3">Size Guide <span className="text-[#414A37]/50 normal-case font-normal">(inches)</span></p>
                        <table className="w-full text-xs border-collapse">
                          <thead>
                            <tr className="bg-[#1a2a20] text-white">
                              <th className="px-3 py-2 text-left rounded-tl-lg">Size</th>
                              <th className="px-3 py-2 text-left">Chest</th>
                              <th className="px-3 py-2 text-left">Waist</th>
                              <th className="px-3 py-2 text-left rounded-tr-lg">Hips</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { size: "XS", chest: "32–33", waist: "24–25", hips: "34–35" },
                              { size: "S",  chest: "34–35", waist: "26–27", hips: "36–37" },
                              { size: "M",  chest: "36–37", waist: "28–29", hips: "38–39" },
                              { size: "L",  chest: "38–40", waist: "30–32", hips: "40–42" },
                              { size: "XL", chest: "41–43", waist: "33–35", hips: "43–45" },
                            ].map((row, i) => (
                              <tr key={row.size} className={i % 2 === 0 ? "bg-white" : "bg-[#F9F7F4]"}>
                                <td className="px-3 py-2 font-semibold text-[#414A37]">{row.size}</td>
                                <td className="px-3 py-2 text-[#414A37]/80">{row.chest}</td>
                                <td className="px-3 py-2 text-[#414A37]/80">{row.waist}</td>
                                <td className="px-3 py-2 text-[#414A37]/80">{row.hips}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`w-12 h-10 border text-sm font-medium rounded-lg transition-all ${
                            selectedSize === size
                              ? "border-[#414A37] bg-[#414A37] text-white"
                              : "border-[#DBC2A6] text-[#414A37] hover:border-[#414A37]"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-auto pt-2">
                  <button
                    onClick={addToCart}
                    className="flex-1 bg-[#414A37] text-white py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#2C3E2A] transition-colors text-sm font-medium"
                  >
                    <ShoppingBag className="w-4 h-4" /> Add to Cart
                  </button>
                  <button
                    onClick={toggleWishlist}
                    className="w-12 h-12 border border-[#DBC2A6] rounded-xl flex items-center justify-center hover:border-[#B9744A] transition-colors"
                  >
                    <Heart className={`w-5 h-5 ${wishlisted ? "fill-[#B9744A] text-[#B9744A]" : "text-[#414A37]"}`} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}