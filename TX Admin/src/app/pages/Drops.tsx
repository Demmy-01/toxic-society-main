import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Trash2, Edit, Loader2, X, Upload, ImageIcon, Check, CalendarClock } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DropsProps {
  onLogout: () => void;
}

interface DBDrop {
  id: string;
  name: string;
  label: string;
  date: string;
  status: string;
  description: string | null;
  image_url: string | null;
  drop_date: string | null;
  price: number | null;
  created_at: string;
}

const STATUSES = ['UPCOMING', 'LIVE', 'SOLD OUT'];

const emptyForm = {
  name: '',
  label: '',
  date: '',
  status: 'UPCOMING',
  description: '',
  drop_date: '',
  price: '',
};

export default function Drops({ onLogout }: DropsProps) {
  const [drops, setDrops] = useState<DBDrop[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  // Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const fetchDrops = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('drops')
      .select('*')
      .order('drop_date', { ascending: false });
    setDrops(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchDrops(); }, []);

  const handleImageFile = (file: File | null) => {
    if (!file) return;
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return existingImageUrl || null;
    const path = `drops/${Date.now()}-${imageFile.name.replace(/\s/g, '_')}`;
    const { data, error } = await supabase.storage.from('drop-images').upload(path, imageFile, { upsert: true });
    if (error || !data?.path) return existingImageUrl || null;
    // data.path is now the full Cloudinary URL
    return data.path;
  };

  const openAdd = () => {
    setForm({ ...emptyForm });
    setImageFile(null);
    setImagePreview('');
    setExistingImageUrl('');
    setEditId(null);
    setSaveMsg('');
    setShowForm(true);
  };

  const openEdit = (d: DBDrop) => {
    setForm({
      name: d.name,
      label: d.label,
      date: d.date,
      status: d.status,
      description: d.description ?? '',
      drop_date: d.drop_date ? d.drop_date.slice(0, 16) : '', // datetime-local format
      price: d.price ? String(d.price) : '',
    });
    setExistingImageUrl(d.image_url ?? '');
    setImageFile(null);
    setImagePreview('');
    setEditId(d.id);
    setSaveMsg('');
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const imgUrl = await uploadImage();
    const payload = {
      name: form.name,
      label: form.label,
      date: form.date,
      status: form.status,
      description: form.description || null,
      image_url: imgUrl,
      drop_date: form.drop_date ? new Date(form.drop_date).toISOString() : null,
      price: form.price ? parseFloat(form.price) : null,
    };
    if (editId) {
      await supabase.from('drops').update(payload).eq('id', editId);
    } else {
      await supabase.from('drops').insert(payload);
    }
    setSaving(false);
    setSaveMsg(editId ? 'Drop updated!' : 'Drop created!');
    await fetchDrops();
    setTimeout(() => { setShowForm(false); setSaveMsg(''); }, 1200);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this drop?')) return;
    await supabase.from('drops').delete().eq('id', id);
    setDrops((prev) => prev.filter((d) => d.id !== id));
  };

  const statusColor = (s: string) =>
    s === 'UPCOMING' ? 'text-blue-400 bg-blue-400/10' :
    s === 'LIVE'     ? 'text-green-400 bg-green-400/10' :
                       'text-neutral-400 bg-neutral-400/10';

  return (
    <DashboardLayout title="Drops" onLogout={onLogout}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-white mb-1">Drop Management</h1>
          <p className="text-neutral-400 text-sm">Schedule and manage product drops with live countdowns</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" /> New Drop
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && drops.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <CalendarClock className="w-12 h-12 text-neutral-700 mb-4" />
          <p className="text-white text-xl mb-2">No drops yet</p>
          <p className="text-neutral-500 text-sm mb-6">Create your first drop to get started.</p>
          <button onClick={openAdd} className="px-6 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors cursor-pointer">
            Create First Drop
          </button>
        </div>
      )}

      {/* Drops list */}
      {!loading && drops.length > 0 && (
        <div className="space-y-4">
          {drops.map((drop) => (
            <div key={drop.id} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 flex gap-6 items-center hover:border-neutral-700 transition-all">
              {/* Image */}
              <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-[#0f0f0f]">
                {drop.image_url
                  ? <img src={drop.image_url} alt={drop.name} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-6 h-6 text-neutral-700" /></div>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1 flex-wrap">
                  <h3 className="text-white">{drop.name} — {drop.label}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full uppercase tracking-wider ${statusColor(drop.status)}`}>
                    {drop.status}
                  </span>
                </div>
                {drop.drop_date && (
                  <p className="text-neutral-400 text-xs mb-1">
                    📅 {new Date(drop.drop_date).toLocaleString()}
                  </p>
                )}
                {drop.price && (
                  <p className="text-neutral-400 text-xs mb-1">💰 ₦{drop.price.toLocaleString()}</p>
                )}
                {drop.description && (
                  <p className="text-neutral-500 text-xs line-clamp-1">{drop.description}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => openEdit(drop)} className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer">
                  <Edit className="w-4 h-4 text-neutral-400 hover:text-white" />
                </button>
                <button onClick={() => handleDelete(drop.id)} className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4 text-neutral-400 hover:text-[#dc2626]" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Add / Edit Modal ─── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-start justify-center overflow-y-auto p-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 max-w-xl w-full my-8"
               onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white">{editId ? 'Edit Drop' : 'New Drop'}</h2>
              <button onClick={() => setShowForm(false)} className="text-neutral-500 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Name + Label */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Drop Name *</label>
                  <input required value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g., Drop 04"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Series Label *</label>
                  <input required value={form.label}
                    onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                    placeholder="e.g., VOID SERIES"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>
              </div>

              {/* Date display string + Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Display Date *</label>
                  <input required value={form.date}
                    onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                    placeholder="e.g., Mar 2026"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Status</label>
                  <select value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors cursor-pointer"
                  >
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Base Price (in naira)</label>
                <input type="number" step="0.01" value={form.price}
                  onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                  placeholder="e.g., 189.00"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                />
              </div>

              {/* Drop Date & Time — this powers the countdown */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  Drop Date & Time <span className="text-neutral-500">(powers the live countdown)</span>
                </label>
                <input type="datetime-local" value={form.drop_date}
                  onChange={(e) => setForm((p) => ({ ...p, drop_date: e.target.value }))}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Description</label>
                <textarea value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Describe this drop..."
                  rows={3}
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors resize-none"
                />
              </div>

              {/* Image upload */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Drop Image</label>
                {(imagePreview || existingImageUrl) && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 border border-neutral-800">
                    <img src={imagePreview || existingImageUrl} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => { setImageFile(null); setImagePreview(''); setExistingImageUrl(''); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center cursor-pointer">
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
                <div onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-neutral-800 rounded-xl p-8 text-center hover:border-[#dc2626] transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                  <p className="text-neutral-400 text-sm">Click to upload a drop image</p>
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => handleImageFile(e.target.files?.[0] ?? null)} />
              </div>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors disabled:opacity-50 cursor-pointer">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saveMsg ? <Check className="w-4 h-4" /> : null}
                  {saving ? 'Saving...' : saveMsg || (editId ? 'Update Drop' : 'Create Drop')}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-[#0f0f0f] text-neutral-400 rounded-xl hover:text-white transition-colors cursor-pointer">
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
