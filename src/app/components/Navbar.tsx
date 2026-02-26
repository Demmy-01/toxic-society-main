import { useState } from "react";
import { Link, useLocation } from "react-router";
import { ShoppingBag, Menu, X, Search, Heart } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

export function Navbar() {
  const { totalItems, setIsCartOpen } = useCart();
  const { totalItems: wishlistCount } = useWishlist();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const leftLinks = [
    { label: "HOME", to: "/" },
    { label: "SHOP", to: "/shop" },
  ];

  const rightLinks = [
    { label: "DROPS", to: "/drops" },
    { label: "LOOKBOOK", to: "/lookbook" },
    { label: "ABOUT", to: "/about" },
  ];

  const allLinks = [...leftLinks, ...rightLinks];

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  return (
    <>
      {/* Announcement bar */}
      <div
        style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
        className="text-white text-center py-2 text-xs tracking-widest uppercase"
      >
        Free shipping on orders over $200 &nbsp;·&nbsp; New drop available now
      </div>

      <nav
        className="sticky top-0 z-50 bg-white border-b border-gray-100"
        style={{ boxShadow: "0 1px 20px rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Desktop 3-column grid */}
          <div className="hidden md:grid grid-cols-3 items-center h-16">

            {/* Left nav links */}
            <div className="flex items-center gap-7 justify-start">
              {leftLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isActive(link.to) ? "#C41E3A" : "#1a1a1a",
                    borderBottom: isActive(link.to) ? "2px solid #C41E3A" : "2px solid transparent",
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
                  style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
                  className="text-2xl text-gray-900 select-none whitespace-nowrap"
                >
                  <span style={{ color: "#C41E3A" }}>TOXIC</span>
                  <span className="ml-1 text-gray-900">SOCIETY</span>
                </div>
              </Link>
            </div>

            {/* Right: nav links + icons */}
            <div className="flex items-center gap-6 justify-end">
              {rightLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    color: isActive(link.to) ? "#C41E3A" : "#1a1a1a",
                    borderBottom: isActive(link.to) ? "2px solid #C41E3A" : "2px solid transparent",
                  }}
                  className="text-xs tracking-widest uppercase pb-1 transition-all duration-200 hover:text-red-700 whitespace-nowrap"
                >
                  {link.label}
                </Link>
              ))}

              {/* Icons */}
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
                      style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
                      className="absolute -top-2 -right-2 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
                    >
                      {wishlistCount}
                    </span>
                  )}
                </Link>
                <button
                  className="relative text-gray-800 hover:text-red-700 transition-colors"
                  onClick={() => setIsCartOpen(true)}
                >
                  <ShoppingBag size={19} />
                  {totalItems > 0 && (
                    <span
                      style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
                      className="absolute -top-2 -right-2 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
                    >
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile header */}
          <div className="md:hidden flex items-center justify-between h-16">
            <button className="text-gray-800" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/">
              <div
                style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
                className="text-2xl text-gray-900 select-none"
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
              <Link to="/wishlist" className="relative text-gray-800 hover:text-red-700 transition-colors">
                <Heart size={19} />
                {wishlistCount > 0 && (
                  <span
                    style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
                    className="absolute -top-2 -right-2 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {wishlistCount}
                  </span>
                )}
              </Link>
              <button
                className="relative text-gray-800 hover:text-red-700 transition-colors"
                onClick={() => setIsCartOpen(true)}
              >
                <ShoppingBag size={19} />
                {totalItems > 0 && (
                  <span
                    style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
                    className="absolute -top-2 -right-2 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center"
                  >
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-gray-100 bg-white px-4 py-3 flex items-center gap-3">
            <Search size={16} className="text-gray-400" />
            <input
              autoFocus
              type="text"
              placeholder="Search products..."
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="flex-1 outline-none text-sm text-gray-800 placeholder-gray-400 bg-transparent"
            />
            <button onClick={() => setSearchOpen(false)}>
              <X size={16} className="text-gray-400" />
            </button>
          </div>
        )}

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-6 flex flex-col gap-5">
            {allLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  color: isActive(link.to) ? "#C41E3A" : "#1a1a1a",
                }}
                className="text-sm tracking-widest uppercase"
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/wishlist"
              onClick={() => setMenuOpen(false)}
              style={{ fontFamily: "'Inter', sans-serif", color: "#1a1a1a" }}
              className="text-sm tracking-widest uppercase flex items-center gap-2"
            >
              Wishlist
              {wishlistCount > 0 && (
                <span
                  style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
                  className="text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                >
                  {wishlistCount}
                </span>
              )}
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
