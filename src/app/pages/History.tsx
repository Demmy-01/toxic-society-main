import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ShoppingBag,
  ArrowRight,
  Loader2,
  Package,
  Calendar,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import { useCurrency } from "../context/CurrencyContext";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  image: string;
  size: string;
  quantity: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
  discount_code?: string;
  discount_amount: number;
}

export function History() {
  const { user, customerProfile } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!customerProfile?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("orders")
          .select("*")
          .eq("customer_id", customerProfile.id)
          .order("created_at", { ascending: false });

        if (fetchError) {
          setError(fetchError.message);
          return;
        }

        setOrders((data as Order[]) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [customerProfile]);

  if (!user) {
    return (
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div
          style={{ backgroundColor: "#0f0f0f" }}
          className="py-16 px-4 text-center"
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "4px",
              color: "#C41E3A",
            }}
            className="text-xs uppercase mb-3"
          >
            Toxic Society
          </p>
          <h1
            style={{
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "4px",
            }}
            className="text-6xl sm:text-7xl text-white"
          >
            Order History
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <Package size={48} className="mx-auto mb-6 text-gray-200" />
          <p
            style={{
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "3px",
            }}
            className="text-4xl text-gray-200 mb-3"
          >
            Sign In to View Orders
          </p>
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-sm text-gray-400 mb-8"
          >
            You need to be signed in to see your order history.
          </p>
          <Link
            to="/"
            style={{
              backgroundColor: "#C41E3A",
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "3px",
            }}
            className="inline-flex items-center gap-2 text-white px-10 py-4 text-xl hover:bg-red-800 transition-colors"
          >
            <ShoppingBag size={18} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div
          style={{ backgroundColor: "#0f0f0f" }}
          className="py-16 px-4 text-center"
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "4px",
              color: "#C41E3A",
            }}
            className="text-xs uppercase mb-3"
          >
            Toxic Society
          </p>
          <h1
            style={{
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "4px",
            }}
            className="text-6xl sm:text-7xl text-white"
          >
            Order History
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center min-h-96">
          <Loader2 size={32} className="text-gray-300 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div
          style={{ backgroundColor: "#0f0f0f" }}
          className="py-16 px-4 text-center"
        >
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "4px",
              color: "#C41E3A",
            }}
            className="text-xs uppercase mb-3"
          >
            Toxic Society
          </p>
          <h1
            style={{
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "4px",
            }}
            className="text-6xl sm:text-7xl text-white"
          >
            Order History
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <p
            style={{
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "3px",
            }}
            className="text-2xl text-red-600 mb-3"
          >
            Error Loading Orders
          </p>
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-sm text-gray-600"
          >
            {error}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div
        style={{ backgroundColor: "#0f0f0f" }}
        className="py-16 px-4 text-center"
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            letterSpacing: "4px",
            color: "#C41E3A",
          }}
          className="text-xs uppercase mb-3"
        >
          Toxic Society
        </p>
        <h1
          style={{
            fontFamily: "'Bebas Neue', cursive",
            letterSpacing: "4px",
          }}
          className="text-6xl sm:text-7xl text-white"
        >
          Order History
        </h1>
        <p
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="text-gray-400 mt-3 text-sm"
        >
          {orders.length} {orders.length === 1 ? "order" : "orders"}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {orders.length === 0 ? (
          <div className="text-center py-24">
            <Package size={48} className="mx-auto mb-6 text-gray-200" />
            <p
              style={{
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "3px",
              }}
              className="text-4xl text-gray-200 mb-3"
            >
              No Orders Yet
            </p>
            <p
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-sm text-gray-400 mb-8"
            >
              Start shopping to see your order history here.
            </p>
            <Link
              to="/shop"
              style={{
                backgroundColor: "#C41E3A",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "3px",
              }}
              className="inline-flex items-center gap-2 text-white px-10 py-4 text-xl hover:bg-red-800 transition-colors"
            >
              <ShoppingBag size={18} />
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Order Header */}
                <div
                  style={{ backgroundColor: "#f9f9f9" }}
                  className="px-6 py-5 border-b border-gray-200"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "1px",
                        }}
                        className="text-xs text-gray-500 uppercase mb-1"
                      >
                        Order ID
                      </p>
                      <p
                        style={{ fontFamily: "'Bebas Neue', cursive" }}
                        className="text-lg text-gray-900"
                      >
                        {order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={16} />
                        <span style={{ fontFamily: "'Inter', sans-serif" }}>
                          {new Date(order.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <div
                        style={{
                          backgroundColor:
                            order.status === "pending"
                              ? "#FEF3C7"
                              : order.status === "completed"
                                ? "#D1FAE5"
                                : order.status === "shipped"
                                  ? "#DBEAFE"
                                  : "#F3F4F6",
                          color:
                            order.status === "pending"
                              ? "#92400E"
                              : order.status === "completed"
                                ? "#065F46"
                                : order.status === "shipped"
                                  ? "#0C4A6E"
                                  : "#374151",
                          fontFamily: "'Inter', sans-serif",
                        }}
                        className="px-4 py-2 rounded-full text-xs font-medium capitalize"
                      >
                        {order.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="px-6 py-5">
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "1px",
                    }}
                    className="text-xs text-gray-500 uppercase mb-4"
                  >
                    Items ({order.items.length})
                  </p>

                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
                      >
                        {/* Image */}
                        <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-200">
                              <ShoppingBag
                                size={24}
                                className="text-gray-400"
                              />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1">
                          <p
                            style={{
                              fontFamily: "'Bebas Neue', cursive",
                              letterSpacing: "2px",
                            }}
                            className="text-sm font-semibold text-gray-900"
                          >
                            {item.name}
                          </p>
                          <p
                            style={{ fontFamily: "'Inter', sans-serif" }}
                            className="text-xs text-gray-500 mt-1"
                          >
                            Size:{" "}
                            <span className="font-medium">{item.size}</span> ·
                            Qty:{" "}
                            <span className="font-medium">{item.quantity}</span>
                          </p>
                          <p
                            style={{
                              fontFamily: "'Inter', sans-serif",
                              color: "#C41E3A",
                            }}
                            className="text-sm font-semibold mt-2"
                          >
                            {formatPrice(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div
                  style={{ backgroundColor: "#f9f9f9" }}
                  className="px-6 py-5 border-t border-gray-200"
                >
                  <div className="space-y-3">
                    {order.discount_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <p
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="text-gray-600"
                        >
                          Discount
                          {order.discount_code && (
                            <span className="font-medium ml-1">
                              ({order.discount_code})
                            </span>
                          )}
                        </p>
                        <p
                          style={{
                            fontFamily: "'Inter', sans-serif",
                            color: "#10B981",
                          }}
                          className="font-medium"
                        >
                          -{formatPrice(order.discount_amount)}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                      <p
                        style={{
                          fontFamily: "'Bebas Neue', cursive",
                          letterSpacing: "2px",
                        }}
                        className="text-sm font-semibold text-gray-900"
                      >
                        Total
                      </p>
                      <p
                        style={{
                          fontFamily: "'Bebas Neue', cursive",
                          color: "#C41E3A",
                          letterSpacing: "1px",
                        }}
                        className="text-lg font-bold"
                      >
                        {formatPrice(order.total)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Continue Shopping Link */}
            <div className="flex justify-center mt-12">
              <Link
                to="/shop"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: "#C41E3A",
                }}
                className="text-xs flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest"
              >
                Continue Shopping <ArrowRight size={12} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
