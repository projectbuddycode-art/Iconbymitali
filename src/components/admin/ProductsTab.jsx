import React, { useState } from "react";
import { motion } from "framer-motion";
import { adminProducts } from "@/api/supabaseAdmin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Upload, X, Image, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ProductsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    category: "knitwear",
    collection: "",
    images: [],
    videos: [],
    sizes: ["XS", "S", "M", "L", "XL"],
    size_chart_image_url: "",
    stock: 0,
    featured: false,
    show_in_lookbook: false,
    related_products: []
  });

  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => adminProducts.list()
  });

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        original_price: product.original_price || "",
        category: product.category,
        collection: product.collection || "",
        images: product.images || [],
        videos: product.videos || [],
        sizes: product.sizes || ["XS", "S", "M", "L", "XL"],
        size_chart_image_url: product.size_chart_image_url || "",
        stock: product.stock || 0,
        featured: product.featured || false,
        show_in_lookbook: product.show_in_lookbook || false,
        related_products: product.related_products || []
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        original_price: "",
        category: "knitwear",
        collection: "",
        images: [],
        videos: [],
        sizes: ["XS", "S", "M", "L", "XL"],
        size_chart_image_url: "",
        stock: 0,
        featured: false,
        show_in_lookbook: false,
        related_products: []
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    setUploadError("");
    const newUrls = [];
    for (const file of files) {
      try {
        const fileUrl = await adminProducts.uploadImage(file);
        newUrls.push(fileUrl);
      } catch (err) {
        setUploadError(`Failed to upload "${file.name}". Please try again.`);
      }
    }
    setFormData(prev => ({ ...prev, images: [...prev.images, ...newUrls] }));
    setIsUploading(false);
    e.target.value = "";
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploadingVideo(true);
    setUploadError("");
    const newUrls = [];
    for (const file of files) {
      try {
        const fileUrl = await adminProducts.uploadImage(file);
        newUrls.push(fileUrl);
      } catch (err) {
        setUploadError(`Failed to upload "${file.name}". Please try again.`);
      }
    }
    setFormData(prev => ({ ...prev, videos: [...prev.videos, ...newUrls] }));
    setIsUploadingVideo(false);
    e.target.value = "";
  };

  const removeImage = (index) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const removeVideo = (index) => {
    setFormData({
      ...formData,
      videos: formData.videos.filter((_, i) => i !== index)
    });
  };

  const toggleRelatedProduct = (productId) => {
    const related = formData.related_products || [];
    if (related.includes(productId)) {
      setFormData({
        ...formData,
        related_products: related.filter(id => id !== productId)
      });
    } else {
      setFormData({
        ...formData,
        related_products: [...related, productId]
      });
    }
  };

  const saveProduct = async () => {
    try {
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await adminProducts.update(editingProduct.id, productData);
      } else {
        await adminProducts.create(productData);
      }

      queryClient.invalidateQueries(["admin-products"]);
      setIsModalOpen(false);
    } catch (error) {
      setUploadError("Error saving product: " + error.message);
    }
  };

  const deleteProduct = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await adminProducts.delete(id);
        queryClient.invalidateQueries(["admin-products"]);
      } catch (error) {
        alert("Error deleting product: " + error.message);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const availableRelatedProducts = products.filter(p => p.id !== editingProduct?.id);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#414A37]">Products ({products.length})</h2>
        <Button onClick={() => openModal()} className="bg-[#B9744A] hover:bg-[#a5663f]">
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#DBC2A6]/30"
            >
              <div className="relative h-40 bg-[#F9F7F4]">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover object-center"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-12 h-12 text-[#DBC2A6]" />
                  </div>
                )}
                {product.featured && (
                  <span className="absolute top-2 left-2 bg-[#B9744A] text-white text-xs px-2 py-1 rounded">
                    Featured
                  </span>
                )}
                {product.videos?.length > 0 && (
                  <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Video className="w-3 h-3" /> {product.videos.length}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-medium text-[#414A37] mb-1">{product.name}</h3>
                <p className="text-sm text-[#414A37]/60 mb-2">{product.category} • Stock: {product.stock || 0}</p>
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <p className="text-[#B9744A] font-medium">{formatPrice(product.price)}</p>
                  {product.original_price && product.original_price > product.price && (
                    <p className="text-sm text-[#414A37]/40 line-through">{formatPrice(product.original_price)}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openModal(product)}
                    className="flex-1"
                  >
                    <Pencil className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteProduct(product.id)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Product Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Product" : "Add New Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Product Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label>Selling Price / Discounted Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Original / Marked Price MRP (₹) <span className="text-[#414A37]/50 font-normal text-xs">— shown with strikethrough</span></Label>
                <Input
                  type="number"
                  value={formData.original_price}
                  onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                  placeholder="e.g. 2500"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => setFormData({ ...formData, category: v })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="knitwear">Knitwear</SelectItem>
                    <SelectItem value="outerwear">Outerwear</SelectItem>
                    <SelectItem value="accessories">Accessories</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Collection</Label>
                <Input
                  value={formData.collection}
                  onChange={(e) => setFormData({ ...formData, collection: e.target.value })}
                  placeholder="e.g., Second Skin"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <Label>Product Images</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {formData.images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20">
                    <img src={img} alt="" className="w-full h-full object-cover object-center rounded-lg" loading="lazy" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed border-[#DBC2A6] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#B9744A] transition-colors">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#B9744A]" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-[#414A37]/50" />
                      <span className="text-[10px] text-[#414A37]/40 mt-1">Multi</span>
                    </>
                  )}
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
              {uploadError && <p className="text-red-500 text-sm mt-2">{uploadError}</p>}
              {isUploading && <p className="text-[#B9744A] text-sm mt-2">Uploading images, please wait...</p>}
            </div>
            


            {/* Videos */}
            <div>
              <Label>Product Videos (Short clips, live images)</Label>
              <div className="mt-2 flex flex-wrap gap-3">
                {formData.videos.map((vid, index) => (
                  <div key={index} className="relative w-32 h-20">
                    <video src={vid} className="w-full h-full object-cover rounded-lg" />
                    <button
                      onClick={() => removeVideo(index)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-32 h-20 border-2 border-dashed border-[#DBC2A6] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#B9744A] transition-colors">
                  {isUploadingVideo ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#B9744A]" />
                  ) : (
                    <>
                      <Video className="w-5 h-5 text-[#414A37]/50" />
                      <span className="text-[10px] text-[#414A37]/40 mt-1">Multi</span>
                    </>
                  )}
                  <input type="file" accept="video/*" multiple className="hidden" onChange={handleVideoUpload} />
                </label>
              </div>
              {isUploadingVideo && <p className="text-[#B9744A] text-sm mt-2">Uploading videos, please wait...</p>}
            </div>
            

            {/* Related Products for Coordination */}
            <div>
              <Label>Coordinate with (Related Products)</Label>
              <div className="mt-2 max-h-40 overflow-y-auto border border-[#DBC2A6] rounded-lg p-3 space-y-2">
                {availableRelatedProducts.length === 0 ? (
                  <p className="text-sm text-[#414A37]/60">No other products available</p>
                ) : (
                  availableRelatedProducts.map((product) => (
                    <label key={product.id} className="flex items-center gap-3 cursor-pointer hover:bg-[#F9F7F4] p-2 rounded">
                      <input
                        type="checkbox"
                        checked={(formData.related_products || []).includes(product.id)}
                        onChange={() => toggleRelatedProduct(product.id)}
                        className="w-4 h-4"
                      />
                      <img src={product.images?.[0]} alt="" className="w-10 h-10 object-cover rounded" />
                      <span className="text-sm text-[#414A37]">{product.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Toggles */}
            <div className="flex gap-8">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(v) => setFormData({ ...formData, featured: v })}
                />
                <Label>Featured Product</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.show_in_lookbook}
                  onCheckedChange={(v) => setFormData({ ...formData, show_in_lookbook: v })}
                />
                <Label>Show in Lookbook</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveProduct} className="bg-[#B9744A] hover:bg-[#a5663f]">
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}