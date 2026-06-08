import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
	const base = "https://challenges.lol";
	return [
		{ url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
		{ url: `${base}/crystal`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
		{ url: `${base}/getting-started`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
	];
}
