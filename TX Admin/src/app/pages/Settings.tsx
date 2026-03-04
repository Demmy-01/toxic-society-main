import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Store, CreditCard, Truck, DollarSign, Users, Bell, Lock, Globe } from 'lucide-react';

interface SettingsProps {
  onLogout: () => void;
}

export default function Settings({ onLogout }: SettingsProps) {
  const [activeTab, setActiveTab] = useState('store');

  const tabs = [
    { id: 'store', label: 'Store Details', icon: Store },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'shipping', label: 'Shipping', icon: Truck },
    { id: 'tax', label: 'Tax', icon: DollarSign },
    { id: 'users', label: 'Users & Roles', icon: Users },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <DashboardLayout title="Settings" onLogout={onLogout}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl text-white mb-1">Settings</h1>
        <p className="text-neutral-400 text-sm">Manage your store configuration and preferences</p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <div className="w-64 bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-[#dc2626] text-white'
                      : 'text-neutral-400 hover:bg-[#0f0f0f] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'store' && (
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Store Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Store Name</label>
                  <input
                    type="text"
                    defaultValue="Toxic Society"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Store URL</label>
                  <input
                    type="text"
                    defaultValue="toxicsociety.com"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Contact Email</label>
                  <input
                    type="email"
                    defaultValue="contact@toxicsociety.com"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Store Description</label>
                  <textarea
                    rows={4}
                    defaultValue="Premium streetwear brand delivering high-quality fashion to the modern generation."
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Store Address</label>
                  <input
                    type="text"
                    defaultValue="123 Fashion Ave, Los Angeles, CA 90028"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>

                <button className="w-full px-4 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Payment Integration</h2>
              <div className="space-y-6">
                {/* Payment Providers */}
                <div>
                  <label className="block text-sm text-neutral-300 mb-3">Payment Providers</label>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-neutral-400" />
                        <div>
                          <p className="text-white text-sm">Stripe</p>
                          <p className="text-neutral-500 text-xs">Credit & Debit Cards</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 text-sm">Connected</span>
                        <button className="px-3 py-1 bg-[#1a1a1a] text-neutral-400 rounded-lg text-sm hover:text-white transition-colors">
                          Configure
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-neutral-400" />
                        <div>
                          <p className="text-white text-sm">PayPal</p>
                          <p className="text-neutral-500 text-xs">PayPal & Venmo</p>
                        </div>
                      </div>
                      <button className="px-3 py-1 bg-[#dc2626] text-white rounded-lg text-sm hover:bg-[#b91c1c] transition-colors">
                        Connect
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CreditCard className="w-5 h-5 text-neutral-400" />
                        <div>
                          <p className="text-white text-sm">Apple Pay</p>
                          <p className="text-neutral-500 text-xs">One-tap checkout</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-green-400 text-sm">Enabled</span>
                        <button className="px-3 py-1 bg-[#1a1a1a] text-neutral-400 rounded-lg text-sm hover:text-white transition-colors">
                          Configure
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Default Currency</label>
                  <select className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors">
                    <option>USD - US Dollar ($)</option>
                    <option>EUR - Euro (€)</option>
                    <option>GBP - British Pound (£)</option>
                    <option>CAD - Canadian Dollar ($)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Shipping Zones</h2>
              <div className="space-y-4 mb-6">
                <div className="p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white text-sm mb-1">United States</p>
                      <p className="text-neutral-500 text-xs">Standard & Express shipping</p>
                    </div>
                    <button className="px-3 py-1 bg-[#1a1a1a] text-neutral-400 rounded-lg text-sm hover:text-white transition-colors">
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">Standard (5-7 days)</span>
                      <span className="text-white">$9.99</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">Express (2-3 days)</span>
                      <span className="text-white">$19.99</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-white text-sm mb-1">International</p>
                      <p className="text-neutral-500 text-xs">Worldwide shipping</p>
                    </div>
                    <button className="px-3 py-1 bg-[#1a1a1a] text-neutral-400 rounded-lg text-sm hover:text-white transition-colors">
                      Edit
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-neutral-400">Standard (10-15 days)</span>
                      <span className="text-white">$29.99</span>
                    </div>
                  </div>
                </div>
              </div>

              <button className="w-full px-4 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors">
                Add Shipping Zone
              </button>
            </div>
          )}

          {activeTab === 'tax' && (
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Tax Configuration</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <div>
                    <p className="text-white text-sm mb-1">Automatic Tax Calculation</p>
                    <p className="text-neutral-500 text-xs">Calculate taxes based on customer location</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#dc2626]">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Tax Provider</label>
                  <select className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors">
                    <option>Manual tax rates</option>
                    <option>TaxJar</option>
                    <option>Avalara</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-neutral-300 mb-2">Default Tax Rate (%)</label>
                  <input
                    type="number"
                    defaultValue="8.5"
                    step="0.1"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>

                <button className="w-full px-4 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors">
                  Save Tax Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-white">Users & Roles</h2>
                <button className="px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors text-sm">
                  Invite User
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#dc2626] rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Admin User</p>
                      <p className="text-neutral-500 text-xs">admin@toxicsociety.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-[#dc2626]/20 text-[#dc2626] rounded-lg text-xs border border-[#dc2626]/30">
                      Owner
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Manager</p>
                      <p className="text-neutral-500 text-xs">manager@toxicsociety.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-neutral-500/20 text-neutral-400 rounded-lg text-xs border border-neutral-500/30">
                      Manager
                    </span>
                    <button className="px-3 py-1 bg-[#1a1a1a] text-neutral-400 rounded-lg text-sm hover:text-white transition-colors">
                      Edit
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-neutral-700 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm">Support Agent</p>
                      <p className="text-neutral-500 text-xs">support@toxicsociety.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-neutral-500/20 text-neutral-400 rounded-lg text-xs border border-neutral-500/30">
                      Support
                    </span>
                    <button className="px-3 py-1 bg-[#1a1a1a] text-neutral-400 rounded-lg text-sm hover:text-white transition-colors">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <h2 className="text-xl text-white mb-6">Notification Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <div>
                    <p className="text-white text-sm mb-1">New Order Notifications</p>
                    <p className="text-neutral-500 text-xs">Get notified when new orders are placed</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#dc2626]">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <div>
                    <p className="text-white text-sm mb-1">Low Stock Alerts</p>
                    <p className="text-neutral-500 text-xs">Receive alerts when inventory is running low</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#dc2626]">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <div>
                    <p className="text-white text-sm mb-1">Marketing Updates</p>
                    <p className="text-neutral-500 text-xs">Campaign performance and analytics</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-neutral-800">
                    <span className="translate-x-1 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#0f0f0f] border border-neutral-800 rounded-xl">
                  <div>
                    <p className="text-white text-sm mb-1">Security Alerts</p>
                    <p className="text-neutral-500 text-xs">Login attempts and security events</p>
                  </div>
                  <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#dc2626]">
                    <span className="translate-x-6 inline-block h-4 w-4 transform rounded-full bg-white transition" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
