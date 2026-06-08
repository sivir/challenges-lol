import type { Metadata } from "next";
import "./globals.css";
import React from "react";
import { DataProvider } from "@/lib/utils1";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
	title: {
		default: "challenges.lol — League of Legends Challenge Tracker",
		template: "%s | challenges.lol",
	},
	description: "Track League of Legends challenges, champion mastery, and progression. View detailed stats for any player including mastery class challenges, optimal paths, and more.",
	openGraph: {
		title: "challenges.lol — League of Legends Challenge Tracker",
		description: "Track League of Legends challenges, champion mastery, and progression with detailed stats and optimal path analysis.",
		siteName: "challenges.lol",
		type: "website",
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
