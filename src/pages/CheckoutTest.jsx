import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import {
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  ShieldCheck,
  Database,
  Truck,
  CreditCard,
  ClipboardList,
} from "lucide-react";

const STATUS = {
  OK: "OK",
  FAIL: "FAIL",
  RUNNING: "RUNNING",
};

function StatusIcon({ status }) {
  if (status === STATUS.OK) return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
  if (status === STATUS.FAIL) return <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />;
  return <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />;
}

function ResultCard({ icon: Icon, label, value, color }) {
  return (
    <div className={`rounded-xl border-2 p-4 flex items-center gap-3 ${value ? "border-green-300 bg-green-50" : "border-red-200 bg-red-50"}`}>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${value ? "bg-green-100" : "bg-red-100"}`}>
        <Icon className={`w-5 h-5 ${value ? "text-green-600" : "text-red-500"}`} />
      </div>
      <div>
        <p className="text-xs text-[#414A37]/60 uppercase tracking-wider">{label}</p>
        <p className={`font-semibold text-sm ${value ? "text-green-700" : "text-red-600"}`}>
          {value ? "PASS" : "FAIL"}
        </p>
      </div>
    </div>
  );
}

function LogRow({ entry, index }) {
  const isOk = entry.status === STATUS.OK;
  const isFail = entry.status === STATUS.FAIL;
  return (
    <div className={`flex items-start gap-3 px-4 py-2.5 text-xs border-b border-[#DBC2A6]/20 last:border-0 ${isFail ? "bg-red-50" : ""}`}>
      <span className="text-[#414A37]/30 w-5 flex-shrink-0 text-right">{index + 1}</span>
      <StatusIcon status={entry.status} />
      <div className="flex-1 min-w-0">
        <span className="font-mono font-semibold text-[#414A37]">{entry.step}</span>
        {entry.detail && <span className="text-[#414A37]/60 ml-2 break-all">{entry.detail}</span>}
      </div>
      <span className="text-[#414A37]/30 flex-shrink-0 ml-2">{entry.timestamp?.slice(11, 19)}</span>
    </div>
  );
}

export default function CheckoutTest() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [showLogs, setShowLogs] = useState(false);

  const runTest = async () => {
    setRunning(true);
    setResult(null);
    setError("");
    setShowLogs(false);
    try {
      const res = await base44.functions.invoke("runFullCheckoutTest", {});
      setResult(res.data);
      setShowLogs(true);
    } catch (err) {
      setError(err.message || "Failed to run test");
    }
    setRunning(false);
  };

  const allPassed = result &&
    result.order_created &&
    result.payment_verified &&
    result.db_saved &&
    result.shiprocket_order_created;

  return (
    <div className="min-h-screen pt-28 pb-16 bg-[#F9F7F4]">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <ShieldCheck className="w-7 h-7 text-[#414A37]" />
            <h1 className="text-3xl text-[#414A37]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Checkout Integration Test
            </h1>
          </div>
          <p className="text-sm text-[#414A37]/60">
            End-to-end test: Razorpay order creation → signature verification → database save → Shiprocket order.
          </p>
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Admin only — creates a real test order in both DB and Shiprocket
          </div>
        </div>

        {/* Trigger Button */}
        <div className="mb-8">
          <motion.button
            onClick={runTest}
            disabled={running}
            whileHover={!running ? { scale: 1.02 } : {}}
            whileTap={!running ? { scale: 0.98 } : {}}
            className="flex items-center gap-3 px-8 py-4 bg-[#414A37] text-white rounded-xl text-sm uppercase tracking-wider font-medium hover:bg-[#353d2d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {running ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Test…
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Run Full Checkout Test
              </>
            )}
          </motion.button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
            <XCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Overall banner */}
              <div className={`rounded-xl p-5 flex items-center gap-4 ${allPassed ? "bg-green-50 border-2 border-green-300" : "bg-red-50 border-2 border-red-200"}`}>
                {allPassed
                  ? <CheckCircle className="w-8 h-8 text-green-500 flex-shrink-0" />
                  : <XCircle className="w-8 h-8 text-red-500 flex-shrink-0" />
                }
                <div>
                  <p className={`font-semibold text-lg ${allPassed ? "text-green-700" : "text-red-700"}`}>
                    {allPassed ? "All Systems Operational" : "Some Steps Failed"}
                  </p>
                  {result.test_order_number && (
                    <p className="text-xs text-[#414A37]/60 mt-0.5">Test order: <span className="font-mono">{result.test_order_number}</span></p>
                  )}
                </div>
              </div>

              {/* Step cards */}
              <div className="grid grid-cols-2 gap-3">
                <ResultCard icon={CreditCard} label="Razorpay Order Created" value={result.order_created} />
                <ResultCard icon={ShieldCheck} label="Payment Verified (HMAC)" value={result.payment_verified} />
                <ResultCard icon={Database} label="Order Saved to Database" value={result.db_saved} />
                <ResultCard icon={Truck} label="Shiprocket Order Created" value={result.shiprocket_order_created} />
              </div>

              {/* Metadata */}
              {(result.razorpay_order_id || result.shiprocket_shipment_id) && (
                <div className="bg-white rounded-xl border border-[#DBC2A6]/40 p-4 space-y-2 text-xs font-mono text-[#414A37]/70">
                  {result.razorpay_order_id && (
                    <div className="flex justify-between"><span className="text-[#414A37]/40">Razorpay Order ID</span><span>{result.razorpay_order_id}</span></div>
                  )}
                  {result.shiprocket_shipment_id && (
                    <div className="flex justify-between"><span className="text-[#414A37]/40">Shiprocket Shipment ID</span><span>{result.shiprocket_shipment_id}</span></div>
                  )}
                </div>
              )}

              {/* Errors */}
              {result.errors?.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-red-700 uppercase tracking-wider mb-2">Errors ({result.errors.length})</p>
                  <ul className="space-y-1">
                    {result.errors.map((e, i) => (
                      <li key={i} className="text-xs text-red-600 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>{e}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Logs toggle */}
              {result.logs?.length > 0 && (
                <div className="bg-white rounded-xl border border-[#DBC2A6]/40 overflow-hidden">
                  <button
                    onClick={() => setShowLogs(!showLogs)}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[#414A37] hover:bg-[#F9F7F4] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      Step-by-step Logs ({result.logs.length} entries)
                    </div>
                    {showLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <AnimatePresence>
                    {showLogs && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-[#DBC2A6]/30 max-h-72 overflow-y-auto">
                          {result.logs.map((entry, i) => (
                            <LogRow key={i} entry={entry} index={i} />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}