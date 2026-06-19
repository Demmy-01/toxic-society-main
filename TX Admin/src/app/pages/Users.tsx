import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
import DashboardLayout from '../components/DashboardLayout';
import { Search, Eye, X, Loader2, Users as UsersIcon, Mail, Phone, MapPin, Ban, Trash2, ShieldCheck, AlertTriangle } from 'lucide-react';
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

interface UserRecord {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function Users({ onLogout }: UsersProps) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<Customer | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    type: 'suspend' | 'unsuspend' | 'delete';
    userId: string;
    userName: string;
  } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    // Fetch both customers and users tables
    const [customersRes, usersRes] = await Promise.all([
      supabase.from('customers').select('*').order('created_at', { ascending: false }),
      supabase.from('users').select('*').order('created_at', { ascending: false }),
    ]);
    setCustomers(customersRes.data ?? []);
    setUsers(usersRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Show toast and auto-dismiss
  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Get user record for a customer
  const getUserForCustomer = (customer: Customer): UserRecord | undefined => {
    return users.find((u) => u.id === customer.user_id);
  };

  // Suspend/unsuspend a user
  const handleSuspend = async (userId: string, suspend: boolean) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('ts_admin_token') || localStorage.getItem('ts_token');
      const res = await fetch(`${API_URL}/api/v1/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: !suspend }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.detail || 'Failed to update user', 'error');
      } else {
        showToast(suspend ? 'User suspended' : 'User reactivated', 'success');
        await fetchData();
      }
    } catch {
      showToast('Network error', 'error');
    }
    setActionLoading(null);
    setConfirmAction(null);
  };

  // Delete a user
  const handleDelete = async (userId: string) => {
    setActionLoading(userId);
    try {
      const token = localStorage.getItem('ts_admin_token') || localStorage.getItem('ts_token');
      const res = await fetch(`${API_URL}/api/v1/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.detail || 'Failed to delete user', 'error');
      } else {
        showToast('User deleted permanently', 'success');
        setSelectedUser(null);
        await fetchData();
      }
    } catch {
      showToast('Network error', 'error');
    }
    setActionLoading(null);
    setConfirmAction(null);
  };

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
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl text-sm font-medium shadow-lg transition-all ${
            toast.type === 'success'
              ? 'bg-green-500/10 border border-green-500/30 text-green-400'
              : 'bg-red-500/10 border border-red-500/30 text-red-400'
          }`}
        >
          {toast.message}
        </div>
      )}

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
                  {['Name', 'Email', 'Phone', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left text-sm text-neutral-400 px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => {
                  const userRec = getUserForCustomer(customer);
                  const isActive = userRec?.is_active !== false;
                  const isAdmin = userRec?.is_admin === true;
                  return (
                    <tr key={customer.id} className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-[#dc2626]/20' : 'bg-neutral-700/30'}`}>
                            <span className={`text-sm font-medium ${isActive ? 'text-[#dc2626]' : 'text-neutral-500'}`}>
                              {(customer.name ?? customer.email ?? '?').charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <span className={`text-sm ${isActive ? 'text-white' : 'text-neutral-500 line-through'}`}>
                              {customer.name ?? '—'}
                            </span>
                            {isAdmin && (
                              <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">ADMIN</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-neutral-400 text-sm">{customer.email ?? '—'}</td>
                      <td className="px-6 py-4 text-neutral-400 text-sm">{customer.phone ?? '—'}</td>
                      <td className="px-6 py-4">
                        {isActive ? (
                          <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                        ) : (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Suspended</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-neutral-400 text-sm">
                        {new Date(customer.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelectedUser(customer)} className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors" title="View details">
                            <Eye className="w-4 h-4 text-neutral-400" />
                          </button>
                          {userRec && !isAdmin && (
                            <>
                              <button
                                onClick={() => setConfirmAction({
                                  type: isActive ? 'suspend' : 'unsuspend',
                                  userId: userRec.id,
                                  userName: customer.name || customer.email || 'this user',
                                })}
                                className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                                title={isActive ? 'Suspend user' : 'Reactivate user'}
                                disabled={actionLoading === userRec.id}
                              >
                                {isActive ? (
                                  <Ban className="w-4 h-4 text-amber-400" />
                                ) : (
                                  <ShieldCheck className="w-4 h-4 text-green-400" />
                                )}
                              </button>
                              <button
                                onClick={() => setConfirmAction({
                                  type: 'delete',
                                  userId: userRec.id,
                                  userName: customer.name || customer.email || 'this user',
                                })}
                                className="p-2 hover:bg-[#2a2a2a] rounded-lg transition-colors"
                                title="Delete user"
                                disabled={actionLoading === userRec.id}
                              >
                                <Trash2 className="w-4 h-4 text-red-400" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      {!loading && filtered.length > 0 && (
        <div className="md:hidden space-y-3">
          {filtered.map((customer) => {
            const userRec = getUserForCustomer(customer);
            const isActive = userRec?.is_active !== false;
            const isAdmin = userRec?.is_admin === true;
            return (
              <div key={customer.id} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isActive ? 'bg-[#dc2626]/20' : 'bg-neutral-700/30'}`}>
                      <span className={`text-sm font-medium ${isActive ? 'text-[#dc2626]' : 'text-neutral-500'}`}>
                        {(customer.name ?? customer.email ?? '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${isActive ? 'text-white' : 'text-neutral-500'}`}>
                        {customer.name ?? 'Unknown'}
                        {isAdmin && <span className="ml-2 text-[10px] px-1.5 py-0.5 bg-amber-500/20 text-amber-400 rounded">ADMIN</span>}
                      </p>
                      <p className="text-neutral-400 text-xs">{customer.email ?? '—'}</p>
                      {!isActive && <span className="text-[10px] text-red-400">Suspended</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setSelectedUser(customer)} className="p-2 bg-[#0f0f0f] rounded-lg">
                      <Eye className="w-4 h-4 text-neutral-400" />
                    </button>
                    {userRec && !isAdmin && (
                      <>
                        <button
                          onClick={() => setConfirmAction({
                            type: isActive ? 'suspend' : 'unsuspend',
                            userId: userRec.id,
                            userName: customer.name || customer.email || 'this user',
                          })}
                          className="p-2 bg-[#0f0f0f] rounded-lg"
                        >
                          {isActive ? <Ban className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-green-400" />}
                        </button>
                        <button
                          onClick={() => setConfirmAction({
                            type: 'delete',
                            userId: userRec.id,
                            userName: customer.name || customer.email || 'this user',
                          })}
                          className="p-2 bg-[#0f0f0f] rounded-lg"
                        >
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
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
            {(() => {
              const userRec = getUserForCustomer(selectedUser);
              const isActive = userRec?.is_active !== false;
              const isAdmin = userRec?.is_admin === true;
              return (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${isActive ? 'bg-[#dc2626]/20' : 'bg-neutral-700/30'}`}>
                      <span className={`text-2xl font-bold ${isActive ? 'text-[#dc2626]' : 'text-neutral-500'}`}>
                        {(selectedUser.name ?? selectedUser.email ?? '?').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white text-lg">
                        {selectedUser.name ?? 'No name provided'}
                        {isAdmin && <span className="ml-2 text-xs px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded">ADMIN</span>}
                      </p>
                      <div className="flex items-center gap-2">
                        <p className="text-neutral-400 text-sm">
                          Joined {new Date(selectedUser.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </p>
                        {!isActive && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Suspended</span>
                        )}
                      </div>
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

                  {/* Action buttons in modal */}
                  {userRec && !isAdmin && (
                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => {
                          setSelectedUser(null);
                          setConfirmAction({
                            type: isActive ? 'suspend' : 'unsuspend',
                            userId: userRec.id,
                            userName: selectedUser.name || selectedUser.email || 'this user',
                          });
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors ${
                          isActive
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20'
                            : 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20'
                        }`}
                      >
                        {isActive ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        {isActive ? 'Suspend' : 'Reactivate'}
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(null);
                          setConfirmAction({
                            type: 'delete',
                            userId: userRec.id,
                            userName: selectedUser.name || selectedUser.email || 'this user',
                          });
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </>
              );
            })()}

            <button
              onClick={() => setSelectedUser(null)}
              className="w-full mt-4 px-4 py-3 bg-[#0f0f0f] text-neutral-400 rounded-xl hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
          <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 max-w-sm w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                confirmAction.type === 'delete' ? 'bg-red-500/20' : 'bg-amber-500/20'
              }`}>
                <AlertTriangle className={`w-5 h-5 ${
                  confirmAction.type === 'delete' ? 'text-red-400' : 'text-amber-400'
                }`} />
              </div>
              <div>
                <h3 className="text-white text-lg">
                  {confirmAction.type === 'delete'
                    ? 'Delete User'
                    : confirmAction.type === 'suspend'
                      ? 'Suspend User'
                      : 'Reactivate User'}
                </h3>
              </div>
            </div>

            <p className="text-neutral-400 text-sm mb-6">
              {confirmAction.type === 'delete'
                ? `Are you sure you want to permanently delete "${confirmAction.userName}"? This will remove their account and all associated data. This action cannot be undone.`
                : confirmAction.type === 'suspend'
                  ? `Are you sure you want to suspend "${confirmAction.userName}"? They won't be able to sign in until reactivated.`
                  : `Are you sure you want to reactivate "${confirmAction.userName}"? They will be able to sign in again.`
              }
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setConfirmAction(null)}
                disabled={!!actionLoading}
                className="flex-1 px-4 py-3 bg-[#0f0f0f] text-neutral-400 rounded-xl hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'delete') {
                    handleDelete(confirmAction.userId);
                  } else {
                    handleSuspend(confirmAction.userId, confirmAction.type === 'suspend');
                  }
                }}
                disabled={!!actionLoading}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-colors disabled:opacity-50 ${
                  confirmAction.type === 'delete'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : confirmAction.type === 'suspend'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : confirmAction.type === 'delete' ? (
                  'Delete'
                ) : confirmAction.type === 'suspend' ? (
                  'Suspend'
                ) : (
                  'Reactivate'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
