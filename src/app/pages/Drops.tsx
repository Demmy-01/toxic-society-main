import { Link } from "react-router";
import { DropCountdown } from "../components/DropCountdown";
import { products } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { ArrowRight, Lock } from "lucide-react";

// Next drop: March 15 2026
const DROP_04_DATE = new Date("2026-03-15T12:00:00Z");

const pastDrops = [
  {
    id: "drop-03",
    name: "Drop 03",
    label: "Flame Series",
    date: "Jan 2025",
    status: "SOLD OUT",
    description: "The Flame Polo Sweatshirt and limited accessories that burned through in 48 hours.",
    image: "https://images.unsplash.com/photo-1595506832554-d3d3b715eff4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "drop-02",
    name: "Drop 02",
    label: "Edge Culture",
    date: "Oct 2024",
    status: "SOLD OUT",
    description: "Cargos, caps, and the zip-up hoodie. Urban decay aesthetics at its finest.",
    image: "https://images.unsplash.com/photo-1521142836214-9c7e52ec962c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
  {
    id: "drop-01",
    name: "Drop 01",
    label: "Core Collection",
    date: "Aug 2024",
    status: "AVAILABLE",
    description: "The foundation. Essentials that define the Toxic Society DNA.",
    image: "https://images.unsplash.com/photo-1528588301474-23126537236b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800",
  },
];

const drop04Products = products.filter((p) => p.drop === "Drop 03"); // Tease with Drop 03 products for Drop 04

export function Drops() {
  return (
    <div className="bg-white min-h-screen">
      {/* Countdown */}
      <DropCountdown
        targetDate={DROP_04_DATE}
        dropName="DROP 04 — VOID SERIES"
        subtitle="Something dark is coming. Sign up to be first in line."
      />

      {/* Email notify */}
      <div style={{ backgroundColor: "#C41E3A" }} className="py-12 px-4">
        <div className="max-w-xl mx-auto text-center">
          <p
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
            className="text-white text-3xl mb-2"
          >
            Get Early Access
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-red-200 text-sm mb-6">
            Drop notifications, exclusive previews, and members-only early access.
          </p>
          <div className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto">
            <input
              type="email"
              placeholder="your@email.com"
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none bg-white"
            />
            <button
              style={{
                backgroundColor: "#0f0f0f",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "2px",
              }}
              className="text-white px-8 py-3 text-lg hover:bg-gray-800 transition-colors whitespace-nowrap"
            >
              Notify Me
            </button>
          </div>
        </div>
      </div>

      {/* Drop 04 Teaser Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <p
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
            className="text-xs uppercase mb-3"
          >
            Sneak Peek
          </p>
          <h2
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
            className="text-6xl text-gray-900"
          >
            DROP 04 PREVIEW
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-400 mt-3">
            Selected pieces from the upcoming Void Series. Details locked.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {drop04Products.map((p) => (
            <div key={p.id} className="relative">
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[2px]">
                <Lock size={24} className="text-white mb-2 opacity-70" />
                <span
                  style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
                  className="text-white text-lg opacity-70"
                >
                  Coming Soon
                </span>
              </div>
              <ProductCard product={p} />
            </div>
          ))}
          {/* Filler locked cards */}
          {[...Array(Math.max(0, 4 - drop04Products.length))].map((_, i) => (
            <div key={`filler-${i}`} className="relative">
              <div
                className="aspect-[3/4] bg-gray-100 flex flex-col items-center justify-center"
                style={{ border: "1px dashed #ddd" }}
              >
                <Lock size={24} className="text-gray-300 mb-2" />
                <span
                  style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
                  className="text-gray-300 text-lg"
                >
                  LOCKED
                </span>
              </div>
              <div className="mt-3">
                <div className="h-3 bg-gray-100 rounded w-16 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-28" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Drops */}
      <div style={{ backgroundColor: "#0f0f0f" }} className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <p
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
              className="text-xs uppercase mb-3"
            >
              Archive
            </p>
            <h2
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
              className="text-6xl text-white"
            >
              Past Drops
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pastDrops.map((drop) => (
              <div key={drop.id} className="group relative overflow-hidden bg-gray-900">
                <div className="aspect-[3/4] overflow-hidden">
                  <img
                    src={drop.image}
                    alt={drop.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        letterSpacing: "2px",
                        backgroundColor: drop.status === "SOLD OUT" ? "#333" : "#C41E3A",
                      }}
                      className="text-white text-xs px-3 py-1 uppercase"
                    >
                      {drop.status}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-gray-400 text-xs">
                      {drop.date}
                    </span>
                  </div>
                  <p
                    style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
                    className="text-white text-2xl mb-1"
                  >
                    {drop.name} — {drop.label}
                  </p>
                  <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-gray-400 text-xs leading-relaxed mb-4">
                    {drop.description}
                  </p>
                  {drop.status === "AVAILABLE" && (
                    <Link
                      to="/shop"
                      style={{ color: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
                      className="text-xs flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Shop Now <ArrowRight size={12} />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
