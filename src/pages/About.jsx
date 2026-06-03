import React from "react";
import { motion } from "framer-motion";

const galleryImages = [
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/153ca4bfb_NEW_0380.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/91853f9fd_NEW_0369.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/ef1c9fe26_NEW_0334.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/9a5af2ef1_DSC_9534.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/42640d97b_DSC_8261.jpg",
  "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68e1aa0ef5cb8ce86c31cdbd/b1065c1c8_DSC_8228.jpg"
];

export default function About() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen">
      {/* Compact Hero */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="pt-32 pb-16 bg-cover bg-center bg-no-repeat relative"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 bg-[#414A37]/80" 
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl sm:text-6xl text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            About ICON
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-white/90 text-lg max-w-2xl mx-auto"
          >
            Crafting timeless luxury knitwear with intention and purpose
          </motion.p>
        </div>
      </motion.section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#B9744A] text-sm uppercase tracking-[0.3em] mb-4 block">
                Our Vision
              </span>
              <h2 
                className="text-3xl sm:text-4xl text-[#414A37] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Making Knitwear Essential
              </h2>
              <p className="text-[#414A37]/80 leading-relaxed text-lg">
                To make knitwear the new essential — iconic, effortless, and part of every wardrobe. 
                We envision a world where luxury fashion exists in harmony with nature, where quality 
                transcends trends, and where every piece becomes a timeless treasure.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[#B9744A] text-sm uppercase tracking-[0.3em] mb-4 block">
                Our Mission
              </span>
              <h2 
                className="text-3xl sm:text-4xl text-[#414A37] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Balance & Empowerment
              </h2>
              <p className="text-[#414A37]/80 leading-relaxed text-lg">
                We design modern knits that balance comfort, breathability, and style, empowering you 
                to feel iconic every day. Our commitment extends beyond fashion – it's about creating 
                pieces that honor both the wearer and the artisan, the present and the future.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Founder's Story */}
      <section className="py-20 bg-[#F9F7F4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              whileHover={{ scale: 1.02 }}
              className="overflow-hidden rounded-2xl shadow-xl"
            >
              <img
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/64305d305_WhatsAppImage2026-02-03at120015AM.jpeg"
                alt="Mitali V. Dhumal"
                className="w-full h-[600px] object-cover object-top transition-transform duration-700 hover:scale-105"
                loading="lazy"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.span 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="text-[#B9744A] text-sm uppercase tracking-[0.3em] mb-4 block"
              >
                Founder's Story
              </motion.span>
              <h2 
                className="text-3xl sm:text-4xl text-[#414A37] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                A Journey in Thread
              </h2>
              <div className="space-y-4 text-[#414A37]/80 leading-relaxed">
                <p>
                  I stumbled into knitwear without really knowing what it was and quickly found myself fascinated by it. The more I learned, the more I realized that knits weren't just fabrics, but structures you could design, engineer, and sculpt into something that feels alive on the body. Flat knits, especially, captured me with their mix of creativity and precision, every loop and stitch became a way to problem-solve and create.
                </p>
                <p>
                  What started as curiosity soon grew into expertise. During my Bachelor's in Design at NIFT Mumbai, I immersed myself in the technicalities of knitwear, mastering the balance between imagination and craft. Knits turned from a subject into my passion, teaching me patience, innovation, and the art of creating clothes that feel like a second skin.
                </p>
                <p>
                  With ICON, I carry forward that journey, building modern flat-knit garments that merge comfort, luxury, and individuality.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Designer's Vision Gallery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <span className="text-[#B9744A] text-sm uppercase tracking-[0.3em] mb-4 block">
              Designer's Vision
            </span>
            <h2 
              className="text-3xl sm:text-4xl text-[#414A37]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Inspiration in Every Stitch
            </h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/93ef8efe7_Look4gaboonviper.jpg",
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/cc1b15a48_DSC_9895.jpg",
              "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/8dc2f7295_DSC_9679.jpg"
            ].map((img, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300"
              >
                <img
                  src={img}
                  alt={`Designer Vision ${index + 1}`}
                  className="w-full h-96 object-cover object-top transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Second Skin Collection Philosophy */}
      <section className="py-24 bg-gradient-to-br from-[#1a2a20] to-[#0f1a14]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-[#C4A484] text-sm uppercase tracking-[0.3em] mb-4 block">
              The Concept
            </span>
            <h2 
              className="text-4xl sm:text-5xl text-white mb-8"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              The Second Skin Collection
            </h2>
            <div className="space-y-6 text-white/80 text-lg leading-relaxed">
              <p>
                The inspiration for our Second Skin collection comes from an unexpected source – the graceful 
                way reptiles shed their skin, revealing something new yet inherently themselves. This natural 
                process of renewal and transformation mirrors what we envision for our knitwear.
              </p>
              <p>
                Just as a second skin adapts perfectly to its wearer, our pieces are designed to move with you, 
                breathe with you, and feel so natural that you forget you're wearing them. We use the finest 
                merino wool, organic cotton, and sustainable silk – fibers that regulate temperature, wick moisture, 
                and soften with each wear.
              </p>
              <p>
                Each garment in this collection undergoes multiple fittings and adjustments to achieve the perfect 
                drape and comfort. The result is knitwear that doesn't just cover the body but enhances it, 
                celebrating your natural form while providing the ease and elegance that defines true luxury.
              </p>
              <p>
                This is more than fashion – it's a philosophy of dressing that prioritizes how you feel above all else. 
                Because when clothing becomes your second skin, you're free to be completely, authentically yourself.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#B9744A] text-sm uppercase tracking-[0.3em] mb-4 block">
              Customer Stories
            </span>
            <h2 
              className="text-3xl sm:text-4xl text-[#414A37]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Loved by Our Community
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah M.",
                quote: "These pieces have become staples in my wardrobe. The comfort is unreal, and knowing they're made with such intention makes wearing them feel special.",
                role: "Fashion Enthusiast"
              },
              {
                name: "Priya K.",
                quote: "From the moment I opened the package, I knew I'd made the right choice. The quality, the craftsmanship, everything about ICON speaks luxury.",
                role: "Entrepreneur"
              },
              {
                name: "Emma R.",
                quote: "I've never owned knitwear that feels this good. It's like a second skin – exactly as promised. I'm a customer for life.",
                role: "Designer"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                whileHover={{ y: -8 }}
                className="bg-[#F9F7F4] rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <div className="mb-4 text-[#b2985d] text-xl">★★★★★</div>
                <p className="text-[#414A37]/80 mb-6 leading-relaxed italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="text-[#414A37] font-medium">{testimonial.name}</p>
                  <p className="text-[#B9744A] text-sm">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}