import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, Eye, X, Loader2, Users as UsersIcon, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface UsersProps {
  onLogout: () => void;
}

interface Customer {
  id: string;
  user_id: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  delivery_location: string | null;
  created_at: string;
  updated_at: string;
}

export default function Users({ onLogout }: UsersProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      const { data } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      setCustomers(data ?? []);
      setLoading(false);
    }
    fetchCustomers();
  }, []);

  const filtered = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      !q ||
      (c.name ?? '').toLowerCase().includes(q) ||
      (c.email ?? '').toLowerCase().includes(q) ||
      (c.phone ?? '').toLowerCase().includes(q)
    );
  });

  return (
    <DashboardLayout title="Users" onLogout={onLogout}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl text-white mb-1">Registered Users</h1>
          <p className="text-neutral-400 text-sm">
            {loading ? 'Loading...' : `${customers.length} registered users`}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4 md:p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search by name, email, or phone…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0f0f0f] border border-neutral-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#dc2626] transition-colors"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && customers.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <UsersIcon className="w-12 h-12 text-neutral-700 mb-4" />
          <p className="text-white text-xl mb-2">No registered users yet</p>
          <p className="text-neutral-500 text-sm">Users who sign up on the website will appear here.</p>
        </div>
      )}

      {/* Desktop Table */}
      {!loading && filtered.length > 0 && (
        <div className="hidden md:block bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#0f0f0f]">
                <tr>
                  {['Name', 'Email', 'Phone', 'Delivery Location', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-sm text-neutral-400 px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#dc2626]/20 flex items-center justify-center shrink-0">
                          <span className="text-sm text-[#dc2626] font-medium">
                            {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-white text-sm">{user.name ?? '—'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400 text-sm">{user.email ?? '—'}</td>
                    <td className="px-6 py-4 text-neutral-400 text-sm">{user.phone ?? '—'}</td>
                    <td className="px-6 py-4 text-neutral-400 text-sm max-w-[180px] truncate">{user.delivery_location ?? '—'}</td>
                    <td className="px-6 py-4 text-neutral-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <button onClick={() => setSelectedUser(user)} className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors">
                        <Eye className="w-4 h-4 text-neutral-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      {!loading && filtered.length > 0 && (
        <div className="md:hidden space-y-3">
          {filtered.map((user) => (
            <div key={user.id} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#dc2626]/20 flex items-center justify-center shrink-0">
                    <span className="text-sm text-[#dc2626] font-medium">
                      {(user.name ?? user.email ?? '?').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{user.name ?? 'Unknown'}</p>
                    <p className="text-neutral-400 text-xs">{user.email ?? '—'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedUser(user)} className="p-2 bg-[#0f0f0f] rounded-lg">
                  <Eye className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
              {(user.phone || user.delivery_location) && (
                <div className="mt-3 pt-3 border-t border-neutral-800 flex flex-wrap gap-3">
                  {user.phone && <span className="text-xs text-neutral-500">{user.phone}</span>}
                  {user.delivery_location && <span className="text-xs text-neutral-500 truncate">{user.delivery_location}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div
            className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-5 md:p-8 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl text-white">User Details</h2>
              <button onClick={() => setSelectedUser(null)} className="text-neutral-500 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar + Name */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-[#dc2626]/20 flex items-center justify-center">
                <span className="text-2xl text-[#dc2626] font-bold">
                  {(selectedUser.name ?? selectedUser.email ?? '?').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white text-lg">{selectedUser.name ?? 'No name provided'}</p>
                <p className="text-neutral-400 text-sm">
                  Joined {new Date(selectedUser.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-[#0f0f0f] rounded-xl">
                <Mail className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 mb-0.5">Email</p>
                  <p className="text-white text-sm">{selectedUser.email ?? '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#0f0f0f] rounded-xl">
                <Phone className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 mb-0.5">Phone</p>
                  <p className="text-white text-sm">{selectedUser.phone ?? 'Not provided'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-[#0f0f0f] rounded-xl">
                <MapPin className="w-4 h-4 text-neutral-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-neutral-500 mb-0.5">Delivery Location</p>
                  <p className="text-white text-sm">{selectedUser.delivery_location ?? 'Not provided'}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-6 px-4 py-3 bg-[#0f0f0f] text-neutral-400 rounded-xl hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
