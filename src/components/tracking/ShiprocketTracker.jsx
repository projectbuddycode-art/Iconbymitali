import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Package, ExternalLink, Truck, AlertCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { base44 } from "@/api/base44Client";

export default function ShiprocketTracker({ defaultAwb = "" }) {
  const [input, setInput] = useState(defaultAwb);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState(null);

  const handleTrack = async () => {
    const awb = input.trim();
    if (!awb) return;
    setLoading(true);
    setError("");
    setData(null);

    const res = await base44.functions.invoke("shiprocketTrack", { awb });
    const result = res.data;

    if (!result.success) {
      setError(result.message || "Failed to fetch tracking data");
    } else {
      setData(result.data);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl border border-[#DBC2A6]/40 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Package className="w-5 h-5 text-[#B9744A]" />
        <h3 className="font-medium text-[#414A37] text-sm uppercase tracking-wider">Track Your Shipment</h3>
      </div>

      <div className="flex gap-2">
        <Input
          placeholder="Enter AWB / Tracking Number"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleTrack()}
          className="flex-1 text-sm"
        />
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleTrack}
          disabled={loading}
          className="px-4 py-2 bg-[#B9744A] text-white rounded-lg text-sm flex items-center gap-1.5 hover:bg-[#a5663f] transition-colors whitespace-nowrap disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          Track
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </motion.div>
        )}

        {data && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 space-y-3"
          >
            {/* Status Card */}
            <div className="bg-[#F9F7F4] rounded-lg p-3 flex items-start gap-3">
              <Truck className="w-5 h-5 text-[#B9744A] flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-[#414A37]/60 mb-0.5">Current Status</p>
                <p className="text-sm font-medium text-[#414A37]">{data.current_status || "In Transit"}</p>
                {data.courier_name && <p className="text-xs text-[#414A37]/50 mt-0.5">{data.courier_name}</p>}
              </div>
              {data.edd && (
                <div className="text-right">
                  <p className="text-xs text-[#414A37]/60">Expected Delivery</p>
                  <p className="text-xs font-medium text-[#414A37]">{data.edd}</p>
                </div>
              )}
            </div>

            {/* Route */}
            {(data.origin || data.destination) && (
              <div className="flex items-center gap-2 text-xs text-[#414A37]/60 px-1">
                <span>{data.origin}</span>
                <span>→</span>
                <span>{data.destination}</span>
              </div>
            )}

            {/* Activity Timeline */}
            {data.activities?.length > 0 && (
              <div className="space-y-0 max-h-52 overflow-y-auto border border-[#DBC2A6]/30 rounded-lg divide-y divide-[#DBC2A6]/20">
                {data.activities.slice(0, 8).map((act, i) => (
                  <div key={i} className="flex gap-3 px-3 py-2 text-xs">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${i === 0 ? "bg-[#B9744A]" : "bg-[#DBC2A6]"}`} />
                    <div>
                      <p className="text-[#414A37] font-medium">{act.activity}</p>
                      <p className="text-[#414A37]/50">{act.location} · {act.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <a
              href={`https://shiprocket.co/tracking/${input.trim()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#B9744A] hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              View full tracking on Shiprocket
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-xs text-[#414A37]/40 mt-4">Powered by Shiprocket</p>
    </div>
  );
}