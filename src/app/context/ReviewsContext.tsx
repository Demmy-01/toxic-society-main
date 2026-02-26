import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

export interface Review {
  id: string;
  productId: number;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
}

interface ReviewsContextType {
  reviews: Review[];
  getProductReviews: (productId: number) => Review[];
  addReview: (review: Omit<Review, "id" | "date">) => void;
  getAverageRating: (productId: number) => number;
  getReviewCount: (productId: number) => number;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

const STORAGE_KEY = "ts_reviews";

const seedReviews: Review[] = [
  {
    id: "r1",
    productId: 1,
    author: "Marcus T.",
    rating: 5,
    title: "Unreal quality, turns heads everywhere",
    body: "I wore this to an event last week and got stopped multiple times. The rhinestone flame detail is even more impressive in person. Heavy, structured, and fits perfectly.",
    date: "2025-01-14",
    verified: true,
  },
  {
    id: "r2",
    productId: 1,
    author: "Jade K.",
    rating: 5,
    title: "Worth every penny",
    body: "The crimson is so rich — photos don't do it justice. I sized up for an oversized look and it's perfect. Washing instructions say cold wash only which I appreciate for the embroidery.",
    date: "2025-02-03",
    verified: true,
  },
  {
    id: "r3",
    productId: 1,
    author: "DeShawn M.",
    rating: 4,
    title: "Fire piece, slight delay on shipping",
    body: "The sweatshirt is crazy good. Quality is top tier. Only reason for 4 stars is shipping took a week longer than expected. The piece itself? 10/10.",
    date: "2025-01-28",
    verified: true,
  },
  {
    id: "r4",
    productId: 2,
    author: "Aisha R.",
    rating: 5,
    title: "The belt that completes every fit",
    body: "Bought this on a whim and now I wear it with everything. The silver hardware catches light perfectly. Feels premium and the leather is thick, not flimsy at all.",
    date: "2025-01-09",
    verified: true,
  },
  {
    id: "r5",
    productId: 2,
    author: "Tyler B.",
    rating: 4,
    title: "Statement piece, as described",
    body: "Exactly as advertised. The barbed wire logo is subtle but impactful. Pairs perfectly with the Flame Polo. Would love more color options.",
    date: "2024-12-22",
    verified: false,
  },
  {
    id: "r6",
    productId: 3,
    author: "Zara N.",
    rating: 5,
    title: "The perfect oversized tee",
    body: "Heavyweight cotton, love it. The barbed wire graphic is clean and the sizing runs big which I love for the relaxed look. Washed 4x and the print hasn't cracked.",
    date: "2025-01-18",
    verified: true,
  },
  {
    id: "r7",
    productId: 4,
    author: "Kevin O.",
    rating: 5,
    title: "The cargos to rule them all",
    body: "The flame embroidery on the side seams is so clean. Deep pockets, great zipper quality. I went true to size on the waist and they fit perfectly.",
    date: "2025-02-01",
    verified: true,
  },
  {
    id: "r8",
    productId: 5,
    author: "Priya S.",
    rating: 4,
    title: "Clean cap, great everyday staple",
    body: "The TS embroidery on the front is crisp. Fits snugly and the clasp feels solid. Was slightly sad it sold out in red before I could get it but the standard is great.",
    date: "2025-01-25",
    verified: true,
  },
  {
    id: "r9",
    productId: 6,
    author: "Elijah W.",
    rating: 5,
    title: "Best zip-up I've ever owned",
    body: "The weight of this hoodie is incredible. Screenprint is ultra clean, the barbed wire sleeve graphics make it feel truly unique. Zero regrets on the $219.",
    date: "2025-02-10",
    verified: true,
  },
];

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : seedReviews;
    } catch {
      return seedReviews;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
  }, [reviews]);

  const getProductReviews = useCallback(
    (productId: number) => reviews.filter((r) => r.productId === productId),
    [reviews]
  );

  const addReview = useCallback((review: Omit<Review, "id" | "date">) => {
    const newReview: Review = {
      ...review,
      id: `r_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setReviews((prev) => [newReview, ...prev]);
  }, []);

  const getAverageRating = useCallback(
    (productId: number) => {
      const productReviews = reviews.filter((r) => r.productId === productId);
      if (!productReviews.length) return 0;
      return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    },
    [reviews]
  );

  const getReviewCount = useCallback(
    (productId: number) => reviews.filter((r) => r.productId === productId).length,
    [reviews]
  );

  return (
    <ReviewsContext.Provider
      value={{ reviews, getProductReviews, addReview, getAverageRating, getReviewCount }}
    >
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewsProvider");
  return ctx;
}
