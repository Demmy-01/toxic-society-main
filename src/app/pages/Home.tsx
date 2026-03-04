import { Link } from "react-router";
import { ArrowRight, Zap } from "lucide-react";
import { fetchProducts } from "../data/products";
import type { Product } from "../data/products";
import { useState, useEffect } from "react";
import { ProductCard } from "../components/ProductCard";
import { DropCountdown } from "../components/DropCountdown";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import sweatshirtImg from "../../assets/09743e963667fce523552d94caf5de8bf4cf5241.png";
import beltImg from "../../assets/belt.png";

// Next drop: March 15 2026
const DROP_04_DATE = new Date("2026-03-15T12:00:00Z");

export function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingCollection, setLoadingCollection] = useState(true);

  useEffect(() => {
    fetchProducts().then((data) => {
      setAllProducts(data);
      setLoadingCollection(false);
    });
  }, []);

  // Group by category, pick top 3 for tiles
  const categoryTiles = (() => {
    const map = new Map<string, Product[]>();
    allProducts.forEach((p) => {
      if (!map.has(p.category)) map.set(p.category, []);
      map.get(p.category)!.push(p);
    });
    return [...map.entries()]
      .sort((a, b) => b[1].length - a[1].length)
      .slice(0, 3)
      .map(([category, items]) => ({
        category,
        count: items.length,
        image: items[0].image,
      }));
  })();

  const featuredProducts = allProducts.slice(0, 4);

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 items-end gap-8">
            {/* Left - Text */}
            <div className="pb-12 lg:pb-20">
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "4px",
                  color: "#C41E3A",
                }}
                className="text-xs uppercase mb-6 flex items-center gap-2"
              >
                <span className="w-8 h-px bg-red-600 inline-block" />
                SS 2025 Collection
              </div>

              <h1
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "2px",
                  lineHeight: "0.9",
                }}
                className="text-[clamp(5rem,12vw,9rem)] text-gray-900 mb-6"
              >
                LIVE{" "}
                <span style={{ color: "#C41E3A" }}>TOXIC</span>
                <br />
                STAY
                <br />
                CALM
              </h1>

              <p
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-gray-500 text-base max-w-md mb-8 leading-relaxed"
              >
                A new breed of streetwear for those who exist between worlds.
                Dangerously calm. Quietly bold. Uncompromisingly toxic.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  style={{
                    backgroundColor: "#C41E3A",
                    fontFamily: "'Bebas Neue', cursive",
                    letterSpacing: "3px",
                  }}
                  className="inline-flex items-center gap-2 text-white px-8 py-3.5 text-xl hover:bg-red-800 transition-colors"
                >
                  Shop Now
                  <ArrowRight size={18} />
                </Link>
                <Link
                  to="/lookbook"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "3px",
                  }}
                  className="inline-flex items-center gap-2 text-gray-700 px-8 py-3.5 text-xs uppercase border border-gray-200 hover:border-gray-400 transition-colors"
                >
                  Lookbook
                </Link>
              </div>
            </div>

            {/* Right - Product Hero Image */}
            <div className="relative flex justify-center lg:justify-end">
              {/* Background shape */}
              <div
                style={{ backgroundColor: "#f8f0f0" }}
                className="absolute inset-x-0 bottom-0 h-4/5"
              />
              <div className="relative z-10 w-full max-w-sm lg:max-w-md">
                <ImageWithFallback
                  src={sweatshirtImg}
                  alt="Toxic Flame Polo Sweatshirt"
                  className="w-full h-auto object-contain drop-shadow-2xl"
                />
              </div>

              {/* Floating price tag */}
              <div className="absolute bottom-10 left-4 lg:left-0 bg-white shadow-xl p-4 z-20 border-l-4 border-red-600">
                <p
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "1px" }}
                  className="text-xs text-gray-400 uppercase mb-0.5"
                >
                  New Drop
                </p>
                <p
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-sm text-gray-900 mb-0.5"
                >
                  Toxic Flame Polo
                </p>
                <p
                  style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }}
                  className="text-sm"
                >
                  $189
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling ticker */}
        <div
          style={{ backgroundColor: "#C41E3A" }}
          className="overflow-hidden py-3 mt-8"
        >
          <div className="flex whitespace-nowrap animate-marquee gap-0">
            {Array.from({ length: 6 }).map((_, i) => (
              <span
                key={i}
                style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
                className="text-white text-lg mr-12 inline-flex items-center gap-4"
              >
                TOXIC SOCIETY
                <Zap size={14} className="text-white/60" />
                SS 2025 COLLECTION
                <Zap size={14} className="text-white/60" />
                NEW DROP AVAILABLE
                <Zap size={14} className="text-white/60" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "4px",
                color: "#C41E3A",
              }}
              className="text-xs uppercase mb-2"
            >
              Shop by Category
            </p>
            <h2
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
              className="text-5xl text-gray-900"
            >
              The Collection
            </h2>
          </div>
          <Link
            to="/shop"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px", color: "#C41E3A" }}
            className="hidden md:flex items-center gap-1 text-xs uppercase hover:gap-3 transition-all"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>

        {/* Loading shimmer */}
        {loadingCollection && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="animate-pulse aspect-[3/4] sm:h-80 bg-gray-100" />
            ))}
          </div>
        )}

        {/* Live category tiles */}
        {!loadingCollection && categoryTiles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {categoryTiles.map(({ category, count, image }) => (
              <Link
                key={category}
                to={`/shop?category=${encodeURIComponent(category)}`}
                className="relative overflow-hidden group aspect-[3/4] sm:aspect-auto sm:h-80 bg-gray-900 block"
              >
                <img
                  src={image}
                  alt={category}
                  className="w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-300"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <p
                    style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
                    className="text-white text-3xl mb-1"
                  >
                    {category}
                  </p>
                  <p
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="text-white/60 text-sm"
                  >
                    {count} {count === 1 ? 'Item' : 'Items'}
                  </p>
                </div>
                {/* Red accent line on hover */}
                <div
                  style={{ backgroundColor: "#C41E3A" }}
                  className="absolute bottom-0 left-0 right-0 h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                />
              </Link>
            ))}
          </div>
        )}

        {/* Mobile see more */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/shop"
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px", borderColor: "#C41E3A", color: "#C41E3A" }}
            className="inline-flex items-center gap-2 border px-8 py-3 text-xl hover:bg-red-50 transition-colors"
          >
            See More <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Drop Countdown */}
      <section>
        <DropCountdown
          targetDate={DROP_04_DATE}
          dropName="DROP 04 — VOID SERIES"
          subtitle="The next chapter arrives March 15, 2026."
          variant="dark"
        />
        <div style={{ backgroundColor: "#0f0f0f" }} className="pb-10 text-center">
          <Link
            to="/drops"
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px", borderColor: "#C41E3A", color: "#C41E3A" }}
            className="inline-flex items-center gap-2 border px-8 py-3 text-xl hover:bg-red-900/20 transition-colors"
          >
            View All Drops <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
              className="text-xs uppercase mb-2"
            >
              Featured
            </p>
            <h2
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
              className="text-5xl text-gray-900"
            >
              Best Sellers
            </h2>
          </div>
          <Link
            to="/shop"
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px", color: "#C41E3A" }}
            className="hidden md:flex items-center gap-1 text-xs uppercase hover:gap-3 transition-all"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Brand Statement */}
      <section
        style={{ backgroundColor: "#0f0f0f" }}
        className="py-24 px-4 text-center"
      >
        <div className="max-w-3xl mx-auto">
          <p
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "8px", color: "#C41E3A" }}
            className="text-sm uppercase mb-6"
          >
            Our Manifesto
          </p>
          <h2
            style={{
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "3px",
              lineHeight: "1.1",
            }}
            className="text-[clamp(2.5rem,7vw,6rem)] text-white mb-8"
          >
            WE DON'T FOLLOW
            <br />
            <span style={{ color: "#C41E3A" }}>TRENDS.</span>
            <br />
            WE INFECT THEM.
          </h2>
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-gray-400 text-base leading-relaxed max-w-lg mx-auto"
          >
            Toxic Society was born from the underground. We make clothing for
            those who are quiet enough to be underestimated, and bold enough
            to be unforgettable.
          </p>
        </div>
      </section>

      {/* Belt Feature Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="bg-gray-50 p-8 flex items-center justify-center aspect-square max-w-md mx-auto w-full">
            <ImageWithFallback
              src={beltImg}
              alt="TS Logo Leather Belt"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p
              style={{
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "4px",
                color: "#C41E3A",
              }}
              className="text-xs uppercase mb-4"
            >
              Accessories
            </p>
            <h2
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px", lineHeight: "1" }}
              className="text-6xl text-gray-900 mb-6"
            >
              TS LOGO
              <br />
              LEATHER BELT
            </h2>
            <p
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-gray-500 leading-relaxed mb-8"
            >
              Premium red leather belt featuring the iconic Toxic Society barbed
              wire logo in silver metal hardware. A statement accessory built for
              those who live on the edge. Handcrafted. Uncompromising.
            </p>
            <div className="flex items-center gap-4 mb-8">
              <span
                style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }}
                className="text-2xl"
              >
                $129
              </span>
            </div>
            <Link
              to="/product/2"
              style={{
                backgroundColor: "#C41E3A",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "3px",
              }}
              className="inline-flex items-center gap-2 text-white px-10 py-3.5 text-xl hover:bg-red-800 transition-colors"
            >
              Shop Now <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}