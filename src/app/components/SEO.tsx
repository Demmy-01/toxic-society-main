import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  /** JSON-LD structured data object to embed in the page */
  jsonLd?: Record<string, any>;
}

const SITE_NAME = "Toxic Society";
const DEFAULT_DESCRIPTION =
  "Premium streetwear brand. Shop limited-edition hoodies, tees, cargo pants and accessories. Bold designs. Exclusive drops.";
const BASE_URL = "https://www.toxic-society.com";
const DEFAULT_IMAGE = `${BASE_URL}/og-image.jpg`;

/**
 * Reusable SEO head component — sets title, meta description,
 * Open Graph tags, Twitter card, and optional JSON-LD structured data.
 */
export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  image = DEFAULT_IMAGE,
  url,
  type = "website",
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} — ${SITE_NAME}` : `${SITE_NAME} — Premium Streetwear for the Dangerously Calm`;
  const canonicalUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  );
}
