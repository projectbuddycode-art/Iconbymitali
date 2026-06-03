# Admin Components - Implementation Guide

This guide shows how to update admin components to:
1. Use collection_id foreign key
2. Implement autosave + draft recovery  
3. Add beforeunload warnings
4. Show save state indicators

---

## ProductsTab.jsx - Complete Example

### Import the new hooks and utilities

```javascript
import { useAutosaveDraft, useBeforeUnload, SaveStateIndicator } from '@/hooks/useAutosaveDraft';
import { adminCollections } from '@/api/supabaseAdmin';
```

### State changes

```javascript
export default function ProductsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [collections, setCollections] = useState([]);  // ✅ NEW
  const [saveToast, setSaveToast] = useState(null);    // ✅ NEW
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    category: "knitwear",
    collection_id: null,  // ✅ Changed from collection: ""
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
  
  // ✅ NEW: Autosave hook
  const {
    hasDraft,
    saveState,
    lastSaveError,
    restoreDraft,
    clearDraft
  } = useAutosaveDraft('product-form', formData, 5000);

  // ✅ NEW: beforeunload warning
  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(initialData);
  useBeforeUnload(hasUnsavedChanges && isModalOpen);
```

### Load collections on mount

```javascript
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => adminProducts.list()
  });

  // ✅ NEW: Load collections
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const cols = await adminCollections.list();
      setCollections(cols);
    } catch (error) {
      console.error('❌ Failed to load collections:', error);
    }
  };
```

### Open modal function - restore draft

```javascript
  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price,
        original_price: product.original_price || "",
        category: product.category,
        collection_id: product.collection_id || null,  // ✅ FK instead of string
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
      
      // ✅ NEW: Try to restore draft
      const draft = restoreDraft();
      if (draft && hasDraft) {
        setFormData(draft);
        setSaveToast({ type: 'info', message: '📋 Draft restored' });
      } else {
        setFormData({
          name: "",
          description: "",
          price: "",
          original_price: "",
          category: "knitwear",
          collection_id: null,  // ✅ FK instead of string
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
    }
    setIsModalOpen(true);
  };
```

### Save product function - with error handling

```javascript
  const saveProduct = async () => {
    try {
      // ✅ Validate collection_id if provided
      if (formData.collection_id) {
        const collection = collections.find(c => c.id === formData.collection_id);
        if (!collection) {
          setSaveToast({
            type: 'error',
            message: '❌ Please select a valid collection'
          });
          return;
        }
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
        stock: parseInt(formData.stock)
      };

      if (editingProduct) {
        await adminProducts.update(editingProduct.id, productData);
        setSaveToast({
          type: 'success',
          message: '✅ Product updated successfully'
        });
      } else {
        await adminProducts.create(productData);
        setSaveToast({
          type: 'success',
          message: '✅ Product created successfully'
        });
      }

      // ✅ Clear draft after successful save
      clearDraft();
      queryClient.invalidateQueries(["admin-products"]);
      setIsModalOpen(false);
      
    } catch (error) {
      console.error('❌ Save error:', error);
      setSaveToast({
        type: 'error',
        message: error.message || 'Failed to save product'
      });
    }
  };
```

### Form UI - Collection select dropdown

**Replace the collection input with:**

```jsx
              <div>
                <Label>Collection</Label>
                <Select
                  value={formData.collection_id?.toString() || ''}
                  onValueChange={(value) => 
                    setFormData({ 
                      ...formData, 
                      collection_id: value ? parseInt(value) : null
                    })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a collection" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None (Optional)</SelectItem>
                    {collections.map((col) => (
                      <SelectItem key={col.id} value={col.id.toString()}>
                        {col.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
```

### Save button - with state indicator

**Update the save button:**

```jsx
            <div className="flex justify-end gap-3 pt-4 items-center">
              {/* ✅ NEW: Save state indicator */}
              <SaveStateIndicator 
                saveState={saveState} 
                error={lastSaveError}
              />
              
              <Button variant="outline" onClick={() => {
                setIsModalOpen(false);
                clearDraft();  // ✅ Clear draft when closing
              }}>
                Cancel
              </Button>
              
              <Button 
                onClick={saveProduct} 
                className="bg-[#B9744A] hover:bg-[#a5663f]"
                disabled={saveState === 'saving' || !formData.name}
              >
                {editingProduct ? "Save Changes" : "Create Product"}
              </Button>
            </div>
```

### Toast notification component

```jsx
  return (
    <div>
      {/* ✅ NEW: Toast notifications */}
      {saveToast && (
        <div className={`fixed top-4 right-4 p-3 rounded-lg text-white z-50 ${
          saveToast.type === 'error' ? 'bg-red-500' :
          saveToast.type === 'success' ? 'bg-green-500' :
          'bg-blue-500'
        }`}>
          {saveToast.message}
        </div>
      )}

      {/* ... rest of component ... */}
    </div>
  );
```

---

## KnitwearTab.jsx - Similar Pattern

Apply the same pattern:

```javascript
// 1. Import hooks
import { useAutosaveDraft, useBeforeUnload } from '@/hooks/useAutosaveDraft';

// 2. Initialize autosave
const { hasDraft, restoreDraft, clearDraft, saveState } = useAutosaveDraft(
  'knitwear-form', 
  formData
);

// 3. Update form data structure
const [formData, setFormData] = useState({ 
  title: "", 
  description: "", 
  image: "", 
  collection_id: null,  // ✅ Changed from collection: ""
  sort_order: 0 
});

// 4. Load collections on mount
useEffect(() => {
  loadCollections();
}, []);

// 5. Update select dropdown
<SelectContent>
  {collections.map((col) => (
    <SelectItem key={col.id} value={col.id.toString()}>
      {col.name}
    </SelectItem>
  ))}
</SelectContent>

// 6. Validate collection_id on save
if (formData.collection_id) {
  const collection = collections.find(c => c.id === formData.collection_id);
  if (!collection) throw new Error('Invalid collection');
}

// 7. Add beforeunload + autosave indicators
```

---

## BlogTab.jsx & CouponsTab.jsx

These don't use collections, but should get:
- ✅ Autosave functionality
- ✅ beforeunload warning
- ✅ Draft restoration
- ✅ Save state indicators

```javascript
const {
  saveState,
  lastSaveError,
  restoreDraft,
  clearDraft
} = useAutosaveDraft('blog-form', formData);

useBeforeUnload(hasChanges && isModalOpen);
```

---

## Toast Notification Component (Optional)

Create `src/components/ui/toast-notification.jsx`:

```jsx
import { useState, useEffect } from 'react';

export function Toast({ message, type = 'info', duration = 3000 }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  const bgColor = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500'
  }[type] || 'bg-gray-500';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-slide-in`}>
      {message}
    </div>
  );
}
```

---

## Testing Each Component

### ProductsTab Test
```javascript
test('creates product with collection_id FK', async () => {
  const { getByText, getByPlaceholderText } = render(<ProductsTab />);
  
  // Fill form
  fireEvent.change(getByPlaceholderText('Product name'), {
    target: { value: 'Test Product' }
  });
  
  // Select collection
  fireEvent.click(getByText('Select a collection'));
  fireEvent.click(getByText('Second Skin'));
  
  // Save
  fireEvent.click(getByText('Create Product'));
  
  // Verify no error and collection_id sent
  await waitFor(() => {
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        collection_id: 1,
        name: 'Test Product'
      })
    );
  });
});

test('restores draft on modal open', async () => {
  // Close and reopen form
  const { getByText, queryByText } = render(<ProductsTab />);
  
  // Verify draft restoration message
  expect(queryByText(/Draft restored/)).toBeInTheDocument();
});

test('warns before leaving with unsaved changes', async () => {
  const { getByText } = render(<ProductsTab />);
  
  fireEvent.click(getByText('Add Product'));
  // Change form
  fireEvent.change(/* ... */);
  
  // Simulate page unload
  const event = new Event('beforeunload');
  window.dispatchEvent(event);
  
  expect(event.returnValue).toBeTruthy();
});
```

---

## Deployment Checklist

- [ ] Update all admin form components
- [ ] Test in staging environment
- [ ] Verify collections FK works
- [ ] Verify autosave persists drafts
- [ ] Verify beforeunload warnings show
- [ ] Verify error messages display
- [ ] Verify session persistence
- [ ] Verify token refresh works
- [ ] Deploy to production
- [ ] Monitor error logs 24 hours

---

## Quick Reference

### New Imports
```javascript
import { useAutosaveDraft, useBeforeUnload, SaveStateIndicator } from '@/hooks/useAutosaveDraft';
import { adminCollections } from '@/api/supabaseAdmin';
```

### State Changes
```javascript
collection_id: null  // Instead of collection: ""
```

### Collection Select
```jsx
<SelectContent>
  {collections.map((col) => (
    <SelectItem key={col.id} value={col.id.toString()}>
      {col.name}
    </SelectItem>
  ))}
</SelectContent>
```

### Validate FK
```javascript
if (formData.collection_id) {
  const collection = collections.find(c => c.id === formData.collection_id);
  if (!collection) throw new Error('Invalid collection');
}
```

### Clear Draft
```javascript
clearDraft();  // After successful save or on modal close
```

### Show Save State
```jsx
<SaveStateIndicator saveState={saveState} error={lastSaveError} />
```
