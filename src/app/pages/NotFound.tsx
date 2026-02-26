import { Link } from "react-router";

export function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white text-center px-4">
      <p
        style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px", color: "#C41E3A" }}
        className="text-9xl"
      >
        404
      </p>
      <h1
        style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
        className="text-4xl text-gray-900 mb-4"
      >
        Page Not Found
      </h1>
      <p
        style={{ fontFamily: "'Inter', sans-serif" }}
        className="text-gray-400 text-sm mb-8"
      >
        This page got lost in the underground.
      </p>
      <Link
        to="/"
        style={{
          backgroundColor: "#C41E3A",
          fontFamily: "'Bebas Neue', cursive",
          letterSpacing: "3px",
        }}
        className="text-white px-8 py-3 text-xl hover:bg-red-800 transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}
