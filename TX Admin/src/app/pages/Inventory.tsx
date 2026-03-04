import DashboardLayout from '../components/DashboardLayout';
import { AlertTriangle, Package, TrendingDown, Edit } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface InventoryProps {
  onLogout: () => void;
}

const stockByCategory = [
  { category: 'Hoodies', stock: 145 },
  { category: 'T-Shirts', stock: 289 },
  { category: 'Jackets', stock: 67 },
  { category: 'Pants', stock: 98 },
  { category: 'Accessories', stock: 234 },
];

const inventoryItems = [
  {
    id: 1,
    product: 'Toxic Society Hoodie - Black',
    sku: 'TS-HOD-BLK-S',
    variant: 'Small',
    category: 'Hoodies',
    stock: 12,
    reserved: 3,
    available: 9,
    status: 'low'
  },
  {
    id: 2,
    product: 'Toxic Society Hoodie - Black',
    sku: 'TS-HOD-BLK-M',
    variant: 'Medium',
    category: 'Hoodies',
    stock: 3,
    reserved: 1,
    available: 2,
    status: 'critical'
  },
  {
    id: 3,
    product: 'Oversized Tee - White',
    sku: 'TS-TEE-WHT-L',
    variant: 'Large',
    category: 'T-Shirts',
    stock: 5,
    reserved: 2,
    available: 3,
    status: 'critical'
  },
  {
    id: 4,
    product: 'Bomber Jacket - Red',
    sku: 'TS-JKT-RED-XL',
    variant: 'X-Large',
    category: 'Jackets',
    stock: 2,
    reserved: 0,
    available: 2,
    status: 'critical'
  },
  {
    id: 5,
    product: 'Cargo Pants - Olive',
    sku: 'TS-PNT-OLV-32',
    variant: '32',
    category: 'Pants',
    stock: 34,
    reserved: 5,
    available: 29,
    status: 'good'
  },
  {
    id: 6,
    product: 'Graphic Tee - Skull',
    sku: 'TS-TEE-SKL-M',
    variant: 'Medium',
    category: 'T-Shirts',
    stock: 67,
    reserved: 8,
    available: 59,
    status: 'good'
  },
  {
    id: 7,
    product: 'Beanie - Black',
    sku: 'TS-ACC-BNE-OS',
    variant: 'One Size',
    category: 'Accessories',
    stock: 120,
    reserved: 15,
    available: 105,
    status: 'good'
  },
  {
    id: 8,
    product: 'Oversized Hoodie - Gray',
    sku: 'TS-HOD-GRY-L',
    variant: 'Large',
    category: 'Hoodies',
    stock: 8,
    reserved: 2,
    available: 6,
    status: 'low'
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'critical':
      return 'bg-red-500/20 text-red-400 border-red-500/30';
    case 'low':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'good':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    default:
      return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
  }
};

export default function Inventory({ onLogout }: InventoryProps) {
  const criticalItems = inventoryItems.filter(item => item.status === 'critical').length;
  const lowItems = inventoryItems.filter(item => item.status === 'low').length;
  const totalStock = inventoryItems.reduce((sum, item) => sum + item.stock, 0);

  return (
    <DashboardLayout title="Inventory" onLogout={onLogout}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-white mb-1">Inventory Management</h1>
        <p className="text-neutral-400 text-sm">Monitor and manage stock levels across all variants</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <Package className="w-6 h-6 text-green-500" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Total Stock</p>
          <p className="text-2xl text-white">{totalStock}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Critical Stock</p>
          <p className="text-2xl text-white">{criticalItems}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <TrendingDown className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Low Stock</p>
          <p className="text-2xl text-white">{lowItems}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <Package className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Product Variants</p>
          <p className="text-2xl text-white">{inventoryItems.length}</p>
        </div>
      </div>

      {/* Stock by Category Chart */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 mb-8">
        <h3 className="text-lg text-white mb-6">Stock by Category</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stockByCategory}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
            <XAxis 
              dataKey="category" 
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
            <Bar dataKey="stock" fill="#dc2626" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-neutral-800">
          <h3 className="text-lg text-white">Variant Stock Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f0f0f]">
              <tr>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Product</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">SKU</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Variant</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Category</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Total Stock</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Reserved</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Available</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Status</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => (
                <tr key={item.id} className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-white text-sm">{item.product}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-400 text-sm font-mono">{item.sku}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-300 text-sm">{item.variant}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-400 text-sm">{item.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-sm">{item.stock}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-400 text-sm">{item.reserved}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-sm">{item.available}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(item.status)}`}>
                      {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                      <Edit className="w-4 h-4 text-neutral-400" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Update Section */}
      <div className="mt-6 bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-lg text-white mb-4">Bulk Stock Update</h3>
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm text-neutral-300 mb-2">Select Category</label>
            <select className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors">
              <option>All Categories</option>
              <option>Hoodies</option>
              <option>T-Shirts</option>
              <option>Jackets</option>
              <option>Pants</option>
              <option>Accessories</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm text-neutral-300 mb-2">Adjust Stock By</label>
            <input
              type="number"
              placeholder="e.g., +10 or -5"
              className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
            />
          </div>
          <button className="px-6 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors">
            Apply Update
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}
