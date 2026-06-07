import Image from "next/image";

const features = [
    {
        title: "Home",
        subtitle: "Champion Overview",
        description: "Browse all champions with mastery level, points, progress to next level, role badges, and region filters. See per-challenge completion checkmarks and sort by any column.",
        image: null,
    },
    {
        title: "Mastery Dashboard",
        subtitle: "Class Challenge Tracking",
        description: "Per-class bar charts for M7/M10 challenge values, optimal path analysis showing which champions to focus for each class, and the cheapest Mastery 7/10 challenge to complete.",
        image: null,
    },
    {
        title: "Live Lobby Integration",
        subtitle: "Arena & ARAM Companion",
        description: "Real-time champion select overlay for Arena, ARAM, ARURF & ARAM Mayhem. Shows which champions are completed for the active challenge and provides one-click swap/trade buttons.",
        image: null,
    },
    {
        title: "Profile Manager",
        subtitle: "Challenge Icons & Status",
        description: "Select up to three challenge icons to display on your League profile. Set your custom status message and configure regalia border preferences directly from the app.",
        image: null,
    },
    {
        title: "Skin Collection",
        subtitle: "Owned, Loot & Unowned",
        description: "Per-champion skin breakdown with total, owned, loot-available, and unowned counts. See summaries for ultimate, mythic, legendary, legacy, and victorious skin challenges.",
        image: null,
    },
    {
        title: "Eternals Tracker",
        subtitle: "Statstone Progress",
        description: "Track Starter Series, Series 1, and Series 2 eternal progress per champion. Detailed per-eternal progress bars with milestone values, formatted stats, and retirement status.",
        image: null,
    },
    {
        title: "Team Builder",
        subtitle: "Globetrotter & Harmony Filter",
        description: "Filter the champion grid by Globetrotter, Harmony, and Variety's Overrated sub-challenges. Copy the filtered champion list to share with your lobby instantly.",
        image: null,
    },
    {
        title: "Challenge Browser",
        subtitle: "Full Challenge Manager",
        description: "Browse all challenges as cards with progress bars to next tier or Master tier. Create custom tags, assign them to challenges, filter by tags, and browse completion item lists.",
        image: null,
    },
];

export default function Page() {
    return (
        <div className="min-h-screen flex flex-col items-center px-4 py-12 md:py-24">
            <div className="w-full max-w-6xl space-y-24">
                {/* Hero */}
                <section className="text-center space-y-8 max-w-4xl mx-auto">
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-400 to-pink-400 bg-clip-text text-transparent leading-[1.2] pb-6">
                        Crystal
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
                        A desktop companion that connects to your League client to track challenges, mastery, skins, eternals, and more automatically &mdash; no more spreadsheets required!
                    </p>
                    <div className="flex items-center justify-center gap-4 pt-4">
                        <a
                            href="https://github.com/sivir/crystal/releases"
                            target="_blank"
                            className="px-8 py-3.5 bg-gradient-to-r from-cyan-500 to-pink-500 text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 text-base"
                        >
                            Download for Windows
                        </a>
                        <a
                            href="https://github.com/sivir/crystal"
                            target="_blank"
                            className="px-8 py-3.5 border border-border text-foreground font-medium rounded-full hover:bg-muted transition-colors text-base"
                        >
                            Source Code
                        </a>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="space-y-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 shadow-sm hover:shadow-md hover:border-border transition-all duration-300"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{feature.title}</span>
                                        <h3 className="text-lg font-semibold mt-0.5">{feature.subtitle}</h3>
                                    </div>
                                </div>
                                {feature.image ? (
                                    <div className="relative aspect-video w-full overflow-hidden rounded-xl mb-4 bg-muted/40">
                                        <Image src={feature.image} alt={feature.title} fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="aspect-video w-full rounded-xl mb-4 bg-gradient-to-br from-cyan-500/5 to-pink-500/5 border border-border/30 flex items-center justify-center">
                                        <span className="text-xs text-muted-foreground/40">Screenshot</span>
                                    </div>
                                )}
                                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Architecture */}
                <section className="space-y-8 max-w-4xl mx-auto">
                    <div className="text-center space-y-3">
                        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">How it works</h2>
                        <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                            Built with Tauri, React, and Supabase. Data flows from the League Client and Riot API through a single pipeline.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="rounded-xl border border-border/50 bg-card/30 p-5 space-y-2">
                            <div className="text-2xl">&#x1F4E1;</div>
                            <h3 className="font-semibold text-sm">League Client</h3>
                            <p className="text-xs text-muted-foreground">Connects via LCU REST API and WebSocket for real-time challenge, mastery, loot, and champ select data.</p>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card/30 p-5 space-y-2">
                            <div className="text-2xl">&#x2601;&#xFE0F;</div>
                            <h3 className="font-semibold text-sm">Supabase Edge</h3>
                            <p className="text-xs text-muted-foreground">Serverless edge function proxies Riot API requests with 10-minute caching to respect rate limits.</p>
                        </div>
                        <div className="rounded-xl border border-border/50 bg-card/30 p-5 space-y-2">
                            <div className="text-2xl">&#x1F5A5;&#xFE0F;</div>
                            <h3 className="font-semibold text-sm">CommunityDragon</h3>
                            <p className="text-xs text-muted-foreground">CDN for champion icons, skin art, statstone definitions, and challenge metadata.</p>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="text-center space-y-4 pb-8">
                    <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
                        Crystal isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or anyone officially involved in producing or managing Riot Games
                        properties. Riot Games, and all associated properties are trademarks or registered trademarks of Riot Games, Inc.
                    </p>
                </footer>
            </div>
        </div>
    );
}
