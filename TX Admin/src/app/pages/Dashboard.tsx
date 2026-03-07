import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { supabase } from '../../lib/supabase';

interface DashboardProps {
  onLogout: () => void;
}

interface Order {
  id: string;
  total: number;
  status: string;
  created_at: string;
  items: { name: string; price: number; quantity: number; size: string }[];
  customers: { name: string | null; email: string | null } | null;
}

interface Product {
  id: string;
  name: string;
  category: string;
  in_stock: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  shipped: 'bg-blue-500/20 text-blue-400',
  paid: 'bg-yellow-500/20 text-yellow-400',
  pending: 'bg-orange-500/20 text-orange-400',
  delivered: 'bg-green-500/20 text-green-400',
  cancelled: 'bg-red-500/20 text-red-400',
};

const PIE_COLORS = ['#dc2626', '#ef4444', '#f87171', '#fca5a5', '#fecaca', '#b91c1c'];

export default function Dashboard({ onLogout }: DashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customerCount, setCustomerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAll() {
      setLoading(true);
      const [ordersRes, productsRes, customersRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, total, status, created_at, items, customers(name, email)')
          .order('created_at', { ascending: false }),
        supabase.from('products').select('id, name, category, in_stock'),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
      ]);
      setOrders((ordersRes.data as unknown as Order[]) ?? []);
      setProducts(productsRes.data ?? []);
      setCustomerCount(customersRes.count ?? 0);
      setLoading(false);
    }
    loadAll();
  }, []);

  // Derived stats
  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);
  const recentOrders = orders.slice(0, 5);
  const outOfStock = products.filter((p) => !p.in_stock);

  // Revenue chart — last 7 days
  const revenueChart = (() => {
    const days: { date: string; revenue: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const dayStr = d.toISOString().slice(0, 10);
      const rev = orders
        .filter((o) => o.created_at.slice(0, 10) === dayStr)
        .reduce((s, o) => s + Number(o.total), 0);
      days.push({ date: label, revenue: rev });
    }
    return days;
  })();

  // Category pie
  const categoryMap: Record<string, number> = {};
  products.forEach((p) => {
    categoryMap[p.category] = (categoryMap[p.category] ?? 0) + 1;
  });
  const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));

  return (
    <DashboardLayout title="Dashboard" onLogout={onLogout}>
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
            <StatCard
              icon={<DollarSign className="w-6 h-6 text-[#dc2626]" />}
              label="Total Revenue"
              value={`$${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              change=""
              changeType="positive"
            />
            <StatCard
              icon={<ShoppingBag className="w-6 h-6 text-[#dc2626]" />}
              label="Total Orders"
              value={orders.length.toString()}
              change=""
              changeType="positive"
            />
            <StatCard
              icon={<Users className="w-6 h-6 text-[#dc2626]" />}
              label="Registered Users"
              value={customerCount.toString()}
              change=""
              changeType="positive"
            />
            <StatCard
              icon={<Package className="w-6 h-6 text-[#dc2626]" />}
              label="Total Products"
              value={products.length.toString()}
              change=""
              changeType="positive"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-lg text-white mb-6">Revenue (Last 7 Days)</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={revenueChart}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #404040', borderRadius: '8px', color: '#fff' }}
                    formatter={(v: number) => [`$${v.toFixed(2)}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#dc2626" strokeWidth={2} dot={{ fill: '#dc2626', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Pie */}
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-lg text-white mb-6">Products by Category</h3>
              {categoryData.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-12">No products yet</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value">
                        {categoryData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #404040', borderRadius: '8px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 space-y-2">
                    {categoryData.map((item, i) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                          <span className="text-sm text-neutral-400 truncate">{item.name}</span>
                        </div>
                        <span className="text-sm text-white">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <h3 className="text-lg text-white mb-6">Recent Orders</h3>
              {recentOrders.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-8">No orders yet</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        <th className="text-left text-sm text-neutral-400 pb-3">Order ID</th>
                        <th className="text-left text-sm text-neutral-400 pb-3">Customer</th>
                        <th className="text-left text-sm text-neutral-400 pb-3">Status</th>
                        <th className="text-left text-sm text-neutral-400 pb-3">Amount</th>
                        <th className="text-left text-sm text-neutral-400 pb-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => {
                        const statusKey = order.status?.toLowerCase();
                        return (
                          <tr key={order.id} className="border-b border-neutral-800/50 hover:bg-[#0f0f0f] transition-colors">
                            <td className="py-4 text-sm text-white font-mono">#{order.id.slice(0, 8).toUpperCase()}</td>
                            <td className="py-4 text-sm text-neutral-300">
                              {order.customers?.name ?? order.customers?.email ?? 'Guest'}
                            </td>
                            <td className="py-4">
                              <span className={`px-3 py-1 rounded-full text-xs capitalize ${STATUS_COLORS[statusKey] ?? 'bg-neutral-500/20 text-neutral-400'}`}>
                                {order.status}
                              </span>
                            </td>
                            <td className="py-4 text-sm text-white">${Number(order.total).toFixed(2)}</td>
                            <td className="py-4 text-sm text-neutral-400">
                              {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Out of Stock Alert */}
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
                <h3 className="text-lg text-white">Out of Stock</h3>
              </div>
              {outOfStock.length === 0 ? (
                <p className="text-neutral-500 text-sm text-center py-8">All products in stock ✓</p>
              ) : (
                <div className="space-y-3">
                  {outOfStock.slice(0, 5).map((item) => (
                    <div key={item.id} className="p-3 bg-[#0f0f0f] rounded-xl border border-neutral-800">
                      <p className="text-sm text-white">{item.name}</p>
                      <p className="text-xs text-neutral-500 mt-0.5">{item.category}</p>
                      <span className="text-xs text-red-400 mt-1 inline-block">Out of stock</span>
                    </div>
                  ))}
                  {outOfStock.length > 5 && (
                    <p className="text-xs text-neutral-500 text-center">+{outOfStock.length - 5} more</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
