import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { createOrder } from "@/api/apiClient";
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, CheckCircle, Smartphone, CreditCard } from "lucide-react";
import ShiprocketTracker from "@/components/tracking/ShiprocketTracker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { base44 } from "@/api/base44Client";

// Load Razorpay script dynamically
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Cart() {
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [cart, setCart] = useState([]);
  const [step, setStep] = useState("cart");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [shiprocketAwb, setShiprocketAwb] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [upiId, setUpiId] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "",
    street: "", city: "", state: "", pincode: "", notes: "",
  });

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("icon_cart") || "[]");
    setCart(savedCart);
  }, []);

  const updateCart = (newCart) => {
    setCart(newCart);
    localStorage.setItem("icon_cart", JSON.stringify(newCart));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (index, delta) => {
    const newCart = [...cart];
    newCart[index].quantity = Math.max(1, newCart[index].quantity + delta);
    updateCart(newCart);
  };

  const removeItem = (index) => updateCart(cart.filter((_, i) => i !== index));

  const formatPrice = (price) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Free shipping always
  const shipping = 0;
  const total = subtotal + shipping;

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const buildOrderData = () => ({
    customer_name: formData.name,
    customer_email: formData.email,
    customer_phone: formData.phone,
    items: cart.map((item) => ({
      product_id: item.product_id,
      product_name: item.product_name,
      size: item.size,
      quantity: item.quantity,
      price: item.price,
    })),
    total_amount: total,
    shipping_address: {
      street: formData.street,
      city: formData.city,
      state: formData.state,
      pincode: formData.pincode,
      country: "India",
    },
    notes: formData.notes,
  });

  const submitUpi = async () => {
     setIsSubmitting(true);
     setPaymentError("");
     const orderNum = `ICON-${Date.now().toString().slice(-8)}`;
     const paymentNote = `UPI ID: ${upiId}`;
     const combinedNotes = [formData.notes, paymentNote].filter(Boolean).join(" | ");

     try {
       await createOrder({
         order_number: orderNum,
         ...buildOrderData(),
         status: "pending",
         payment_status: "pending",
         notes: combinedNotes,
       });
       setOrderNumber(orderNum);
       updateCart([]);
       setStep("success");
     } catch (err) {
       setPaymentError("Failed to place order. Please try again. " + (err?.message || ""));
     } finally {
       setIsSubmitting(false);
     }
   };

  const submitRazorpay = async () => {
    setIsSubmitting(true);
    setPaymentError("");

    const loaded = await loadRazorpayScript();
    if (!loaded) {
      setPaymentError("Failed to load Razorpay. Please check your connection.");
      setIsSubmitting(false);
      return;
    }

    // Create Razorpay order via backend
    let rzpOrder;
    try {
      const res = await base44.functions.invoke("razorpayCreateOrder", { amount: total });
      rzpOrder = res.data;
      if (!rzpOrder?.order_id || !rzpOrder?.key_id) {
        throw new Error(rzpOrder?.error || "Invalid order response from payment gateway");
      }
    } catch (err) {
      setPaymentError("Could not initiate payment: " + err.message);
      setIsSubmitting(false);
      return;
    }

    // Capture order data NOW before cart state can change
    const capturedOrderData = buildOrderData();

    // Suppress Razorpay's own browser alert() dialogs
    const originalAlert = window.alert;
    const restoreAlert = () => { window.alert = originalAlert; };
    window.alert = (msg) => {
      if (typeof msg === "string" && (msg.includes("Payment") || msg.includes("payment") || msg.includes("Oops"))) {
        return;
      }
      originalAlert(msg);
    };
    setTimeout(restoreAlert, 120000);

    const options = {
      key: rzpOrder.key_id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      name: "ICON by Mitali Dhumal",
      description: "Fashion Order",
      image: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/697e263b19f8bcf929a8b036/010f7c59a_WhatsAppImage2026-02-05at020120.jpg",
      order_id: rzpOrder.order_id,
      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },
      theme: { color: "#414A37" },
      handler: async (response) => {
        restoreAlert();
        try {
          const verifyRes = await base44.functions.invoke("razorpayVerifyPayment", {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            orderData: capturedOrderData,
          });

          const data = verifyRes.data;

          if (data?.payment_verified && data?.order_saved) {
            setOrderNumber(data.order_number);
            if (data?.shiprocket_awb) setShiprocketAwb(data.shiprocket_awb);
            updateCart([]);
            setStep("success");
          } else if (data?.payment_verified && !data?.order_saved) {
            setPaymentError("Payment successful but order save failed. Please contact support with payment ID: " + response.razorpay_payment_id);
          } else {
            setPaymentError(data?.error || "Payment verification failed. Please contact support.");
          }
        } catch (err) {
          setPaymentError("Payment processing error. If amount was deducted, contact support with payment ID: " + response.razorpay_payment_id);
        }
        setIsSubmitting(false);
      },
      modal: {
        ondismiss: () => {
          setIsSubmitting(false);
          restoreAlert();
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", (response) => {
      const desc = response?.error?.description || "Payment was declined. Please try again or use a different payment method.";
      setPaymentError(`Payment failed: ${desc}`);
      setIsSubmitting(false);
      restoreAlert();
    });

    rzp.open();
  };

  const submitOrder = () => {
     if (paymentMethod === "razorpay") return submitRazorpay();
     return submitUpi();
   };

  if (step === "success") {
    return (
      <div className="min-h-screen pt-32 pb-16 bg-[#F9F7F4]">
        <div className="max-w-xl mx-auto px-4 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-20 h-20 bg-green-500 rounded-full mx-auto mb-6 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>
          <h1 className="text-4xl text-[#414A37] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Thank You!
          </h1>
          <p className="text-[#414A37]/70 mb-2">Your order has been placed successfully.</p>

          {/* Order reference — NOT for tracking */}
          <div className="inline-block bg-white border border-[#DBC2A6]/50 rounded-lg px-5 py-3 mb-6">
            <p className="text-xs text-[#414A37]/50 uppercase tracking-wider mb-0.5">Order Reference</p>
            <p className="text-[#414A37] font-semibold">{orderNumber}</p>
          </div>

          {shiprocketAwb ? (
            <>
              <p className="text-sm text-[#414A37]/60 mb-2">Your shipment tracking number:</p>
              <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 mb-6">
                <span className="text-sm text-green-700 font-medium">AWB / Tracking Number:</span>
                <span className="text-sm text-green-800 font-bold">{shiprocketAwb}</span>
              </div>
              <p className="text-xs text-[#414A37]/50 mb-6">Use this AWB number below to track your shipment.</p>
              <div className="mb-8 text-left">
                <ShiprocketTracker defaultAwb={shiprocketAwb} />
              </div>
            </>
          ) : (
             <p className="text-sm text-[#414A37]/60 mb-8">Your UPI order is received. Once payment is confirmed, we'll dispatch your order and share tracking details via email.</p>
           )}

          <Link
            to={createPageUrl("Shop")}
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#414A37] text-white rounded-lg hover:bg-[#353d2d] transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-16 bg-[#F9F7F4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl sm:text-5xl text-[#414A37] mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            {step === "cart" ? "Shopping Cart" : "Checkout"}
          </h1>
          {step === "details" && (
            <button onClick={() => setStep("cart")} className="inline-flex items-center gap-2 text-[#B9744A] hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to Cart
            </button>
          )}
        </motion.div>

        {cart.length === 0 && step === "cart" ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <ShoppingBag className="w-16 h-16 text-[#DBC2A6] mx-auto mb-6" />
            <h2 className="text-2xl text-[#414A37] mb-4">Your cart is empty</h2>
            <p className="text-[#414A37]/70 mb-8">Discover our collection and add your favorites.</p>
            <Link to={createPageUrl("Shop")} className="inline-flex items-center gap-2 px-8 py-4 bg-[#B9744A] text-white rounded-lg hover:bg-[#a5663f] transition-colors">
              Shop Now
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {step === "cart" ? (
                  <motion.div key="cart" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="space-y-6">
                      {cart.map((item, index) => (
                        <motion.div
                          key={`${item.product_id}-${item.size}`}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0, x: -50 }}
                          className="flex gap-6 pb-6 border-b border-[#DBC2A6]/30 last:border-0"
                        >
                          <img
                            src={item.image || "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=200"}
                            alt={item.product_name}
                            className="w-24 h-32 object-cover object-center rounded-lg"
                            loading="lazy"
                          />
                          <div className="flex-1">
                            <h3 className="text-lg text-[#414A37] mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                              {item.product_name}
                            </h3>
                            <p className="text-sm text-[#414A37]/60 mb-3">Size: {item.size}</p>
                            <p className="text-[#B9744A] font-medium">{formatPrice(item.price)}</p>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <button onClick={() => removeItem(index)} className="text-[#414A37]/40 hover:text-red-500 transition-colors">
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3">
                              <button onClick={() => updateQuantity(index, -1)} className="w-8 h-8 rounded-full border border-[#DBC2A6] flex items-center justify-center hover:border-[#B9744A] transition-colors">
                                <Minus className="w-4 h-4 text-[#414A37]" />
                              </button>
                              <span className="w-8 text-center text-[#414A37]">{item.quantity}</span>
                              <button onClick={() => updateQuantity(index, 1)} className="w-8 h-8 rounded-full border border-[#DBC2A6] flex items-center justify-center hover:border-[#B9744A] transition-colors">
                                <Plus className="w-4 h-4 text-[#414A37]" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ) : (
                  <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="bg-white rounded-2xl p-6 shadow-sm">
                    <h2 className="text-xl text-[#414A37] mb-6 font-medium">Customer Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="name" className="text-[#414A37]">Full Name *</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-[#414A37]">Email *</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} required className="mt-2" />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="phone" className="text-[#414A37]">Phone *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                          required
                          maxLength={10}
                          placeholder="10-digit mobile number"
                          className="mt-2"
                        />
                      </div>
                    </div>
                    <h2 className="text-xl text-[#414A37] mb-6 mt-8 font-medium">Shipping Address</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <Label htmlFor="street" className="text-[#414A37]">Street Address *</Label>
                        <Input id="street" name="street" value={formData.street} onChange={handleInputChange} required className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="city" className="text-[#414A37]">City *</Label>
                        <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-[#414A37]">State *</Label>
                        <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required className="mt-2" />
                      </div>
                      <div>
                        <Label htmlFor="pincode" className="text-[#414A37]">Pincode *</Label>
                        <Input
                          id="pincode"
                          name="pincode"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                          required
                          maxLength={6}
                          placeholder="6-digit pincode"
                          className="mt-2"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="notes" className="text-[#414A37]">Order Notes (optional)</Label>
                        <Textarea id="notes" name="notes" value={formData.notes} onChange={handleInputChange} className="mt-2" rows={3} />
                      </div>
                    </div>

                    {/* Payment Method */}
                     <h2 className="text-xl text-[#414A37] mb-4 mt-8 font-medium">Payment Method</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                       {/* Razorpay */}
                       <button
                         type="button"
                         onClick={() => setPaymentMethod("razorpay")}
                         className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                           paymentMethod === "razorpay"
                             ? "border-[#1a6ae0] bg-[#1a6ae0]/5"
                             : "border-[#DBC2A6]/50 hover:border-[#1a6ae0]/40"
                         }`}
                       >
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === "razorpay" ? "bg-[#1a6ae0] text-white" : "bg-[#F9F7F4] text-[#1a6ae0]"}`}>
                           <CreditCard className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="font-medium text-[#414A37] text-sm">Pay Online</p>
                           <p className="text-xs text-[#414A37]/60">Card, UPI, NetBanking & more</p>
                         </div>
                       </button>

                       {/* Manual UPI */}
                       <button
                         type="button"
                         onClick={() => setPaymentMethod("upi")}
                         className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                           paymentMethod === "upi"
                             ? "border-[#B9744A] bg-[#B9744A]/5"
                             : "border-[#DBC2A6]/50 hover:border-[#B9744A]/40"
                         }`}
                       >
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${paymentMethod === "upi" ? "bg-[#B9744A] text-white" : "bg-[#F9F7F4] text-[#B9744A]"}`}>
                           <Smartphone className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="font-medium text-[#414A37] text-sm">UPI Transfer</p>
                           <p className="text-xs text-[#414A37]/60">Manual UPI confirmation</p>
                         </div>
                       </button>
                     </div>

                    {paymentMethod === "razorpay" && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800"
                      >
                        You'll be redirected to Razorpay's secure checkout to pay via Card, UPI, Net Banking, or Wallets.
                      </motion.div>
                    )}

                    {paymentMethod === "upi" && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-4 bg-[#F9F7F4] rounded-xl border border-[#DBC2A6]/40"
                      >
                        <p className="text-sm text-[#414A37] font-medium mb-1">UPI ID</p>
                        <Input
                          placeholder="e.g. yourname@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="mt-1"
                        />
                        <p className="text-xs text-[#414A37]/50 mt-2">Enter your UPI ID. We will confirm payment manually before processing your order.</p>
                      </motion.div>
                    )}

                    {paymentError && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-4 text-sm text-red-600 bg-red-50 rounded-lg px-4 py-3"
                      >
                        {paymentError}
                      </motion.p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-28">
                <h2 className="text-xl text-[#414A37] mb-6 font-medium">Order Summary</h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-[#414A37]/70">
                    <span>Subtotal</span><span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-[#414A37]/70">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-green-600 font-medium">Free</span> : formatPrice(shipping)}</span>
                  </div>

                  <div className="border-t border-[#DBC2A6]/30 pt-4 flex justify-between text-lg text-[#414A37] font-medium">
                    <span>Total</span><span>{formatPrice(total)}</span>
                  </div>
                </div>
                {step === "cart" ? (
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setStep("details")} className="w-full py-4 bg-[#414A37] text-white uppercase tracking-wider text-sm rounded-lg hover:bg-[#353d2d] transition-colors">
                    Proceed to Checkout
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={submitOrder}
                    disabled={
                      isSubmitting ||
                      !formData.name || !formData.email ||
                      formData.phone.length !== 10 ||
                      !formData.street || !formData.city || !formData.state ||
                      formData.pincode.length !== 6 ||
                      (paymentMethod === "upi" && !upiId.trim())
                    }
                    className="w-full py-4 bg-[#B9744A] text-white uppercase tracking-wider text-sm rounded-lg hover:bg-[#a5663f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? (paymentMethod === "razorpay" ? "Opening Payment..." : "Placing Order...")
                      : (paymentMethod === "razorpay" ? "Pay Now" : "Place Order")
                    }
                  </motion.button>
                )}
                <p className="text-xs text-[#414A37]/50 text-center mt-4">
                  {paymentMethod === "razorpay" ? "🔒 Secured by Razorpay" : "UPI available · Secure checkout"}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}