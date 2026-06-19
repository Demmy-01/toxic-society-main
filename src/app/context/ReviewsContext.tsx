import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

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
    author: row.author ?? "Anonymous",
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
  const didLoad = useRef(false);

  // Load all reviews from backend
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/v1/reviews`);
      if (!res.ok) {
        console.error("Failed to load reviews:", res.status);
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setReviews(data.map(dbToReview));
      }
    } catch (err) {
      console.error("Error loading reviews:", err);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!didLoad.current) {
      didLoad.current = true;
      fetchReviews();
    }
  }, [fetchReviews]);

  const getProductReviews = useCallback(
    (productId: string) => reviews.filter((r) => r.productId === productId),
    [reviews]
  );

  const addReview = useCallback(async (review: Omit<Review, "id" | "date">) => {
    try {
      const token = localStorage.getItem('ts_token');
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/v1/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          product_id: review.productId,
          author: review.author,
          rating: review.rating,
          title: review.title,
          body: review.body,
          verified: review.verified ?? false,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        console.error("Failed to create review:", errData);
        return;
      }

      const created = await res.json();
      // Add to state immediately
      setReviews((prev) => [dbToReview(created), ...prev]);
    } catch (err) {
      console.error("Error creating review:", err);
      // Fallback: refetch all reviews
      await fetchReviews();
    }
  }, [fetchReviews]);

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
