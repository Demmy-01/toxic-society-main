import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Search, Edit, Trash2, Grid, List, Upload, X, Loader2, ImageIcon, Check } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProductsProps {
  onLogout: () => void;
}

interface DBProduct {
  id: string;
  name: string;
  category: string;
  collection: string;
  price: number;
  original_price: number | null;
  images: string[];
  sizes: string[];
  description: string | null;
  tag: string | null;
  in_stock: boolean;
  drop_id: string | null;
  created_at: string;
}

interface Drop {
  id: string;
  name: string;
}

const CATEGORIES = ['Hoodies', 'T-Shirts', 'Jackets', 'Pants', 'Accessories', 'Caps', 'Tops', 'Bottoms'];
const COLLECTIONS = ['Core', 'Limited', 'Seasonal'];
const TAGS = ['NEW', 'SALE', 'LIMITED', 'EXCLUSIVE'];
const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const COLOR_OPTIONS = [
  { name: 'Red',    hex: '#EF4444' },
  { name: 'Orange', hex: '#F97316' },
  { name: 'Yellow', hex: '#EAB308' },
  { name: 'Green',  hex: '#22C55E' },
  { name: 'Blue',   hex: '#3B82F6' },
  { name: 'Beige',  hex: '#D4C5A9' },
  { name: 'White',  hex: '#FFFFFF' },
  { name: 'Black',  hex: '#1a1a1a' },
];

const emptyForm = {
  name: '',
  category: CATEGORIES[0],
  collection: COLLECTIONS[0],
  price: '',
  original_price: '',
  sizes: [] as string[],
  colors: [] as string[],
  description: '',
  tag: '',
  in_stock: true,
  drop_id: '',
};

export default function Products({ onLogout }: ProductsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Data
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [drops, setDrops] = useState<Drop[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form state
  const [form, setForm] = useState({ ...emptyForm });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [fileSizeError, setFileSizeError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    setProducts(data ?? []);
    setLoadingProducts(false);
  };

  const fetchDrops = async () => {
    const { data } = await supabase.from('drops').select('id, name').order('name');
    setDrops(data ?? []);
  };

  useEffect(() => {
    fetchProducts();
    fetchDrops();
  }, []);

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Image handling
  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    setFileSizeError('');
    const currentTotal = existingImages.length + imageFiles.length;
    const remaining = MAX_IMAGES - currentTotal;
    if (remaining <= 0) return;
    const imageArr = Array.from(files).filter((f) => f.type.startsWith('image/'));

    // Check file sizes
    const oversized = imageArr.filter((f) => f.size > MAX_FILE_SIZE);
    if (oversized.length > 0) {
      const names = oversized.map((f) => f.name).join(', ');
      setFileSizeError(
        `File${oversized.length > 1 ? 's' : ''} too large (max 5MB): ${names}. Please select smaller files.`
      );
      // Auto-dismiss after 4 seconds
      setTimeout(() => setFileSizeError(''), 4000);
      // Reset input so user can re-select
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const arr = imageArr.slice(0, remaining);
    setImageFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e) => setImagePreviews((prev) => [...prev, e.target?.result as string]);
      reader.readAsDataURL(f);
    });
  };

  const removeNewImage = (idx: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== idx));
    setImagePreviews((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
  };

  // Upload images to Cloudinary via backend
  const uploadImages = async (): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of imageFiles) {
      const path = `products/${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const { data, error } = await supabase.storage.from('product-images').upload(path, file, { upsert: true });
      if (!error && data?.path) {
        // data.path is now the full Cloudinary URL
        urls.push(data.path);
      }
    }
    return urls;
  };

  const openAdd = () => {
    setForm({ ...emptyForm });
    setImageFiles([]);
    setImagePreviews([]);
    setExistingImages([]);
    setEditId(null);
    setSaveMsg('');
    setShowForm(true);
  };

  const openEdit = (p: DBProduct) => {
    setForm({
      name: p.name,
      category: p.category,
      collection: p.collection,
      price: String(p.price),
      original_price: p.original_price ? String(p.original_price) : '',
      sizes: p.sizes ?? [],
      colors: (p as any).colors ?? [],
      description: p.description ?? '',
      tag: p.tag ?? '',
      in_stock: p.in_stock,
      drop_id: p.drop_id ?? '',
    });
    setExistingImages(p.images ?? []);
    setImageFiles([]);
    setImagePreviews([]);
    setEditId(p.id);
    setSaveMsg('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');

    // Upload new images
    const newUrls = await uploadImages();
    const allImages = [...existingImages, ...newUrls];

    const payload = {
      name: form.name,
      category: form.category,
      collection: form.collection,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : null,
      images: allImages,
      sizes: form.sizes,
      colors: form.colors,
      description: form.description || null,
      tag: form.tag || null,
      in_stock: form.in_stock,
      drop_id: form.drop_id || null,
    };

    if (editId) {
      await supabase.from('products').update(payload).eq('id', editId);
    } else {
      await supabase.from('products').insert(payload);
    }

    setSaving(false);
    setSaveMsg(editId ? 'Product updated!' : 'Product added!');
    await fetchProducts();
    setTimeout(() => {
      setShowForm(false);
      setSaveMsg('');
    }, 1200);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const toggleColor = (color: string) => {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter((c) => c !== color)
        : [...prev.colors, color],
    }));
  };

  const ALL_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', 'ONE SIZE'];

  return (
    <DashboardLayout title="Products" onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl text-white mb-1">Product Management</h1>
          <p className="text-neutral-400 text-sm">{products.length} products in catalog</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {['All', ...CATEGORIES].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                  selectedCategory === cat ? 'bg-[#dc2626] text-white' : 'bg-[#0f0f0f] text-neutral-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors w-56"
              />
            </div>
            <div className="flex items-center gap-1 bg-[#0f0f0f] rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-[#dc2626] text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-[#dc2626] text-white' : 'text-neutral-400 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loadingProducts && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
        </div>
      )}

      {/* Empty state */}
      {!loadingProducts && products.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ImageIcon className="w-12 h-12 text-neutral-700 mb-4" />
          <p className="text-white text-xl mb-2">No products yet</p>
          <p className="text-neutral-500 text-sm mb-6">Add your first product to get started.</p>
          <button onClick={openAdd} className="px-6 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors cursor-pointer">
            Add First Product
          </button>
        </div>
      )}

      {/* Grid */}
      {!loadingProducts && filteredProducts.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden hover:border-neutral-700 transition-all group">
              <div className="aspect-square bg-[#0f0f0f] overflow-hidden relative">
                {product.images?.[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      // Hide broken image, show placeholder
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      const parent = (e.currentTarget as HTMLImageElement).parentElement;
                      if (parent) {
                        const placeholder = document.createElement('div');
                        placeholder.className = 'w-full h-full flex items-center justify-center';
                        placeholder.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#404040" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>';
                        parent.appendChild(placeholder);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-10 h-10 text-neutral-700" />
                  </div>
                )}
                {product.tag && (
                  <div className="absolute top-3 right-3 bg-[#dc2626] text-white text-xs px-2 py-1 rounded-lg">{product.tag}</div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs text-neutral-500 mb-1">{product.category}</p>
                <h3 className="text-white mb-2 line-clamp-1 text-sm">{product.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  {product.original_price ? (
                    <>
                      <span className="text-base text-white">${product.price.toFixed(2)}</span>
                      <span className="text-sm text-neutral-500 line-through">${product.original_price.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="text-base text-white">${product.price.toFixed(2)}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#0f0f0f] text-neutral-400 rounded-lg hover:text-white transition-colors cursor-pointer text-sm"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="p-2 bg-[#0f0f0f] text-neutral-400 rounded-lg hover:text-[#dc2626] transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view */}
      {!loadingProducts && filteredProducts.length > 0 && viewMode === 'list' && (
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f0f0f]">
                <tr>
                  <th className="text-left text-sm text-neutral-400 px-6 py-4">Product</th>
                  <th className="text-left text-sm text-neutral-400 px-6 py-4">Category</th>
                  <th className="text-left text-sm text-neutral-400 px-6 py-4">Price</th>
                  <th className="text-left text-sm text-neutral-400 px-6 py-4">Sizes</th>
                  <th className="text-left text-sm text-neutral-400 px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-[#0f0f0f] rounded-lg overflow-hidden shrink-0">
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                            : <ImageIcon className="w-5 h-5 text-neutral-700 m-auto mt-3" />
                          }
                        </div>
                        <span className="text-white text-sm">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><span className="text-neutral-400 text-sm">{product.category}</span></td>
                    <td className="px-6 py-4"><span className="text-white text-sm">${product.price.toFixed(2)}</span></td>
                    <td className="px-6 py-4"><span className="text-neutral-400 text-sm">{(product.sizes ?? []).join(', ') || '—'}</span></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(product)} className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer">
                          <Edit className="w-4 h-4 text-neutral-400 hover:text-white" />
                        </button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer">
                          <Trash2 className="w-4 h-4 text-neutral-400 hover:text-[#dc2626]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ─── Add / Edit Product Modal ─── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 overflow-y-auto p-4">
          <div
            className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 md:p-8 max-w-2xl w-full my-4 mx-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white">{editId ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Product Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="e.g., Toxic Flame Hoodie"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                />
              </div>

              {/* Category & Collection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors cursor-pointer"
                  >
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Collection *</label>
                  <select
                    value={form.collection}
                    onChange={(e) => setForm((p) => ({ ...p, collection: e.target.value }))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors cursor-pointer"
                  >
                    {COLLECTIONS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Price ($) *</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                    placeholder="149.00"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Original Price (if on sale)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.original_price}
                    onChange={(e) => setForm((p) => ({ ...p, original_price: e.target.value }))}
                    placeholder="189.00"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>
              </div>

              {/* Tag & Drop */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Tag (optional)</label>
                  <select
                    value={form.tag}
                    onChange={(e) => setForm((p) => ({ ...p, tag: e.target.value }))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors cursor-pointer"
                  >
                    <option value="">None</option>
                    {TAGS.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Drop (optional)</label>
                  <select
                    value={form.drop_id}
                    onChange={(e) => setForm((p) => ({ ...p, drop_id: e.target.value }))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors cursor-pointer"
                  >
                    <option value="">No drop</option>
                    {drops.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <label className="block text-sm text-neutral-300 mb-3">Sizes</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_SIZES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => toggleSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-all cursor-pointer ${
                        form.sizes.includes(s)
                          ? 'bg-[#dc2626] text-white'
                          : 'bg-[#0f0f0f] text-neutral-400 hover:text-white border border-neutral-800'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colors */}
              <div>
                <label className="block text-sm text-neutral-300 mb-3">Available Colors</label>
                <div className="flex flex-wrap gap-3">
                  {COLOR_OPTIONS.map((col) => {
                    const active = form.colors.includes(col.name);
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => toggleColor(col.name)}
                        title={col.name}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer border ${
                          active
                            ? 'border-white text-white bg-white/10'
                            : 'border-neutral-700 text-neutral-400 hover:border-neutral-500'
                        }`}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0 ring-1 ring-white/20"
                          style={{ backgroundColor: col.hex }}
                        />
                        {col.name}
                        {active && <Check className="w-3 h-3 ml-0.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Enter product description..."
                  rows={3}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm text-neutral-300">Product Images</label>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    (existingImages.length + imageFiles.length) >= MAX_IMAGES
                      ? 'bg-[#dc2626]/20 text-[#dc2626]'
                      : 'bg-neutral-800 text-neutral-400'
                  }`}>
                    {existingImages.length + imageFiles.length} / {MAX_IMAGES} photos
                  </span>
                </div>

                {/* All image previews together */}
                {(existingImages.length > 0 || imagePreviews.length > 0) && (
                  <div className="flex flex-wrap gap-3 mb-3">
                    {existingImages.map((url, idx) => (
                      <div key={url} className="relative w-20 h-20 rounded-lg overflow-hidden border border-neutral-800 group">
                        {idx === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-[#dc2626] text-white text-[9px] text-center py-0.5 z-10">Cover</span>
                        )}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#dc2626]/50 group">
                        {existingImages.length === 0 && i === 0 && (
                          <span className="absolute bottom-0 left-0 right-0 bg-[#dc2626] text-white text-[9px] text-center py-0.5 z-10">Cover</span>
                        )}
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {(existingImages.length + imageFiles.length) < MAX_IMAGES ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-neutral-800 rounded-xl p-6 text-center hover:border-[#dc2626] transition-colors cursor-pointer"
                  >
                    <Upload className="w-7 h-7 text-neutral-600 mx-auto mb-2" />
                    <p className="text-neutral-400 text-sm">Click to upload images</p>
                    <p className="text-neutral-600 text-xs mt-1">PNG, JPG, WEBP · max 5MB each · max {MAX_IMAGES} total</p>
                    <p className="text-neutral-600 text-xs mt-0.5">First image = cover photo · Label angles (front, back, side…)</p>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#dc2626]/30 rounded-xl p-4 text-center bg-[#dc2626]/5">
                    <p className="text-[#dc2626] text-sm">Maximum {MAX_IMAGES} images reached</p>
                    <p className="text-neutral-500 text-xs mt-1">Remove a photo above to add another</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleImageFiles(e.target.files)}
                />
                {fileSizeError && (
                  <div className="mt-3 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                    <svg className="w-4 h-4 text-red-500 shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    <p className="text-sm text-red-400">{fileSizeError}</p>
                  </div>
                )}
              </div>

              {/* In stock toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, in_stock: !p.in_stock }))}
                  className={`w-11 h-6 rounded-full transition-colors cursor-pointer relative ${form.in_stock ? 'bg-[#dc2626]' : 'bg-neutral-700'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all ${form.in_stock ? 'left-5.5' : 'left-0.5'}`} style={{ left: form.in_stock ? '22px' : '2px' }} />
                </button>
                <span className="text-sm text-neutral-300">In Stock</span>
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveMsg ? <Check className="w-4 h-4" /> : null}
                  {saving ? 'Saving...' : saveMsg || (editId ? 'Update Product' : 'Add Product')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-[#0f0f0f] text-neutral-400 rounded-xl hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
