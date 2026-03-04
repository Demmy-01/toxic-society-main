import DashboardLayout from '../components/DashboardLayout';
import StatCard from '../components/StatCard';
import { DollarSign, ShoppingBag, Package, AlertTriangle, TrendingUp } from 'lucide-react';

interface ComponentsShowcaseProps {
  onLogout: () => void;
}

export default function ComponentsShowcase({ onLogout }: ComponentsShowcaseProps) {
  return (
    <DashboardLayout title="Components Showcase" onLogout={onLogout}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-white mb-1">Design System Components</h1>
        <p className="text-neutral-400 text-sm">Reusable components used throughout the dashboard</p>
      </div>

      {/* Typography */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-6">Typography</h2>
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 space-y-4">
          <h1 className="text-4xl text-white">Heading 1 - 4xl</h1>
          <h2 className="text-3xl text-white">Heading 2 - 3xl</h2>
          <h3 className="text-2xl text-white">Heading 3 - 2xl</h3>
          <h4 className="text-xl text-white">Heading 4 - xl</h4>
          <p className="text-white">Body Text - Regular</p>
          <p className="text-neutral-400">Body Text - Muted</p>
          <p className="text-sm text-neutral-500">Small Text</p>
          <p className="text-xs text-neutral-600">Extra Small Text</p>
        </div>
      </div>

      {/* Colors */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-6">Color Palette</h2>
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8">
          <div className="grid grid-cols-6 gap-4">
            <div>
              <div className="w-full h-20 bg-[#0f0f0f] rounded-xl mb-2"></div>
              <p className="text-sm text-neutral-400">#0f0f0f</p>
              <p className="text-xs text-neutral-600">Background</p>
            </div>
            <div>
              <div className="w-full h-20 bg-[#1a1a1a] rounded-xl mb-2 border border-neutral-800"></div>
              <p className="text-sm text-neutral-400">#1a1a1a</p>
              <p className="text-xs text-neutral-600">Card</p>
            </div>
            <div>
              <div className="w-full h-20 bg-[#dc2626] rounded-xl mb-2"></div>
              <p className="text-sm text-neutral-400">#dc2626</p>
              <p className="text-xs text-neutral-600">Primary</p>
            </div>
            <div>
              <div className="w-full h-20 bg-[#b91c1c] rounded-xl mb-2"></div>
              <p className="text-sm text-neutral-400">#b91c1c</p>
              <p className="text-xs text-neutral-600">Primary Dark</p>
            </div>
            <div>
              <div className="w-full h-20 bg-neutral-800 rounded-xl mb-2"></div>
              <p className="text-sm text-neutral-400">neutral-800</p>
              <p className="text-xs text-neutral-600">Border</p>
            </div>
            <div>
              <div className="w-full h-20 bg-white rounded-xl mb-2"></div>
              <p className="text-sm text-neutral-400">white</p>
              <p className="text-xs text-neutral-600">Text</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-6">Stat Cards</h2>
        <div className="grid grid-cols-4 gap-6">
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-[#dc2626]" />}
            label="Revenue"
            value="$6,890"
            change="+12.5%"
            changeType="positive"
          />
          <StatCard
            icon={<ShoppingBag className="w-6 h-6 text-[#dc2626]" />}
            label="Orders"
            value="1,247"
            change="+8.3%"
            changeType="positive"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6 text-[#dc2626]" />}
            label="Conversion"
            value="3.24%"
            change="-2.1%"
            changeType="negative"
          />
          <StatCard
            icon={<Package className="w-6 h-6 text-[#dc2626]" />}
            label="Inventory"
            value="245"
            change="0%"
            changeType="neutral"
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-6">Buttons</h2>
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8">
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors">
              Primary Button
            </button>
            <button className="px-4 py-2 bg-[#0f0f0f] border border-neutral-800 text-neutral-400 rounded-xl hover:text-white transition-colors">
              Secondary Button
            </button>
            <button className="px-4 py-2 bg-transparent border border-[#dc2626] text-[#dc2626] rounded-xl hover:bg-[#dc2626] hover:text-white transition-colors">
              Outline Button
            </button>
            <button className="px-4 py-2 text-neutral-400 rounded-xl hover:bg-[#0f0f0f] hover:text-white transition-colors">
              Ghost Button
            </button>
            <button className="px-4 py-2 bg-[#dc2626] text-white rounded-xl opacity-50 cursor-not-allowed">
              Disabled Button
            </button>
          </div>
        </div>
      </div>

      {/* Inputs */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-6">Form Inputs</h2>
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8">
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm text-neutral-300 mb-2">Text Input</label>
              <input
                type="text"
                placeholder="Enter text..."
                className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">Select Dropdown</label>
              <select className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors">
                <option>Option 1</option>
                <option>Option 2</option>
                <option>Option 3</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">Textarea</label>
              <textarea
                placeholder="Enter description..."
                rows={4}
                className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm text-neutral-300 mb-2">Toggle Switch</label>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#dc2626]">
                <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-6">Status Badges</h2>
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8">
          <div className="flex flex-wrap gap-3">
            <span className="px-3 py-1 rounded-full text-xs border bg-green-500/20 text-green-400 border-green-500/30">
              Active
            </span>
            <span className="px-3 py-1 rounded-full text-xs border bg-blue-500/20 text-blue-400 border-blue-500/30">
              Shipped
            </span>
            <span className="px-3 py-1 rounded-full text-xs border bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
              Pending
            </span>
            <span className="px-3 py-1 rounded-full text-xs border bg-orange-500/20 text-orange-400 border-orange-500/30">
              Warning
            </span>
            <span className="px-3 py-1 rounded-full text-xs border bg-red-500/20 text-red-400 border-red-500/30">
              Critical
            </span>
            <span className="px-3 py-1 rounded-full text-xs border bg-neutral-500/20 text-neutral-400 border-neutral-500/30">
              Inactive
            </span>
          </div>
        </div>
      </div>

      {/* Loading States */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-6">Loading States</h2>
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8">
          <div className="space-y-4">
            {/* Skeleton Card */}
            <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-neutral-800 rounded w-1/4"></div>
                <div className="h-8 bg-neutral-800 rounded w-1/2"></div>
                <div className="h-3 bg-neutral-800 rounded w-1/3"></div>
              </div>
            </div>

            {/* Spinner */}
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 border-4 border-neutral-800 border-t-[#dc2626] rounded-full animate-spin"></div>
              <span className="text-neutral-400">Loading...</span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty States */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-6">Empty States</h2>
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#0f0f0f] rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8 text-neutral-600" />
            </div>
            <p className="text-neutral-400 mb-2">No items found</p>
            <p className="text-neutral-600 text-sm mb-6">Get started by adding your first item</p>
            <button className="px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors">
              Add Item
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-6">Alerts</h2>
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 space-y-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <Package className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-green-400 text-sm mb-1">Success</p>
              <p className="text-neutral-300 text-sm">Your changes have been saved successfully.</p>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-red-400 text-sm mb-1">Error</p>
              <p className="text-neutral-300 text-sm">Something went wrong. Please try again.</p>
            </div>
          </div>

          <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 bg-orange-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-orange-400 text-sm mb-1">Warning</p>
              <p className="text-neutral-300 text-sm">Low stock alert: Only 3 items remaining.</p>
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <Package className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-blue-400 text-sm mb-1">Info</p>
              <p className="text-neutral-300 text-sm">Your subscription will renew on March 1, 2026.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table Example */}
      <div className="mb-12">
        <h2 className="text-xl text-white mb-6">Table</h2>
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#0f0f0f]">
              <tr>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Product</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Price</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Stock</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                <td className="px-6 py-4 text-white text-sm">Toxic Society Hoodie</td>
                <td className="px-6 py-4 text-white text-sm">$149.00</td>
                <td className="px-6 py-4 text-white text-sm">45</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs border bg-green-500/20 text-green-400 border-green-500/30">
                    In Stock
                  </span>
                </td>
              </tr>
              <tr className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                <td className="px-6 py-4 text-white text-sm">Oversized Tee</td>
                <td className="px-6 py-4 text-white text-sm">$89.00</td>
                <td className="px-6 py-4 text-white text-sm">12</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 rounded-full text-xs border bg-orange-500/20 text-orange-400 border-orange-500/30">
                    Low Stock
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
