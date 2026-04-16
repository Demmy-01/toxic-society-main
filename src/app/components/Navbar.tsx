import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import logoNoBg from "../../assets/logo-no-bg.png";
import {
  ShoppingBag,
  Menu,
  X,
  Search,
  Heart,
  Home,
  Store,
  BookOpen,
  Zap,
  Info,
  Clock,
  User,
} from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

export function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const { user, signInWithGoogle } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  const handleAccountClick = () => {
    if (!user) {
      signInWithGoogle();
    } else {
      navigate("/account");
    }
  };

  const handleSearch = () => {
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/shop?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  const leftLinks = [
    { label: "HOME", to: "/" },
    { label: "SHOP", to: "/shop" },
    { label: "HISTORY", to: "/history" },
  ];

  const rightLinks = [
    { label: "DROPS", to: "/drops" },
    { label: "LOOKBOOK", to: "/lookbook" },
    { label: "ABOUT", to: "/about" },
  ];

  // Mobile hamburger — only Drops + About
  const mobileMenuLinks = [
    { label: "DROPS", to: "/drops", icon: Zap },
    { label: "ABOUT", to: "/about", icon: Info },
  ];

  // Bottom nav tabs
  const bottomNavItems = [
    { label: "Home", to: "/", icon: Home },
    { label: "Shop", to: "/shop", icon: Store },
    { label: "Wishlist", to: "/wishlist", icon: Heart },
    { label: "History", to: "/history", icon: Clock },
    { label: "Lookbook", to: "/lookbook", icon: BookOpen },
  ];

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  return (
    <>
      {/* ── Announcement bar ── */}
      <div
        style={{
          backgroundColor: "#C41E3A",
          fontFamily: "'Inter', sans-serif",
        }}
        className="text-white text-center py-2 text-xs tracking-widest uppercase"
      >
        Free shipping on orders over $200 &nbsp;·&nbsp; New drop available now
      </div>

      {/* ── Main nav ── */}
      <nav
        className="sticky top-0 z-50 bg-white border-b border-gray-100"
        style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop 3-column */}
          <div className="hidden md:grid grid-cols-3 items-center h-16">
            {/* Left */}
            <div className="flex items-center gap-7 justify-start">
              {leftLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isActive(link.to) ? "#C41E3A" : "#1a1a1a",
                    borderBottom: isActive(link.to)
                      ? "2px solid #C41E3A"
                      : "2px solid transparent",
                  }}
                  className="text-xs tracking-widest uppercase pb-1 transition-all duration-200 hover:text-red-700 whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Center: Logo */}
            <div className="flex justify-center">
              <Link to="/">
                <div
                  style={{
                    fontFamily: "'Bebas Neue', cursive",
                    letterSpacing: "4px",
                  }}
                  className="flex items-center text-2xl text-gray-900 select-none whitespace-nowrap"
                >
                  <span style={{ color: "#C41E3A" }}>TOXIC</span>
                  <img
                    src={logoNoBg}
                    alt="Toxic Society"
                    className="h-9 w-auto mx-1"
                  />
                  <span className="text-gray-900">SOCIETY</span>
                </div>
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center gap-6 justify-end">
              {rightLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isActive(link.to) ? "#C41E3A" : "#1a1a1a",
                    borderBottom: isActive(link.to)
                      ? "2px solid #C41E3A"
                      : "2px solid transparent",
                  }}
                  className="text-xs tracking-widest uppercase pb-1 transition-all duration-200 hover:text-red-700 whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-4 ml-1">
                <button
                  className="text-gray-800 hover:text-red-700 transition-colors"
                  onClick={() => setSearchOpen(!searchOpen)}
                >
                  <Search size={19} />
                </button>
                <Link
                  to="/wishlist"
                  className="relative text-gray-800 hover:text-red-700 transition-colors"
                  title="Wishlist"
                >
                  <Heart size={19} />
                  {wishlistCount > 0 && (
                    <span
                      style={{
                        backgroundColor: "#C41E3A",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      className="absolute -top-2 -right-2 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
                    >
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <button
                  className="text-gray-800 hover:text-red-700 transition-colors"
                  onClick={handleAccountClick}
                  title="Account"
                >
                  <User size={19} />
                </button>
                <button
                  className="relative text-gray-800 hover:text-red-700 transition-colors"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingBag size={19} />
                  {totalItems > 0 && (
                    <span
                      style={{
                        backgroundColor: "#C41E3A",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      className="absolute -top-2 -right-2 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
                    >
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile top bar */}
          <div className="md:hidden flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <button
                className="text-gray-800"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <Link to="/">
                <img
                  src={logoNoBg}
                  alt="Toxic Society"
                  className="h-10 w-auto"
                />
              </Link>
            </div>
            <Link to="/" className="absolute left-1/2 -translate-x-1/2">
              <div
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "4px",
                }}
                className="text-2xl text-gray-900 select-none whitespace-nowrap"
              >
                <span style={{ color: "#C41E3A" }}>TOXIC</span>
                <span className="ml-1 text-gray-900">SOCIETY</span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <button
                className="text-gray-800 hover:text-red-700 transition-colors"
                onClick={() => setSearchOpen(!searchOpen)}
              >
                <Search size={19} />
              </button>
              <button
                className="text-gray-800 hover:text-red-700 transition-colors"
                onClick={handleAccountClick}
                title="Account"
              >
                <User size={19} />
              </button>
              <button
                className="relative text-gray-800 hover:text-red-700 transition-colors"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={19} />
                {totalItems > 0 && (
                  <span
                    style={{
                      backgroundColor: "#C41E3A",
                      fontFamily: "'Inter', sans-serif",
                    }}
                    className="absolute -top-2 -right-2 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-3">
            <Search size={16} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search products..."
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent"
            />
            <button
              onClick={handleSearch}
              style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }}
              className="text-xs uppercase tracking-widest whitespace-nowrap hover:opacity-70 transition-opacity"
            >
              Go
            </button>
            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery("");
              }}
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        )}

        {/* Mobile dropdown — Drops + About only */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-5 py-5 flex flex-col gap-4">
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "3px",
                color: "#bbb",
              }}
              className="text-[10px] uppercase mb-1"
            >
              More Pages
            </p>
            {mobileMenuLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: isActive(to) ? "#C41E3A" : "#1a1a1a",
                }}
                className="flex items-center gap-3 text-sm tracking-widest uppercase"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: isActive(to) ? "#C41E3A" : "#f3f3f3",
                  }}
                >
                  <Icon
                    size={14}
                    style={{ color: isActive(to) ? "white" : "#555" }}
                  />
                </span>
                {label}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* ══════════════════════════════════════
          Mobile Bottom Navigation Bar
          ══════════════════════════════════════ */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          backgroundColor: "#111111",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          boxShadow: "0 -8px 32px rgba(0,0,0,0.5)",
          height: "66px",
        }}
      >
        {/* 4 nav links */}
        {bottomNavItems.map(({ label, to, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center justify-center gap-[3px] relative overflow-hidden"
            >
              {/* Active pill at top */}
              {active && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-b-full transition-all duration-300"
                  style={{ backgroundColor: "#C41E3A" }}
                />
              )}

              {/* Icon */}
              <div className="relative">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.2 : 1.6}
                  style={{
                    color: active ? "#C41E3A" : "rgba(255,255,255,0.4)",
                    fill: active && to === "/wishlist" ? "#C41E3A" : "none",
                    transition: "color 0.2s",
                  }}
                />
                {to === "/wishlist" && wishlistCount > 0 && (
                  <span
                    style={{
                      backgroundColor: "#C41E3A",
                      fontFamily: "'Inter', sans-serif",
                    }}
                    className="absolute -top-[7px] -right-[7px] text-white text-[9px] w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold"
                  >
                    {wishlistCount}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "9.5px",
                  letterSpacing: "0.8px",
                  color: active ? "#C41E3A" : "rgba(255,255,255,0.35)",
                  fontWeight: active ? 700 : 400,
                  transition: "color 0.2s",
                  textTransform: "uppercase",
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}

        {/* Cart tab */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="flex-1 flex flex-col items-center justify-center gap-[3px] relative"
        >
          <div className="relative">
            <ShoppingBag
              size={21}
              strokeWidth={1.6}
              style={{ color: "rgba(255,255,255,0.4)" }}
            />
            {totalItems > 0 && (
              <span
                style={{
                  backgroundColor: "#C41E3A",
                  fontFamily: "'Inter', sans-serif",
                }}
                className="absolute -top-[7px] -right-[7px] text-white text-[9px] w-[14px] h-[14px] rounded-full flex items-center justify-center font-bold"
              >
                {totalItems}
              </span>
            )}
          </div>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "9.5px",
              letterSpacing: "0.8px",
              color: "rgba(255,255,255,0.35)",
              fontWeight: 400,
              textTransform: "uppercase",
            }}
          >
            Cart
          </span>
        </button>
      </nav>
    </>
  );
}
