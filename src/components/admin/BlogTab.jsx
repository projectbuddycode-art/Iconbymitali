import React, { useState } from "react";
import { motion } from "framer-motion";
import { adminBlogPosts } from "@/api/supabaseAdmin";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Plus, Pencil, Trash2, Upload, FileText, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export default function BlogTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    author: "Mitali Dhumal",
    published: false,
    featured: false
  });

  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["admin-blog"],
    queryFn: () => adminBlogPosts.list()
  });

  const openModal = (post = null) => {
    if (post) {
      setEditingPost(post);
      setFormData({
        title: post.title,
        excerpt: post.excerpt || "",
        content: post.content,
        image: post.image || "",
        author: post.author || "Mitali Dhumal",
        published: post.published || false,
        featured: post.featured || false
      });
    } else {
      setEditingPost(null);
      setFormData({
        title: "",
        excerpt: "",
        content: "",
        image: "",
        author: "Mitali Dhumal",
        published: false,
        featured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileUrl = await adminBlogPosts.uploadImage(file);
      setFormData({ ...formData, image: fileUrl });
    } catch (error) {
      alert("Error uploading image: " + error.message);
    }
    setIsUploading(false);
  };

  const savePost = async () => {
    try {
      if (editingPost) {
        await adminBlogPosts.update(editingPost.id, formData);
      } else {
        await adminBlogPosts.create(formData);
      }
      queryClient.invalidateQueries(["admin-blog"]);
      setIsModalOpen(false);
    } catch (error) {
      alert("Error saving post: " + error.message);
    }
  };

  const deletePost = async (id) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await adminBlogPosts.delete(id);
      queryClient.invalidateQueries(["admin-blog"]);
    } catch (error) {
      alert("Error deleting post: " + error.message);
    }
  };

  const togglePublished = async (post) => {
    try {
      await adminBlogPosts.update(post.id, { published: !post.published });
      queryClient.invalidateQueries(["admin-blog"]);
    } catch (error) {
      alert("Error updating post: " + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#414A37]">Blog Posts ({posts.length})</h2>
        <Button onClick={() => openModal()} className="bg-[#B9744A] hover:bg-[#a5663f]">
          <Plus className="w-4 h-4 mr-2" /> Add Post
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl">
          <FileText className="w-12 h-12 text-[#DBC2A6] mx-auto mb-4" />
          <p className="text-[#414A37]/60">No blog posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-xl overflow-hidden shadow-sm border border-[#DBC2A6]/30 flex"
            >
              <div className="w-40 h-32 bg-[#F9F7F4] flex-shrink-0">
                {post.image ? (
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileText className="w-8 h-8 text-[#DBC2A6]" />
                  </div>
                )}
              </div>
              <div className="flex-1 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-[#414A37]">{post.title}</h3>
                      {post.published ? (
                        <Badge className="bg-green-100 text-green-800">Published</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
                      )}
                      {post.featured && (
                        <Badge className="bg-[#B9744A] text-white">Featured</Badge>
                      )}
                    </div>
                    <p className="text-sm text-[#414A37]/60 mb-2">
                      By {post.author || "Mitali Dhumal"} • {post.created_date && format(new Date(post.created_date), "MMM d, yyyy")}
                    </p>
                    <p className="text-sm text-[#414A37]/70 line-clamp-2">
                      {post.excerpt || post.content?.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePublished(post)}
                      title={post.published ? "Unpublish" : "Publish"}
                    >
                      {post.published ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openModal(post)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deletePost(post.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Blog Post Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPost ? "Edit Blog Post" : "Create New Post"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Featured Image</Label>
              <div className="mt-2">
                {formData.image ? (
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <img src={formData.image} alt="" className="w-full h-full object-cover" />
                    <button
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                ) : (
                  <label className="block w-full h-32 border-2 border-dashed border-[#DBC2A6] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#B9744A] transition-colors">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#B9744A]" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-8 h-8 text-[#414A37]/40 mx-auto mb-2" />
                        <span className="text-sm text-[#414A37]/60">Upload image</span>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>
            </div>

            <div>
              <Label>Excerpt (optional)</Label>
              <Textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                className="mt-1"
                rows={2}
                placeholder="A brief summary of the post..."
              />
            </div>

            <div>
              <Label>Content</Label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-1"
                rows={8}
              />
            </div>

            <div>
              <Label>Author</Label>
              <Input
                value={formData.author}
                onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                className="mt-1"
              />
            </div>

            <div className="flex gap-8">
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.published}
                  onCheckedChange={(v) => setFormData({ ...formData, published: v })}
                />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={formData.featured}
                  onCheckedChange={(v) => setFormData({ ...formData, featured: v })}
                />
                <Label>Featured</Label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={savePost} className="bg-[#B9744A] hover:bg-[#a5663f]">
                {editingPost ? "Save Changes" : "Create Post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}