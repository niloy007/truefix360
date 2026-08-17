import type { MetadataRoute } from "next";
import { site } from "@/config/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "/",
    "/about",
    "/services",
    "/services/property-preservation",
    "/services/property-maintenance",
    "/coverage",
    "/partners",
    "/vendors",
    "/vendors/apply",
    "/residents",
    "/resident-experience",
    "/get-a-quote",
    "/contact",
    "/privacy",
    "/terms",
    "/accessibility",
    "/faq",
  ];

  return paths.map((path) => ({
    url: `${site.url}${path}`,
    lastModified: new Date(),
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
