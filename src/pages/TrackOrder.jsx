import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, Truck, CheckCircle2, Clock, ExternalLink, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

const STATUS_CONFIG = {
  pending:    { label: "Order Placed",   color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200" },
  processing: { label: "Processing",     color: "text-blue-600",   bg: "bg-blue-50",   border: "border-blue-200" },
  shipped:    { label: "In Transit",      color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-200" },
  delivered:  { label: "Delivered",      color: "text-green-600",  bg: "bg-green-50",  border: "border-green-200" },
  cancelled:  { label: "Cancelled",      color: "text-red-600",    bg: "bg-red-50",    border: "border-red-200" },
};

const SHIPMENT_STATUS_CONFIG = {
  created:    { label: "Shipment Created", icon: Package },
  manifested: { label: "Manifested",       icon: Package },
  picked_up:  { label: "Picked Up",        icon: Truck },
  in_transit: { label: "In Transit",       icon: Truck },
  delivered:  { label: "Delivered",        icon: CheckCircle2 },
  rto:        { label: "Return to Origin", icon: AlertCircle },
  cancelled:  { label: "Cancelled",        icon: AlertCircle },
};

export default function TrackOrder() {
  const [orderInput, setOrderInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleTrack = async () => {
    if (!orderInput.trim() && !emailInput.trim()) {
      setError("Please enter your Order ID or Email address.");
      return;
    }
    setLoading(true);
    setError("");
    setResult(null);

    const res = await base44.functions.invoke("getShipmentDetails", {
      order_number: orderInput.trim() || undefined,
      email: emailInput.trim() || undefined,
    });

    const data = res.data;
    if (!data?.success) {
      setError(data?.error || "Could not find your order. Please check the details and try again.");
    } else {
      setResult(data);
    }
    setLoading(false);
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "";
  const formatPrice = (p) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(p);

  const orderStatus = result?.order?.status;
  const statusCfg = STATUS_CONFIG[orderStatus] || STATUS_CONFIG.pending;
  const shipmentStatusCfg = SHIPMENT_STATUS_CONFIG[result?.shipment?.shipment_status] || null;
  const ShipmentIcon = shipmentStatusCfg?.icon || Package;

  const awb = result?.shipment?.awb_code || result?.awb_fallback;
  const trackingUrl = result?.shipment?.tracking_url || (awb ? `https://shiprocket.co/tracking/${awb}` : null);

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#F9F7F4]">
      <div className="max-w-2xl mx-auto px-4">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#1a2a20] rounded-2xl mb-5 shadow-lg">
            <Package className="w-8 h-8 text-[#b2985d]" />
          </div>
          <h1 className="text-4xl sm:text-5xl text-[#1a2a20] mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Track Your Order
          </h1>
          <p className="text-[#1a2a20]/60 text-sm">Enter your Order ID or email address to get live shipment updates.</p>
        </motion.div>

        {/* Search Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-sm border border-[#DBC2A6]/30 p-6 mb-6"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#1a2a20]/50 mb-2">Order ID</label>
              <Input
                placeholder="e.g. ICON-12345678"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="h-12 text-base border-[#DBC2A6]/50 focus:border-[#b2985d] rounded-xl"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#DBC2A6]/40" />
              <span className="text-xs text-[#1a2a20]/40 uppercase tracking-wider">or</span>
              <div className="flex-1 h-px bg-[#DBC2A6]/40" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-[#1a2a20]/50 mb-2">Email Address</label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                className="h-12 text-base border-[#DBC2A6]/50 focus:border-[#b2985d] rounded-xl"
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleTrack}
              disabled={loading}
              className="w-full h-12 bg-[#1a2a20] text-white rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest hover:bg-[#253d2c] transition-colors disabled:opacity-60"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Searching...</>
              ) : (
                <><Search className="w-4 h-4" /> Track Order</>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-6 text-sm text-red-700"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {/* Order Summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-[#DBC2A6]/30 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-[#1a2a20]/40 mb-1">Order Reference</p>
                    <p className="text-xl font-semibold text-[#1a2a20]">{result.order.order_number}</p>
                    <p className="text-xs text-[#1a2a20]/40 mt-1">{formatDate(result.order.created_date)}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusCfg.color} ${statusCfg.bg} ${statusCfg.border}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.color.replace('text-', 'bg-')}`} />
                    {statusCfg.label}
                  </span>
                </div>

                {/* Items */}
                {result.order.items?.length > 0 && (
                  <div className="border-t border-[#DBC2A6]/20 pt-4 space-y-2">
                    {result.order.items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-[#1a2a20]/70">{item.product_name} <span className="text-[#1a2a20]/40">× {item.quantity}</span>{item.size ? <span className="text-[#1a2a20]/40"> · {item.size}</span> : null}</span>
                        <span className="text-[#1a2a20] font-medium">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center text-sm pt-2 border-t border-[#DBC2A6]/20">
                      <span className="font-medium text-[#1a2a20]">Total</span>
                      <span className="font-semibold text-[#1a2a20]">{formatPrice(result.order.total_amount)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Shipment Card */}
              {(result.shipment || awb) ? (
                <div className="bg-white rounded-2xl shadow-sm border border-[#DBC2A6]/30 p-6">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 bg-[#1a2a20] rounded-xl flex items-center justify-center">
                      <ShipmentIcon className="w-5 h-5 text-[#b2985d]" />
                    </div>
                    <div>
                      <p className="font-medium text-[#1a2a20] text-sm">Shipment Details</p>
                      {shipmentStatusCfg && (
                        <p className="text-xs text-[#1a2a20]/50">{shipmentStatusCfg.label}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    {awb && (
                      <div className="flex items-center justify-between p-3 bg-[#F9F7F4] rounded-xl">
                        <div className="flex items-center gap-2">
                          <Package className="w-4 h-4 text-[#b2985d]" />
                          <span className="text-xs uppercase tracking-wider text-[#1a2a20]/50">AWB / Tracking No.</span>
                        </div>
                        <span className="font-semibold text-[#1a2a20] text-sm">{awb}</span>
                      </div>
                    )}

                    {result.shipment?.courier_name && (
                      <div className="flex items-center justify-between p-3 bg-[#F9F7F4] rounded-xl">
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4 text-[#b2985d]" />
                          <span className="text-xs uppercase tracking-wider text-[#1a2a20]/50">Courier Partner</span>
                        </div>
                        <span className="font-medium text-[#1a2a20] text-sm">{result.shipment.courier_name}</span>
                      </div>
                    )}
                  </div>

                  {trackingUrl && (
                    <motion.a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className="w-full h-12 bg-[#b2985d] text-white rounded-xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest hover:bg-[#9e8450] transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Live Tracking
                    </motion.a>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-[#DBC2A6]/30 p-6 text-center">
                  <Clock className="w-8 h-8 text-[#DBC2A6] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#1a2a20] mb-1">Shipment Not Yet Dispatched</p>
                  <p className="text-xs text-[#1a2a20]/50">Your order is being prepared. Tracking information will be available once it is dispatched.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}