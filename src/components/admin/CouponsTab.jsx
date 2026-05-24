import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminCoupons } from "@/api/supabaseAdmin";
import { format } from "date-fns";

export default function CouponsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage", // "percentage" or "fixed"
    discount_value: "",
    minimum_order_value: "",
    usage_limit: "",
    expiry_date: "",
    is_active: true
  });
  const [errorMessage, setErrorMessage] = useState("");
  const queryClient = useQueryClient();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["admin-coupons"],
    queryFn: () => adminCoupons.list()
  });

  const openModal = (coupon = null) => {
    setErrorMessage("");
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || "",
        discount_type: coupon.discount_type || "percentage",
        discount_value: coupon.discount_value,
        minimum_order_value: coupon.minimum_order_value || "",
        usage_limit: coupon.usage_limit || "",
        expiry_date: coupon.expiry_date ? coupon.expiry_date.split('T')[0] : "",
        is_active: coupon.is_active !== false
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: "",
        description: "",
        discount_type: "percentage",
        discount_value: "",
        minimum_order_value: "",
        usage_limit: "",
        expiry_date: "",
        is_active: true
      });
    }
    setIsModalOpen(true);
  };

  const validateForm = () => {
    if (!formData.code.trim()) {
      setErrorMessage("Coupon code is required");
      return false;
    }
    if (!/^[A-Z0-9-]+$/.test(formData.code)) {
      setErrorMessage("Coupon code can only contain uppercase letters, numbers, and hyphens");
      return false;
    }
    if (!formData.discount_value || isNaN(formData.discount_value) || formData.discount_value <= 0) {
      setErrorMessage("Discount value must be a positive number");
      return false;
    }
    if (formData.discount_type === "percentage" && formData.discount_value > 100) {
      setErrorMessage("Percentage discount cannot be more than 100%");
      return false;
    }
    return true;
  };

  const saveCoupon = async () => {
    if (!validateForm()) return;

    try {
      const couponData = {
        code: formData.code.toUpperCase(),
        description: formData.description,
        discount_type: formData.discount_type,
        discount_value: parseFloat(formData.discount_value),
        minimum_order_value: formData.minimum_order_value ? parseFloat(formData.minimum_order_value) : 0,
        usage_limit: formData.usage_limit ? parseInt(formData.usage_limit) : null,
        expiry_date: formData.expiry_date ? new Date(formData.expiry_date).toISOString() : null,
        is_active: formData.is_active
      };

      if (editingCoupon) {
        await adminCoupons.update(editingCoupon.id, couponData);
      } else {
        await adminCoupons.create(couponData);
      }

      queryClient.invalidateQueries(["admin-coupons"]);
      setIsModalOpen(false);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Failed to save coupon");
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await adminCoupons.delete(id);
      queryClient.invalidateQueries(["admin-coupons"]);
    } catch (error) {
      alert("Error deleting coupon: " + error.message);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await adminCoupons.toggleActive(coupon.id, !coupon.is_active);
      queryClient.invalidateQueries(["admin-coupons"]);
    } catch (error) {
      alert("Error updating coupon: " + error.message);
    }
  };

  const copyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
  };

  const formatDiscount = (coupon) => {
    if (coupon.discount_type === "percentage") {
      return `${coupon.discount_value}%`;
    } else {
      return `₹${coupon.discount_value}`;
    }
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#414A37]">Coupons ({coupons.length})</h2>
          <p className="text-sm text-[#414A37]/60 mt-1">Create and manage discount coupons</p>
        </div>
        <Button 
          onClick={() => openModal()} 
          className="bg-[#B9744A] hover:bg-[#a5663f]"
        >
          <Plus className="w-4 h-4 mr-2" /> Create Coupon
        </Button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl">
          <p className="text-[#414A37]/50">No coupons yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {coupons.map((coupon, index) => (
            <motion.div
              key={coupon.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <code className="text-lg font-bold text-[#B9744A] bg-[#F9F7F4] px-3 py-2 rounded-lg">
                      {coupon.code}
                    </code>
                    <button
                      onClick={() => copyCouponCode(coupon.code)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Copy code"
                    >
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  {coupon.description && (
                    <p className="text-sm text-[#414A37]/60 mt-1">{coupon.description}</p>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-2xl font-bold text-[#414A37]">
                    {formatDiscount(coupon)}
                  </p>
                  <p className="text-xs text-[#414A37]/60 mt-1">
                    {coupon.discount_type === "percentage" ? "Off" : "Discount"}
                  </p>
                </div>

                <div>
                  <div className="flex flex-col gap-2">
                    {coupon.minimum_order_value > 0 && (
                      <p className="text-sm text-[#414A37]/60">
                        Min: ₹{coupon.minimum_order_value}
                      </p>
                    )}
                    {coupon.usage_limit && (
                      <p className="text-sm text-[#414A37]/60">
                        Limit: {coupon.usage_limit}
                      </p>
                    )}
                    {coupon.expiry_date && (
                      <p className={`text-sm ${isExpired(coupon.expiry_date) ? 'text-red-600' : 'text-[#414A37]/60'}`}>
                        {isExpired(coupon.expiry_date) ? '❌ Expired' : `📅 ${format(new Date(coupon.expiry_date), 'MMM d, yyyy')}`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => toggleActive(coupon)}
                    className={`p-2 rounded-lg transition-colors ${
                      coupon.is_active 
                        ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={coupon.is_active ? "Active - Click to deactivate" : "Inactive - Click to activate"}
                  >
                    {coupon.is_active ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => openModal(coupon)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Edit coupon"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteCoupon(coupon.id)}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Delete coupon"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? "Edit Coupon" : "Create New Coupon"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {errorMessage}
              </div>
            )}

            <div>
              <Label htmlFor="code">Coupon Code *</Label>
              <Input
                id="code"
                placeholder="e.g., SUMMER20"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">Letters, numbers, and hyphens only</p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="e.g., Summer sale 20% off"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 resize-none"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountType">Discount Type *</Label>
                <Select value={formData.discount_type} onValueChange={(value) => setFormData({ ...formData, discount_type: value })}>
                  <SelectTrigger id="discountType" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="discountValue">Discount Value *</Label>
                <Input
                  id="discountValue"
                  type="number"
                  placeholder="20"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  className="mt-1"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="minOrder">Minimum Order Value (Optional)</Label>
              <Input
                id="minOrder"
                type="number"
                placeholder="500"
                value={formData.minimum_order_value}
                onChange={(e) => setFormData({ ...formData, minimum_order_value: e.target.value })}
                className="mt-1"
                step="1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="usageLimit">Usage Limit (Optional)</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  placeholder="100"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded"
              />
              <Label htmlFor="isActive" className="cursor-pointer mb-0">
                Active (visible to customers)
              </Label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={saveCoupon}
                className="flex-1 bg-[#B9744A] hover:bg-[#a5663f]"
              >
                {editingCoupon ? "Update" : "Create"} Coupon
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
