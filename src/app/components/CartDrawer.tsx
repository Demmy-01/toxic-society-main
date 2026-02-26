import { X, Plus, Minus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { ImageWithFallback } from "./figma/ImageWithFallback";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, totalPrice, isCartOpen, setIsCartOpen } = useCart();

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full z-50 w-full max-w-md bg-white flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} style={{ color: "#C41E3A" }} />
            <span
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
              className="text-xl text-gray-900"
            >
              Your Bag ({items.length})
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="text-gray-400 hover:text-gray-700 transition-colors"
          >
            <X size={22} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-5">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <ShoppingBag size={48} className="text-gray-200" />
              <p
                style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
                className="text-2xl text-gray-300"
              >
                Your bag is empty
              </p>
              <p
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-sm text-gray-400"
              >
                Add some items to get started
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                className="flex gap-4 pb-5 border-b border-gray-100 last:border-0"
              >
                <div className="w-20 h-20 bg-gray-50 overflow-hidden flex-shrink-0">
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <p
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="text-sm text-gray-900 mb-0.5"
                  >
                    {item.name}
                  </p>
                  <p
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="text-xs text-gray-400 mb-2"
                  >
                    Size: {item.size}
                  </p>
                  <div className="flex items-center justify-between">
                    {/* Quantity controls */}
                    <div className="flex items-center border border-gray-200 h-7">
                      <button
                        className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity - 1)
                        }
                      >
                        <Minus size={12} />
                      </button>
                      <span
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="w-7 h-full flex items-center justify-center text-xs text-gray-800 border-x border-gray-200"
                      >
                        {item.quantity}
                      </span>
                      <button
                        className="w-7 h-full flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors"
                        onClick={() =>
                          updateQuantity(item.id, item.size, item.quantity + 1)
                        }
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        style={{ fontFamily: "'Inter', sans-serif" }}
                        className="text-sm text-gray-900"
                      >
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <button
                        onClick={() => removeItem(item.id, item.size)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-6 py-5 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-sm text-gray-500"
              >
                Subtotal
              </span>
              <span
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-base text-gray-900"
              >
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <p
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-xs text-gray-400 mb-4 text-center"
            >
              Shipping & taxes calculated at checkout
            </p>
            <button
              style={{ backgroundColor: "#C41E3A", fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
              className="w-full text-white py-3.5 text-lg hover:bg-red-800 transition-colors"
            >
              Checkout — ${totalPrice.toFixed(2)}
            </button>
            <button
              onClick={() => setIsCartOpen(false)}
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
              className="w-full mt-2 text-xs text-gray-400 uppercase tracking-widest py-2 hover:text-gray-700 transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
