import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { ShoppingBag, Heart, ArrowLeft, ChevronDown, ChevronUp, Star } from "lucide-react";
import { products as staticProducts, fetchProducts } from "../data/products";
import type { Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useReviews } from "../context/ReviewsContext";
import { ProductCard } from "../components/ProductCard";
import { ReviewsSection } from "../components/ReviewsSection";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

export function ProductDetail() {
  const { id } = useParams();
  const [allProducts, setAllProducts] = useState<Product[]>(staticProducts);
  const product = allProducts.find((p) => p.id === id);
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const { getAverageRating, getReviewCount } = useReviews();
  const [selectedSize, setSelectedSize] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [showShipping, setShowShipping] = useState(false);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    fetchProducts().then((data) => {
      if (data.length > 0) setAllProducts(data);
    });
  }, []);

  const related = allProducts.filter((p) => p.id !== id).slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
            className="text-5xl text-gray-200 mb-4"
          >
            Product Not Found
          </p>
          <Link to="/shop" style={{ color: "#C41E3A" }} className="text-sm underline">
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const avgRating = getAverageRating(product.id);
  const reviewCount = getReviewCount(product.id);

  const handleAddToCart = () => {
    if (!selectedSize && product.sizes.length > 1) return;
    const size = selectedSize || product.sizes[0];
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image */}
          <div className="bg-gray-50 flex items-center justify-center overflow-hidden aspect-square max-h-[600px]">
            <ImageWithFallback
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-4">
              {product.tag && (
                <span
                  style={{
                    backgroundColor: product.tag === "SALE" ? "#C41E3A" : "#1a1a1a",
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "2px",
                  }}
                  className="text-white text-xs px-3 py-1 uppercase"
                >
                  {product.tag}
                </span>
              )}
              <span
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px", color: "#C41E3A", borderColor: "#C41E3A" }}
                className="text-xs px-3 py-1 uppercase border"
              >
                {product.collection}
              </span>
              <span
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px", color: "#888", borderColor: "#e5e5e5" }}
                className="text-xs px-3 py-1 uppercase border"
              >
                {product.drop}
              </span>
            </div>

            {/* Name */}
            <h1
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px", lineHeight: "1.1" }}
              className="text-5xl text-gray-900 mb-3"
            >
              {product.name}
            </h1>

            {/* Stars */}
            {reviewCount > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={13}
                      style={{
                        color: star <= Math.round(avgRating) ? "#C41E3A" : "#e5e5e5",
                        fill: star <= Math.round(avgRating) ? "#C41E3A" : "#e5e5e5",
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400">
                  {avgRating.toFixed(1)} ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                </span>
                <a
                  href="#reviews"
                  style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }}
                  className="text-xs underline"
                >
                  Read reviews
                </a>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-3 mb-6">
              <span style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-2xl">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-base text-gray-400 line-through">
                  ${product.originalPrice}
                </span>
              )}
              {product.originalPrice && (
                <span
                  style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif" }}
                  className="text-white text-xs px-2 py-0.5"
                >
                  Save ${product.originalPrice - product.price}
                </span>
              )}
            </div>

            {/* Description */}
            <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-gray-500 leading-relaxed mb-8 text-sm">
              {product.description}
            </p>

            {/* Size selector */}
            {product.sizes.length > 1 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p
                    style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
                    className="text-xs uppercase text-gray-500"
                  >
                    Size{selectedSize && <span className="ml-2 text-gray-900">— {selectedSize}</span>}
                  </p>
                  <button style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-xs underline">
                    Size Guide
                  </button>
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
                  <p style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-xs mt-2">
                    Please select a size
                  </p>
                )}
              </div>
            )}

            {/* Add to cart */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize && product.sizes.length > 1}
                style={{
                  backgroundColor: added ? "#1a1a1a" : !selectedSize && product.sizes.length > 1 ? "#ddd" : "#C41E3A",
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
              <button
                className="w-full flex items-center justify-between py-4"
                onClick={() => setShowDetails(!showDetails)}
              >
                <span style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }} className="text-xs uppercase text-gray-600">
                  Product Details
                </span>
                {showDetails ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>
              {showDetails && (
                <div style={{ fontFamily: "'Inter', sans-serif" }} className="pb-4 text-sm text-gray-500 leading-relaxed">
                  <ul className="list-disc list-inside space-y-1">
                    <li>100% Premium heavyweight cotton</li>
                    <li>Embroidered Toxic Society logo</li>
                    <li>Rhinestone flame detailing</li>
                    <li>Ribbed collar and cuffs</li>
                    <li>Limited edition drop — once gone, it's gone</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion: Shipping */}
            <div className="border-t border-gray-100">
              <button
                className="w-full flex items-center justify-between py-4"
                onClick={() => setShowShipping(!showShipping)}
              >
                <span style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }} className="text-xs uppercase text-gray-600">
                  Shipping & Returns
                </span>
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
        <div className="flex items-end justify-between mb-10">
          <div>
            <p style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }} className="text-xs uppercase mb-2">
              You Might Also Like
            </p>
            <h2 style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }} className="text-5xl text-gray-900">
              Related Items
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {related.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
