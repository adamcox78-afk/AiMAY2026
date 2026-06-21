import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://apexsignal.app";
  const now = new Date();
  const routes = ["", "/pricing", "/dashboard", "/signals", "/watchlist", "/performance", "/alerts", "/briefings"];
  return routes.map((path) => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" ? "weekly" : "daily",
    priority: path === "" ? 1 : 0.7,
  }));
}
