import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Shield, FileText, Package, Truck } from "lucide-react";

const sections = [
  {
    icon: Shield,
    title: "Privacy Policy",
    content: [
      {
        subtitle: "Information We Collect",
        text: "We collect personal information necessary to process your orders and improve your shopping experience, including:\n\n• Personal Details: Name, email address, mobile number, and shipping/billing address.\n• Payment Information: Payment details are processed through secure third-party gateways. We do not store your credit/debit card information on our servers.\n• Browsing Data: IP address, browser type, and cookies to analyze website performance."
      },
      {
        subtitle: "How We Use Your Information",
        text: "• To process and deliver your orders via our logistics partners.\n• To communicate with you regarding order updates, shipping status, and customer support.\n• To comply with legal obligations under Indian law."
      },
      {
        subtitle: "Data Sharing",
        text: "We do not sell or rent your personal data. We only share necessary details (Name, Address, Phone Number) with our trusted courier partners to ensure delivery."
      }
    ]
  },
  {
    icon: FileText,
    title: "Terms & Conditions",
    content: [
      {
        subtitle: "General",
        text: "These terms apply to all visitors and customers of ICON by MITALI DHUMAL. We reserve the right to update these terms at any time without prior notice."
      },
      {
        subtitle: "Intellectual Property",
        text: "All content on this website, including designs, logos, images, text, and graphics, is the exclusive property of ICON by MITALI DHUMAL and is protected by Indian copyright and trademark laws. Unauthorized use or reproduction is strictly prohibited."
      },
      {
        subtitle: "Payment Policy (Strictly Prepaid)",
        text: "• No Cash on Delivery (COD): We do not offer Cash on Delivery services. All orders must be fully prepaid at the time of checkout via UPI, Credit/Debit Card, or Net Banking.\n• Unpaid orders will not be processed or shipped."
      },
      {
        subtitle: "Product Accuracy",
        text: "We have made every effort to display the colors and textures of our products accurately. However, due to monitor discrepancies and lighting, we cannot guarantee that the color you see matches the product exactly."
      },
      {
        subtitle: "Governing Law",
        text: "These terms shall be governed by the laws of India. Any disputes arising in relation to these terms shall be subject to the exclusive jurisdiction of the courts in Mumbai, Maharashtra."
      }
    ]
  },
  {
    icon: Package,
    title: "Returns & Exchange Policy",
    content: [
      {
        subtitle: "Eligibility for Return/Exchange",
        text: "• 7-Day Window: Returns or exchanges are strictly accepted only within 7 days from the date of delivery. Requests made after this period will not be entertained.\n• Condition: The item must be unused, unwashed, and in its original condition with all tags and packaging intact."
      },
      {
        subtitle: "Mandatory Unboxing Video Proof",
        text: "To be eligible for a return or exchange regarding damage or defects, you must provide a clear, uncut unboxing video of the package.\n\nVideo Requirements:\n• The video must start by showing the sealed package with the shipping label clearly visible.\n• It must capture the entire unboxing process without any cuts or edits.\n• The damage or defect must be clearly zoomed in on and shown in the video.\n\nRejection: Failure to provide a valid unboxing video will result in the automatic rejection of your return request. Photos alone will not be accepted as proof."
      },
      {
        subtitle: "Refund Policy",
        text: "• Refunds are processed only after the returned item reaches our warehouse and passes the quality check.\n• Refunds will be credited to the original source of payment within 7-10 business days."
      }
    ]
  },
  {
    icon: Truck,
    title: "Shipping Policy",
    content: [
      {
        subtitle: "Processing Time",
        text: "All orders are processed and dispatched within 2-3 business days after payment confirmation."
      },
      {
        subtitle: "Shipping Duration",
        text: "• Standard Delivery: Please allow 5-7 business days for delivery, depending on your location.\n• Delays: While we aim for timely delivery, delays caused by courier partners or external factors (such as weather, strikes, etc.) are beyond our control. We will assist you in tracking your package should any issues arise."
      },
      {
        subtitle: "Shipping Charges",
        text: "Shipping charges (if applicable) will be calculated and displayed at checkout before payment."
      },
      {
        subtitle: "Non-Delivery",
        text: "If a package is returned to us due to an incorrect address provided by the customer or customer unavailability, re-shipping charges will be applicable."
      }
    ]
  }
];

export default function Policies() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [expandedSection, setExpandedSection] = useState(0);
  const [expandedSubsection, setExpandedSubsection] = useState({});

  const toggleSection = (index) => {
    setExpandedSection(expandedSection === index ? null : index);
  };

  const toggleSubsection = (sectionIndex, subsectionIndex) => {
    const key = `${sectionIndex}-${subsectionIndex}`;
    setExpandedSubsection(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#F9F7F4]">
      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-[#1a2a20] to-[#0f1a14] relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(185,116,74,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(185,116,74,0.1) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(185,116,74,0.1) 0%, transparent 50%)"
            ]
          }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="w-20 h-20 bg-[#B9744A]/20 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <Shield className="w-10 h-10 text-[#C4A484]" />
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-6xl text-white mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Company Policies
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/80 text-lg max-w-2xl mx-auto"
          >
            Transparency and trust are at the heart of everything we do
          </motion.p>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-white/60 text-sm mt-4"
          >
            Effective Date: 2026 | Jurisdiction: Mumbai, Maharashtra, India
          </motion.p>
        </div>
      </section>

      {/* Policies Content */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6">
            {sections.map((section, sectionIndex) => {
              const Icon = section.icon;
              const isExpanded = expandedSection === sectionIndex;
              
              return (
                <motion.div
                  key={sectionIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden"
                >
                  <button
                    onClick={() => toggleSection(sectionIndex)}
                    className="w-full px-6 sm:px-8 py-6 flex items-center justify-between hover:bg-[#F9F7F4] transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{
                          scale: isExpanded ? 1.1 : 1,
                          rotate: isExpanded ? 360 : 0
                        }}
                        transition={{ duration: 0.3 }}
                        className="w-12 h-12 bg-[#B9744A]/10 rounded-full flex items-center justify-center"
                      >
                        <Icon className="w-6 h-6 text-[#B9744A]" />
                      </motion.div>
                      <h2 
                        className="text-2xl text-[#414A37] text-left"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {section.title}
                      </h2>
                    </div>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-6 h-6 text-[#414A37]" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 sm:px-8 pb-6 space-y-4">
                          {section.content.map((item, itemIndex) => {
                            const subsectionKey = `${sectionIndex}-${itemIndex}`;
                            const isSubExpanded = expandedSubsection[subsectionKey];
                            
                            return (
                              <motion.div
                                key={itemIndex}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: itemIndex * 0.1 }}
                                className="border-l-2 border-[#B9744A]/30 pl-6"
                              >
                                <button
                                  onClick={() => toggleSubsection(sectionIndex, itemIndex)}
                                  className="w-full text-left"
                                >
                                  <h3 
                                    className="text-lg text-[#414A37] mb-2 font-medium hover:text-[#B9744A] transition-colors"
                                    style={{ fontFamily: "'Lato', sans-serif" }}
                                  >
                                    {item.subtitle}
                                  </h3>
                                </button>
                                
                                <AnimatePresence>
                                  {(isSubExpanded || itemIndex === 0) && (
                                    <motion.p
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: "auto", opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      className="text-[#414A37]/70 leading-relaxed whitespace-pre-line overflow-hidden"
                                    >
                                      {item.text}
                                    </motion.p>
                                  )}
                                </AnimatePresence>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Size Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-10 bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <div className="px-6 sm:px-8 py-6">
              <h2 className="text-2xl text-[#414A37] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Size Guide</h2>
              <p className="text-sm text-[#414A37]/60 mb-4">All measurements in inches. When in doubt, size up.</p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#F9F7F4]">
                      <th className="border border-[#DBC2A6] px-4 py-3 text-left text-[#414A37] font-medium">Size</th>
                      <th className="border border-[#DBC2A6] px-4 py-3 text-left text-[#414A37] font-medium">Chest</th>
                      <th className="border border-[#DBC2A6] px-4 py-3 text-left text-[#414A37] font-medium">Waist</th>
                      <th className="border border-[#DBC2A6] px-4 py-3 text-left text-[#414A37] font-medium">Hips</th>
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
                      <tr key={row.size} className={i % 2 === 0 ? "bg-white" : "bg-[#F9F7F4]/50"}>
                        <td className="border border-[#DBC2A6] px-4 py-3 font-semibold text-[#414A37]">{row.size}</td>
                        <td className="border border-[#DBC2A6] px-4 py-3 text-[#414A37]/80">{row.chest}</td>
                        <td className="border border-[#DBC2A6] px-4 py-3 text-[#414A37]/80">{row.waist}</td>
                        <td className="border border-[#DBC2A6] px-4 py-3 text-[#414A37]/80">{row.hips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>

          {/* Contact CTA */}
           <motion.div
             initial={{ opacity: 0, y: 30 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="mt-16 bg-gradient-to-br from-[#1a2a20] to-[#0f1a14] rounded-2xl p-8 sm:p-12 text-center"
           >
            <h3 
              className="text-3xl text-white mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Questions About Our Policies?
            </h3>
            <p className="text-white/80 mb-6 max-w-2xl mx-auto">
              Our customer support team is here to help. Reach out to us for any clarifications or concerns.
            </p>
            <motion.a
              href="mailto:info@iconbymitali.com"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-8 py-3 bg-[#B9744A] text-white rounded-full hover:bg-[#a5663f] transition-colors"
            >
              Contact Support
            </motion.a>
          </motion.div>
        </div>
      </section>
    </div>
  );
}