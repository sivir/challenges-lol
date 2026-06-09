import type { Metadata } from "next";
import HomePageClient from "@/components/HomePage";

export const metadata: Metadata = {
	title: "League of Legends Challenge Tracker & Challenges — challenges.lol",
	description: "Track League of Legends challenges, champion mastery, and progression. Search any player to view detailed challenge stats, class challenges, optimal paths, and mastery tracking.",
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "League of Legends Challenge Tracker & Challenges — challenges.lol",
		description: "View detailed League of Legends challenge stats, champion mastery progression, and optimal path analysis for any player.",
	},
};

const jsonLd = {
	"@context": "https://schema.org",
	"@type": "WebApplication",
	name: "challenges.lol",
	url: "https://challenges.lol",
	applicationCategory: "GameApplication",
	operatingSystem: "Any",
	description: "Track League of Legends challenges, champion mastery, and progression. View detailed stats, optimal paths, and class challenge progress for any player.",
	keywords: "League of Legends challenges, League of Legends challenge tracker, LoL challenges, champion mastery",
};

export default function HomePage() {
	return (
		<>
			<script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
			<HomePageClient />
		</>
	);
}
