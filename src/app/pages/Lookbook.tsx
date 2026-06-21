import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Play } from "lucide-react";
import { SEO } from "../components/SEO";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import flamImg from "../../assets/ts-tshirt-2.jpeg";
import metalImg from "../../assets/86aeade7262b02c7fbb79d4cb1ce30e8984bff4e.png";
import edgeImg from "../../assets/sweatshirt.png";
import edgeEditorialImg from "../../assets/ts-1.jpeg";
import edgeAccentImg from "../../assets/ts-2.jpeg";

export const campaigns = [
  {
    slug: "flame-series",
    name: "FLAME SERIES",
    season: "SS 2025",
    drop: "Drop 03",
    tagline: "Born in fire. Worn in calm.",
    description:
      "The Flame Series channels the paradox at the heart of Toxic Society — destructive beauty, refined rage. Shot on location at an abandoned industrial site, the campaign captures what it means to carry chaos gracefully.",
    heroImg: flamImg,
    heroUnsplash: flamImg,
    editorialImg: "https://images.unsplash.com/photo-1768742466928-7eb18e2fcb6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    accentImg: "https://images.unsplash.com/photo-1528588301474-23126537236b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
    color: "#C41E3A",
    products: [1],
    featured: true,
  },
  {
    slug: "metal-statement",
    name: "METAL STATEMENT",
    season: "Core",
    drop: "Drop 01",
    tagline: "Hardware that speaks louder than words.",
    description:
      "Our accessories campaign strips everything back to the object itself — raw leather, cold metal, and the Toxic Society logo as the only language needed. Minimalism with maximum edge.",
    heroImg: metalImg,
    heroUnsplash: metalImg,
    editorialImg: "https://images.unsplash.com/photo-1528588301474-23126537236b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200",
    accentImg: "https://images.unsplash.com/photo-1768742466928-7eb18e2fcb6c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=900",
    color: "#1a1a1a",
    products: [2],
    featured: false,
  },
  {
    slug: "edge-culture",
    name: "EDGE CULTURE",
    season: "FW 2024",
    drop: "Drop 02",
    tagline: "Where calm meets the abyss.",
    description:
      "FW24 explores the tension between city life and inner silence. Heavy fabrics, muted color, and the signature Toxic Society flame graphic printed across outerwear that's built for the coldest nights.",
    heroImg: edgeImg,
    heroUnsplash: edgeImg,
    editorialImg: edgeEditorialImg,
    accentImg: edgeAccentImg,
    color: "#C41E3A",
    products: [4, 5, 6],
    featured: false,
  },
];

export function Lookbook() {
  const [activeTab, setActiveTab] = useState("all");
  const featured = campaigns.find((c) => c.featured)!;
  const rest = campaigns.filter((c) => !c.featured);

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title="Lookbook"
        description="Explore Toxic Society's seasonal lookbook campaigns. Editorial photography showcasing our streetwear collections and the culture behind the brand."
        url="/lookbook"
      />
      {/* Header */}
      <div style={{ backgroundColor: "#0f0f0f" }} className="py-20 text-center px-4">
        <p
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "6px", color: "#C41E3A" }}
          className="text-xs uppercase mb-4"
        >
          SS 2025
        </p>
        <h1
          style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "6px", lineHeight: "0.9" }}
          className="text-7xl sm:text-9xl text-white"
        >
          LOOK
          <br />
          <span style={{ color: "#C41E3A" }}>BOOK</span>
        </h1>
        <p
          style={{ fontFamily: "'Inter', sans-serif" }}
          className="text-gray-400 mt-6 max-w-md mx-auto text-sm leading-relaxed"
        >
          Season after season, Toxic Society pushes the boundary between calm and chaos.
          This is how we wear it.
        </p>
      </div>

      {/* Tab nav */}
      <div className="border-b border-gray-100 sticky top-0 bg-white z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8 overflow-x-auto">
            {["all", ...campaigns.map((c) => c.slug)].map((tab) => {
              const label =
                tab === "all"
                  ? "All Campaigns"
                  : campaigns.find((c) => c.slug === tab)?.name ?? tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    letterSpacing: "2px",
                    color: activeTab === tab ? "#C41E3A" : "#999",
                    borderBottom: activeTab === tab ? "2px solid #C41E3A" : "2px solid transparent",
                  }}
                  className="text-xs uppercase py-4 whitespace-nowrap transition-colors"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Featured hero campaign */}
        {(activeTab === "all" || activeTab === featured.slug) && (
          <Link
            to={`/lookbook/${featured.slug}`}
            className="group block mb-16 relative overflow-hidden"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative aspect-[4/5] lg:aspect-auto lg:min-h-[600px] overflow-hidden bg-gray-100">
                <img
                  src={featured.heroUnsplash}
                  alt={featured.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-all duration-300" />
                {/* red bar */}
                <div
                  style={{ backgroundColor: "#C41E3A" }}
                  className="absolute top-0 left-0 bottom-0 w-1 scale-y-0 group-hover:scale-y-100 transition-transform duration-500 origin-top"
                />
              </div>
              <div
                style={{ backgroundColor: "#0f0f0f" }}
                className="flex flex-col justify-center p-10 lg:p-16"
              >
                <span
                  style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
                  className="text-xs uppercase mb-4"
                >
                  {featured.season} · {featured.drop}
                </span>
                <h2
                  style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px", lineHeight: "0.95" }}
                  className="text-6xl lg:text-7xl text-white mb-6"
                >
                  {featured.name}
                </h2>
                <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-gray-400 text-sm leading-relaxed mb-10 max-w-sm">
                  {featured.tagline}
                </p>
                <div
                  style={{ color: "#C41E3A", fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
                  className="flex items-center gap-2 text-xs uppercase group-hover:gap-4 transition-all"
                >
                  View Campaign <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Other campaigns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {(activeTab === "all" ? rest : campaigns.filter((c) => c.slug === activeTab && !c.featured)).map(
            (campaign) => (
              <Link
                key={campaign.slug}
                to={`/lookbook/${campaign.slug}`}
                className="group block relative overflow-hidden bg-gray-50"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img
                    src={campaign.heroUnsplash}
                    alt={campaign.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-all duration-300" />
                  {/* red line top */}
                  <div
                    style={{ backgroundColor: "#C41E3A" }}
                    className="absolute top-0 left-0 right-0 h-1 scale-x-0 group-hover:scale-x-100 transition-transform duration-400 origin-left"
                  />
                  {/* Content overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <span
                      style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
                      className="text-xs uppercase block mb-2"
                    >
                      {campaign.season} · {campaign.drop}
                    </span>
                    <h3
                      style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
                      className="text-white text-4xl mb-1"
                    >
                      {campaign.name}
                    </h3>
                    <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-gray-300 text-xs">
                      {campaign.tagline}
                    </p>
                    <div
                      style={{ color: "#C41E3A", fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
                      className="flex items-center gap-2 text-xs uppercase mt-4 group-hover:gap-4 transition-all"
                    >
                      View Campaign <ArrowRight size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            )
          )}
        </div>

        {/* If single campaign selected, show its content inline */}
        {activeTab !== "all" && (() => {
          const c = campaigns.find((x) => x.slug === activeTab);
          if (!c) return null;
          return (
            <div className="mt-12 text-center">
              <Link
                to={`/lookbook/${c.slug}`}
                style={{ backgroundColor: "#C41E3A", fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }}
                className="inline-flex items-center gap-2 text-white px-10 py-4 text-xl hover:bg-red-800 transition-colors"
              >
                Enter Campaign <ArrowRight size={18} />
              </Link>
            </div>
          );
        })()}
      </div>

      {/* CTA */}
      <div style={{ backgroundColor: "#C41E3A" }} className="py-16 text-center px-4">
        <h2
          style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
          className="text-5xl text-white mb-4"
        >
          WEAR THE CULTURE
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-red-200 mb-8 max-w-sm mx-auto text-sm">
          Every piece from the lookbook is available to shop now.
        </p>
        <Link
          to="/shop"
          style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px", backgroundColor: "white", color: "#C41E3A" }}
          className="inline-block px-10 py-3 text-xl hover:bg-gray-100 transition-colors"
        >
          Shop The Collection
        </Link>
      </div>
    </div>
  );
}
