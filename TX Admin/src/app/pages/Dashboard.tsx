import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { 
  DollarSign, 
  ShoppingBag, 
  TrendingUp, 
  CreditCard,
  AlertTriangle,
  Package
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
  Legend
} from 'recharts';

interface DashboardProps {
  onLogout: () => void;
}

// Mock Data
const revenueData = [
  { date: 'Feb 18', revenue: 4200 },
  { date: 'Feb 19', revenue: 5100 },
  { date: 'Feb 20', revenue: 4800 },
  { date: 'Feb 21', revenue: 6200 },
  { date: 'Feb 22', revenue: 5800 },
  { date: 'Feb 23', revenue: 7200 },
  { date: 'Feb 24', revenue: 6900 },
];

const categoryData = [
  { name: 'Hoodies', value: 35, color: '#dc2626' },
  { name: 'T-Shirts', value: 28, color: '#ef4444' },
  { name: 'Jackets', value: 22, color: '#f87171' },
  { name: 'Accessories', value: 15, color: '#fca5a5' },
];

const recentOrders = [
  { id: '#TS-8492', customer: 'Marcus Chen', status: 'Shipped', amount: '$289.00', date: 'Feb 25, 2026' },
  { id: '#TS-8491', customer: 'Sofia Martinez', status: 'Paid', amount: '$445.00', date: 'Feb 25, 2026' },
  { id: '#TS-8490', customer: 'James Wilson', status: 'Pending', amount: '$189.00', date: 'Feb 24, 2026' },
  { id: '#TS-8489', customer: 'Emma Thompson', status: 'Delivered', amount: '$324.00', date: 'Feb 24, 2026' },
  { id: '#TS-8488', customer: 'Kai Johnson', status: 'Shipped', amount: '$567.00', date: 'Feb 24, 2026' },
];

const lowStockItems = [
  { name: 'Toxic Society Hoodie - Black', sku: 'TS-HOD-BLK-M', stock: 3 },
  { name: 'Oversized Tee - White', sku: 'TS-TEE-WHT-L', stock: 5 },
  { name: 'Bomber Jacket - Red', sku: 'TS-JKT-RED-XL', stock: 2 },
];

const statusColors: Record<string, string> = {
  Shipped: 'bg-blue-500/20 text-blue-400',
  Paid: 'bg-yellow-500/20 text-yellow-400',
  Pending: 'bg-orange-500/20 text-orange-400',
  Delivered: 'bg-green-500/20 text-green-400',
};

export default function Dashboard({ onLogout }: DashboardProps) {
  return (
    <DashboardLayout title="Dashboard" onLogout={onLogout}>
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
        <StatCard
          icon={<DollarSign className="w-6 h-6 text-[#dc2626]" />}
          label="Today's Revenue"
          value="$6,890"
          change="+12.5%"
          changeType="positive"
        />
        <StatCard
          icon={<ShoppingBag className="w-6 h-6 text-[#dc2626]" />}
          label="Total Orders (30d)"
          value="1,247"
          change="+8.3%"
          changeType="positive"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-[#dc2626]" />}
          label="Conversion Rate"
          value="3.24%"
          change="+0.4%"
          changeType="positive"
        />
        <StatCard
          icon={<CreditCard className="w-6 h-6 text-[#dc2626]" />}
          label="Avg Order Value"
          value="$189.50"
          change="-2.1%"
          changeType="negative"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Revenue Trend Chart */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg text-white mb-6">Revenue Trend (7 Days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280" 
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280" 
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#dc2626" 
                strokeWidth={2}
                dot={{ fill: '#dc2626', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sales by Category */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg text-white mb-6">Sales by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#fff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-neutral-400">{item.name}</span>
                </div>
                <span className="text-sm text-white">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg text-white mb-6">Recent Orders</h3>
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
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-800/50 hover:bg-[#0f0f0f] transition-colors">
                    <td className="py-4 text-sm text-white">{order.id}</td>
                    <td className="py-4 text-sm text-neutral-300">{order.customer}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 text-sm text-white">{order.amount}</td>
                    <td className="py-4 text-sm text-neutral-400">{order.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <AlertTriangle className="w-5 h-5 text-[#dc2626]" />
            <h3 className="text-lg text-white">Low Stock Alert</h3>
          </div>
          <div className="space-y-4">
            {lowStockItems.map((item) => (
              <div key={item.sku} className="p-4 bg-[#0f0f0f] rounded-xl border border-neutral-800">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-neutral-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-white mb-1">{item.name}</p>
                    <p className="text-xs text-neutral-500 mb-2">{item.sku}</p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-neutral-800 rounded-full h-1.5">
                        <div 
                          className="bg-[#dc2626] h-1.5 rounded-full"
                          style={{ width: `${(item.stock / 10) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-[#dc2626]">{item.stock} left</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
