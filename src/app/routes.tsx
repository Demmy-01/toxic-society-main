import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Home } from "./pages/Home";
import { Shop } from "./pages/Shop";
import { ProductDetail } from "./pages/ProductDetail";
import { Lookbook } from "./pages/Lookbook";
import { LookbookCampaign } from "./pages/LookbookCampaign";
import { About } from "./pages/About";
import { Drops } from "./pages/Drops";
import { Wishlist } from "./pages/Wishlist";
import { History } from "./pages/History";
import { NotFound } from "./pages/NotFound";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "shop", Component: Shop },
      { path: "product/:id", Component: ProductDetail },
      { path: "lookbook", Component: Lookbook },
      { path: "lookbook/:slug", Component: LookbookCampaign },
      { path: "drops", Component: Drops },
      { path: "wishlist", Component: Wishlist },
      { path: "history", Component: History },
      { path: "about", Component: About },
      { path: "*", Component: NotFound },
    ],
  },
]);
