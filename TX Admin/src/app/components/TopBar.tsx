import { Bell, User, Menu, ShoppingBag, Mail, Package, X } from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router";
import { supabase } from "../../lib/supabase";

interface TopBarProps {
  title: string;
  onMenuToggle: () => void;
  onLogout: () => void;
}

interface Notification {
  id: string;
  type: "order" | "signup" | "drop";
  title: string;
  body: string;
  time: string; // ISO string
}

const LAST_SEEN_KEY = "ts_admin_notif_last_seen";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function TopBar({ title, onMenuToggle, onLogout }: TopBarProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ── Fetch notifications from Supabase ─────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    const items: Notification[] = [];

    try {
      // Recent orders (last 7 days)
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const { data: orders } = await supabase
        .from("orders")
        .select("id, total, status, created_at, items")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(10);

      if (orders) {
        for (const o of orders) {
          const itemCount = Array.isArray(o.items) ? o.items.length : 0;
          items.push({
            id: `order-${o.id}`,
            type: "order",
            title: "New Order",
            body: `$${Number(o.total).toFixed(2)} · ${itemCount} item${itemCount !== 1 ? "s" : ""}`,
            time: o.created_at,
          });
        }
      }

      // Recent drop signups (last 7 days)
      const { data: signups } = await supabase
        .from("drop_signups")
        .select("id, email, created_at")
        .gte("created_at", since)
        .order("created_at", { ascending: false })
        .limit(5);

      if (signups) {
        for (const s of signups) {
          items.push({
            id: `signup-${s.id}`,
            type: "signup",
            title: "Drop Signup",
            body: s.email,
            time: s.created_at,
          });
        }
      }
    } catch (e) {
      console.warn("[Notifications] fetch error:", e);
    }

    // Sort by newest first
    items.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    setNotifications(items);

    // Count unread (newer than last seen)
    const lastSeen = localStorage.getItem(LAST_SEEN_KEY);
    const cutoff = lastSeen ? new Date(lastSeen).getTime() : 0;
    setUnreadCount(items.filter(n => new Date(n.time).getTime() > cutoff).length);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    const opening = !showNotifications;
    setShowNotifications(opening);
    if (opening) {
      // Mark all as read
      localStorage.setItem(LAST_SEEN_KEY, new Date().toISOString());
      setUnreadCount(0);
    }
  };

  const handleNotifClick = (n: Notification) => {
    setShowNotifications(false);
    if (n.type === "order") navigate("/orders");
    if (n.type === "signup") navigate("/drops");
  };

  const handleProfile = () => { navigate("/users"); setShowProfileMenu(false); };
  const handleSettings = () => { navigate("/settings"); setShowProfileMenu(false); };
  const handleLogout = async () => { setShowProfileMenu(false); await onLogout(); navigate("/login"); };

  const iconForType = (type: Notification["type"]) => {
    if (type === "order") return <ShoppingBag className="w-4 h-4 text-[#dc2626]" />;
    if (type === "signup") return <Mail className="w-4 h-4 text-blue-400" />;
    return <Package className="w-4 h-4 text-amber-400" />;
  };

  return (
    <header className="bg-[#1a1a1a] border-b border-neutral-800 px-4 md:px-8 py-4 flex items-center justify-between sticky top-0 z-20">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-neutral-400 hover:bg-[#0f0f0f] hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-lg md:text-xl text-white font-medium">{title}</h2>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2 md:gap-4">

        {/* ── Notification Bell ── */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={handleBellClick}
            className="relative p-2 rounded-xl hover:bg-[#0f0f0f] transition-colors"
          >
            <Bell className="w-5 h-5 text-neutral-400" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#dc2626] rounded-full flex items-center justify-center text-[10px] text-white font-bold px-1">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Dropdown Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1a1a1a] border border-neutral-800 rounded-2xl shadow-2xl z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                <span className="text-sm font-semibold text-white">Notifications</span>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-neutral-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="max-h-80 overflow-y-auto">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-5 h-5 border-2 border-[#dc2626] border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2 text-center px-4">
                    <Bell className="w-8 h-8 text-neutral-700" />
                    <p className="text-neutral-500 text-sm">No notifications</p>
                    <p className="text-neutral-600 text-xs">New orders and signups will appear here</p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        onClick={() => handleNotifClick(n)}
                        className="w-full flex items-start gap-3 px-4 py-3 hover:bg-[#0f0f0f] transition-colors border-b border-neutral-800/50 last:border-0 text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-[#0f0f0f] flex items-center justify-center shrink-0 mt-0.5">
                          {iconForType(n.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium leading-tight">{n.title}</p>
                          <p className="text-xs text-neutral-400 truncate mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-neutral-600 mt-1">{timeAgo(n.time)}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2 border-t border-neutral-800">
                  <button
                    onClick={() => { navigate("/orders"); setShowNotifications(false); }}
                    className="text-xs text-[#dc2626] hover:underline w-full text-center"
                  >
                    View all orders →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Profile Dropdown ── */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-1.5 pr-2 rounded-xl hover:bg-[#0f0f0f] transition-colors"
          >
            <div className="w-8 h-8 bg-[#dc2626] rounded-full flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block text-sm text-white">Admin</span>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#1a1a1a] border border-neutral-800 rounded-xl shadow-xl overflow-hidden z-50">
              <button onClick={handleProfile} className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:bg-[#0f0f0f] transition-colors">Profile</button>
              <button onClick={handleSettings} className="w-full px-4 py-3 text-left text-sm text-neutral-300 hover:bg-[#0f0f0f] transition-colors">Settings</button>
              <button onClick={handleLogout} className="w-full px-4 py-3 text-left text-sm text-[#dc2626] hover:bg-[#0f0f0f] transition-colors">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
