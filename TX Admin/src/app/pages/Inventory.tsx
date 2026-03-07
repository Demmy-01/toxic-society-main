import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { AlertTriangle, Package, TrendingDown, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';

interface InventoryProps {
  onLogout: () => void;
}

interface Product {
  id: string;
  name: string;
  category: string;
  sizes: string[];
  in_stock: boolean;
  price: number;
  images: string[];
}

export default function Inventory({ onLogout }: InventoryProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('products')
      .select('id, name, category, sizes, in_stock, price, images')
      .order('category', { ascending: true });
    setProducts(data ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, []);

  const toggleStock = async (id: string, current: boolean) => {
    setTogglingId(id);
    await supabase.from('products').update({ in_stock: !current }).eq('id', id);
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, in_stock: !current } : p));
    setTogglingId(null);
  };

  // Derived stats
  const inStock = products.filter((p) => p.in_stock).length;
  const outOfStock = products.filter((p) => !p.in_stock).length;

  // Category chart data
  const categoryMap: Record<string, number> = {};
  products.forEach((p) => { categoryMap[p.category] = (categoryMap[p.category] ?? 0) + 1; });
  const chartData = Object.entries(categoryMap).map(([category, count]) => ({ category, count }));

  const getStatusStyle = (inStock: boolean) =>
    inStock
      ? 'bg-green-500/20 text-green-400 border-green-500/30'
      : 'bg-red-500/20 text-red-400 border-red-500/30';

  return (
    <DashboardLayout title="Inventory" onLogout={onLogout}>
      <div className="mb-8">
        <h1 className="text-2xl text-white mb-1">Inventory Management</h1>
        <p className="text-neutral-400 text-sm">View and manage stock status for all products</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-neutral-600 animate-spin" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <div className="p-3 bg-[#0f0f0f] rounded-xl inline-flex mb-3">
                <Package className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-neutral-400 text-sm mb-1">Total Products</p>
              <p className="text-2xl text-white">{products.length}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <div className="p-3 bg-[#0f0f0f] rounded-xl inline-flex mb-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-neutral-400 text-sm mb-1">In Stock</p>
              <p className="text-2xl text-white">{inStock}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <div className="p-3 bg-[#0f0f0f] rounded-xl inline-flex mb-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-neutral-400 text-sm mb-1">Out of Stock</p>
              <p className="text-2xl text-white">{outOfStock}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6">
              <div className="p-3 bg-[#0f0f0f] rounded-xl inline-flex mb-3">
                <TrendingDown className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-neutral-400 text-sm mb-1">Categories</p>
              <p className="text-2xl text-white">{chartData.length}</p>
            </div>
          </div>

          {/* Chart */}
          {chartData.length > 0 && (
            <div className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-6 mb-8">
              <h3 className="text-lg text-white mb-6">Products by Category</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
                  <XAxis dataKey="category" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #404040', borderRadius: '8px', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#dc2626" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Inventory Table */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-12 h-12 text-neutral-700 mb-4" />
              <p className="text-white text-xl mb-2">No products yet</p>
              <p className="text-neutral-500 text-sm">Add products in the Products section first.</p>
            </div>
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden md:block bg-[#1a1a1a] border border-neutral-800 rounded-2xl overflow-hidden">
                <div className="p-6 border-b border-neutral-800">
                  <h3 className="text-lg text-white">Product Stock Status</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0f0f0f]">
                      <tr>
                        {['Product', 'Category', 'Price', 'Sizes', 'Status', 'Toggle'].map((h) => (
                          <th key={h} className="text-left text-sm text-neutral-400 px-6 py-4">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((item) => (
                        <tr key={item.id} className="border-t border-neutral-800 hover:bg-[#0f0f0f] transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              {item.images?.[0] ? (
                                <img src={item.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0" />
                              ) : (
                                <div className="w-10 h-10 bg-[#0f0f0f] rounded-lg shrink-0 flex items-center justify-center">
                                  <Package className="w-4 h-4 text-neutral-700" />
                                </div>
                              )}
                              <span className="text-white text-sm">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-neutral-400 text-sm">{item.category}</td>
                          <td className="px-6 py-4 text-white text-sm">${Number(item.price).toFixed(2)}</td>
                          <td className="px-6 py-4 text-neutral-400 text-sm">{(item.sizes ?? []).join(', ') || '—'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs border ${getStatusStyle(item.in_stock)}`}>
                              {item.in_stock ? 'In Stock' : 'Out of Stock'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => toggleStock(item.id, item.in_stock)}
                              disabled={togglingId === item.id}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors ${
                                item.in_stock
                                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                  : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              } disabled:opacity-50`}
                            >
                              {togglingId === item.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : item.in_stock ? (
                                <XCircle className="w-3 h-3" />
                              ) : (
                                <CheckCircle className="w-3 h-3" />
                              )}
                              {item.in_stock ? 'Mark Out' : 'Mark In'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile */}
              <div className="md:hidden space-y-3">
                {products.map((item) => (
                  <div key={item.id} className="bg-[#1a1a1a] border border-neutral-800 rounded-2xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {item.images?.[0] ? (
                          <img src={item.images[0]} alt="" className="w-12 h-12 object-cover rounded-xl shrink-0" />
                        ) : (
                          <div className="w-12 h-12 bg-[#0f0f0f] rounded-xl shrink-0 flex items-center justify-center">
                            <Package className="w-5 h-5 text-neutral-700" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-white text-sm truncate">{item.name}</p>
                          <p className="text-neutral-500 text-xs">{item.category} · ${Number(item.price).toFixed(2)}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <span className={`px-2.5 py-1 rounded-full text-xs border ${getStatusStyle(item.in_stock)}`}>
                          {item.in_stock ? 'In Stock' : 'Out'}
                        </span>
                        <button
                          onClick={() => toggleStock(item.id, item.in_stock)}
                          disabled={togglingId === item.id}
                          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-colors ${
                            item.in_stock ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'
                          } disabled:opacity-50`}
                        >
                          {togglingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                          {item.in_stock ? 'Mark Out' : 'Mark In'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
