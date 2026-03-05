import { Link } from "react-router";
import { ShoppingBag, Heart, Star, Eye } from "lucide-react";
import { Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useReviews } from "../context/ReviewsContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useCurrency } from "../context/CurrencyContext";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const { getAverageRating, getReviewCount } = useReviews();
  const { formatPrice } = useCurrency();

  const wishlisted = isWishlisted(product.id);
  const avgRating = getAverageRating(product.id);
  const reviewCount = getReviewCount(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes[0] ?? "ONE SIZE",
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <Link to={`/product/${product.id}`} className="group block">
      {/* Image container */}
      <div className="relative overflow-hidden bg-gray-50">
        {/* Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {product.tag && (
            <span
              style={{
                backgroundColor: product.tag === "SALE" ? "#C41E3A" : "#1a1a1a",
                fontFamily: "'Inter', sans-serif",
                letterSpacing: "2px",
              }}
              className="text-white text-[10px] px-2 py-0.5 uppercase"
            >
              {product.tag}
            </span>
          )}
          {discount && discount > 0 && (
            <span
              style={{ fontFamily: "'Inter', sans-serif", backgroundColor: "#C41E3A" }}
              className="text-white text-[10px] px-2 py-0.5"
            >
              -{discount}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white cursor-pointer"
          title={wishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <Heart
            size={14}
            style={{ color: wishlisted ? "#C41E3A" : "#555" }}
            fill={wishlisted ? "#C41E3A" : "none"}
          />
        </button>

        {/* Wishlisted always-visible */}
        {wishlisted && (
          <div
            style={{ backgroundColor: "#C41E3A" }}
            className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center group-hover:hidden"
          >
            <Heart size={14} fill="white" className="text-white" />
          </div>
        )}

        {/* Image */}
        <div className="aspect-[3/4] overflow-hidden">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        {/* Hover overlay with sizes */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 pt-12 pb-12 px-3">
          {product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {product.sizes.slice(0, 6).map((s) => (
                <span
                  key={s}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="text-[10px] text-white border border-white/50 px-1.5 py-0.5 uppercase"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick Add */}
        <button
          onClick={handleQuickAdd}
          style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
          className="absolute bottom-0 left-0 right-0 py-3 text-white text-xs uppercase tracking-widest flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300 cursor-pointer hover:bg-red-800"
        >
          <ShoppingBag size={13} />
          Quick Add
        </button>
      </div>

      {/* Info */}
      <div className="mt-3 space-y-1.5">
        {/* Meta */}
        <p
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "1.5px" }}
          className="text-[10px] text-gray-400 uppercase"
        >
          {product.category}
          {product.collection ? ` · ${product.collection}` : ""}
        </p>

        {/* Name */}
        <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-900 leading-snug line-clamp-1">
          {product.name}
        </p>

        {/* Description */}
        {product.description && (
          <p
            style={{ fontFamily: "'Inter', sans-serif" }}
            className="text-xs text-gray-400 leading-relaxed line-clamp-2"
          >
            {product.description}
          </p>
        )}

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={9}
                style={{
                  color: star <= Math.round(avgRating) ? "#C41E3A" : "#e5e5e5",
                  fill: star <= Math.round(avgRating) ? "#C41E3A" : "#e5e5e5",
                }}
              />
            ))}
            <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-[10px] text-gray-400 ml-0.5">
              ({reviewCount})
            </span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-sm font-medium">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          {/* View detail link */}
          <span
            style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }}
            className="hidden group-hover:flex items-center gap-1 text-[10px] uppercase tracking-widest"
          >
            <Eye size={10} />
            View
          </span>
        </div>

        {/* Thin accent line */}
        <div
          style={{ backgroundColor: "#C41E3A" }}
          className="h-px w-0 group-hover:w-full transition-all duration-500 mt-1"
        />
      </div>
    </Link>
  );
}