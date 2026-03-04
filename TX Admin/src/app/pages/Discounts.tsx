import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Edit, Trash2, Percent, Calendar, Users, TrendingUp } from 'lucide-react';

interface DiscountsProps {
  onLogout: () => void;
}

const discounts = [
  {
    id: 1,
    code: 'TOXIC25',
    type: 'Percentage',
    value: 25,
    description: 'New Customer Welcome',
    uses: 234,
    limit: 1000,
    validUntil: 'Mar 31, 2026',
    status: 'Active'
  },
  {
    id: 2,
    code: 'SUMMER50',
    type: 'Percentage',
    value: 50,
    description: 'Summer Sale',
    uses: 567,
    limit: 500,
    validUntil: 'Jun 30, 2026',
    status: 'Active'
  },
  {
    id: 3,
    code: 'FREESHIPING',
    type: 'Fixed',
    value: 15,
    description: 'Free Standard Shipping',
    uses: 892,
    limit: null,
    validUntil: 'Dec 31, 2026',
    status: 'Active'
  },
  {
    id: 4,
    code: 'VIPONLY',
    type: 'Percentage',
    value: 30,
    description: 'VIP Members Only',
    uses: 123,
    limit: 300,
    validUntil: 'Dec 31, 2026',
    status: 'Active'
  },
  {
    id: 5,
    code: 'WINTER20',
    type: 'Percentage',
    value: 20,
    description: 'Winter Collection',
    uses: 445,
    limit: 500,
    validUntil: 'Feb 28, 2026',
    status: 'Expired'
  },
];

export default function Discounts({ onLogout }: DiscountsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');

  const activeDiscounts = discounts.filter(d => d.status === 'Active').length;
  const totalUses = discounts.reduce((sum, d) => sum + d.uses, 0);

  return (
    <DashboardLayout title="Discounts" onLogout={onLogout}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-white mb-1">Discount & Promo Codes</h1>
          <p className="text-neutral-400 text-sm">Create and manage promotional discount codes</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Discount
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <Percent className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Active Discounts</p>
          <p className="text-2xl text-white">{activeDiscounts}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <Users className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Total Uses</p>
          <p className="text-2xl text-white">{totalUses}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <TrendingUp className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Conversion Rate</p>
          <p className="text-2xl text-white">12.4%</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <Calendar className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Expiring Soon</p>
          <p className="text-2xl text-white">2</p>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f0f0f]">
              <tr>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Code</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Description</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Type</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Value</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Usage</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Valid Until</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Status</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map((discount) => (
                <tr key={discount.id} className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <code className="text-white text-sm font-mono bg-[#0f0f0f] px-2 py-1 rounded">
                        {discount.code}
                      </code>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-300 text-sm">{discount.description}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-400 text-sm">{discount.type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-sm">
                      {discount.type === 'Percentage' ? `${discount.value}%` : `$${discount.value}`}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white text-sm">{discount.uses}</span>
                        {discount.limit && (
                          <span className="text-neutral-500 text-xs">/ {discount.limit}</span>
                        )}
                      </div>
                      {discount.limit && (
                        <div className="w-full bg-neutral-800 rounded-full h-1.5">
                          <div 
                            className="bg-[#dc2626] h-1.5 rounded-full"
                            style={{ width: `${(discount.uses / discount.limit) * 100}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-400 text-sm">{discount.validUntil}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${
                      discount.status === 'Active' 
                        ? 'bg-green-500/20 text-green-400 border-green-500/30'
                        : 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30'
                    }`}>
                      {discount.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                        <Edit className="w-4 h-4 text-neutral-400" />
                      </button>
                      <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Discount Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl text-white mb-6">Create New Discount</h2>
            
            <div className="space-y-6">
              {/* Discount Code */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Discount Code</label>
                <input
                  type="text"
                  placeholder="e.g., TOXIC25"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors uppercase"
                />
                <p className="text-xs text-neutral-500 mt-1">Code will be automatically converted to uppercase</p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Description</label>
                <input
                  type="text"
                  placeholder="e.g., New Customer Welcome"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                />
              </div>

              {/* Discount Type Toggle */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Discount Type</label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDiscountType('percentage')}
                    className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                      discountType === 'percentage'
                        ? 'bg-[#dc2626] text-white'
                        : 'bg-[#0f0f0f] text-neutral-400 border border-neutral-800'
                    }`}
                  >
                    Percentage (%)
                  </button>
                  <button
                    onClick={() => setDiscountType('fixed')}
                    className={`flex-1 px-4 py-3 rounded-xl transition-all ${
                      discountType === 'fixed'
                        ? 'bg-[#dc2626] text-white'
                        : 'bg-[#0f0f0f] text-neutral-400 border border-neutral-800'
                    }`}
                  >
                    Fixed Amount ($)
                  </button>
                </div>
              </div>

              {/* Value */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">
                  {discountType === 'percentage' ? 'Percentage Off' : 'Dollar Amount Off'}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    placeholder={discountType === 'percentage' ? '25' : '15'}
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500">
                    {discountType === 'percentage' ? '%' : '$'}
                  </span>
                </div>
              </div>

              {/* Usage Limit and Expiry */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Usage Limit (Optional)</label>
                  <input
                    type="number"
                    placeholder="1000"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Valid Until</label>
                  <input
                    type="date"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>
              </div>

              {/* Minimum Purchase */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Minimum Purchase (Optional)</label>
                <input
                  type="number"
                  placeholder="50"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors">
                  Create Discount
                </button>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 bg-[#0f0f0f] text-neutral-400 rounded-xl hover:text-white transition-colors"
                >
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
