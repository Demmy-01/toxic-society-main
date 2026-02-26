import { Link } from "react-router";
import { ShoppingBag, Heart, Star } from "lucide-react";
import { Product } from "../data/products";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useReviews } from "../context/ReviewsContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { isWishlisted, toggleItem } = useWishlist();
  const { getAverageRating, getReviewCount } = useReviews();

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
      size: product.sizes[0],
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleItem(product);
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
      <div className="relative overflow-hidden bg-gray-50">
        {/* Badge */}
        {product.tag && (
          <span
            style={{
              backgroundColor: product.tag === "SALE" ? "#C41E3A" : "#1a1a1a",
              fontFamily: "'Inter', sans-serif",
              letterSpacing: "2px",
            }}
            className="absolute top-3 left-3 z-10 text-white text-xs px-2 py-0.5 uppercase"
          >
            {product.tag}
          </span>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
          title={wishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
        >
          <Heart
            size={14}
            style={{ color: wishlisted ? "#C41E3A" : "#555" }}
            fill={wishlisted ? "#C41E3A" : "none"}
          />
        </button>

        {/* Wishlisted always-visible dot */}
        {wishlisted && (
          <div
            style={{ backgroundColor: "#C41E3A" }}
            className="absolute top-3 right-3 z-10 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center group-hover:hidden"
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

        {/* Quick Add */}
        <button
          onClick={handleQuickAdd}
          style={{ backgroundColor: "#C41E3A", fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
          className="absolute bottom-0 left-0 right-0 py-3 text-white text-xs uppercase tracking-widest flex items-center justify-center gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300"
        >
          <ShoppingBag size={14} />
          Quick Add
        </button>
      </div>

      <div className="mt-3">
        <p
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "0.5px" }}
          className="text-xs text-gray-400 uppercase mb-1"
        >
          {product.category} · {product.collection}
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-900 mb-1">
          {product.name}
        </p>

        {/* Rating */}
        {reviewCount > 0 && (
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={10}
                style={{
                  color: star <= Math.round(avgRating) ? "#C41E3A" : "#e5e5e5",
                  fill: star <= Math.round(avgRating) ? "#C41E3A" : "#e5e5e5",
                }}
              />
            ))}
            <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400 ml-1">
              ({reviewCount})
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-sm">
            ${product.price}
          </span>
          {product.originalPrice && (
            <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
