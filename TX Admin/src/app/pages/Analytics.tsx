import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { TrendingUp, Users, ShoppingBag, DollarSign, Package, Loader2 } from 'lucide-react';
import {
  AreaChart, Area,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../lib/supabase';

interface AnalyticsProps { onLogout: () => void; }

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: { name: string; price: number; quantity: number }[];
}

const PIE_COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#b91c1c'];

const TOOLTIP_STYLE = {
  contentStyle: { backgroundColor: '#1a1a1a', border: '1px solid #404040', borderRadius: '8px', color: '#fff' },
};

export default function Analytics({ onLogout }: AnalyticsProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<{ name: string; category: string }[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [ordersRes, productsRes, custRes] = await Promise.all([
        supabase.from('orders').select('id, total, status, created_at, items').order('created_at', { ascending: true }),
        supabase.from('products').select('name, category'),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
      ]);
      setOrders((ordersRes.data as unknown as Order[]) ?? []);
      setProducts(productsRes.data ?? []);
      setCustomerCount(custRes.count ?? 0);
      setLoading(false);
    }
    load();
  }, []);

  // ── Derived metrics ──────────────────────────────────────────────
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const totalOrders = orders.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Revenue & orders by month (last 7 months)
  const monthlyData = (() => {
    const months: { month: string; revenue: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(1);
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const month = d.getMonth();
      const filtered = orders.filter(o => {
        const od = new Date(o.created_at);
        return od.getFullYear() === year && od.getMonth() === month;
      });
      months.push({ month: label, revenue: filtered.reduce((s, o) => s + Number(o.total), 0), orders: filtered.length });
    }
    return months;
  })();

  // Orders by status
  const statusMap: Record<string, number> = {};
  orders.forEach(o => { statusMap[o.status] = (statusMap[o.status] ?? 0) + 1; });
  const statusData = Object.entries(statusMap).map(([name, value]) => ({ name, value }));

  // Top products by revenue derived from order items
  const productRevMap: Record<string, { sales: number; revenue: number }> = {};
  orders.forEach(o => {
    (Array.isArray(o.items) ? o.items : []).forEach(item => {
      if (!item?.name) return;
      const key = item.name;
      if (!productRevMap[key]) productRevMap[key] = { sales: 0, revenue: 0 };
      const qty = item.quantity ?? 1;
      productRevMap[key].sales += qty;
      productRevMap[key].revenue += Number(item.price) * qty;
    });
  });
  const topProducts = Object.entries(productRevMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Products by category
  const categoryMap: Record<string, number> = {};
  products.forEach(p => { categoryMap[p.category] = (categoryMap[p.category] ?? 0) + 1; });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  // Orders last 30 days vs previous 30 days
  const now = new Date();
  const last30 = orders.filter(o => (now.getTime() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 30);
  const prev30 = orders.filter(o => {
    const days = (now.getTime() - new Date(o.created_at).getTime()) / (1000 * 60 * 60 * 24);
    return days > 30 && days <= 60;
  });
  const revenueChange = prev30.length > 0
    ? (((last30.reduce((s, o) => s + Number(o.total), 0) - prev30.reduce((s, o) => s + Number(o.total), 0)) /
        prev30.reduce((s, o) => s + Number(o.total), 0)) * 100).toFixed(1)
    : null;

  if (loading) {
    return (
      <DashboardLayout title="Analytics" onLogout={onLogout}>
        <div className="flex justify-center py-32">
          <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Analytics" onLogout={onLogout}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-white mb-1">Analytics</h1>
        <p className="text-neutral-400 text-sm">Real-time insights from your store data</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {[
          {
            icon: <DollarSign className="w-6 h-6 text-[#dc2626]" />,
            label: 'Total Revenue',
            value: `$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            sub: revenueChange ? `${Number(revenueChange) >= 0 ? '+' : ''}${revenueChange}% vs last 30d` : 'All time',
            subColor: revenueChange && Number(revenueChange) >= 0 ? 'text-green-500' : 'text-red-400',
          },
          {
            icon: <ShoppingBag className="w-6 h-6 text-[#dc2626]" />,
            label: 'Total Orders',
            value: totalOrders,
            sub: `${last30.length} in last 30d`,
            subColor: 'text-neutral-400',
          },
          {
            icon: <TrendingUp className="w-6 h-6 text-[#dc2626]" />,
            label: 'Avg Order Value',
            value: `$${avgOrderValue.toFixed(2)}`,
            sub: 'Per completed order',
            subColor: 'text-neutral-400',
          },
          {
            icon: <Users className="w-6 h-6 text-[#dc2626]" />,
            label: 'Registered Users',
            value: customerCount,
            sub: 'Total accounts',
            subColor: 'text-neutral-400',
          },
        ].map(m => (
          <div key={m.label} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
            <div className="p-3 bg-[#0f0f0f] rounded-xl inline-flex mb-3">{m.icon}</div>
            <p className="text-neutral-400 text-sm mb-1">{m.label}</p>
            <p className="text-2xl text-white mb-1">{m.value}</p>
            <p className={`text-xs ${m.subColor}`}>{m.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue & Orders Trend */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 mb-6">
        <h3 className="text-lg text-white mb-6">Revenue & Orders — Last 7 Months</h3>
        {orders.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-12">No order data yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
              <Tooltip {...TOOLTIP_STYLE} formatter={(v: number, name: string) =>
                [name === 'revenue' ? `$${v.toFixed(2)}` : v, name === 'revenue' ? 'Revenue' : 'Orders']} />
              <Area type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={2}
                fillOpacity={1} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Orders by Status + Category breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Orders by Status */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg text-white mb-6">Orders by Status</h3>
          {statusData.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-10">No orders yet</p>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                    paddingAngle={2} dataKey="value">
                    {statusData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusData.map((s, i) => (
                  <div key={s.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-sm text-neutral-400 capitalize">{s.name}</span>
                    </div>
                    <span className="text-sm text-white">{s.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Products by Category */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg text-white mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-[#dc2626]" /> Products by Category
          </h3>
          {categoryData.length === 0 ? (
            <p className="text-neutral-500 text-sm text-center py-10">No products yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                <XAxis type="number" stroke="#6b7280" style={{ fontSize: '11px' }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke="#6b7280" style={{ fontSize: '11px' }} width={90} />
                <Tooltip {...TOOLTIP_STYLE} />
                <Bar dataKey="value" fill="#dc2626" radius={[0, 6, 6, 0]} name="Products" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Products */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 mb-6">
        <h3 className="text-lg text-white mb-6">Top Selling Products</h3>
        {topProducts.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-8">No order data yet — top products will appear once orders come in.</p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((p, i) => {
              const maxRev = topProducts[0].revenue;
              const pct = maxRev > 0 ? (p.revenue / maxRev) * 100 : 0;
              return (
                <div key={p.name} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-[#0f0f0f] rounded-lg flex items-center justify-center text-neutral-400 text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white text-sm truncate">{p.name}</p>
                      <p className="text-white text-sm ml-2 shrink-0">${p.revenue.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-neutral-800 rounded-full h-1.5">
                        <div className="bg-[#dc2626] h-1.5 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-neutral-500 text-xs shrink-0">{p.sales} sold</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Monthly Orders Bar Chart */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-lg text-white mb-6">Monthly Order Volume</h3>
        {orders.length === 0 ? (
          <p className="text-neutral-500 text-sm text-center py-12">No orders yet</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis dataKey="month" stroke="#6b7280" style={{ fontSize: '12px' }} />
              <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} allowDecimals={false} />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="orders" fill="#dc2626" radius={[6, 6, 0, 0]} name="Orders" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </DashboardLayout>
  );
}
