import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCart } from "../hooks/useCart";
import { supabase } from "../api/supabaseClient";
import "./Checkout.css";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
  });

  const razorpayRef = useRef(null);

  // Validate form
  const validateForm = () => {
    const { fullName, email, phone, street, city, state, zip } = formData;

    if (!fullName.trim()) return "Please enter your full name";
    if (!email.trim() || !/^\S+@\S+$/.test(email)) return "Please enter a valid email";
    if (!phone.trim() || !/^\d{10}$/.test(phone.replace(/\D/g, ""))) return "Please enter a valid 10-digit phone number";
    if (!street.trim()) return "Please enter your street address";
    if (!city.trim()) return "Please enter your city";
    if (!state.trim()) return "Please enter your state";
    if (!zip.trim()) return "Please enter your postal code";

    return "";
  };

  // Calculate total
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Step 1: Create Razorpay order
  const createRazorpayOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const validation = validateForm();
      if (validation) {
        setError(validation);
        setLoading(false);
        return;
      }

      console.log("[Checkout] Creating Razorpay order...");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabase.auth.session()?.access_token || ""}`,
        },
        body: JSON.stringify({
          amount: total,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
          },
          products: cart,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create Razorpay order");
      }

      const { razorpay_order_id, key_id } = await response.json();

      console.log("[Checkout] ✅ Razorpay order created:", razorpay_order_id);

      // Step 2: Open Razorpay modal
      openRazorpayModal(razorpay_order_id, key_id);
    } catch (err) {
      console.error("[Checkout] Error:", err);
      setError(err.message || "Failed to initiate payment");
      setLoading(false);
    }
  };

  // Step 2: Open Razorpay checkout modal
  const openRazorpayModal = (razorpay_order_id, key_id) => {
    const options = {
      key: key_id,
      amount: Math.round(total * 100),
      currency: "INR",
      name: "ICON by Mitali",
      description: "Luxury Knitwear Collection",
      order_id: razorpay_order_id,
      prefill: {
        name: formData.fullName,
        email: formData.email,
        contact: formData.phone,
      },
      theme: {
        color: "#414A37",
      },
      handler: (response) => {
        console.log("[Checkout] Payment successful:", response);
        verifyPayment(response, razorpay_order_id);
      },
      modal: {
        ondismiss: () => {
          console.log("[Checkout] Payment modal dismissed");
          setLoading(false);
          setError("Payment cancelled");
        },
      },
    };

    // Load Razorpay script if not already loaded
    if (!window.Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => {
        razorpayRef.current = new window.Razorpay(options);
        razorpayRef.current.open();
      };
      document.body.appendChild(script);
    } else {
      razorpayRef.current = new window.Razorpay(options);
      razorpayRef.current.open();
    }
  };

  // Step 3: Verify payment signature
  const verifyPayment = async (paymentResponse, razorpay_order_id) => {
    try {
      console.log("[Checkout] Verifying payment...");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const response = await fetch(`${supabaseUrl}/functions/v1/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${supabase.auth.session()?.access_token || ""}`,
        },
        body: JSON.stringify({
          razorpay_order_id,
          razorpay_payment_id: paymentResponse.razorpay_payment_id,
          razorpay_signature: paymentResponse.razorpay_signature,
          amount: total,
          customerName: formData.fullName,
          customerEmail: formData.email,
          customerPhone: formData.phone,
          shippingAddress: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zip: formData.zip,
            country: formData.country,
          },
          products: cart,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Payment verification failed");
      }

      const { order_number } = await response.json();

      console.log("[Checkout] ✅ Payment verified. Order:", order_number);

      // Clear cart and redirect to success page
      clearCart();
      navigate(`/payment-success?order=${order_number}`);
    } catch (err) {
      console.error("[Checkout] Verification error:", err);
      setLoading(false);
      navigate(`/payment-failure?error=${encodeURIComponent(err.message)}`);
    }
  };

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="checkout-page">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="checkout-container"
      >
        <h1>Checkout</h1>

        <div className="checkout-grid">
          {/* Left: Order Summary */}
          <div className="checkout-summary">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}`} className="summary-item">
                  <span>{item.name}</span>
                  <span className="summary-detail">
                    {item.quantity}x ₹{item.price.toFixed(2)}
                  </span>
                  <span className="summary-total">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-total-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="total-row">
                <span>Shipping:</span>
                <span>FREE</span>
              </div>
              <div className="total-row grand-total">
                <span>Total Amount:</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Right: Checkout Form */}
          <div className="checkout-form">
            <h2>Delivery Information</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={(e) => e.preventDefault()}>
              {/* Full Name */}
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  disabled={loading}
                  required
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  disabled={loading}
                  required
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 XXXXX XXXXX"
                  disabled={loading}
                  required
                />
              </div>

              {/* Street Address */}
              <div className="form-group">
                <label htmlFor="street">Street Address *</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  disabled={loading}
                  required
                />
              </div>

              {/* City & State */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city">City *</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Your city"
                    disabled={loading}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="state">State *</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="Your state"
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              {/* Postal Code */}
              <div className="form-group">
                <label htmlFor="zip">Postal Code *</label>
                <input
                  type="text"
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                  placeholder="123456"
                  disabled={loading}
                  required
                />
              </div>

              {/* Pay Button */}
              <motion.button
                className="pay-button"
                onClick={createRazorpayOrder}
                disabled={loading || cart.length === 0}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? "Processing..." : `Pay ₹${total.toFixed(2)}`}
              </motion.button>

              <p className="secure-note">🔒 Secured by Razorpay | Your payment information is encrypted</p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout;
