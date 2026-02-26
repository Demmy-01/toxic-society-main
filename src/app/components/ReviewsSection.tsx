import { useState } from "react";
import { Star, CheckCircle, ChevronDown, ChevronUp, Edit3 } from "lucide-react";
import { useReviews } from "../context/ReviewsContext";

interface ReviewsSectionProps {
  productId: number;
  productName: string;
}

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          style={{
            color: star <= Math.round(rating) ? "#C41E3A" : "#e5e5e5",
            fill: star <= Math.round(rating) ? "#C41E3A" : "#e5e5e5",
          }}
        />
      ))}
    </div>
  );
}

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
        >
          <Star
            size={22}
            style={{
              color: star <= (hovered || value) ? "#C41E3A" : "#ddd",
              fill: star <= (hovered || value) ? "#C41E3A" : "#ddd",
              transition: "all 0.1s",
            }}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }: { label: string; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-500 w-10 shrink-0">
        {label}
      </span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: "#C41E3A" }}
        />
      </div>
      <span style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400 w-4 text-right shrink-0">
        {count}
      </span>
    </div>
  );
}

export function ReviewsSection({ productId, productName }: ReviewsSectionProps) {
  const { getProductReviews, addReview, getAverageRating, getReviewCount } = useReviews();
  const reviews = getProductReviews(productId);
  const average = getAverageRating(productId);
  const count = getReviewCount(productId);

  const [showForm, setShowForm] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [sortBy, setSortBy] = useState<"recent" | "highest" | "lowest">("recent");

  const [form, setForm] = useState({
    author: "",
    rating: 0,
    title: "",
    body: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    label: `${star}★`,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === "recent") return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === "highest") return b.rating - a.rating;
    return a.rating - b.rating;
  });

  const displayed = showAll ? sortedReviews : sortedReviews.slice(0, 3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author.trim()) { setFormError("Please enter your name."); return; }
    if (form.rating === 0) { setFormError("Please select a rating."); return; }
    if (!form.title.trim()) { setFormError("Please enter a review title."); return; }
    if (!form.body.trim()) { setFormError("Please write your review."); return; }
    setFormError("");
    addReview({ productId, ...form, verified: false });
    setSubmitted(true);
    setForm({ author: "", rating: 0, title: "", body: "" });
    setTimeout(() => { setSubmitted(false); setShowForm(false); }, 3000);
  };

  return (
    <div className="border-t border-gray-100 mt-16 pt-16">
      <div className="flex items-end justify-between mb-10">
        <div>
          <p
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
            className="text-xs uppercase mb-2"
          >
            Customer Reviews
          </p>
          <h2
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
            className="text-5xl text-gray-900"
          >
            What They Say
          </h2>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: "#C41E3A", fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
          className="hidden sm:flex items-center gap-2 text-white px-6 py-3 text-lg hover:bg-red-800 transition-colors"
        >
          <Edit3 size={16} />
          Write a Review
        </button>
      </div>

      {/* Rating Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10 pb-10 border-b border-gray-100">
        <div className="flex flex-col items-center justify-center">
          <div
            style={{ fontFamily: "'Bebas Neue', cursive", color: "#C41E3A" }}
            className="text-7xl leading-none"
          >
            {average > 0 ? average.toFixed(1) : "—"}
          </div>
          <StarDisplay rating={average} size={18} />
          <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400 mt-2">
            {count} {count === 1 ? "review" : "reviews"}
          </p>
        </div>
        <div className="md:col-span-2 flex flex-col justify-center gap-2">
          {ratingDistribution.map((row) => (
            <RatingBar key={row.label} label={row.label} count={row.count} total={count} />
          ))}
        </div>
      </div>

      {/* Write a Review Button (mobile) */}
      <button
        onClick={() => setShowForm(!showForm)}
        style={{ backgroundColor: "#C41E3A", fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
        className="sm:hidden w-full flex items-center justify-center gap-2 text-white py-3 text-lg mb-8 hover:bg-red-800 transition-colors"
      >
        <Edit3 size={16} />
        Write a Review
      </button>

      {/* Review Form */}
      {showForm && (
        <div className="bg-gray-50 p-6 mb-10 border border-gray-100">
          <h3
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
            className="text-2xl text-gray-900 mb-6"
          >
            Review: {productName}
          </h3>
          {submitted ? (
            <div className="flex items-center gap-3 py-4">
              <CheckCircle size={20} style={{ color: "#C41E3A" }} />
              <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-700">
                Thank you! Your review has been submitted.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "1px" }} className="text-xs text-gray-500 uppercase block mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="e.g. Marcus T."
                    style={{ fontFamily: "'Inter', sans-serif" }}
                    className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400 bg-white transition-colors"
                  />
                </div>
                <div>
                  <label style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "1px" }} className="text-xs text-gray-500 uppercase block mb-2">
                    Rating *
                  </label>
                  <StarInput value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} />
                </div>
              </div>
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "1px" }} className="text-xs text-gray-500 uppercase block mb-2">
                  Review Title *
                </label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Sum it up in one line..."
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400 bg-white transition-colors"
                />
              </div>
              <div>
                <label style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "1px" }} className="text-xs text-gray-500 uppercase block mb-2">
                  Your Review *
                </label>
                <textarea
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                  placeholder="Tell us what you think about the quality, fit, and style..."
                  rows={4}
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  className="w-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-gray-400 bg-white transition-colors resize-none"
                />
              </div>
              {formError && (
                <p style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A" }} className="text-xs">
                  {formError}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  type="submit"
                  style={{ backgroundColor: "#C41E3A", fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
                  className="px-8 py-3 text-white text-lg hover:bg-red-800 transition-colors"
                >
                  Submit Review
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ fontFamily: "'Inter', sans-serif", borderColor: "#ddd" }}
                  className="px-8 py-3 text-sm text-gray-500 border hover:border-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Sort */}
      {reviews.length > 0 && (
        <div className="flex items-center justify-between mb-6">
          <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400">
            Showing {displayed.length} of {count} reviews
          </p>
          <div className="flex items-center gap-2">
            <span style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "1px" }} className="text-xs text-gray-400 uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "recent" | "highest" | "lowest")}
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-sm text-gray-700 border-b border-gray-300 bg-transparent outline-none py-1 cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="py-12 text-center">
          <p style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }} className="text-3xl text-gray-200 mb-2">
            No Reviews Yet
          </p>
          <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-400">
            Be the first to share your thoughts.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayed.map((review) => (
            <div key={review.id} className="border-b border-gray-100 pb-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <StarDisplay rating={review.rating} />
                    {review.verified && (
                      <span
                        style={{ fontFamily: "'Inter', sans-serif", color: "#C41E3A", borderColor: "#C41E3A" }}
                        className="text-xs border px-2 py-0.5 flex items-center gap-1"
                      >
                        <CheckCircle size={10} />
                        Verified
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-900">
                    {review.title}
                  </h4>
                </div>
                <div className="text-right shrink-0">
                  <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-500">{review.author}</p>
                  <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-300 mt-0.5">
                    {new Date(review.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
              <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-sm text-gray-500 leading-relaxed">
                {review.body}
              </p>
            </div>
          ))}
        </div>
      )}

      {reviews.length > 3 && (
        <button
          onClick={() => setShowAll(!showAll)}
          style={{ fontFamily: "'Inter', sans-serif", borderColor: "#ddd" }}
          className="mt-8 w-full border py-3 text-sm text-gray-500 flex items-center justify-center gap-2 hover:border-gray-400 transition-colors"
        >
          {showAll ? (
            <><ChevronUp size={14} /> Show Less</>
          ) : (
            <><ChevronDown size={14} /> Show All {count} Reviews</>
          )}
        </button>
      )}
    </div>
  );
}
