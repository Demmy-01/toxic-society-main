import { Link } from "react-router";
import { Instagram, Twitter, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-[#0f0f0f] text-white mt-20">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="md:col-span-1">
          <div
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
            className="text-3xl mb-4"
          >
            <span style={{ color: "#C41E3A" }}>TOXIC</span>
            <span className="text-white ml-1">SOCIETY</span>
          </div>
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-gray-400 text-sm leading-relaxed"
          >
            Clothing for those who refuse to blend in. Born from the underground,
            worn by the bold.
          </p>
          <div className="flex gap-4 mt-6">
            <a
              href="#"
              style={{ color: "#C41E3A" }}
              className="hover:text-white transition-colors"
            >
              <Instagram size={20} />
            </a>
            <a
              href="#"
              style={{ color: "#C41E3A" }}
              className="hover:text-white transition-colors"
            >
              <Twitter size={20} />
            </a>
            <a
              href="#"
              style={{ color: "#C41E3A" }}
              className="hover:text-white transition-colors"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h4
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "3px" }}
            className="text-xs uppercase text-gray-400 mb-5"
          >
            Shop
          </h4>
          <ul className="flex flex-col gap-3">
            {["New Arrivals", "Tops", "Bottoms", "Accessories", "Sale"].map((item) => (
              <li key={item}>
                <Link
                  to="/shop"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "3px" }}
            className="text-xs uppercase text-gray-400 mb-5"
          >
            Company
          </h4>
          <ul className="flex flex-col gap-3">
            {["About Us", "Lookbook", "Sustainability", "Careers", "Press"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Support */}
        <div>
          <h4
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "3px" }}
            className="text-xs uppercase text-gray-400 mb-5"
          >
            Support
          </h4>
          <ul className="flex flex-col gap-3">
            {["FAQ", "Shipping & Returns", "Size Guide", "Track Order", "Contact"].map((item) => (
              <li key={item}>
                <a
                  href="#"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Newsletter */}
      <div
        style={{ backgroundColor: "#C41E3A" }}
        className="py-10"
      >
        <div className="max-w-xl mx-auto px-4 text-center">
          <p
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
            className="text-2xl text-white mb-2"
          >
            JOIN THE TOXIC CIRCLE
          </p>
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-red-100 text-sm mb-5"
          >
            Get early access to drops, exclusive discounts, and more.
          </p>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="flex-1 bg-white/10 border border-white/30 text-white placeholder-red-200 px-4 py-2.5 text-sm outline-none focus:bg-white/20 transition-all"
            />
            <button
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
              className="bg-white text-red-700 px-5 py-2.5 text-xs uppercase tracking-widest hover:bg-gray-100 transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 py-5 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-gray-500 text-xs"
          >
            © 2025 Toxic Society. All rights reserved. Izuken 2025.
          </p>
          <div className="flex gap-5">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((item) => (
              <a
                key={item}
                href="#"
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-gray-500 text-xs hover:text-gray-300 transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
