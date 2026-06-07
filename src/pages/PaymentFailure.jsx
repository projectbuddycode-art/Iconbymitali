import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import "./PaymentFailure.css";

const PaymentFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const errorMessage = searchParams.get("error") || "Payment processing failed";

  return (
    <div className="payment-failure-page">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="failure-container"
      >
        {/* Error Icon */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="error-icon"
        >
          ✕
        </motion.div>

        <h1>Payment Failed</h1>
        <p className="subtitle">We couldn't process your payment</p>

        {/* Error Details */}
        <div className="error-details">
          <p className="error-message">{decodeURIComponent(errorMessage)}</p>

          <div className="error-info">
            <h3>What should you do?</h3>
            <ul>
              <li>✓ Check your internet connection</li>
              <li>✓ Verify your card/payment method details</li>
              <li>✓ Ensure you have sufficient balance</li>
              <li>✓ Try again with a different payment method</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="actions">
          <motion.button
            className="btn btn-primary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/cart")}
          >
            Try Again
          </motion.button>
          <motion.button
            className="btn btn-secondary"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/shop")}
          >
            Return to Shop
          </motion.button>
        </div>

        {/* Support */}
        <div className="support">
          <p>Still having issues?</p>
          <p>
            Contact our support team at{" "}
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

export default PaymentFailure;
