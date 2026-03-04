import { useState, useEffect } from "react";
import { Link } from "react-router";
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
  description: string | null;
  tag: string | null;
  in_stock: boolean;
  drop_id: string | null;
}

/** Checks if a drop is live or if its countdown has elapsed */
function isDropLive(drop: DBDrop, now: number): boolean {
  if (drop.status === "LIVE") return true;
  if (drop.drop_date) return new Date(drop.drop_date).getTime() <= now;
  return false;
}

function dbToProduct(p: DBProduct, dropName?: string) {
  return {
    id: p.id,
    name: p.name,
    price: p.price,
    originalPrice: p.original_price ?? undefined,
    image: p.images?.[0] ?? "",
    images: p.images ?? [],
    category: p.category,
    collection: p.collection,
    sizes: p.sizes ?? [],
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
        const active = drops.filter(
          (d) => d.status === "UPCOMING" || d.status === "LIVE",
        );
        setUpcomingDrop(active[0] ?? null);
        setActiveDrops(active);

        // Include LIVE in archive so they show with "Shop Now"
        setPastDrops(drops.filter((d) => d.status !== "UPCOMING"));

        if (active.length > 0) {
          const ids = active.map((d) => d.id);
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

  const nextUnlocked = activeDrops.find((d) => !isDropLive(d, now));
  const countdownDate = nextUnlocked?.drop_date
    ? new Date(nextUnlocked.drop_date)
    : new Date("2099-01-01T00:00:00Z");

  const dropName = nextUnlocked
    ? `${nextUnlocked.name} — ${nextUnlocked.label}`
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
      {/* Countdown hero */}
      <DropCountdown
        targetDate={countdownDate}
        dropName={dropName}
        subtitle={
          nextUnlocked?.description ??
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

      {/* ── Per-drop section: locked preview OR live products ── */}
      {activeDrops.map((drop) => {
        const live = isDropLive(drop, now);
        const products = dropProductsMap[drop.id] ?? [];

        return (
          <div
            key={drop.id}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-10 border-b border-gray-100 last:border-0"
          >
            {/* Section header */}
            <div className="text-center mb-12">
              <p
                style={{
                  fontFamily: "'Inter', sans-serif",
                  letterSpacing: "4px",
                  color: live ? "#16a34a" : "#C41E3A",
                }}
                className="text-xs uppercase mb-3 flex items-center justify-center gap-1"
              >
                {live ? (
                  <>
                    <Zap size={12} fill="#16a34a" />{" "}
                    <span className="font-semibold">Now Live</span>
                  </>
                ) : (
                  "Sneak Peek"
                )}
              </p>
              <h2
                style={{
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "4px",
                }}
                className="text-6xl text-gray-900"
              >
                {drop.name.toUpperCase()} {live ? "— SHOP NOW" : "PREVIEW"}
              </h2>
              <p
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-sm text-gray-400 mt-3"
              >
                {live
                  ? `${drop.label} is now live. Get it before it's gone.`
                  : `Selected pieces from the upcoming ${drop.label}. Details locked.`}
              </p>
            </div>

            {live ? (
              /* ── LIVE: show drop image AND purchasable ProductCards ── */
              <div className="max-w-5xl mx-auto">
                {drop.image_url && (
                  <div className="mb-12 w-full aspect-video md:aspect-[21/9] overflow-hidden rounded-2xl relative shadow-sm">
                    <img
                      src={drop.image_url}
                      alt={drop.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                )}

                {products.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {products.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={dbToProduct(p, drop.name)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                    <p
                      style={{ fontFamily: "'Inter', sans-serif" }}
                      className="text-gray-400 text-sm mb-4"
                    >
                      Products for this drop will appear here shortly.
                    </p>
                    <Link
                      to="/shop"
                      style={{
                        color: "#16a34a",
                        fontFamily: "'Inter', sans-serif",
                      }}
                      className="inline-flex items-center gap-1 text-sm hover:gap-2 transition-all font-medium"
                    >
                      Browse the shop <ArrowRight size={14} />
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              /* ── UPCOMING: single proper sized blurred card ── */
              <div className="max-w-md mx-auto relative overflow-hidden rounded-2xl shadow-xl">
                <div className="aspect-[3/4] overflow-hidden bg-black">
                  {drop.image_url ? (
                    <img
                      src={drop.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                      style={{
                        filter: "blur(8px)",
                        transform: "scale(1.12)",
                        opacity: 0.55,
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-900" />
                  )}
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40">
                  <Lock
                    size={36}
                    className="text-white mb-3 opacity-90 drop-shadow-md"
                  />
                  <span
                    style={{
                      fontFamily: "'Bebas Neue', cursive",
                      letterSpacing: "5px",
                    }}
                    className="text-white text-3xl opacity-90 drop-shadow-md"
                  >
                    COMING SOON
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "3px",
                    }}
                    className="text-white/80 text-sm uppercase mt-2 drop-shadow-sm font-semibold"
                  >
                    {drop.name}
                  </span>
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
