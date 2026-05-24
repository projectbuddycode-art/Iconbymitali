import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { useAuth } from "@/lib/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, ShoppingCart, MessageSquare, FileText, LayoutDashboard, ArrowLeft, Layers, Tag, LogOut } from "lucide-react";
import ProductsTab from "../components/admin/ProductsTab";
import OrdersTab from "../components/admin/OrdersTab";
import ContactsTab from "../components/admin/ContactsTab";
import BlogTab from "../components/admin/BlogTab";
import KnitwearTab from "../components/admin/KnitwearTab";
import CouponsTab from "../components/admin/CouponsTab";

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check admin status
    if (!isAdmin) {
      navigate("/");
      return;
    }
    setIsLoading(false);
  }, [isAdmin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#F9F7F4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B9744A]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-[#F9F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-[#B9744A]" />
              <h1 
                className="text-3xl sm:text-4xl text-[#414A37]"
                style={{ fontFamily: "'Cormorant Garamond', serif" }}
              >
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to={createPageUrl("Home")}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-[#414A37] rounded-lg hover:bg-[#414A37] hover:text-white transition-all duration-300 shadow-sm"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm">Back</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-300 shadow-sm"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Logout</span>
                </button>
              </motion.div>
            </div>
          </div>
          <p className="text-[#414A37]/60">
            Welcome back, {user?.full_name || user?.email || "Admin"}
          </p>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-white shadow-sm p-1 rounded-xl overflow-x-auto flex">
            <TabsTrigger 
              value="products" 
              className="data-[state=active]:bg-[#414A37] data-[state=active]:text-white px-4 md:px-6 text-sm"
            >
              <Package className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Products</span>
              <span className="sm:hidden">Prod</span>
            </TabsTrigger>
            <TabsTrigger 
              value="orders"
              className="data-[state=active]:bg-[#414A37] data-[state=active]:text-white px-4 md:px-6 text-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">Ord</span>
            </TabsTrigger>
            <TabsTrigger 
              value="coupons"
              className="data-[state=active]:bg-[#414A37] data-[state=active]:text-white px-4 md:px-6 text-sm"
            >
              <Tag className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Coupons</span>
              <span className="sm:hidden">Coup</span>
            </TabsTrigger>
            <TabsTrigger 
              value="blog"
              className="data-[state=active]:bg-[#414A37] data-[state=active]:text-white px-4 md:px-6 text-sm"
            >
              <FileText className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Blog</span>
            </TabsTrigger>
            <TabsTrigger 
              value="knitwear"
              className="data-[state=active]:bg-[#414A37] data-[state=active]:text-white px-4 md:px-6 text-sm"
            >
              <Layers className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Knitwear</span>
              <span className="sm:hidden">Knit</span>
            </TabsTrigger>
            <TabsTrigger 
              value="contacts"
              className="data-[state=active]:bg-[#414A37] data-[state=active]:text-white px-4 md:px-6 text-sm"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Contacts</span>
              <span className="sm:hidden">Cont</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>

          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>

          <TabsContent value="coupons">
            <CouponsTab />
          </TabsContent>

          <TabsContent value="blog">
            <BlogTab />
          </TabsContent>

          <TabsContent value="knitwear">
            <KnitwearTab />
          </TabsContent>

          <TabsContent value="contacts">
            <ContactsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}