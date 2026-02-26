import { useParams, Link } from "react-router";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { campaigns } from "./Lookbook";
import { products } from "../data/products";
import { ProductCard } from "../components/ProductCard";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import sweatshirtImg from "../../assets/09743e963667fce523552d94caf5de8bf4cf5241.png";
import beltImg from "../../assets/belt.png";

// imageMap kept for campaign heroImg references
const _unused = { sweatshirtImg, beltImg }; // tree-shaken

const editorialCopy: Record<string, { p1: string; p2: string; quote: string }> = {
  "flame-series": {
    p1:
      "The Flame Series began not in a design studio, but on a rooftop at 3am. The idea was simple: what does it look like when something dangerous is worn with absolute calm? The answer is a crimson polo sweatshirt with rhinestone flames that catch the light of every room you walk into.",
    p2:
      "Shot over two days at an abandoned textile factory, the campaign captures the duality that defines Toxic Society. Rough concrete. Rich fabric. Industrial cold. The warmth of deep crimson. These are not contradictions — they are the brand.",
    quote: "\"Danger looks best when it's effortless.\"",
  },
  "metal-statement": {
    p1:
      "The Metal Statement campaign was shot in a single afternoon — just the object, a concrete surface, and natural light. No models. No set dressing. The TS Logo Leather Belt needed nothing else to speak for itself.",
    p2:
      "Premium red leather. Cold silver barbed wire logo. The belt has become a cult object among Toxic Society's community — worn by those who understand that the right detail transforms any outfit into a statement. It is not decoration. It is language.",
    quote: "\"The right accessory says everything before you speak.\"",
  },
  "edge-culture": {
    p1:
      "FW24 was designed for the in-between spaces — the walk home at midnight, the subway platform, the moments between what you planned and what actually happens. Edge Culture dresses those moments.",
    p2:
      "The Zip-Up Hoodie, Cargo Pants, and Cap were each conceived as standalone pieces that gain power when worn together. Heavyweight fabrics, the Toxic Society flame graphic, and enough pocket space for everything you're carrying — literally and otherwise.",
    quote: "\"You don't wear this. You live in it.\"",
  },
};

export function LookbookCampaign() {
  const { slug } = useParams<{ slug: string }>();
  const campaign = campaigns.find((c) => c.slug === slug);

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }} className="text-5xl text-gray-200 mb-4">
            Campaign Not Found
          </p>
          <Link to="/lookbook" style={{ color: "#C41E3A" }} className="text-sm underline">
            Back to Lookbook
          </Link>
        </div>
      </div>
    );
  }

  const copy = editorialCopy[campaign.slug] || {
    p1: campaign.description,
    p2: "",
    quote: `"${campaign.tagline}"`,
  };

  const campaignProducts = products.filter((p) => campaign.products.includes(p.id));
  const currentIndex = campaigns.findIndex((c) => c.slug === slug);
  const prevCampaign = campaigns[currentIndex - 1];
  const nextCampaign = campaigns[currentIndex + 1];

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden">
        <img
          src={campaign.heroUnsplash}
          alt={campaign.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />
        {/* Back */}
        <Link
          to="/lookbook"
          style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
          className="absolute top-8 left-8 text-white/80 hover:text-white text-xs uppercase flex items-center gap-2 transition-colors"
        >
          <ArrowLeft size={14} />
          Lookbook
        </Link>
        {/* Hero text */}
        <div className="absolute bottom-0 left-0 right-0 p-10 sm:p-16">
          <p
            style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "6px", color: "#C41E3A" }}
            className="text-xs uppercase mb-4"
          >
            {campaign.season} · {campaign.drop}
          </p>
          <h1
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px", lineHeight: "0.9" }}
            className="text-7xl sm:text-9xl text-white mb-4"
          >
            {campaign.name}
          </h1>
          <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-white/70 text-sm max-w-md">
            {campaign.tagline}
          </p>
        </div>
      </div>

      {/* Editorial section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <p
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
              className="text-xs uppercase mb-8"
            >
              The Story
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-gray-600 leading-relaxed text-sm mb-6">
              {copy.p1}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-gray-600 leading-relaxed text-sm">
              {copy.p2}
            </p>
          </div>
          <div className="relative">
            <div className="aspect-[3/4] overflow-hidden">
              <img
                src={campaign.editorialImg}
                alt={`${campaign.name} editorial`}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Red accent */}
            <div
              style={{ backgroundColor: "#C41E3A" }}
              className="absolute -bottom-4 -right-4 w-24 h-24 -z-10"
            />
          </div>
        </div>

        {/* Pull quote */}
        <div
          style={{ borderLeft: "4px solid #C41E3A" }}
          className="pl-8 py-4 my-20 max-w-2xl mx-auto"
        >
          <blockquote
            style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
            className="text-3xl sm:text-4xl text-gray-900"
          >
            {copy.quote}
          </blockquote>
          <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-400 mt-3 uppercase tracking-widest">
            — Toxic Society, {campaign.season}
          </p>
        </div>

        {/* Second image */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-20">
          <div className="md:col-span-2 aspect-[16/9] overflow-hidden">
            <img
              src={campaign.accentImg}
              alt={campaign.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          <div className="flex flex-col justify-center bg-gray-50 p-8">
            <p
              style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
              className="text-xs uppercase mb-4"
            >
              The Collection
            </p>
            <p
              style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "2px" }}
              className="text-3xl text-gray-900 mb-4"
            >
              {campaign.name}
            </p>
            <p style={{ fontFamily: "'Inter', sans-serif" }} className="text-xs text-gray-500 leading-relaxed mb-6">
              {campaign.description}
            </p>
            <Link
              to="/shop"
              style={{ color: "#C41E3A", fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}
              className="text-xs uppercase flex items-center gap-2 hover:gap-4 transition-all"
            >
              Shop Now <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* Featured products */}
      {campaignProducts.length > 0 && (
        <div style={{ backgroundColor: "#0f0f0f" }} className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <p
                style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "4px", color: "#C41E3A" }}
                className="text-xs uppercase mb-3"
              >
                Shop the Campaign
              </p>
              <h2
                style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "4px" }}
                className="text-6xl text-white"
              >
                Featured Pieces
              </h2>
            </div>
            <div className={`grid gap-6 ${campaignProducts.length === 1 ? "max-w-xs mx-auto" : campaignProducts.length === 2 ? "grid-cols-2 max-w-2xl mx-auto" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"}`}>
              {campaignProducts.map((p) => (
                <div key={p.id} className="bg-white">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                to="/shop"
                style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px", backgroundColor: "#C41E3A" }}
                className="inline-flex items-center gap-2 text-white px-10 py-4 text-xl hover:bg-red-800 transition-colors"
              >
                Shop All <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Campaign navigation */}
      <div className="grid grid-cols-2 divide-x divide-gray-100">
        {prevCampaign ? (
          <Link
            to={`/lookbook/${prevCampaign.slug}`}
            className="group relative overflow-hidden aspect-[16/7]"
          >
            <img
              src={prevCampaign.heroUnsplash}
              alt={prevCampaign.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-start justify-center p-8">
              <div className="flex items-center gap-2 mb-2" style={{ color: "#C41E3A", fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}>
                <ArrowLeft size={12} />
                <span className="text-xs uppercase">Previous</span>
              </div>
              <p style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }} className="text-white text-3xl">
                {prevCampaign.name}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
        {nextCampaign ? (
          <Link
            to={`/lookbook/${nextCampaign.slug}`}
            className="group relative overflow-hidden aspect-[16/7]"
          >
            <img
              src={nextCampaign.heroUnsplash}
              alt={nextCampaign.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-60"
            />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/40 transition-colors" />
            <div className="absolute inset-0 flex flex-col items-end justify-center p-8 text-right">
              <div className="flex items-center gap-2 mb-2" style={{ color: "#C41E3A", fontFamily: "'Inter', sans-serif", letterSpacing: "2px" }}>
                <span className="text-xs uppercase">Next</span>
                <ArrowRight size={12} />
              </div>
              <p style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: "3px" }} className="text-white text-3xl">
                {nextCampaign.name}
              </p>
            </div>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
