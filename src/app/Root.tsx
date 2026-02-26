import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { ReviewsProvider } from "./context/ReviewsContext";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Root() {
  return (
    <CartProvider>
      <WishlistProvider>
        <ReviewsProvider>
          <ScrollToTop />
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
            <CartDrawer />
          </div>
        </ReviewsProvider>
      </WishlistProvider>
    </CartProvider>
  );
}
