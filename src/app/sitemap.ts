import type { MetadataRoute } from "next";
import { getCanonicalUrl, portalRoutes } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return portalRoutes.map((route) => ({
    url: getCanonicalUrl(route).toString(),
    lastModified: new Date(),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
