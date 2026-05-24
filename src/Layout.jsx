import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { createPageUrl } from "./utils";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Heart, Menu, X, ChevronDown, MessageCircle, Send, Instagram, Facebook, Twitter, Mail, Phone, MapPin, Plus, Minus } from "lucide-react";

/** @type {React.FC<{children: React.ReactNode, currentPageName: string}>} */
export default function Layout({ children, currentPageName }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [expandedFaq, setExpandedFaq] = useState(-1);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated, isLoadingAuth, isAdmin } = useAuth();

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("icon_cart") || "[]");
      /** @type {Array<{quantity: number}>} */
      const cartArray = cart;
      setCartCount(cartArray.reduce((sum, item) => sum + (item?.quantity || 0), 0));
    };
    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  useEffect(() => {
    const updateWishlistCount = () => {
      const list = JSON.parse(localStorage.getItem("icon_wishlist") || "[]");
      setWishlistCount(list.length);
    };
    updateWishlistCount();
    window.addEventListener("wishlistUpdated", updateWishlistCount);
    return () => window.removeEventListener("wishlistUpdated", updateWishlistCount);
  }, []);

  const navLinks = [
    { name: "Home", page: "Home" },
    { name: "Shop", page: "Shop" },
    { name: "About", page: "About" },
    { name: "Lookbook", page: "Lookbook" },
    { name: "Blog", page: "Blog" },
  ];

  const faqs = [
    { q: "What materials do you use?", a: "We are currently working with 100% cotton suitable for the seasonal collections." },
    { q: "Do you ship internationally?", a: "Currently we ship within India. International shipping coming soon." },
    { q: "What is your return policy?", a: "15-day returns on unworn items with tags attached." },
    { q: "How do I care for knitwear?", a: "Hand wash in cold water or dry clean. Lay flat to dry." }
  ];

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      setChatMessage("");
    }
  };

  // Memoize FAQs to avoid recalculation
  const memoizedFaqs = React.useMemo(() => faqs, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Open Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Lato:wght@300;400;700&family=Open+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Roboto:wght@300;400;500;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

        :root {
          --primary-green: #2C3E2A;
          --primary-tan: #D4AF37;
          --primary-beige: #E5D4B5;
        }

        * {
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        body {
          font-feature-settings: "kern" 1, "liga" 1;
          text-rendering: optimizeLegibility;
        }

        * {
          will-change: auto;
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a2a20]/95 backdrop-blur-md shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to={createPageUrl("Home")} className="flex-shrink-0 flex items-center">
              <motion.img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/010f7c59a_WhatsAppImage2026-02-05at020120.jpg"
                alt="ICON by Mitali Dhumal"
                className="h-14 sm:h-16 w-auto object-contain"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <motion.div key={link.page} whileHover={{ y: -2 }} transition={{ duration: 0.2 }}>
                  <Link
                    to={createPageUrl(link.page)}
                    className={`text-sm tracking-wider uppercase transition-all duration-300 hover:text-[#b2985d] text-[#d4c4a8] ${
                      currentPageName === link.page ? "border-b-2 border-[#b2985d] pb-1" : ""
                    }`}
                    style={{ fontFamily: "'Lato', sans-serif" }}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              
              {/* Contact Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsContactOpen(!isContactOpen)}
                  className="flex items-center text-sm tracking-wider uppercase transition-all duration-300 hover:text-[#b2985d] text-[#d4c4a8]"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  Contact <ChevronDown className="w-4 h-4 ml-1" />
                </button>
                <AnimatePresence>
                  {isContactOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full right-0 mt-2 w-64 bg-white shadow-xl rounded-lg p-4"
                      onMouseLeave={() => setIsContactOpen(false)}
                    >
                      <div className="space-y-3 text-sm text-[#1a2a20]">
                        <a href="mailto:info@iconbymitalidhumal.com" className="flex items-center gap-2 hover:text-[#b2985d] transition-colors">
                          <Mail className="w-4 h-4" /> info@iconbymitalidhumal.com
                        </a>
                        <a href="tel:+91 9021126552" className="flex items-center gap-2 hover:text-[#b2985d] transition-colors">
                          <Phone className="w-4 h-4" /> +91 9021126552
                        </a>
                        <p className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" /> Nasik, Maharashtra India
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Icons */}
            <div className="flex items-center space-x-4">
              {user && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Link to={createPageUrl("Wishlist")} className="relative block">
                    <Heart className="w-5 h-5 text-[#d4c4a8] hover:text-[#b2985d] transition-colors duration-300" />
                    {wishlistCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-[#b2985d] text-white text-xs rounded-full flex items-center justify-center"
                      >
                        {wishlistCount}
                      </motion.span>
                    )}
                  </Link>
                </motion.div>
              )}
              
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Link to={createPageUrl("Cart")} className="relative block">
                  <ShoppingBag className="w-5 h-5 text-[#d4c4a8] hover:text-[#b2985d] transition-colors duration-300" />
                  {cartCount > 0 && (
                    <motion.span 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-[#b2985d] text-white text-xs rounded-full flex items-center justify-center"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </Link>
              </motion.div>

              {(user?.role === "admin" || isAdmin) && (
                <Link 
                  to={createPageUrl("AdminDashboard")}
                  className="text-xs tracking-wider uppercase transition-colors text-[#d4c4a8] hover:text-[#b2985d] hidden sm:block"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  Admin
                </Link>
              )}

              {!isAuthenticated && !isLoadingAuth ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/login')}
                  className="text-xs tracking-wider uppercase transition-colors text-[#d4c4a8] hover:text-[#b2985d] border border-[#d4c4a8]/40 hover:border-[#b2985d] px-3 py-1.5 rounded hidden sm:block"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  Login
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    await logout();
                    navigate('/');
                  }}
                  className="text-xs tracking-wider uppercase transition-colors text-[#d4c4a8] hover:text-[#b2985d] hidden sm:block"
                  style={{ fontFamily: "'Lato', sans-serif" }}
                >
                  Logout
                </motion.button>
              )}

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6 text-[#d4c4a8]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#d4c4a8]" />
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#1a2a20] border-t border-[#DBC2A6]/20"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.page}
                    to={createPageUrl(link.page)}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-[#DBC2A6] text-lg tracking-wider hover:text-[#B9744A] transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
                {user?.role === "admin" && (
                  <Link
                    to={createPageUrl("AdminDashboard")}
                    onClick={() => setIsMenuOpen(false)}
                    className="block text-[#B9744A] text-lg tracking-wider"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="pt-4 border-t border-[#d4c4a8]/20 space-y-2 text-sm text-[#d4c4a8]">
                  <a href="mailto:info@iconbymitalidhumal.com" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-300">
                    <Mail className="w-4 h-4" /> info@iconbymitalidhumal.com
                  </a>
                  <a href="tel:+91 9021126552" className="flex items-center gap-2 hover:text-white hover:translate-x-1 transition-all duration-300">
                    <Phone className="w-4 h-4" /> +91 9021126552
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a2a20] text-white pt-8 pb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
            {/* Brand */}
            <div className="lg:col-span-2">
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/010f7c59a_WhatsAppImage2026-02-05at020120.jpg"
                alt="ICON by Mitali Dhumal"
                className="h-10 mb-2 object-contain brightness-125"
              />
              <p className="text-white/70 text-xs leading-relaxed mb-3">
                Luxury flat knitwear crafted in India with sustainable practices and timeless design.
              </p>
              <div className="flex space-x-3">
                <motion.a 
                  href="https://instagram.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="text-white/70 hover:text-[#b2985d] transition-colors duration-300"
                >
                  <Instagram className="w-4 h-4" />
                </motion.a>
                <motion.a 
                  href="https://facebook.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="text-white/70 hover:text-[#b2985d] transition-colors duration-300"
                >
                  <Facebook className="w-4 h-4" />
                </motion.a>
                <motion.a 
                  href="https://twitter.com" 
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="text-white/70 hover:text-[#b2985d] transition-colors duration-300"
                >
                  <Twitter className="w-4 h-4" />
                </motion.a>
              </div>
            </div>

            {/* Collections */}
            <div>
            <h4 className="text-xs uppercase tracking-wider mb-2 text-white/90">Collections</h4>
            <ul className="space-y-1 text-white/70 text-xs">
              <li><Link to={createPageUrl("Shop")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">All Products</Link></li>
              <li><Link to={createPageUrl("Shop")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">Knitwear</Link></li>
              <li><Link to={createPageUrl("Shop")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">Outerwear</Link></li>
              <li><Link to={createPageUrl("Shop")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">Accessories</Link></li>
            </ul>
            </div>

            {/* Information */}
            <div>
              <h4 className="text-xs uppercase tracking-wider mb-2 text-white/90">Information</h4>
              <ul className="space-y-1 text-white/70 text-xs">
                <li><Link to={createPageUrl("About")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">About Us</Link></li>
                <li><Link to={createPageUrl("Policies")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">Shipping & Returns</Link></li>
                <li><Link to={createPageUrl("Policies")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">Size Guide</Link></li>
                <li><Link to={createPageUrl("Policies")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">Care Instructions</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-xs uppercase tracking-wider mb-2 text-white/90">Legal</h4>
              <ul className="space-y-1 text-white/70 text-xs">
                <li><Link to={createPageUrl("Policies")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">Company Policies</Link></li>
                <li><Link to={createPageUrl("Policies")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">Privacy Policy</Link></li>
                <li><Link to={createPageUrl("Policies")} className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="border-t border-white/20 pt-4 mb-4">
            <h4 className="text-xs uppercase tracking-wider mb-2 text-white/90">FAQ</h4>
            <div className="space-y-1">
              {faqs.map((faq, index) => (
                <div key={index} className="border-b border-white/10">
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? -1 : index)}
                    className="w-full flex items-center justify-between py-2 text-left text-white/70 hover:text-white transition-all duration-300"
                  >
                    <span className="text-xs">{faq.q}</span>
                    <motion.div
                      animate={{ rotate: expandedFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {expandedFaq === index ? (
                        <Minus className="w-4 h-4" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {expandedFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-xs text-white/60 pb-2">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="border-t border-white/20 pt-4 mb-4">
            <h4 className="text-xs uppercase tracking-wider mb-2 text-white/90">Contact</h4>
            <ul className="space-y-1.5 text-white/70 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" /> 
                <a href="mailto:info@iconbymitalidhumal.com" className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">
                  info@iconbymitalidhumal.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" /> 
                <a href="tel:+91 9021126552" className="hover:text-white hover:translate-x-1 transition-all duration-300 inline-block">
                  +91 9021126552
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Nasik, Maharashtra India
              </li>
            </ul>
          </div>

          <div className="border-t border-white/20 pt-4 text-center text-white/50 text-xs">
            <p>© {new Date().getFullYear()} ICON by Mitali Dhumal. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Floating Chat Widget - hidden for admins */}
      {user?.role !== "admin" && <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isChatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="absolute bottom-16 right-0 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="bg-[#2C3E2A] p-4 text-white">
                <h4 className="font-medium">Chat with us</h4>
                <p className="text-sm text-white/70">We typically reply within minutes</p>
              </div>
              <div className="p-4 h-64 bg-gray-50 overflow-y-auto">
                <div className="bg-white rounded-lg p-3 shadow-sm mb-4">
                  <p className="text-sm text-[#414A37]">Hello! How can we help you today?</p>
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatMessage}
                    onChange={(e) => {
                      if (e.target.value.length <= 150) {
                        setChatMessage(e.target.value);
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border rounded-full text-sm focus:outline-none focus:border-[#b2985d]"
                    maxLength={150}
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-10 h-10 bg-[#B9744A] text-white rounded-full flex items-center justify-center hover:bg-[#a5663f] transition-colors duration-300"
                  >
                    <Send className="w-4 h-4" />
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 mt-1 text-right">
                  {chatMessage.length}/150
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="w-14 h-14 bg-[#2C3E2A] text-white rounded-full shadow-lg flex items-center justify-center"
        >
          {isChatOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
        </motion.button>
      </div>}
    </div>
  );
}