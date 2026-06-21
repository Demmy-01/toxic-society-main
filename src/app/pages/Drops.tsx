import { useState, useEffect } from "react";
import { Link } from "react-router";
import { SEO } from "../components/SEO";
import { DropCountdown } from "../components/DropCountdown";
import { ProductCard } from "../components/ProductCard";
import { supabase } from "../../lib/supabase";
import { Lock, Loader2, Check, ArrowRight, Zap } from "lucide-react";

interface DBDrop {
  id: string;
  name: string;
  label: string;
  date: string;
  status: string;
  description: string | null;
  image_url: string | null;
  drop_date: string | null;
  price: number | null;
}

interface DBProduct {
  id: string;
  name: string;
  price: number;
  original_price: number | null;
  images: string[];
  category: string;
  collection: string;
  sizes: string[];
  colors: string[];
  description: string | null;
  tag: string | null;
  in_stock: boolean;
  drop_id: string | null;
}

import { PRODUCT_IMAGES } from "../data/products";

/** Checks if a drop is live or if its countdown has elapsed */
function isDropLive(drop: DBDrop, now: number): boolean {
  if (drop.status === "LIVE") return true;
  if (drop.drop_date) return new Date(drop.drop_date).getTime() <= now;
  return false;
}

// Fallback image for drop products based on name
function getDropProductImage(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('polo') || n.includes('flame polo')) return PRODUCT_IMAGES.sweatshirt;
  if (n.includes('belt')) return PRODUCT_IMAGES.belt;
  if (n.includes('cap') || n.includes('hat')) return PRODUCT_IMAGES.cap;
  return PRODUCT_IMAGES.sweatshirt2;
}

function dbToProduct(p: DBProduct, dropName?: string) {
  const hasImages = p.images && p.images.length > 0 && p.images[0] !== '';
  const fallback = getDropProductImage(p.name);
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    image: hasImages ? p.images[0] : fallback,
    images: hasImages ? p.images : [fallback],
    category: p.category,
    collection: p.collection,
    sizes: p.sizes ?? [],
    colors: p.colors ?? [],
    description: p.description ?? "",
    tag: p.tag as any,
    inStock: p.in_stock,
    drop: dropName ?? "",
  };
}

export function Drops() {
  const [upcomingDrop, setUpcomingDrop] = useState<DBDrop | null>(null);
  const [activeDrops, setActiveDrops] = useState<DBDrop[]>([]);
  const [pastDrops, setPastDrops] = useState<DBDrop[]>([]);
  const [dropProductsMap, setDropProductsMap] = useState<
    Record<string, DBProduct[]>
  >({});
  const [loading, setLoading] = useState(true);

  // Real-time clock for auto-unlock
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Email signup
  const [email, setEmail] = useState("");
  const [signupState, setSignupState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [signupMsg, setSignupMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: drops } = await supabase
        .from("drops")
        .select("*")
        .order("drop_date", { ascending: true });

      if (drops) {
        const active = (drops as DBDrop[]).filter(
          (d: DBDrop) => d.status === "UPCOMING" || d.status === "LIVE",
        );
        setUpcomingDrop(active[0] ?? null);
        setActiveDrops(active);

        // Include LIVE in archive so they show with "Shop Now"
        setPastDrops((drops as DBDrop[]).filter((d: DBDrop) => d.status !== "UPCOMING"));

        if (active.length > 0) {
          const ids = active.map((d: DBDrop) => d.id);
          const { data: prods } = await supabase
            .from("products")
            .select("*")
            .in("drop_id", ids)
            .eq("in_stock", true);

          if (prods) {
            const map: Record<string, DBProduct[]> = {};
            for (const p of prods) {
              if (!p.drop_id) continue;
              if (!map[p.drop_id]) map[p.drop_id] = [];
              map[p.drop_id].push(p);
            }
            setDropProductsMap(map);
          }
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSignupState("loading");
    const { error } = await supabase
      .from("drop_signups")
      .upsert({ email }, { onConflict: "email" });
    if (error) {
      setSignupState("error");
      setSignupMsg("Something went wrong. Try again.");
    } else {
      setSignupState("success");
      setSignupMsg("You're on the list!");
      setEmail("");
    }
    setTimeout(() => {
      setSignupState("idle");
      setSignupMsg("");
    }, 4000);
  };

  // Countdown target = any active drop whose drop_date is still in the future.
  // We deliberately ignore `status` here — drop_date drives the clock, not the status field.
  const dropWithFutureDate = activeDrops.find(
    (d) => d.drop_date && new Date(d.drop_date).getTime() > now
  );

  // If a future drop_date exists → count down to it.
  // If every drop_date has already passed (or none set) → show "The Drop is Live" (0s).
  const countdownDate: Date = dropWithFutureDate?.drop_date
    ? new Date(dropWithFutureDate.drop_date)
    : new Date(Date.now() - 1000);

  const dropName = dropWithFutureDate
    ? `${dropWithFutureDate.name} — ${dropWithFutureDate.label}`
    : upcomingDrop
      ? `${upcomingDrop.name} — ${upcomingDrop.label}`
      : "NEXT DROP — COMING SOON";

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <Loader2 size={36} className="text-gray-200 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Drops"
        description="Exclusive limited-edition drops from Toxic Society. Get notified for upcoming releases, shop live drops, and browse the archive."
        url="/drops"
      />
      {/* Countdown hero */}
      <DropCountdown
        targetDate={countdownDate}
        dropName={dropName}
        subtitle={
          dropWithFutureDate?.description ??
          upcomingDrop?.description ??
          "Something dark is coming. Sign up to be first in line."
        }
      />

      {/* Email notify */}
      <div style={{ backgroundColor: "#C41E3A" }} className="py-12 px-4">
        <div className="max-w-xl mx-auto text-center">
          <p
            style={{
              fontFamily: "'Bebas Neue', cursive",
              letterSpacing: "3px",
            }}
            className="text-white text-3xl mb-2"
          >
            Get Early Access
          </p>
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-red-200 text-sm mb-6"
          >
            Drop notifications, exclusive previews, and members-only early
            access.
          </p>
          <form
            onSubmit={handleSignup}
            className="flex flex-col sm:flex-row gap-0 max-w-md mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="flex-1 px-4 py-3 text-sm text-gray-800 outline-none bg-white"
            />
            <button
              type="submit"
              disabled={signupState === "loading" || signupState === "success"}
              style={{
                backgroundColor: "#0f0f0f",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "2px",
              }}
              className="text-white px-8 py-3 text-lg hover:bg-gray-800 transition-colors whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
            >
              {signupState === "loading" && (
                <Loader2 size={14} className="animate-spin" />
              )}
              {signupState === "success" && <Check size={14} />}
              {signupState === "success" ? "You're in!" : "Notify Me"}
            </button>
          </form>
          {signupMsg && (
            <p
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-red-100 text-xs mt-3"
            >
              {signupMsg}
            </p>
          )}
        </div>
      </div>

      {/* ── Per-drop section ── */}
      {activeDrops.map((drop) => {
        const live = isDropLive(drop, now);
        const products = dropProductsMap[drop.id] ?? [];

        return (
          <div
            key={drop.id}
            className="border-b border-gray-100 last:border-0"
          >
            {live ? (
              /* ── LIVE: editorial split layout ── */
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Top editorial strip: text left | image right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                  {/* Left: content */}
                  <div>
                    {/* Live badge */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="relative flex items-center justify-center">
                        <span
                          className="absolute inline-flex h-4 w-4 rounded-full opacity-75 animate-ping"
                          style={{ backgroundColor: "#16a34a" }}
                        />
                        <span
                          className="relative inline-flex h-3 w-3 rounded-full"
                          style={{ backgroundColor: "#22c55e" }}
                        />
                      </div>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "4px",
                          color: "#16a34a",
                        }}
                        className="text-xs uppercase font-semibold flex items-center gap-1"
                      >
                        <Zap size={11} fill="#16a34a" /> Now Live
                      </span>
                    </div>

                    {/* Drop name */}
                    <h2
                      style={{
                        fontFamily: "'Bebas Neue', cursive",
                        letterSpacing: "4px",
                      }}
                      className="text-7xl sm:text-8xl text-gray-900 leading-none mb-2"
                    >
                      {drop.name}
                    </h2>
                    <p
                      style={{
                        fontFamily: "'Bebas Neue', cursive",
                        letterSpacing: "3px",
                        color: "#C41E3A",
                      }}
                      className="text-2xl sm:text-3xl mb-6"
                    >
                      {drop.label}
                    </p>

                    {/* Description */}
                    <p
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="text-gray-500 text-sm leading-relaxed mb-8 max-w-sm"
                    >
                      {drop.description ?? "Available now. Get it before it's gone."}
                    </p>

                    {/* Meta row */}
                    <div
                      style={{ borderColor: "#e5e5e5" }}
                      className="flex items-center gap-6 border-t pt-6 mb-8"
                    >
                      <div>
                        <p
                          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
                          className="text-[10px] uppercase text-gray-400 mb-0.5"
                        >
                          Status
                        </p>
                        <p
                          style={{ fontFamily: "'Inter', sans-serif", color: "#16a34a" }}
                          className="text-xs font-semibold uppercase"
                        >
                          Live Now
                        </p>
                      </div>
                      <div
                        className="w-px h-8 bg-gray-200"
                      />
                      <div>
                        <p
                          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
                          className="text-[10px] uppercase text-gray-400 mb-0.5"
                        >
                          Items
                        </p>
                        <p
                          style={{ fontFamily: "'Inter', sans-serif" }}
                          className="text-xs font-semibold text-gray-800"
                        >
                          {products.length > 0 ? `${products.length} pieces` : "Coming soon"}
                        </p>
                      </div>
                      {drop.date && (
                        <>
                          <div className="w-px h-8 bg-gray-200" />
                          <div>
                            <p
                              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
                              className="text-[10px] uppercase text-gray-400 mb-0.5"
                            >
                              Dropped
                            </p>
                            <p
                              style={{ fontFamily: "'Inter', sans-serif" }}
                              className="text-xs font-semibold text-gray-800"
                            >
                              {drop.date}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {/* CTA */}
                    <Link
                      to="/shop"
                      style={{
                        backgroundColor: "#C41E3A",
                        fontFamily: "'Bebas Neue', cursive",
                        letterSpacing: "3px",
                      }}
                      className="inline-flex items-center gap-3 text-white px-8 py-4 text-xl hover:bg-red-800 transition-colors"
                    >
                      Shop This Drop <ArrowRight size={18} />
                    </Link>
                  </div>

                  {/* Right: image contained in portrait frame */}
                  {drop.image_url ? (
                    <div className="relative">
                      {/* Decorative offset border */}
                      <div
                        style={{ borderColor: "#C41E3A" }}
                        className="absolute -top-3 -right-3 w-full h-full border-2 z-0"
                      />
                      <div className="relative z-10 overflow-hidden aspect-[3/4] w-full max-w-sm mx-auto lg:max-w-none">
                        <img
                          src={drop.image_url}
                          alt={drop.name}
                          className="w-full h-full object-cover"
                        />
                        {/* Subtle gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                      </div>
                    </div>
                  ) : (
                    <div
                      style={{ backgroundColor: "#f5f5f5" }}
                      className="aspect-[3/4] flex items-center justify-center"
                    >
                      <span
                        style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
                        className="text-gray-300 text-4xl"
                      >
                        {drop.name}
                      </span>
                    </div>
                  )}
                </div>

                {/* Products grid */}
                {products.length > 0 ? (
                  <>
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-px flex-1 bg-gray-100" />
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "3px",
                          color: "#999",
                        }}
                        className="text-[10px] uppercase"
                      >
                        Available Now
                      </span>
                      <div className="h-px flex-1 bg-gray-100" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {products.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={dbToProduct(p, drop.name)}
                        />
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12 border border-dashed border-gray-200 bg-gray-50/50">
                    <p
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="text-gray-400 text-sm mb-4"
                    >
                      Products for this drop will appear here shortly.
                    </p>
                    <Link
                      to="/shop"
                      style={{ color: "#16a34a", fontFamily: "'Inter', sans-serif" }}
                      className="inline-flex items-center gap-1 text-sm hover:gap-2 transition-all font-medium"
                    >
                      Browse the shop <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* ── UPCOMING: blurred locked preview ── */
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-10">
                <div className="text-center mb-12">
                  <p
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "4px",
                      color: "#C41E3A",
                    }}
                    className="text-xs uppercase mb-3"
                  >
                    Sneak Peek
                  </p>
                  <h2
                    style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
                    className="text-6xl text-gray-900"
                  >
                    {drop.name.toUpperCase()} PREVIEW
                  </h2>
                  <p
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="text-sm text-gray-400 mt-3"
                  >
                    Selected pieces from the upcoming {drop.label}. Details locked.
                  </p>
                </div>
                <div className="max-w-md mx-auto relative overflow-hidden rounded-2xl shadow-xl">
                  <div className="aspect-[3/4] overflow-hidden bg-black">
                    {drop.image_url ? (
                      <img
                        src={drop.image_url}
                        alt=""
                        className="w-full h-full object-cover"
                        style={{ filter: "blur(8px)", transform: "scale(1.12)", opacity: 0.55 }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-900" />
                    )}
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                    <Lock size={36} className="text-white mb-3 opacity-90 drop-shadow-md" />
                    <span
                      style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "5px" }}
                      className="text-white text-3xl opacity-90 drop-shadow-md"
                    >
                      COMING SOON
                    </span>
                    <span
                      style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "3px" }}
                      className="text-white/80 text-sm uppercase mt-2 drop-shadow-sm font-semibold"
                    >
                      {drop.name}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}


      {/* ── Past / Live archive ── */}
      {pastDrops.length > 0 && (
        <div style={{ backgroundColor: "#0f0f0f" }} className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14">
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "4px",
                  color: "#C41E3A",
                }}
                className="text-xs uppercase mb-3"
              >
                Archive
              </p>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "4px",
                }}
                className="text-6xl text-white"
              >
                Past Drops
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {pastDrops.map((drop) => (
                <div
                  key={drop.id}
                  className="group relative overflow-hidden bg-gray-900"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    {drop.image_url ? (
                      <img
                        src={drop.image_url}
                        alt={drop.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-70"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          letterSpacing: "2px",
                          backgroundColor:
                            drop.status === "LIVE"
                              ? "#16a34a"
                              : drop.status === "SOLD OUT"
                                ? "#333"
                                : drop.status === "AVAILABLE"
                                  ? "#C41E3A"
                                  : "#333",
                        }}
                        className="text-white text-xs px-3 py-1 uppercase font-medium"
                      >
                        {drop.status}
                      </span>
                      <span
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="text-gray-400 text-xs"
                      >
                        {drop.date}
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "'Bebas Neue', cursive",
                        letterSpacing: "3px",
                      }}
                      className="text-white text-2xl mb-1"
                    >
                      {drop.name} — {drop.label}
                    </p>
                    {drop.description && (
                      <p
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="text-gray-400 text-xs leading-relaxed mb-4"
                      >
                        {drop.description}
                      </p>
                    )}
                    {(drop.status === "AVAILABLE" ||
                      drop.status === "LIVE") && (
                      <Link
                        to="/shop"
                        style={{
                          color: drop.status === "LIVE" ? "#16a34a" : "#C41E3A",
                          fontFamily: "'Inter', sans-serif",
                        }}
                        className="text-xs flex items-center gap-1 hover:gap-2 transition-all font-medium"
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
      )}
    </div>
  );
}

