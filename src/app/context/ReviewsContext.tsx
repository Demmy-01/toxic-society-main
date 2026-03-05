import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;   // ISO string from created_at
  verified: boolean;
}

interface ReviewsContextType {
  reviews: Review[];
  loading: boolean;
  getProductReviews: (productId: string) => Review[];
  addReview: (review: Omit<Review, "id" | "date">) => Promise<void>;
  getAverageRating: (productId: string) => number;
  getReviewCount: (productId: string) => number;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

function dbToReview(row: any): Review {
  return {
    id: row.id,
    productId: row.product_id,
    author: row.author,
    rating: row.rating,
    title: row.title,
    body: row.body,
    date: row.created_at,
    verified: row.verified ?? false,
  };
}

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all reviews once on mount
  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setReviews(data.map(dbToReview));
      }
      setLoading(false);
    };
    load();
  }, []);

  const getProductReviews = useCallback(
    (productId: string) => reviews.filter((r) => r.productId === productId),
    [reviews]
  );

  const addReview = useCallback(async (review: Omit<Review, "id" | "date">) => {
    const { data, error } = await supabase
      .from("reviews")
      .insert({
        product_id: review.productId,
        author: review.author,
        rating: review.rating,
        title: review.title,
        body: review.body,
        verified: review.verified ?? false,
      })
      .select()
      .single();

    if (!error && data) {
      setReviews((prev) => [dbToReview(data), ...prev]);
    }
  }, []);

  const getAverageRating = useCallback(
    (productId: string) => {
      const productReviews = reviews.filter((r) => r.productId === productId);
      if (!productReviews.length) return 0;
      return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    },
    [reviews]
  );

  const getReviewCount = useCallback(
    (productId: string) => reviews.filter((r) => r.productId === productId).length,
    [reviews]
  );

  return (
    <ReviewsContext.Provider
      value={{ reviews, loading, getProductReviews, addReview, getAverageRating, getReviewCount }}
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
