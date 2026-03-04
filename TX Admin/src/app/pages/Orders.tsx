import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Filter, Search, Eye, Download, MoreVertical } from 'lucide-react';

interface OrdersProps {
  onLogout: () => void;
}

const orders = [
  { 
    id: '#TS-8492', 
    customer: 'Marcus Chen', 
    email: 'marcus@email.com',
    status: 'Shipped', 
    amount: '$289.00', 
    items: 2,
    date: 'Feb 25, 2026',
    time: '10:34 AM'
  },
  { 
    id: '#TS-8491', 
    customer: 'Sofia Martinez', 
    email: 'sofia@email.com',
    status: 'Paid', 
    amount: '$445.00', 
    items: 3,
    date: 'Feb 25, 2026',
    time: '09:15 AM'
  },
  { 
    id: '#TS-8490', 
    customer: 'James Wilson', 
    email: 'james@email.com',
    status: 'Pending', 
    amount: '$189.00', 
    items: 1,
    date: 'Feb 24, 2026',
    time: '16:22 PM'
  },
  { 
    id: '#TS-8489', 
    customer: 'Emma Thompson', 
    email: 'emma@email.com',
    status: 'Delivered', 
    amount: '$324.00', 
    items: 2,
    date: 'Feb 24, 2026',
    time: '14:50 PM'
  },
  { 
    id: '#TS-8488', 
    customer: 'Kai Johnson', 
    email: 'kai@email.com',
    status: 'Shipped', 
    amount: '$567.00', 
    items: 4,
    date: 'Feb 24, 2026',
    time: '11:30 AM'
  },
  { 
    id: '#TS-8487', 
    customer: 'Olivia Brown', 
    email: 'olivia@email.com',
    status: 'Paid', 
    amount: '$234.00', 
    items: 2,
    date: 'Feb 23, 2026',
    time: '18:45 PM'
  },
  { 
    id: '#TS-8486', 
    customer: 'Noah Davis', 
    email: 'noah@email.com',
    status: 'Delivered', 
    amount: '$412.00', 
    items: 3,
    date: 'Feb 23, 2026',
    time: '13:20 PM'
  },
  { 
    id: '#TS-8485', 
    customer: 'Ava Garcia', 
    email: 'ava@email.com',
    status: 'Pending', 
    amount: '$156.00', 
    items: 1,
    date: 'Feb 23, 2026',
    time: '10:05 AM'
  },
];

const statusColors: Record<string, string> = {
  Shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Paid: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Pending: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Delivered: 'bg-green-500/20 text-green-400 border-green-500/30',
};

export default function Orders({ onLogout }: OrdersProps) {
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const statuses = ['All', 'Pending', 'Paid', 'Shipped', 'Delivered'];

  const filteredOrders = orders.filter(order => {
    const matchesStatus = selectedStatus === 'All' || order.status === selectedStatus;
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <DashboardLayout title="Orders" onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl text-white mb-1">Order Management</h1>
          <p className="text-neutral-400 text-sm">Manage and track all customer orders</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors self-start sm:self-auto">
          <Download className="w-4 h-4" />
          Export Orders
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4 md:p-6 mb-6">
        <div className="flex flex-col gap-3">
          {/* Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-3 py-1.5 rounded-xl text-xs md:text-sm transition-all ${
                  selectedStatus === status
                    ? 'bg-[#dc2626] text-white'
                    : 'bg-[#0f0f0f] text-neutral-400 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Orders Table - desktop */}
      <div className="hidden md:block bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#0f0f0f]">
              <tr>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Order ID</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Customer</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Status</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Amount</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Items</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Date</th>
                <th className="text-left text-sm text-neutral-400 px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-[#0f0f0f] rounded-full flex items-center justify-center">
                        <Search className="w-8 h-8 text-neutral-600" />
                      </div>
                      <p className="text-neutral-400">No orders found</p>
                      <p className="text-neutral-600 text-sm">Try adjusting your filters or search term</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-white text-sm">{order.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm">{order.customer}</p>
                        <p className="text-neutral-500 text-xs">{order.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs border ${statusColors[order.status]}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white text-sm">{order.amount}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-neutral-400 text-sm">{order.items}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white text-sm">{order.date}</p>
                        <p className="text-neutral-500 text-xs">{order.time}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order.id)}
                          className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4 text-neutral-400" />
                        </button>
                        <button className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
                          <MoreVertical className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Orders Cards - mobile */}
      <div className="md:hidden space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <div className="w-16 h-16 bg-[#1a1a1a] rounded-full flex items-center justify-center">
              <Search className="w-8 h-8 text-neutral-600" />
            </div>
            <p className="text-neutral-400">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-white text-sm font-medium">{order.id}</p>
                  <p className="text-neutral-400 text-xs mt-0.5">{order.customer}</p>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs border ${statusColors[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-xs text-neutral-500">Amount</p>
                    <p className="text-white text-sm">{order.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Items</p>
                    <p className="text-neutral-300 text-sm">{order.items}</p>
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500">Date</p>
                    <p className="text-neutral-300 text-sm">{order.date}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(order.id)}
                  className="p-2 bg-[#0f0f0f] rounded-lg"
                >
                  <Eye className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 md:p-8 max-w-2xl w-full mx-2 my-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl md:text-2xl text-white mb-6">Order Details: {selectedOrder}</h2>
            {/* Order Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4">
                <p className="text-neutral-400 text-sm mb-2">Customer Information</p>
                <p className="text-white">Marcus Chen</p>
                <p className="text-neutral-400 text-sm">marcus@email.com</p>
                <p className="text-neutral-400 text-sm">+1 (555) 123-4567</p>
              </div>
              <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4">
                <p className="text-neutral-400 text-sm mb-2">Shipping Address</p>
                <p className="text-white text-sm">123 Fashion Ave</p>
                <p className="text-neutral-400 text-sm">Los Angeles, CA 90028</p>
                <p className="text-neutral-400 text-sm">United States</p>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4 mb-6">
              <p className="text-neutral-400 text-sm mb-4">Order Items</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">Toxic Society Hoodie - Black (M)</p>
                    <p className="text-neutral-500 text-xs">Qty: 1</p>
                  </div>
                  <span className="text-white">$149.00</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">Oversized Tee - White (L)</p>
                    <p className="text-neutral-500 text-xs">Qty: 1</p>
                  </div>
                  <span className="text-white">$89.00</span>
                </div>
              </div>
              <div className="border-t border-neutral-800 mt-4 pt-4 flex items-center justify-between">
                <span className="text-white">Total</span>
                <span className="text-xl text-white">$289.00</span>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-[#0f0f0f] border border-neutral-800 rounded-xl p-4 mb-6">
              <p className="text-neutral-400 text-sm mb-4">Order Timeline</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-white text-sm">Order Shipped</p>
                    <p className="text-neutral-500 text-xs">Feb 25, 2026 - 2:30 PM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-white text-sm">Payment Confirmed</p>
                    <p className="text-neutral-500 text-xs">Feb 25, 2026 - 10:34 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                  <div>
                    <p className="text-white text-sm">Order Placed</p>
                    <p className="text-neutral-500 text-xs">Feb 25, 2026 - 10:34 AM</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 px-4 py-3 bg-[#dc2626] text-white rounded-xl hover:bg-[#b91c1c] transition-colors">
                Update Status
              </button>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 bg-[#0f0f0f] text-neutral-400 rounded-xl hover:text-white transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
