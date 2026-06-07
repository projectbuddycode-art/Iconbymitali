import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabaseClient } from "../api/supabaseClient";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderNumber = searchParams.get("order");

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderNumber) {
        setLoading(false);
        return;
      }

      try {
        console.log("[PaymentSuccess] Fetching order:", orderNumber);

        const { data, error } = await supabaseClient
          .from("orders")
          .select("*")
          .eq("order_number", orderNumber)
          .single();

        if (error) throw error;

        setOrder(data);
        console.log("[PaymentSuccess] ✅ Order fetched");
      } catch (err) {
        console.error("[PaymentSuccess] Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderNumber]);

  if (loading) {
    return (
      <div className="payment-success-page">
        <div className="loading">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="spinner"
          />
          <p>Processing your order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="success-container"
      >
        {/* Success Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="success-icon"
        >
          ✓
        </motion.div>

        <h1>Order Confirmed!</h1>
        <p className="subtitle">Thank you for your purchase</p>

        {/* Order Details */}
        {order && (
          <div className="order-details">
            <div className="detail-row">
              <span className="label">Order Number:</span>
              <span className="value">{order.order_number}</span>
            </div>

            <div className="detail-row">
              <span className="label">Amount Paid:</span>
              <span className="value">₹{order.amount.toFixed(2)}</span>
            </div>

            <div className="detail-row">
              <span className="label">Status:</span>
              <span className="value status">{order.order_status}</span>
            </div>

            <div className="detail-row">
              <span className="label">Email:</span>
              <span className="value">{order.customer_email}</span>
            </div>

            <div className="detail-row">
              <span className="label">Shipping To:</span>
              <span className="value">
                {order.shipping_address?.city}, {order.shipping_address?.state}
              </span>
            </div>

            {/* Items */}
            <div className="items-section">
              <h3>Items Ordered</h3>
              <div className="items-list">
                {(order.products || []).map((product, index) => (
                  <div key={index} className="item">
                    <span>{product.name}</span>
                    <span className="qty">Qty: {product.quantity}</span>
                    <span className="price">₹{(product.price * product.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="next-steps">
          <h3>What's Next?</h3>
          <ul>
            <li>✓ Your order has been confirmed</li>
            <li>📧 A confirmation email will be sent to {order?.customer_email}</li>
            <li>📦 Your package will be shipped within 2-3 business days</li>
            <li>🚚 You'll receive tracking information via email</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="actions">
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/shop")}
          >
            Continue Shopping
          </motion.button>
          <motion.button
            className="btn btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/track-order")}
          >
            Track Order
          </motion.button>
        </div>

        {/* Support */}
        <div className="support">
          <p>
            Have questions? Contact us at{" "}
            <a href="mailto:info@iconbymitalidhumal.com">info@iconbymitalidhumal.com</a>
          </p>
          <p>
            Call: <a href="tel:+919021126552">+91 9021126552</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentSuccess;
