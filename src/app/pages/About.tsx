import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { SEO } from "../components/SEO";
import sweatshirtImg from "../../assets/09743e963667fce523552d94caf5de8bf4cf5241.png";
import beltImg from "../../assets/belt.png";
import { Link } from "react-router";

export function About() {
  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="About"
        description="Born from the underground. Toxic Society makes clothing for those who are quiet enough to be underestimated, and bold enough to be unforgettable. Our story."
        url="/about"
      />
      {/* Hero */}
      <div style={{ backgroundColor: "#0f0f0f" }} className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "6px", color: "#C41E3A" }}
              className="text-xs uppercase mb-6"
            >
              Our Story
            </p>
            <h1
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px", lineHeight: "0.9" }}
              className="text-7xl sm:text-8xl text-white mb-8"
            >
              BORN FROM
              <br />
              THE
              <br />
              <span style={{ color: "#C41E3A" }}>UNDERGROUND</span>
            </h1>
            <p
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-gray-400 text-base leading-relaxed"
            >
              Toxic Society isn't just clothing. It's a signal — worn by those
              who exist in the space between rebellion and restraint. We don't
              shout. We radiate.
            </p>
          </div>
          <div className="relative">
            <ImageWithFallback
              src={sweatshirtImg}
              alt="About Toxic Society"
              className="w-full max-w-sm mx-auto object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>

      {/* Values */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            {
              num: "01",
              title: "Quiet Toxicity",
              body:
                "We don't need to be loud. Our pieces speak for themselves — precise, deliberate, and dangerously calm.",
            },
            {
              num: "02",
              title: "Limited Always",
              body:
                "Every drop is limited. Once it's gone, it's gone. We make for those who move fast and decide with conviction.",
            },
            {
              num: "03",
              title: "Craft First",
              body:
                "From rhinestone flames to barbed wire hardware, every detail is intentional. Nothing is accidental.",
            },
          ].map((v) => (
            <div key={v.num}>
              <p
                style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px", color: "#C41E3A" }}
                className="text-5xl mb-3"
              >
                {v.num}
              </p>
              <h3
                style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
                className="text-2xl text-gray-900 mb-3"
              >
                {v.title}
              </h3>
              <p
                style={{ fontFamily: "'Inter', sans-serif" }}
                className="text-gray-500 text-sm leading-relaxed"
              >
                {v.body}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Belt Feature */}
      <div style={{ backgroundColor: "#f8f8f8" }} className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1">
            <p
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
              className="text-xs uppercase mb-4"
            >
              Accessories
            </p>
            <h2
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px", lineHeight: "1" }}
              className="text-6xl text-gray-900 mb-6"
            >
              THE TS LOGO:
              <br />
              BARBED & BOLD
            </h2>
            <p
              style={{ fontFamily: "'Inter', sans-serif" }}
              className="text-gray-500 text-sm leading-relaxed mb-6"
            >
              The barbed wire logo is the symbol of Toxic Society. Sharp edges.
              Deliberate tension. The logo doesn't ask for attention — it demands
              it. Handcrafted in silver metal hardware on every piece.
            </p>
            <Link
              to="/shop"
              style={{
                backgroundColor: "#C41E3A",
                fontFamily: "'Bebas Neue', cursive",
                letterSpacing: "3px",
              }}
              className="inline-block text-white px-8 py-3 text-lg hover:bg-red-800 transition-colors"
            >
              Shop Accessories
            </Link>
          </div>
          <div className="order-1 lg:order-2 bg-white p-8 flex items-center justify-center aspect-square max-w-md mx-auto w-full shadow-sm">
            <ImageWithFallback
              src={beltImg}
              alt="TS Logo Belt"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ backgroundColor: "#C41E3A" }} className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { num: "2023", label: "Founded" },
              { num: "12", label: "Drops" },
              { num: "10K+", label: "Community" },
              { num: "100%", label: "Limited Runs" },
            ].map((stat) => (
              <div key={stat.label}>
                <p
                  style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
                  className="text-5xl text-white mb-1"
                >
                  {stat.num}
                </p>
                <p
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
                  className="text-xs text-red-200 uppercase"
                >
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
