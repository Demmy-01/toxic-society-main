import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router";
import {
  ShoppingBag, Heart, ArrowLeft, ChevronDown, ChevronUp,
  Star, ChevronLeft, ChevronRight, X, ZoomIn,
} from "lucide-react";
import { products as staticProducts, fetchProducts } from "../data/products";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useReviews } from "../context/ReviewsContext";
import { ProductCard } from "../components/ProductCard";
import { ReviewsSection } from "../components/ReviewsSection";
import { useCurrency } from "../context/CurrencyContext";

/* ─── Color map ─── */
const COLOR_HEX: Record<string, string> = {
  Red: "#EF4444", Orange: "#F97316", Yellow: "#EAB308",
  Green: "#22C55E", Blue: "#3B82F6", Indigo: "#6366F1",
  Violet: "#A855F7", Beige: "#D4C5A9",
};

/* ─── Fullscreen Gallery Modal ─── */
function GalleryModal({
  images, startIndex, onClose,
}: { images: string[]; startIndex: number; onClose: () => void }) {
  const [current, setCurrent] = useState(startIndex);

  const prev = useCallback(() => setCurrent((i) => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent((i) => (i + 1) % images.length), [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next, onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.92)" }}
      onClick={onClose}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
        aria-label="Close gallery"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Counter */}
      <span
        className="absolute top-5 left-5 text-white/60 text-sm"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {current + 1} / {images.length}
      </span>

      {/* Main image */}
      <div
        className="relative flex items-center justify-center w-full h-full px-16 py-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[current]}
          alt={`Product photo ${current + 1}`}
          className="max-h-full max-w-full object-contain select-none"
          style={{ maxHeight: "80vh", maxWidth: "80vw" }}
          draggable={false}
        />
      </div>

      {/* Prev */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); prev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all"
          aria-label="Previous image"
        >
          <ChevronLeft size={24} className="text-white" />
        </button>
      )}

      {/* Next */}
      {images.length > 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); next(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-all"
          aria-label="Next image"
        >
          <ChevronRight size={24} className="text-white" />
        </button>
      )}

      {/* Thumbnail strip at bottom */}
      {images.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto max-w-[90vw] px-2"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="shrink-0 w-14 h-14 overflow-hidden transition-all duration-200"
              style={{
                outline: i === current ? "2px solid #C41E3A" : "2px solid rgba(255,255,255,0.2)",
                outlineOffset: "2px",
                opacity: i === current ? 1 : 0.55,
              }}
              aria-label={`Go to photo ${i + 1}`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" draggable={false} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─── */
export function ProductDetail() {
  const { id } = useParams();
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts);
  const product = allProducts.find((p) => p.id === id);
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const { getAverageRating, getReviewCount } = useReviews();
  const { formatPrice } = useCurrency();

  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProducts().then((data) => { if (data.length > 0) setAllProducts(data); });
  }, []);

  useEffect(() => {
    setActiveImg(0);
    setSelectedColor("");
    setSelectedSize("");
  }, [id]);

  const related = allProducts.filter((p) => p.id !== id).slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }} className="text-5xl text-gray-200 mb-4">
            Product Not Found
          </p>
          <Link to="/shop" style={{ color: "#C41E3A" }} className="text-sm underline">Back to Shop</Link>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const avgRating = getAverageRating(product.id);
  const reviewCount = getReviewCount(product.id);

  // Build final gallery
  const gallery: string[] = product.images && product.images.length > 0 ? product.images : [product.image];

  const prevImg = () => setActiveImg((i) => (i - 1 + gallery.length) % gallery.length);
  const nextImg = () => setActiveImg((i) => (i + 1) % gallery.length);

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 1) return;
    const size = selectedSize || product.sizes[0];
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
      color: selectedColor || undefined,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Lightbox */}
      {lightboxOpen && (
        <GalleryModal
          images={gallery}
          startIndex={activeImg}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-0">
        <Link
          to="/shop"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "1px" }}
          className="inline-flex items-center gap-1 text-xs text-gray-400 uppercase hover:text-gray-700 transition-colors"
        >
          <ArrowLeft size={12} /> Back to Shop
        </Link>
      </div>

      {/* Product Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

          {/* ── Image Section (clipper-style) ── */}
          <div className="flex gap-3">
            {/* Vertical thumbnail strip on the LEFT */}
            {gallery.length > 1 && (
              <div className="flex flex-col gap-2.5 shrink-0 overflow-y-auto" style={{ maxHeight: 560 }}>
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className="shrink-0 w-[68px] h-[68px] overflow-hidden transition-all duration-200 hover:opacity-90"
                    style={{
                      outline: i === activeImg ? "2px solid #C41E3A" : "2px solid #e5e5e5",
                      outlineOffset: "1px",
                    }}
                    aria-label={`Select photo ${i + 1}`}
                  >
                    <img src={src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Main image + dots */}
            <div className="flex-1 flex flex-col gap-3">
              {/* Main viewer */}
              <div
                className="relative bg-gray-50 overflow-hidden aspect-square group cursor-zoom-in"
                style={{ maxHeight: 560 }}
                onClick={() => setLightboxOpen(true)}
              >
                <img
                  src={gallery[activeImg]}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />

                {/* Zoom hint */}
                <div className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                  <ZoomIn size={14} className="text-gray-700" />
                </div>

                {/* Prev / Next arrows */}
                {gallery.length > 1 && (
                  <>
                    <button
                      onClick={(e) => { e.stopPropagation(); prevImg(); }}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={16} className="text-gray-700" />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); nextImg(); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                      aria-label="Next image"
                    >
                      <ChevronRight size={16} className="text-gray-700" />
                    </button>
                  </>
                )}
              </div>

              {/* Dot indicators */}
              {gallery.length > 1 && (
                <div className="flex items-center justify-center gap-1.5 py-1">
                  {gallery.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      aria-label={`Photo ${i + 1}`}
                      className="transition-all duration-200"
                      style={{
                        width: i === activeImg ? 20 : 6,
                        height: 6,
                        borderRadius: 999,
                        backgroundColor: i === activeImg ? "#C41E3A" : "#d1d5db",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── Info Panel ── */}
          <div className="flex flex-col">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tag && (
                <span
                  style={{ backgroundColor: product.tag === "SALE" ? "#C41E3A" : "#1a1a1a", fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
                  className="text-white text-xs px-3 py-1 uppercase"
                >
                  {product.tag}
                </span>
              )}
              <span style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px", color: "#C41E3A", borderColor: "#C41E3A" }} className="text-xs px-3 py-1 uppercase border">
                {product.collection}
              </span>
              {product.drop && (
                <span style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px", color: "#888", borderColor: "#e5e5e5" }} className="text-xs px-3 py-1 uppercase border">
                  {product.drop}
                </span>
              )}
            </div>

            {/* Name */}
            <h1 style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px", lineHeight: "1.1" }} className="text-5xl text-gray-900 mb-3">
              {product.name}
            </h1>

            {/* Stars */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={13} style={{ color: star <= Math.round(avgRating) ? "#C41E3A" : "#e5e5e5", fill: star <= Math.round(avgRating) ? "#C41E3A" : "#e5e5e5" }} />
                  ))}
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400">
                  {avgRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
                <a href="#reviews" style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-xs underline">Read reviews</a>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-2xl">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-base text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
              )}
              {product.originalPrice && (
                <span style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif" }} className="text-white text-xs px-2 py-0.5">
                  Save {formatPrice(product.originalPrice - product.price)}
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-gray-500 leading-relaxed mb-6 text-sm">{product.description}</p>

            {/* ── Color Selector ── */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <p style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }} className="text-xs uppercase text-gray-500 mb-3">
                  Color{selectedColor && <span className="ml-2 normal-case text-gray-900">— {selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((colorName) => {
                    const hex = COLOR_HEX[colorName] ?? "#888";
                    const active = selectedColor === colorName;
                    return (
                      <button
                        key={colorName}
                        onClick={() => setSelectedColor(active ? "" : colorName)}
                        title={colorName}
                        className="flex items-center gap-2 transition-all duration-150"
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12px",
                          letterSpacing: "1px",
                          color: active ? "#1a1a1a" : "#888",
                          padding: "5px 12px",
                          border: active ? "1.5px solid #1a1a1a" : "1.5px solid #e5e5e5",
                          background: active ? "#fafafa" : "white",
                        }}
                      >
                        <span
                          className="w-4 h-4 rounded-full shrink-0"
                          style={{
                            backgroundColor: hex,
                            boxShadow: active ? `0 0 0 2px white, 0 0 0 3.5px ${hex}` : "none",
                          }}
                        />
                        {colorName}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size selector */}
            {product.sizes.length > 1 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }} className="text-xs uppercase text-gray-500">
                    Size{selectedSize && <span className="ml-2 normal-case text-gray-900">— {selectedSize}</span>}
                  </p>
                  <button style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-xs underline">Size Guide</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        borderColor: selectedSize === size ? "#C41E3A" : "#e5e5e5",
                        color: selectedSize === size ? "#C41E3A" : "#555",
                        backgroundColor: selectedSize === size ? "#fff0f2" : "white",
                      }}
                      className="px-4 py-2 text-sm border transition-all duration-150 hover:border-red-400"
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {!selectedSize && (
                  <p style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-xs mt-2">Please select a size</p>
                )}
              </div>
            )}

            {/* Add to cart */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize && product.sizes.length > 1}
                style={{
                  backgroundColor: added ? "#1a1a1a" : (!selectedSize && product.sizes.length > 1) ? "#ddd" : "#C41E3A",
                  fontFamily: "'Bebas Neue', cursive",
                  letterSpacing: "3px",
                }}
                className="flex-1 text-white py-4 text-xl flex items-center justify-center gap-3 transition-all duration-300 disabled:cursor-not-allowed"
              >
                <ShoppingBag size={18} />
                {added ? "Added to Bag!" : "Add to Bag"}
              </button>
              <button
                onClick={() => toggleItem(product)}
                style={{ borderColor: wishlisted ? "#C41E3A" : "#ddd", color: wishlisted ? "#C41E3A" : "#555" }}
                className="w-14 border flex items-center justify-center transition-all duration-200 hover:border-red-400"
                title={wishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <Heart size={18} fill={wishlisted ? "#C41E3A" : "none"} />
              </button>
            </div>

            {/* Accordion: Details */}
            <div className="border-t border-gray-100">
              <button className="w-full flex items-center justify-between py-4" onClick={() => setShowDetails(!showDetails)}>
                <span style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }} className="text-xs uppercase text-gray-600">Product Details</span>
                {showDetails ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {showDetails && (
                <div style={{ fontFamily: "'Inter', sans-serif" }} className="pb-4 text-sm text-gray-500 leading-relaxed">
                  {product.description || "No details available."}
                </div>
              )}
            </div>

            {/* Accordion: Shipping */}
            <div className="border-t border-gray-100">
              <button className="w-full flex items-center justify-between py-4" onClick={() => setShowShipping(!showShipping)}>
                <span style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }} className="text-xs uppercase text-gray-600">Shipping &amp; Returns</span>
                {showShipping ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {showShipping && (
                <div style={{ fontFamily: "'Inter', sans-serif" }} className="pb-4 text-sm text-gray-500 leading-relaxed">
                  <p className="mb-2">Free shipping on orders over $200.</p>
                  <p className="mb-2">Standard shipping: 3–5 business days.</p>
                  <p>Returns accepted within 14 days of delivery. Items must be unworn and in original packaging.</p>
                </div>
              )}
            </div>
            <div className="border-t border-gray-100" />
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div id="reviews" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ReviewsSection productId={product.id} productName={product.name} />
      </div>

      {/* Related Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-gray-100 mt-8">
        <div className="mb-10">
          <p style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }} className="text-xs uppercase mb-2">You Might Also Like</p>
          <h2 style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }} className="text-5xl text-gray-900">Related Items</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>
    </div>
  );
}
