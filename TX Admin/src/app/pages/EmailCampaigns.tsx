import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Send, Edit, Trash2, Calendar, Users, Mail, TrendingUp } from 'lucide-react';

interface EmailCampaignsProps {
  onLogout: () => void;
}

const campaigns = [
  {
    id: 1,
    name: 'New Collection Launch',
    subject: '🔥 Toxic Society - New Winter Drop',
    audience: 'All Subscribers',
    recipients: 12450,
    sent: 12450,
    opens: 5678,
    clicks: 1234,
    status: 'Sent',
    sentDate: 'Feb 20, 2026'
  },
  {
    id: 2,
    name: 'Abandoned Cart Recovery',
    subject: 'Still thinking about it? Here\'s 15% off',
    audience: 'Abandoned Carts',
    recipients: 892,
    sent: 892,
    opens: 445,
    clicks: 178,
    status: 'Sent',
    sentDate: 'Feb 23, 2026'
  },
  {
    id: 3,
    name: 'VIP Early Access',
    subject: 'Exclusive: Shop Before Everyone Else',
    audience: 'VIP Members',
    recipients: 456,
    sent: 0,
    opens: 0,
    clicks: 0,
    status: 'Scheduled',
    sentDate: 'Feb 28, 2026'
  },
  {
    id: 4,
    name: 'Summer Sale Announcement',
    subject: 'Up to 50% OFF - Summer Starts Now',
    audience: 'All Subscribers',
    recipients: 12450,
    sent: 0,
    opens: 0,
    clicks: 0,
    status: 'Draft',
    sentDate: null
  },
];

const statusColors: Record<string, string> = {
  Sent: 'bg-green-500/20 text-green-400 border-green-500/30',
  Scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Draft: 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30',
};

export default function EmailCampaigns({ onLogout }: EmailCampaignsProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalSent = campaigns.reduce((sum, c) => sum + c.sent, 0);
  const totalOpens = campaigns.reduce((sum, c) => sum + c.opens, 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + c.clicks, 0);
  const avgOpenRate = totalSent > 0 ? ((totalOpens / totalSent) * 100).toFixed(1) : 0;
  const avgClickRate = totalSent > 0 ? ((totalClicks / totalSent) * 100).toFixed(1) : 0;

  return (
    <DashboardLayout title="Email Campaigns" onLogout={onLogout}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl text-white mb-1">Email Campaigns</h1>
          <p className="text-neutral-400 text-sm">Create and manage email marketing campaigns</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Campaign
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <Send className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Total Sent</p>
          <p className="text-2xl text-white">{totalSent.toLocaleString()}</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <Mail className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Avg Open Rate</p>
          <p className="text-2xl text-white">{avgOpenRate}%</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <TrendingUp className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Avg Click Rate</p>
          <p className="text-2xl text-white">{avgClickRate}%</p>
        </div>

        <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-[#0f0f0f] rounded-xl">
              <Users className="w-6 h-6 text-[#dc2626]" />
            </div>
          </div>
          <p className="text-neutral-400 text-sm mb-1">Total Subscribers</p>
          <p className="text-2xl text-white">12,450</p>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f0f0f]">
              <tr>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Campaign Name</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Subject</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Audience</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Recipients</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Opens</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Clicks</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Status</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((campaign) => (
                <tr key={campaign.id} className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white text-sm mb-1">{campaign.name}</p>
                      {campaign.sentDate && (
                        <p className="text-neutral-500 text-xs">{campaign.sentDate}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-300 text-sm">{campaign.subject}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-neutral-400 text-sm">{campaign.audience}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-white text-sm">{campaign.recipients.toLocaleString()}</span>
                  </td>
                  <td className="px-6 py-4">
                    {campaign.sent > 0 ? (
                      <div>
                        <span className="text-white text-sm">{campaign.opens.toLocaleString()}</span>
                        <span className="text-neutral-500 text-xs ml-1">
                          ({((campaign.opens / campaign.sent) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-600 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {campaign.sent > 0 ? (
                      <div>
                        <span className="text-white text-sm">{campaign.clicks.toLocaleString()}</span>
                        <span className="text-neutral-500 text-xs ml-1">
                          ({((campaign.clicks / campaign.sent) * 100).toFixed(1)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-neutral-600 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[campaign.status]}`}>
                      {campaign.status}
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

      {/* Abandoned Cart Widget */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
        <h3 className="text-lg text-white mb-4">Abandoned Cart Analytics</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-[#0f0f0f] rounded-xl p-4">
            <p className="text-neutral-400 text-sm mb-2">Total Abandoned</p>
            <p className="text-2xl text-white mb-1">892</p>
            <p className="text-neutral-500 text-xs">Last 30 days</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-xl p-4">
            <p className="text-neutral-400 text-sm mb-2">Recovery Rate</p>
            <p className="text-2xl text-white mb-1">19.8%</p>
            <p className="text-green-500 text-xs">+2.3% from last month</p>
          </div>
          <div className="bg-[#0f0f0f] rounded-xl p-4">
            <p className="text-neutral-400 text-sm mb-2">Recovered Revenue</p>
            <p className="text-2xl text-white mb-1">$18,456</p>
            <p className="text-green-500 text-xs">+12% from last month</p>
          </div>
        </div>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 overflow-y-auto p-4"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-8 max-w-3xl w-full my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl text-white mb-6">Create Email Campaign</h2>
            
            <div className="space-y-6">
              {/* Campaign Name */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Campaign Name</label>
                <input
                  type="text"
                  placeholder="e.g., New Collection Launch"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                />
              </div>

              {/* Subject Line */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Subject Line</label>
                <input
                  type="text"
                  placeholder="e.g., 🔥 Toxic Society - New Winter Drop"
                  className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
                />
              </div>

              {/* Audience Selector */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Target Audience</label>
                <select className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors">
                  <option>All Subscribers (12,450)</option>
                  <option>VIP Members (456)</option>
                  <option>New Customers (2,340)</option>
                  <option>Abandoned Carts (892)</option>
                  <option>Inactive Users (1,234)</option>
                </select>
              </div>

              {/* Email Preview */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Email Content Preview</label>
                <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-6">
                  <div className="bg-white text-black p-6 rounded-lg">
                    <h3 className="text-xl mb-4">TOXIC SOCIETY</h3>
                    <p className="text-neutral-600 mb-4">Your email content will appear here...</p>
                    <button className="bg-black text-white px-6 py-2 rounded">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div>
                <label className="block text-sm text-neutral-300 mb-2">Schedule</label>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="date"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                  <input
                    type="time"
                    className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#dc2626] transition-colors"
                  />
                </div>
                <p className="text-xs text-neutral-500 mt-1">Leave blank to save as draft</p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button className="flex-1 px-4 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors">
                  Send Campaign
                </button>
                <button className="px-6 py-3 bg-[#0f0f0f] border border-neutral-800 text-neutral-400 rounded-xl hover:text-white transition-colors">
                  Save Draft
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
