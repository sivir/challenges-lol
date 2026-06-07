"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

function DisabledNavItem({ label }: { label: string }) {
    return (
        <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
                <span className="text-sm font-medium text-muted-foreground cursor-not-allowed select-none">
                    {label}
                </span>
            </TooltipTrigger>
            <TooltipContent side="bottom">
                <p>Coming soon</p>
            </TooltipContent>
        </Tooltip>
    );
}

export default function NavBar() {
    const router = useRouter();
    const [searchInput, setSearchInput] = useState("");

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const parts = searchInput.trim().split("#");
        if (parts.length !== 2 || !parts[0] || !parts[1]) return;
        router.push(`/user/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`);
        setSearchInput("");
    };

    return (
        <TooltipProvider>
            <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
                <div className="container flex h-16 items-center justify-between mx-auto">
                    <div className="flex items-center gap-6 md:gap-10">
                        <Link href="/" className="flex items-center space-x-2">
                            <span className="inline-block font-bold text-xl">challenges.lol</span>
                        </Link>
                        <nav className="flex gap-6">
                            <DisabledNavItem label="Challenges" />
                            <DisabledNavItem label="Leaderboards" />
                            <Link href="/crystal" className="text-sm font-bold bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                                Crystal
                            </Link>
                        </nav>
                    </div>
                    <div className="flex items-center gap-6 md:gap-10">
                        <form onSubmit={handleSearch} className="flex items-center gap-1">
                            <Input
                                placeholder="Player#Tag"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="w-[160px] h-8 text-xs"
                            />
                            <Button type="submit" size="icon" variant="ghost" className="h-8 w-8" disabled={!searchInput.includes("#")}>
                                <Search className="h-4 w-4" />
                            </Button>
                        </form>
                        <nav className="flex gap-6">
                            <DisabledNavItem label="Team Builder" />
                            <DisabledNavItem label="Wiki" />
                            <Link href="/getting-started" className="text-sm font-medium transition-colors hover:text-primary">
                                Getting Started
                            </Link>
                            <DisabledNavItem label="About" />
                        </nav>
                    </div>
                </div>
            </header>
        </TooltipProvider>
    );
}
