import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import {
  Plus, Edit, Trash2, Percent, Calendar, Users, TrendingUp,
  X, Loader2, Copy, Check, AlertTriangle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DiscountsProps { onLogout: () => void; }

interface Discount {
  id: string;
  code: string;
  description: string | null;
  type: 'percentage' | 'fixed';
  value: number;
  usage_limit: number | null;
  uses: number;
  valid_until: string | null;
  min_purchase: number | null;
  active: boolean;
  created_at: string;
}

const EMPTY_FORM = {
  code: '',
  description: '',
  type: 'percentage' as 'percentage' | 'fixed',
  value: '',
  usage_limit: '',
  valid_until: '',
  min_purchase: '',
  active: true,
};

export default function Discounts({ onLogout }: DiscountsProps) {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Discount | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchDiscounts = async () => {
    setLoading(true);
    const { data } = await supabase.from('discounts').select('*').order('created_at', { ascending: false });
    setDiscounts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchDiscounts(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (d: Discount) => {
    setEditTarget(d);
    setForm({
      code: d.code,
      description: d.description ?? '',
      type: d.type,
      value: String(d.value),
      usage_limit: d.usage_limit != null ? String(d.usage_limit) : '',
      valid_until: d.valid_until ?? '',
      min_purchase: d.min_purchase != null ? String(d.min_purchase) : '',
      active: d.active,
    });
    setError('');
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.value) { setError('Code and value are required.'); return; }
    setSaving(true);
    setError('');
    const payload = {
      code: form.code.toUpperCase().trim(),
      description: form.description || null,
      type: form.type,
      value: Number(form.value),
      usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
      valid_until: form.valid_until || null,
      min_purchase: form.min_purchase ? Number(form.min_purchase) : null,
      active: form.active,
    };

    if (editTarget) {
      const { error: err } = await supabase.from('discounts').update(payload).eq('id', editTarget.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from('discounts').insert({ ...payload, uses: 0 });
      if (err) { setError(err.message); setSaving(false); return; }
    }
    setSaving(false);
    setShowModal(false);
    fetchDiscounts();
  };

  const handleDelete = async (id: string) => {
    setDeleteId(id);
    await supabase.from('discounts').delete().eq('id', id);
    setDeleteId(null);
    setDiscounts(prev => prev.filter(d => d.id !== id));
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const toggleActive = async (d: Discount) => {
    await supabase.from('discounts').update({ active: !d.active }).eq('id', d.id);
    setDiscounts(prev => prev.map(x => x.id === d.id ? { ...x, active: !x.active } : x));
  };

  const activeCount = discounts.filter(d => d.active).length;
  const totalUses = discounts.reduce((s, d) => s + d.uses, 0);
  const now = new Date();
  const expiringSoon = discounts.filter(d => {
    if (!d.valid_until || !d.active) return false;
    const diff = (new Date(d.valid_until).getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 7;
  }).length;

  const isExpired = (d: Discount) =>
    d.valid_until ? new Date(d.valid_until) < now : false;

  return (
    <DashboardLayout title="Discounts" onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl text-white mb-1">Discount & Promo Codes</h1>
          <p className="text-neutral-400 text-sm">Create and manage promotional discount codes</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Create Discount
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          { icon: <Percent className="w-6 h-6 text-[#dc2626]" />, label: 'Active Discounts', value: loading ? '…' : activeCount },
          { icon: <Users className="w-6 h-6 text-[#dc2626]" />, label: 'Total Uses', value: loading ? '…' : totalUses },
          { icon: <TrendingUp className="w-6 h-6 text-[#dc2626]" />, label: 'Total Codes', value: loading ? '…' : discounts.length },
          { icon: <Calendar className="w-6 h-6 text-[#dc2626]" />, label: 'Expiring in 7d', value: loading ? '…' : expiringSoon },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
            <div className="p-3 bg-[#0f0f0f] rounded-xl inline-flex mb-3">{s.icon}</div>
            <p className="text-neutral-400 text-sm mb-1">{s.label}</p>
            <p className="text-2xl text-white">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
        </div>
      ) : discounts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Percent className="w-12 h-12 text-neutral-700 mb-4" />
          <p className="text-white text-xl mb-2">No discount codes yet</p>
          <p className="text-neutral-500 text-sm">Click "Create Discount" to add your first promo code.</p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden md:block bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#0f0f0f]">
                  <tr>
                    {['Code', 'Description', 'Type', 'Value', 'Usage', 'Min Order', 'Valid Until', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left text-sm text-neutral-400 px-5 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {discounts.map(d => {
                    const expired = isExpired(d);
                    const status = !d.active ? 'Inactive' : expired ? 'Expired' : 'Active';
                    const statusStyle = status === 'Active'
                      ? 'bg-green-500/20 text-green-400 border-green-500/30'
                      : status === 'Expired'
                      ? 'bg-orange-500/20 text-orange-400 border-orange-500/30'
                      : 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';

                    return (
                      <tr key={d.id} className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <code className="text-white text-sm font-mono bg-[#0f0f0f] px-2 py-1 rounded">{d.code}</code>
                            <button onClick={() => copyCode(d.code)} className="text-neutral-500 hover:text-white transition-colors">
                              {copiedCode === d.code ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-neutral-300 text-sm max-w-[160px] truncate">{d.description ?? '—'}</td>
                        <td className="px-5 py-4 text-neutral-400 text-sm capitalize">{d.type}</td>
                        <td className="px-5 py-4 text-white text-sm">
                          {d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}
                        </td>
                        <td className="px-5 py-4">
                          <div>
                            <div className="flex gap-1 mb-1">
                              <span className="text-white text-sm">{d.uses}</span>
                              {d.usage_limit && <span className="text-neutral-500 text-xs">/ {d.usage_limit}</span>}
                            </div>
                            {d.usage_limit && (
                              <div className="w-20 bg-neutral-800 rounded-full h-1.5">
                                <div className="bg-[#dc2626] h-1.5 rounded-full"
                                  style={{ width: `${Math.min((d.uses / d.usage_limit) * 100, 100)}%` }} />
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-neutral-400 text-sm">
                          {d.min_purchase ? `$${d.min_purchase}` : '—'}
                        </td>
                        <td className="px-5 py-4 text-neutral-400 text-sm">
                          {d.valid_until
                            ? new Date(d.valid_until).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                            : 'No limit'}
                        </td>
                        <td className="px-5 py-4">
                          <button onClick={() => toggleActive(d)}
                            className={`px-3 py-1 rounded-full text-xs border ${statusStyle}`}>
                            {status}
                          </button>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1">
                            <button onClick={() => openEdit(d)} className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                              <Edit className="w-4 h-4 text-neutral-400" />
                            </button>
                            <button onClick={() => handleDelete(d.id)} disabled={deleteId === d.id}
                              className="p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                              {deleteId === d.id
                                ? <Loader2 className="w-4 h-4 text-red-400 animate-spin" />
                                : <Trash2 className="w-4 h-4 text-neutral-400 hover:text-red-400" />}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {discounts.map(d => {
              const expired = isExpired(d);
              const status = !d.active ? 'Inactive' : expired ? 'Expired' : 'Active';
              const statusStyle = status === 'Active'
                ? 'bg-green-500/20 text-green-400 border-green-500/30'
                : 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
              return (
                <div key={d.id} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <code className="text-white text-sm font-mono bg-[#0f0f0f] px-2 py-1 rounded">{d.code}</code>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${statusStyle}`}>{status}</span>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(d)} className="p-1.5 hover:bg-[#2a2a2a] rounded-lg"><Edit className="w-4 h-4 text-neutral-400" /></button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4 text-neutral-400" /></button>
                    </div>
                  </div>
                  <p className="text-neutral-400 text-xs mb-2">{d.description ?? '—'}</p>
                  <div className="flex gap-4">
                    <div><p className="text-xs text-neutral-500">Value</p><p className="text-white text-sm">{d.type === 'percentage' ? `${d.value}%` : `$${d.value}`}</p></div>
                    <div><p className="text-xs text-neutral-500">Uses</p><p className="text-white text-sm">{d.uses}{d.usage_limit ? ` / ${d.usage_limit}` : ''}</p></div>
                    <div><p className="text-xs text-neutral-500">Expires</p><p className="text-white text-sm">{d.valid_until ? new Date(d.valid_until).toLocaleDateString() : 'Never'}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}>
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 md:p-8 max-w-2xl w-full my-4"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-white">{editTarget ? 'Edit Discount' : 'Create Discount'}</h2>
              <button onClick={() => setShowModal(false)} className="text-neutral-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <div className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />{error}
                </div>
              )}

              {/* Code */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Discount Code *</label>
                <input value={form.code}
                  onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))}
                  placeholder="e.g. TOXIC25"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] uppercase tracking-widest" />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Description</label>
                <input value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="e.g. New Customer Welcome"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626]" />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Discount Type</label>
                <div className="flex gap-3">
                  {(['percentage', 'fixed'] as const).map(t => (
                    <button key={t} onClick={() => setForm(p => ({ ...p, type: t }))}
                      className={`flex-1 py-3 rounded-xl transition-all capitalize ${form.type === t ? 'bg-[#dc2626] text-white' : 'bg-[#0f0f0f] text-neutral-400 border border-neutral-800'}`}>
                      {t === 'percentage' ? 'Percentage (%)' : 'Fixed Amount ($)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Value + Usage Limit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">
                    {form.type === 'percentage' ? 'Percentage Off *' : 'Dollar Amount Off *'}
                  </label>
                  <div className="relative">
                    <input type="number" value={form.value}
                      onChange={e => setForm(p => ({ ...p, value: e.target.value }))}
                      placeholder={form.type === 'percentage' ? '25' : '15'}
                      className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 pr-10 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626]" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
                      {form.type === 'percentage' ? '%' : '$'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Usage Limit (optional)</label>
                  <input type="number" value={form.usage_limit}
                    onChange={e => setForm(p => ({ ...p, usage_limit: e.target.value }))}
                    placeholder="1000"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626]" />
                </div>
              </div>

              {/* Valid Until + Min Purchase */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Valid Until (optional)</label>
                  <input type="date" value={form.valid_until}
                    onChange={e => setForm(p => ({ ...p, valid_until: e.target.value }))}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626]" />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Min Purchase $ (optional)</label>
                  <input type="number" value={form.min_purchase}
                    onChange={e => setForm(p => ({ ...p, min_purchase: e.target.value }))}
                    placeholder="50"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626]" />
                </div>
              </div>

              {/* Active toggle */}
              <div className="flex items-center justify-between p-4 bg-[#0f0f0f] rounded-xl">
                <div>
                  <p className="text-white text-sm">Active</p>
                  <p className="text-neutral-500 text-xs mt-0.5">Customers can use this code</p>
                </div>
                <button onClick={() => setForm(p => ({ ...p, active: !p.active }))}
                  className={`w-12 h-6 rounded-full transition-all relative ${form.active ? 'bg-[#dc2626]' : 'bg-neutral-700'}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.active ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors disabled:opacity-60">
                  {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editTarget ? 'Save Changes' : 'Create Discount'}
                </button>
                <button onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-[#0f0f0f] text-neutral-400 rounded-xl hover:text-white transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
