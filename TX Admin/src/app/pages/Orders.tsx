import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Filter, Search, Eye, Download, X, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface OrdersProps {
  onLogout: () => void;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  image?: string;
}

interface Customer {
  name: string | null;
  email: string | null;
  phone: string | null;
  delivery_location: string | null;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: OrderItem[];
  customer_id: string | null;
  customers: Customer | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending:   'bg-orange-500/20 text-orange-400 border-orange-500/30',
  paid:      'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  shipped:   'bg-blue-500/20 text-blue-400 border-blue-500/30',
  delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ALL_STATUSES = ['All', 'pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export default function Orders({ onLogout }: OrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('id, total, status, created_at, items, customer_id, customers(name, email, phone, delivery_location)')
      .order('created_at', { ascending: false });
    setOrders((data as unknown as Order[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, []);

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = selectedStatus === 'All' || o.status === selectedStatus;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !q ||
      o.id.toLowerCase().includes(q) ||
      (o.customers?.name ?? '').toLowerCase().includes(q) ||
      (o.customers?.email ?? '').toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  const openOrder = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder || newStatus === selectedOrder.status) return;
    setUpdatingStatus(true);
    await supabase.from('orders').update({ status: newStatus }).eq('id', selectedOrder.id);
    setUpdatingStatus(false);
    setOrders((prev) =>
      prev.map((o) => (o.id === selectedOrder.id ? { ...o, status: newStatus } : o))
    );
    setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
  };

  const exportCSV = () => {
    const rows = [
      ['Order ID', 'Customer', 'Email', 'Status', 'Total', 'Date'],
      ...filteredOrders.map((o) => [
        o.id,
        o.customers?.name ?? 'Guest',
        o.customers?.email ?? '',
        o.status,
        `$${Number(o.total).toFixed(2)}`,
        new Date(o.created_at).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'orders.csv';
    a.click();
  };

  return (
    <DashboardLayout title="Orders" onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl text-white mb-1">Order Management</h1>
          <p className="text-neutral-400 text-sm">
            {loading ? 'Loading...' : `${orders.length} total orders`}
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
            {ALL_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs md:text-sm transition-all capitalize ${
                  selectedStatus === status
                    ? 'bg-[#dc2626] text-white'
                    : 'bg-[#0f0f0f] text-neutral-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search by ID, name, email…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
        </div>
      )}

      {/* Desktop Table */}
      {!loading && (
        <div className="hidden md:block bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f0f0f]">
                <tr>
                  {['Order ID', 'Customer', 'Status', 'Amount', 'Items', 'Date', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-sm text-neutral-400 px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-neutral-500">
                      No orders found
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    const statusKey = order.status?.toLowerCase();
                    const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
                    return (
                      <tr key={order.id} className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                        <td className="px-6 py-4 font-mono text-white text-sm">#{order.id.slice(0, 8).toUpperCase()}</td>
                        <td className="px-6 py-4">
                          <p className="text-white text-sm">{order.customers?.name ?? 'Guest'}</p>
                          <p className="text-neutral-500 text-xs">{order.customers?.email ?? ''}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs border capitalize ${STATUS_COLORS[statusKey] ?? 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-white text-sm">${Number(order.total).toFixed(2)}</td>
                        <td className="px-6 py-4 text-neutral-400 text-sm">{items.reduce((s, i) => s + (i.quantity ?? 1), 0)}</td>
                        <td className="px-6 py-4 text-neutral-400 text-sm">
                          {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-6 py-4">
                          <button onClick={() => openOrder(order)} className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-neutral-400" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile Cards */}
      {!loading && (
        <div className="md:hidden space-y-3">
          {filteredOrders.length === 0 ? (
            <p className="text-center text-neutral-500 py-12">No orders found</p>
          ) : (
            filteredOrders.map((order) => {
              const statusKey = order.status?.toLowerCase();
              const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
              return (
                <div key={order.id} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white text-sm font-medium font-mono">#{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-neutral-400 text-xs mt-0.5">{order.customers?.name ?? 'Guest'}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs border capitalize ${STATUS_COLORS[statusKey] ?? 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs text-neutral-500">Amount</p>
                        <p className="text-white text-sm">${Number(order.total).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Items</p>
                        <p className="text-neutral-300 text-sm">{items.reduce((s, i) => s + (i.quantity ?? 1), 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500">Date</p>
                        <p className="text-neutral-300 text-sm">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => openOrder(order)} className="p-2 bg-[#0f0f0f] rounded-lg">
                      <Eye className="w-4 h-4 text-neutral-400" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 md:p-8 max-w-2xl w-full my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl text-white">
                Order #{selectedOrder.id.slice(0, 8).toUpperCase()}
              </h2>
              <button onClick={() => setSelectedOrder(null)} className="text-neutral-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer + Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4">
                <p className="text-neutral-400 text-sm mb-2">Customer</p>
                <p className="text-white">{selectedOrder.customers?.name ?? 'Guest'}</p>
                <p className="text-neutral-400 text-sm">{selectedOrder.customers?.email ?? '—'}</p>
                <p className="text-neutral-400 text-sm">{selectedOrder.customers?.phone ?? '—'}</p>
              </div>
              <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4">
                <p className="text-neutral-400 text-sm mb-2">Delivery Address</p>
                <p className="text-white text-sm">{selectedOrder.customers?.delivery_location ?? 'Not provided'}</p>
              </div>
            </div>

            {/* Items */}
            <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4 mb-6">
              <p className="text-neutral-400 text-sm mb-4">Order Items</p>
              <div className="space-y-3">
                {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm">{item.name} {item.size ? `(${item.size})` : ''}</p>
                      <p className="text-neutral-500 text-xs">Qty: {item.quantity ?? 1}</p>
                    </div>
                    <span className="text-white">${(Number(item.price) * (item.quantity ?? 1)).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-800 mt-4 pt-4 flex items-center justify-between">
                <span className="text-white">Total</span>
                <span className="text-xl text-white">${Number(selectedOrder.total).toFixed(2)}</span>
              </div>
            </div>

            {/* Status Update */}
            <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4 mb-6">
              <p className="text-neutral-400 text-sm mb-3">Update Status</p>
              <div className="flex gap-3 flex-wrap">
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="flex-1 bg-[#1a1a1a] border border-neutral-700 rounded-xl px-4 py-2 text-white text-sm focus:outline-none focus:border-[#dc2626] capitalize"
                >
                  {['pending', 'paid', 'shipped', 'delivered', 'cancelled'].map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button
                  onClick={handleUpdateStatus}
                  disabled={updatingStatus || newStatus === selectedOrder.status}
                  className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full px-4 py-3 bg-[#0f0f0f] text-neutral-400 rounded-xl hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
