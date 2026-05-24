import React, { useState } from "react";
import { adminOrders } from "@/api/supabaseAdmin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Package, Mail, Phone, MapPin, Truck, ExternalLink, Trash2, Archive } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function OrdersTab() {
  const queryClient = useQueryClient();
  const [awbInputs, setAwbInputs] = useState({});

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => adminOrders.list()
  });

  const updateOrderStatus = async (orderId, status) => {
    try {
      await adminOrders.updateStatus(orderId, status);
      queryClient.invalidateQueries(["admin-orders"]);
    } catch (error) {
      alert("Error updating order: " + error.message);
    }
  };

  const updatePaymentStatus = async (orderId, payment_status) => {
    try {
      await adminOrders.updatePaymentStatus(orderId, payment_status);
      queryClient.invalidateQueries(["admin-orders"]);
    } catch (error) {
      alert("Error updating payment: " + error.message);
    }
  };

  const saveAwb = async (orderId) => {
    const awb = awbInputs[orderId]?.trim();
    if (!awb) return;
    try {
      await adminOrders.updateTrackingAwb(orderId, awb);
      setAwbInputs({ ...awbInputs, [orderId]: "" });
      queryClient.invalidateQueries(["admin-orders"]);
    } catch (error) {
      alert("Error saving AWB: " + error.message);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to permanently delete this order? This cannot be undone.")) return;
    try {
      await adminOrders.delete(orderId);
      queryClient.invalidateQueries(["admin-orders"]);
    } catch (error) {
      alert("Error deleting order: " + error.message);
    }
  };

  const archiveOrder = async (orderId) => {
    try {
      await adminOrders.updateStatus(orderId, "cancelled");
      queryClient.invalidateQueries(["admin-orders"]);
    } catch (error) {
      alert("Error archiving order: " + error.message);
    }
  };

  const getAwbFromOrder = (order) => {
    return order.shiprocket_awb || "";
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-purple-100 text-purple-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800"
  };

  const paymentColors = {
    pending: "bg-yellow-100 text-yellow-800",
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    refunded: "bg-gray-100 text-gray-800"
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#414A37]">Orders ({orders.length})</h2>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <Package className="w-12 h-12 text-[#DBC2A6] mx-auto mb-4" />
          <p className="text-[#414A37]/60">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl p-6 shadow-sm border border-[#DBC2A6]/30">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-[#414A37]">{order.order_number}</h3>
                    <Badge className={statusColors[order.status || "pending"]}>
                      {order.status || "pending"}
                    </Badge>
                    <Badge className={paymentColors[order.payment_status || "pending"]}>
                      Payment: {order.payment_status || "pending"}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#414A37]/60">
                    {order.created_at && format(new Date(order.created_at), "MMM d, yyyy 'at' h:mm a")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-semibold text-[#B9744A]">
                    {formatPrice(order.total_amount)}
                  </p>
                  <p className="text-sm text-[#414A37]/60">
                    {order.items?.length || 0} item(s)
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-4">
                {/* Customer Info */}
                <div className="space-y-2">
                  <h4 className="font-medium text-[#414A37] text-sm">Customer</h4>
                  <p className="text-[#414A37]">{order.customer_name}</p>
                  <p className="text-sm text-[#414A37]/70 flex items-center gap-2">
                    <Mail className="w-4 h-4" /> {order.customer_email}
                  </p>
                  {order.customer_phone && (
                    <p className="text-sm text-[#414A37]/70 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {order.customer_phone}
                    </p>
                  )}
                </div>

                {/* Shipping Address */}
                <div className="space-y-2">
                  <h4 className="font-medium text-[#414A37] text-sm">Shipping Address</h4>
                  {order.shipping_address && (
                    <div className="text-sm text-[#414A37]/70 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <div>
                        <p>{order.shipping_address.street}</p>
                        <p>{order.shipping_address.city}, {order.shipping_address.state}</p>
                        <p>{order.shipping_address.pincode}, {order.shipping_address.country}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Items */}
                <div className="space-y-2">
                  <h4 className="font-medium text-[#414A37] text-sm">Items</h4>
                  <div className="space-y-1">
                    {order.items?.map((item, index) => (
                      <p key={index} className="text-sm text-[#414A37]/70">
                        {item.product_name} ({item.size}) × {item.quantity}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

              {/* AWB / Tracking */}
              <div className="pt-4 border-t border-[#DBC2A6]/30 mb-4">
                <p className="text-sm text-[#414A37]/60 mb-2 flex items-center gap-1"><Truck className="w-4 h-4" /> Shiprocket AWB / Tracking Number</p>
                <div className="flex gap-2 items-center">
                  <Input
                    placeholder="Enter AWB number"
                    defaultValue={getAwbFromOrder(order)}
                    onChange={(e) => setAwbInputs(prev => ({ ...prev, [order.id]: e.target.value }))}
                    className="max-w-xs text-sm"
                  />
                  <button
                    onClick={() => saveAwb(order.id)}
                    className="px-3 py-2 bg-[#414A37] text-white text-xs rounded-lg hover:bg-[#353d2d] transition-colors"
                  >
                    Save
                  </button>
                  {getAwbFromOrder(order) && (
                    <a
                      href={`https://shiprocket.co/tracking/${getAwbFromOrder(order)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-[#B9744A] hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Track
                    </a>
                  )}
                </div>
              </div>

              {/* Status Controls */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-[#DBC2A6]/30 items-center">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#414A37]/60">Order Status:</span>
                  <Select
                    value={order.status || "pending"}
                    onValueChange={(v) => updateOrderStatus(order.id, v)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#414A37]/60">Payment:</span>
                  <Select
                    value={order.payment_status || "pending"}
                    onValueChange={(v) => updatePaymentStatus(order.id, v)}
                  >
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="ml-auto flex gap-2">
                  <button
                    onClick={() => archiveOrder(order.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs text-[#414A37] border border-[#DBC2A6] rounded-lg hover:bg-[#F9F7F4] transition-colors"
                    title="Archive order"
                  >
                    <Archive className="w-3.5 h-3.5" /> Archive
                  </button>
                  <button
                    onClick={() => deleteOrder(order.id)}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete order permanently"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}