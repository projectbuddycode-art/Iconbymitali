import React from "react";
import { motion } from "framer-motion";
import { getBlogPosts } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowRight, Calendar, User } from "lucide-react";

export default function Blog() {
  React.useEffect(() => { window.scrollTo(0, 0); }, []);

  // GET /api/blog-posts?published=true
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: getBlogPosts,
  });

  return (
    <div className="min-h-screen">
      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} className="pt-32 pb-16 bg-[#F9F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-5xl sm:text-6xl text-[#414A37] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Journal
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }} className="text-[#414A37]/70 text-lg max-w-2xl mx-auto">
            Stories, inspirations, and insights from the world of ICON
          </motion.p>
        </div>
      </motion.section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/3] bg-[#F9F7F4] rounded-xl mb-4" />
                  <div className="h-4 bg-[#F9F7F4] rounded w-1/3 mb-3" />
                  <div className="h-6 bg-[#F9F7F4] rounded w-3/4 mb-2" />
                  <div className="h-4 bg-[#F9F7F4] rounded w-full" />
                </div>
              ))}
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[#414A37]/60 text-lg mb-4">No blog posts yet.</p>
              <p className="text-[#414A37]/40">Check back soon for stories and updates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08, duration: 0.5 }}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                >
                  <div className="relative overflow-hidden rounded-xl aspect-[4/3] mb-6 shadow-lg hover:shadow-2xl transition-shadow duration-300">
                    <img
                      src={post.image || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600"}
                      alt={post.title}
                      className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                    {post.featured && (
                      <div className="absolute top-4 left-4 bg-[#B9744A] text-white text-xs uppercase tracking-wider px-3 py-1 rounded-full">Featured</div>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-[#414A37]/60 text-sm mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {post.created_date ? format(new Date(post.created_date), "MMM d, yyyy") : "Recently"}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {post.author || "Mitali Dhumal"}
                    </span>
                  </div>
                  <h2 className="text-2xl text-[#414A37] mb-3 group-hover:text-[#B9744A] transition-colors duration-300" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                    {post.title}
                  </h2>
                  <p className="text-[#414A37]/70 mb-4 line-clamp-3">
                    {post.excerpt || post.content?.substring(0, 150) + "..."}
                  </p>
                  <span className="inline-flex items-center gap-2 text-[#B9744A] text-sm uppercase tracking-wider group-hover:gap-4 transition-all duration-300">
                    Read More <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </span>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}