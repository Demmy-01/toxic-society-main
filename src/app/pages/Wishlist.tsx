import { Link } from "react-router";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { ProductCard } from "../components/ProductCard";
import { Heart, ShoppingBag, ArrowRight } from "lucide-react";

export function Wishlist() {
  const { items, removeItem, totalItems } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (product: (typeof items)[0]) => {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: product.sizes[0],
    });
    removeItem(product.id);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Header */}
      <div style={{ backgroundColor: "#0f0f0f" }} className="py-16 px-4 text-center">
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
          My Wishlist
        </h1>
        <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-gray-400 mt-3 text-sm">
          {totalItems} {totalItems === 1 ? "item" : "items"} saved
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {items.length === 0 ? (
          <div className="text-center py-24">
            <Heart
              size={48}
              className="mx-auto mb-6 text-gray-200"
            />
            <p
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
              className="text-4xl text-gray-200 mb-3"
            >
              Your Wishlist is Empty
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-400 mb-8">
              Save pieces you love and come back to them anytime.
            </p>
            <Link
              to="/shop"
              style={{
                backgroundColor: "#C41E3A",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "3px",
              }}
              className="inline-flex items-center gap-2 text-white px-10 py-4 text-xl hover:bg-red-800 transition-colors"
            >
              <ShoppingBag size={18} />
              Explore Shop
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-100">
              <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-500">
                {totalItems} saved {totalItems === 1 ? "piece" : "pieces"}
              </p>
              <Link
                to="/shop"
                style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }}
                className="text-xs flex items-center gap-1 hover:gap-2 transition-all uppercase tracking-widest"
              >
                Continue Shopping <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {items.map((product) => (
                <div key={product.id} className="group">
                  <ProductCard product={product} />
                  <button
                    onClick={() => handleMoveToCart(product)}
                    style={{
                      backgroundColor: "#C41E3A",
                      fontFamily: "'Inter', sans-serif",
                      letterSpacing: "2px",
                    }}
                    className="w-full mt-2 py-2.5 text-white text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-800 transition-colors"
                  >
                    <ShoppingBag size={13} />
                    Move to Cart
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
