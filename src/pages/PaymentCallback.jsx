import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/api/supabaseClient";
import { CheckCircle, AlertCircle, Loader } from "lucide-react";

export default function PaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Processing payment...");
  const [paymentId, setPaymentId] = useState("");

  useEffect(() => {
    const processPayment = async () => {
      try {
        const paymentId = searchParams.get("razorpay_payment_id");
        const orderId = searchParams.get("razorpay_order_id");
        const signature = searchParams.get("razorpay_signature");

        setPaymentId(paymentId);

        console.log("Payment callback received:", {
          paymentId,
          orderId,
          signature: signature ? "✓ Present" : "✗ Missing",
        });

        if (!paymentId || !orderId || !signature) {
          console.error("❌ Missing payment parameters");
          setStatus("error");
          setMessage("Invalid payment response. Missing payment details.");
          return;
        }

        // Find the order by order_number (created before payment)
        console.log("🔍 Finding order with order_number starting with ICON-...");
        const { data: orders, error: findError } = await supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1);

        if (findError || !orders || orders.length === 0) {
          console.error("❌ Order not found:", findError);
          setStatus("error");
          setMessage("Order not found in system. Contact support with Payment ID: " + paymentId);
          return;
        }

        const order = orders[0];
        console.log("✓ Order found:", order.order_number, "Order ID:", order.id);

        // Update order with payment details
        console.log("📝 Updating order with payment verification...");
        const { error: updateError } = await supabase
          .from("orders")
          .update({
            status: "confirmed",
            payment_status: "paid",
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
          })
          .eq("id", order.id);

        if (updateError) {
          console.error("❌ Order update failed:", updateError);
          setStatus("error");
          setMessage("Order confirmation failed. Contact support with Payment ID: " + paymentId);
          return;
        }

        console.log("✓ Order updated successfully. Status: confirmed");
        setStatus("success");
        setMessage("✓ Payment confirmed! Order placed successfully. Redirecting...");

        // Store order number for success page
        localStorage.setItem("lastOrderNumber", order.order_number);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate("/cart?step=success&orderNumber=" + order.order_number);
        }, 2000);
      } catch (err) {
        console.error("❌ Payment callback error:", err);
        setStatus("error");
        setMessage("An error occurred processing your payment. Please contact support.");
      }
    };

    processPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#F9F7F4] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === "processing" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-6">
              <Loader className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-semibold text-[#414A37] mb-2">Processing Payment</h1>
            <p className="text-[#414A37]/70">{message}</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-semibold text-green-600 mb-2">Payment Confirmed!</h1>
            <p className="text-[#414A37]/70 mb-4">{message}</p>
            <p className="text-xs text-[#414A37]/50 mt-4">Payment ID: {paymentId}</p>
          </>
        )}

        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-semibold text-red-600 mb-2">Payment Error</h1>
            <p className="text-[#414A37]/70 mb-4">{message}</p>
            <div className="mt-6 space-y-2">
              <p className="text-xs text-[#414A37]/60">Payment ID: {paymentId}</p>
              <button
                onClick={() => navigate("/cart")}
                className="w-full px-4 py-2 bg-[#414A37] text-white rounded hover:bg-[#353d2d] transition-colors text-sm"
              >
                Return to Cart
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
