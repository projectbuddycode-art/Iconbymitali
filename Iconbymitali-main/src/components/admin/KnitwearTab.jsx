import React, { useState, useEffect } from "react";
import { adminKnitwearItems, adminCollections } from "@/api/supabaseAdmin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2, Upload, X, Image, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { useAutosaveDraft, useBeforeUnload, SaveStateIndicator } from "@/hooks/useAutosaveDraft";

const emptyForm = { title: "", description: "", image: "", collection_id: null, sort_order: 0 };

export default function KnitwearTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [isUploading, setIsUploading] = useState(false);
  const [collections, setCollections] = useState([]);
  const [saveError, setSaveError] = useState("");
  const queryClient = useQueryClient();
  
  // Autosave hook
  const { saveState, clearDraft } = useAutosaveDraft('knitwear-form', formData);
  
  // Beforeunload warning
  const hasUnsavedChanges = formData !== emptyForm && JSON.stringify(formData) !== JSON.stringify(editingItem ? { 
    title: editingItem.title, 
    description: editingItem.description || "", 
    image: editingItem.image, 
    collection_id: editingItem.collection_id || null, 
    sort_order: editingItem.sort_order || 0 
  } : emptyForm);
  
  useBeforeUnload(hasUnsavedChanges && isModalOpen);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["knitwear-items"],
    queryFn: () => adminKnitwearItems.list(),
  });

  // Load collections on mount
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const data = await adminCollections.list();
      setCollections(data || []);
    } catch (error) {
      console.error("Failed to load collections:", error);
      setSaveError("Failed to load collections");
    }
  };

  const openModal = (item = null) => {
    clearDraft();
    setSaveError("");
    setEditingItem(item);
    setFormData(item ? { 
      title: item.title, 
      description: item.description || "", 
      image: item.image, 
      collection_id: item.collection_id || null, 
      sort_order: item.sort_order || 0 
    } : emptyForm);
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fileUrl = await adminKnitwearItems.uploadImage(file);
      setFormData(prev => ({ ...prev, image: fileUrl }));
    } catch (error) {
      alert("Error uploading image: " + error.message);
    }
    setIsUploading(false);
    e.target.value = "";
  };

  const saveItem = async () => {
    try {
      setSaveError("");
      
      // Validate form
      if (!formData.title) {
        setSaveError("Title is required");
        return;
      }
      if (!formData.image) {
        setSaveError("Image is required");
        return;
      }
      if (formData.collection_id === null) {
        setSaveError("Collection is required");
        return;
      }
      
      const data = { ...formData, sort_order: Number(formData.sort_order) };
      if (editingItem) {
        await adminKnitwearItems.update(editingItem.id, data);
      } else {
        await adminKnitwearItems.create(data);
      }
      queryClient.invalidateQueries(["knitwear-items"]);
      clearDraft();
      setIsModalOpen(false);
      setSaveError("");
    } catch (error) {
      setSaveError(error.message || "Error saving item");
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm("Delete this knitwear item?")) {
      try {
        await adminKnitwearItems.delete(id);
        queryClient.invalidateQueries(["knitwear-items"]);
      } catch (error) {
        alert("Error deleting item: " + error.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#414A37]">Timeless Knitwear ({items.length})</h2>
        <Button onClick={() => openModal()} className="bg-[#B9744A] hover:bg-[#a5663f]">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-gray-100 rounded-xl h-48 animate-pulse" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 text-[#414A37]/50">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No knitwear items yet. Add your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#DBC2A6]/30">
              <div className="relative h-40 bg-[#F9F7F4]">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover object-center" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-10 h-10 text-[#DBC2A6]" />
                  </div>
                )}
                <span className="absolute top-2 left-2 bg-[#b2985d] text-white text-xs px-2 py-0.5 rounded-full">
                  {item.collection}
                </span>
              </div>
              <div className="p-3">
                <p className="font-medium text-[#414A37] text-sm truncate">{item.title}</p>
                <p className="text-xs text-[#414A37]/50 mb-3 truncate">{item.description}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openModal(item)} className="flex-1">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => deleteItem(item.id)} className="text-red-500 hover:text-red-600">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle>{editingItem ? "Edit Knitwear Item" : "Add Knitwear Item"}</DialogTitle>
              <SaveStateIndicator state={saveState} />
            </div>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {saveError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{saveError}</p>
              </div>
            )}
            
            <div>
              <Label>Title *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="mt-1" placeholder="e.g. Ivory Block Knit Top" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1" rows={2} placeholder="Short description" />
            </div>
            <div>
              <Label>Collection *</Label>
              <Select
                value={formData.collection_id ? String(formData.collection_id) : ""}
                onValueChange={(v) => setFormData({ ...formData, collection_id: v ? parseInt(v) : null })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.map((col) => (
                    <SelectItem key={col.id} value={String(col.id)}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input type="number" value={formData.sort_order} onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })} className="mt-1" placeholder="0" />
            </div>
            <div>
              <Label>Image *</Label>
              <div className="mt-2 flex items-center gap-4">
                {formData.image && (
                  <div className="relative w-20 h-20">
                    <img src={formData.image} alt="" className="w-full h-full object-cover rounded-lg" />
                    <button onClick={() => setFormData({ ...formData, image: "" })} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="w-20 h-20 border-2 border-dashed border-[#DBC2A6] rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#B9744A] transition-colors">
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#B9744A]" />
                  ) : (
                    <>
                      <Upload className="w-5 h-5 text-[#414A37]/50" />
                      <span className="text-[10px] text-[#414A37]/40 mt-1">Upload</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => {
                clearDraft();
                setIsModalOpen(false);
              }}>Cancel</Button>
              <Button onClick={saveItem} className="bg-[#B9744A] hover:bg-[#a5663f]" disabled={!formData.title || !formData.image || !formData.collection_id}>
                {editingItem ? "Save Changes" : "Create Item"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}