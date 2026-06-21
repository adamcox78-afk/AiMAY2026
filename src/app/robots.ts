import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const base = "https://apexsignal.app";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
