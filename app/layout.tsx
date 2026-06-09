import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { DataProvider } from "@/lib/utils1";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
	metadataBase: new URL("https://challenges.lol"),
	title: {
		default: "League of Legends Challenge Tracker — challenges.lol",
		template: "%s | challenges.lol",
	},
	description: "Track your League of Legends challenges, champion mastery, and progression. View detailed player stats, mastery class challenges, and optimal progression paths.",
	keywords: ["league of legends challenges", "league of legends challenge tracker", "lol challenges", "champion mastery tracker", "lol progression tracker"],
	alternates: {
		canonical: "/",
	},
	openGraph: {
		title: "League of Legends Challenge Tracker — challenges.lol",
		description: "Track your League of Legends challenges, champion mastery, and progression with detailed player stats, mastery class challenges, and optimal progression paths.",
		siteName: "challenges.lol",
		type: "website",
		url: "https://challenges.lol",
	},
	twitter: {
		card: "summary_large_image",
	},
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<html lang="en">
			<body className="min-h-screen bg-background text-foreground">
				<DataProvider>
				<div className="min-h-screen">
					{/* Background pattern */}
					<div
						className="fixed inset-0 z-0 pointer-events-none"
						style={{
							backgroundImage: `radial-gradient(circle, rgba(0,0,0,0.1) 1px, transparent 1px)`,
							backgroundSize: '20px 20px',
							maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
							WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)'
						}}
					/>

					<NavBar />

					{/* Main Content */}
					<main className="flex-1 relative z-10 h-full">
						{children}
					</main>
				</div>
				</DataProvider>
			</body>
		</html>
	);
}
