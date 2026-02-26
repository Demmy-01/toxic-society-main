import { useState, useMemo } from "react";
import { products, categories, collections, drops, allSizes } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";

type SortOption = "featured" | "price-asc" | "price-desc" | "newest";

interface Filters {
  categories: string[];
  collections: string[];
  drops: string[];
  sizes: string[];
  priceMax: number;
}

const PRICE_MAX = 300;

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100 py-5">
      <button
        className="w-full flex items-center justify-between mb-3"
        onClick={() => setOpen(!open)}
      >
        <span
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
          className="text-xs uppercase text-gray-700"
        >
          {title}
        </span>
        {open ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Inter', sans-serif",
        letterSpacing: "1px",
        backgroundColor: active ? "#C41E3A" : "transparent",
        color: active ? "white" : "#555",
        borderColor: active ? "#C41E3A" : "#e5e5e5",
      }}
      className="text-xs uppercase px-3 py-1.5 border transition-all duration-150 hover:border-red-400"
    >
      {label}
    </button>
  );
}

function SizeButton({
  size,
  active,
  onClick,
}: {
  size: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: "'Inter', sans-serif",
        borderColor: active ? "#C41E3A" : "#e5e5e5",
        color: active ? "#C41E3A" : "#555",
        backgroundColor: active ? "#fff0f2" : "white",
      }}
      className="px-3 py-2 text-xs border transition-all duration-150 hover:border-red-400"
    >
      {size}
    </button>
  );
}

export function Shop() {
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    categories: [],
    collections: [],
    drops: [],
    sizes: [],
    priceMax: PRICE_MAX,
  });

  const toggleFilter = (key: keyof Omit<Filters, "priceMax">, value: string) => {
    setFilters((prev) => {
      const arr = prev[key] as string[];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const clearAll = () => {
    setFilters({ categories: [], collections: [], drops: [], sizes: [], priceMax: PRICE_MAX });
  };

  const activeFilterCount =
    filters.categories.length +
    filters.collections.length +
    filters.drops.length +
    filters.sizes.length +
    (filters.priceMax < PRICE_MAX ? 1 : 0);

  const filtered = useMemo(() => {
    return products
      .filter((p) => {
        if (filters.categories.length && !filters.categories.includes(p.category)) return false;
        if (filters.collections.length && !filters.collections.includes(p.collection)) return false;
        if (filters.drops.length && !filters.drops.includes(p.drop)) return false;
        if (filters.sizes.length && !p.sizes.some((s) => filters.sizes.includes(s))) return false;
        if (p.price > filters.priceMax) return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        if (sortBy === "newest") return b.id - a.id;
        return 0;
      });
  }, [filters, sortBy]);

  const FilterPanel = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h3
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
            className="text-2xl text-gray-900"
          >
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <span
              style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
              className="text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
            >
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={clearAll}
            style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }}
            className="text-xs uppercase tracking-widest hover:underline"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <div className="flex flex-wrap gap-2">
          {categories.filter((c) => c !== "All").map((cat) => (
            <FilterPill
              key={cat}
              label={cat}
              active={filters.categories.includes(cat)}
              onClick={() => toggleFilter("categories", cat)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Collection */}
      <FilterSection title="Collection">
        <div className="flex flex-wrap gap-2">
          {collections.filter((c) => c !== "All").map((col) => (
            <FilterPill
              key={col}
              label={col}
              active={filters.collections.includes(col)}
              onClick={() => toggleFilter("collections", col)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Drop */}
      <FilterSection title="Drop">
        <div className="flex flex-wrap gap-2">
          {drops.filter((d) => d !== "All").map((drop) => (
            <FilterPill
              key={drop}
              label={drop}
              active={filters.drops.includes(drop)}
              onClick={() => toggleFilter("drops", drop)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-2">
          {allSizes.map((size) => (
            <SizeButton
              key={size}
              size={size}
              active={filters.sizes.includes(size)}
              onClick={() => toggleFilter("sizes", size)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Price */}
      <FilterSection title="Max Price">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400">
              $0
            </span>
            <span style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-sm">
              Up to ${filters.priceMax}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={PRICE_MAX}
            step={10}
            value={filters.priceMax}
            onChange={(e) => setFilters((prev) => ({ ...prev, priceMax: Number(e.target.value) }))}
            className="w-full accent-red-700 cursor-pointer"
          />
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {/* Page Header */}
      <div
        style={{ backgroundColor: "#0f0f0f" }}
        className="py-16 px-4 text-center"
      >
        <p
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
          className="text-xs uppercase mb-3"
        >
          Toxic Society
        </p>
        <h1
          style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
          className="text-6xl sm:text-7xl text-white"
        >
          Shop All
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-gray-400 mt-3 text-sm">
          {filtered.length} products
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-10 pb-6 border-b border-gray-100">
          {/* Filter toggle */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
            className="flex items-center gap-2 text-xs uppercase text-gray-600 hover:text-gray-900 transition-colors"
          >
            <SlidersHorizontal size={16} />
            {filtersOpen ? "Hide Filters" : "Show Filters"}
            {activeFilterCount > 0 && (
              <span
                style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
                className="text-white text-xs w-5 h-5 rounded-full flex items-center justify-center ml-1"
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Active filter chips */}
          <div className="flex-1 flex flex-wrap gap-2 overflow-hidden">
            {[
              ...filters.categories,
              ...filters.collections,
              ...filters.drops,
              ...filters.sizes,
              ...(filters.priceMax < PRICE_MAX ? [`≤$${filters.priceMax}`] : []),
            ].map((chip) => (
              <span
                key={chip}
                style={{ fontFamily: "'Inter', sans-serif", borderColor: "#C41E3A", color: "#C41E3A" }}
                className="text-xs border px-2 py-1 flex items-center gap-1"
              >
                {chip}
                <button
                  onClick={() => {
                    if (chip.startsWith("≤$")) {
                      setFilters((p) => ({ ...p, priceMax: PRICE_MAX }));
                    } else if (categories.includes(chip)) {
                      toggleFilter("categories", chip);
                    } else if (collections.includes(chip)) {
                      toggleFilter("collections", chip);
                    } else if (drops.includes(chip)) {
                      toggleFilter("drops", chip);
                    } else {
                      toggleFilter("sizes", chip);
                    }
                  }}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-3 shrink-0">
            <label
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "1px" }}
              className="text-xs text-gray-400 uppercase hidden sm:block"
            >
              Sort:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-sm text-gray-700 border-b border-gray-300 bg-transparent outline-none py-1 cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="newest">Newest</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </select>
          </div>
        </div>

        {/* Layout: sidebar + grid */}
        <div className="flex gap-10">
          {/* Sidebar */}
          {filtersOpen && (
            <div className="hidden md:block w-60 shrink-0">
              <FilterPanel />
            </div>
          )}

          {/* Products Grid */}
          <div className="flex-1">
            {/* Mobile filter drawer */}
            {filtersOpen && (
              <div className="md:hidden fixed inset-0 z-50 flex">
                <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
                <div className="relative ml-auto w-80 max-w-full bg-white h-full overflow-y-auto p-6 z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }} className="text-xl">
                      Filters
                    </span>
                    <button onClick={() => setFiltersOpen(false)}>
                      <X size={20} className="text-gray-600" />
                    </button>
                  </div>
                  <FilterPanel />
                  <button
                    onClick={() => setFiltersOpen(false)}
                    style={{ backgroundColor: "#C41E3A", fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
                    className="w-full mt-6 py-4 text-white text-xl"
                  >
                    Show {filtered.length} Results
                  </button>
                </div>
              </div>
            )}

            {filtered.length > 0 ? (
              <div
                className={`grid gap-6 ${
                  filtersOpen
                    ? "grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {filtered.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p
                  style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
                  className="text-4xl text-gray-200 mb-4"
                >
                  No products found
                </p>
                <button
                  onClick={clearAll}
                  style={{ color: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
                  className="text-sm underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
