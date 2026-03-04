import DashboardLayout from '../components/DashboardLayout';
import { TrendingUp, Users, ShoppingBag, DollarSign, MapPin } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsProps {
  onLogout: () => void;
}

// Mock Data
const monthlyRevenue = [
  { month: 'Aug', revenue: 42000, orders: 234 },
  { month: 'Sep', revenue: 48000, orders: 267 },
  { month: 'Oct', revenue: 52000, orders: 289 },
  { month: 'Nov', revenue: 61000, orders: 312 },
  { month: 'Dec', revenue: 78000, orders: 389 },
  { month: 'Jan', revenue: 71000, orders: 356 },
  { month: 'Feb', revenue: 84000, orders: 421 },
];

const conversionFunnel = [
  { stage: 'Visitors', count: 45000 },
  { stage: 'Product Views', count: 18000 },
  { stage: 'Add to Cart', count: 5400 },
  { stage: 'Checkout', count: 2160 },
  { stage: 'Purchase', count: 1458 },
];

const topProducts = [
  { name: 'Toxic Society Hoodie', sales: 456, revenue: 67984 },
  { name: 'Oversized Tee - White', sales: 389, revenue: 26131 },
  { name: 'Bomber Jacket - Red', sales: 234, revenue: 67626 },
  { name: 'Cargo Pants - Olive', sales: 312, revenue: 40248 },
  { name: 'Graphic Tee - Skull', sales: 445, revenue: 35155 },
];

const trafficSources = [
  { name: 'Organic Search', value: 38, color: '#dc2626' },
  { name: 'Social Media', value: 28, color: '#ef4444' },
  { name: 'Direct', value: 18, color: '#f87171' },
  { name: 'Email', value: 10, color: '#fca5a5' },
  { name: 'Paid Ads', value: 6, color: '#fecaca' },
];

const customerMetrics = [
  { metric: 'New Customers', value: 1234, change: '+12.5%' },
  { metric: 'Returning Customers', value: 3456, change: '+8.3%' },
  { metric: 'Customer Lifetime Value', value: '$489', change: '+15.2%' },
  { metric: 'Churn Rate', value: '3.2%', change: '-1.1%' },
];

export default function Analytics({ onLogout }: AnalyticsProps) {
  return (
    <DashboardLayout title="Analytics" onLogout={onLogout}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-white mb-1">Advanced Analytics</h1>
        <p className="text-neutral-400 text-sm">Comprehensive insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <DollarSign className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Total Revenue (30d)</p>
          <p className="text-2xl text-white mb-1">$84,000</p>
          <p className="text-green-500 text-sm">+18.5%</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <ShoppingBag className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Total Orders</p>
          <p className="text-2xl text-white mb-1">421</p>
          <p className="text-green-500 text-sm">+12.3%</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <TrendingUp className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Conversion Rate</p>
          <p className="text-2xl text-white mb-1">3.24%</p>
          <p className="text-green-500 text-sm">+0.8%</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <Users className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Avg Order Value</p>
          <p className="text-2xl text-white mb-1">$199.50</p>
          <p className="text-green-500 text-sm">+5.2%</p>
        </div>
      </div>

      {/* Revenue & Orders Chart */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 mb-8">
        <h3 className="text-lg text-white mb-6">Revenue & Orders Trend</h3>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis 
              dataKey="month" 
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
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="#dc2626" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorRevenue)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Conversion Funnel & Traffic Sources */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Conversion Funnel */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg text-white mb-6">Conversion Funnel</h3>
          <div className="space-y-4">
            {conversionFunnel.map((stage, index) => {
              const percentage = ((stage.count / conversionFunnel[0].count) * 100).toFixed(1);
              return (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-neutral-300 text-sm">{stage.stage}</span>
                    <span className="text-white text-sm">{stage.count.toLocaleString()}</span>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-neutral-800 rounded-full h-8 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-[#dc2626] to-[#b91c1c] h-8 rounded-full flex items-center justify-end pr-3 transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      >
                        <span className="text-white text-xs">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg text-white mb-6">Traffic Sources</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={trafficSources}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {trafficSources.map((entry, index) => (
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
            {trafficSources.map((source) => (
              <div key={source.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: source.color }}
                  ></div>
                  <span className="text-sm text-neutral-400">{source.name}</span>
                </div>
                <span className="text-sm text-white">{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products & Customer Metrics */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {/* Top Products */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg text-white mb-6">Top Selling Products</h3>
          <div className="space-y-4">
            {topProducts.map((product, index) => (
              <div key={product.name} className="flex items-center gap-4">
                <div className="w-8 h-8 bg-[#0f0f0f] rounded-lg flex items-center justify-center text-neutral-400 text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-white text-sm mb-1">{product.name}</p>
                  <p className="text-neutral-500 text-xs">{product.sales} sales</p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">${product.revenue.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Metrics */}
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <h3 className="text-lg text-white mb-6">Customer Metrics</h3>
          <div className="space-y-4">
            {customerMetrics.map((metric) => (
              <div key={metric.metric} className="bg-[#0f0f0f] rounded-xl p-4">
                <p className="text-neutral-400 text-sm mb-2">{metric.metric}</p>
                <div className="flex items-end justify-between">
                  <p className="text-2xl text-white">{metric.value}</p>
                  <p className={`text-sm ${
                    metric.change.startsWith('+') || metric.change.startsWith('-') && parseFloat(metric.change) < 0
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {metric.change}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Abandoned Cart */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-lg text-white mb-6">Abandoned Cart Analytics</h3>
        <div className="grid grid-cols-4 gap-6">
          <div className="bg-[#0f0f0f] rounded-xl p-4">
            <p className="text-neutral-400 text-sm mb-2">Total Abandoned</p>
            <p className="text-2xl text-white mb-1">892</p>
            <p className="text-neutral-500 text-xs">Last 30 days</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-xl p-4">
            <p className="text-neutral-400 text-sm mb-2">Abandonment Rate</p>
            <p className="text-2xl text-white mb-1">58.7%</p>
            <p className="text-red-500 text-xs">Industry avg: 69.8%</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-xl p-4">
            <p className="text-neutral-400 text-sm mb-2">Recovery Rate</p>
            <p className="text-2xl text-white mb-1">19.8%</p>
            <p className="text-green-500 text-xs">+2.3% from last month</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-xl p-4">
            <p className="text-neutral-400 text-sm mb-2">Lost Revenue</p>
            <p className="text-2xl text-white mb-1">$74,523</p>
            <p className="text-neutral-500 text-xs">Potential revenue</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
