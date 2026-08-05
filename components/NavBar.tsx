"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function DisabledNavItem({ label, className }: { label: string; className?: string }) {
    return (
        <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
                <span className={cn("text-sm font-medium text-muted-foreground cursor-not-allowed select-none", className)}>
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
    const pathname = usePathname();
    const [searchInput, setSearchInput] = useState("");
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        setMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (!menuOpen) return;
        const onResize = () => {
            if (window.matchMedia("(min-width: 1024px)").matches) setMenuOpen(false);
        };
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, [menuOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const parts = searchInput.trim().split("#");
        if (parts.length !== 2 || !parts[0] || !parts[1]) return;
        router.push(`/user/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}`);
        setSearchInput("");
        setMenuOpen(false);
    };

    const closeMenu = () => setMenuOpen(false);

    return (
        <TooltipProvider>
            <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95">
                <div className="container mx-auto flex h-16 items-center gap-3 px-4">
                    <div className="flex items-center gap-6 lg:gap-10 shrink-0 min-w-0">
                        <Link href="/" className="flex items-center space-x-2 shrink-0">
                            <span className="inline-block font-bold text-xl">challenges.lol</span>
                        </Link>
                        <nav className="hidden lg:flex gap-6">
                            <DisabledNavItem label="Challenges" />
                            <DisabledNavItem label="Leaderboards" />
                            <Link href="/crystal" className="text-sm font-bold bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
                                Crystal
                            </Link>
                        </nav>
                    </div>

                    <div className="flex flex-1 justify-center min-w-0 px-2">
                        {pathname !== "/" && (
                            <form onSubmit={handleSearch} className="flex items-center gap-1 w-full max-w-[280px]">
                                <Input
                                    placeholder="Player#Tag"
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                    className="w-full h-9 text-sm"
                                />
                                <Button type="submit" size="icon" variant="ghost" className="h-9 w-9 shrink-0" disabled={!searchInput.includes("#")}>
                                    <Search className="h-4 w-4" />
                                </Button>
                            </form>
                        )}
                    </div>

                    <div className="flex items-center justify-end gap-2 shrink-0">
                        <nav className="hidden lg:flex gap-6">
                            <DisabledNavItem label="Team Builder" />
                            <DisabledNavItem label="Wiki" />
                            <Link href="/getting-started" className="text-sm font-medium transition-colors hover:text-primary">
                                Getting Started
                            </Link>
                            <DisabledNavItem label="About" />
                        </nav>
                        <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="lg:hidden h-9 w-9 shrink-0"
                            aria-label={menuOpen ? "Close menu" : "Open menu"}
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {menuOpen && (
                    <div className="lg:hidden border-t bg-background/95">
                        <div className="container mx-auto flex flex-col gap-1 px-4 py-3">
                            <DisabledNavItem label="Challenges" className="px-2 py-2" />
                            <DisabledNavItem label="Leaderboards" className="px-2 py-2" />
                            <Link
                                href="/crystal"
                                onClick={closeMenu}
                                className="px-2 py-2 text-sm font-bold bg-gradient-to-r from-cyan-500 to-pink-500 bg-clip-text text-transparent"
                            >
                                Crystal
                            </Link>
                            <div className="my-1 h-px bg-border" />
                            <DisabledNavItem label="Team Builder" className="px-2 py-2" />
                            <DisabledNavItem label="Wiki" className="px-2 py-2" />
                            <Link href="/getting-started" onClick={closeMenu} className="px-2 py-2 text-sm font-medium transition-colors hover:text-primary">
                                Getting Started
                            </Link>
                            <DisabledNavItem label="About" className="px-2 py-2" />
                        </div>
                    </div>
                )}
            </header>
        </TooltipProvider>
    );
}
