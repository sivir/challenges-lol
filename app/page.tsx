"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, ArrowRight } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select"
import Link from "next/link";
import dynamic from "next/dynamic";

const CrystalShard = dynamic(() => import("@/components/CrystalShard"), { ssr: false });

const REGIONS = [
  { value: "na", label: "NA" }, { value: "euw", label: "EUW" }, { value: "eune", label: "EUNE" },
  { value: "kr", label: "KR" }, { value: "br", label: "BR" }, { value: "jp", label: "JP" },
  { value: "oc", label: "OC" }, { value: "tr", label: "TR" }, { value: "ru", label: "RU" },
  { value: "la1", label: "LA1" }, { value: "la2", label: "LA2" },
];

export default function HomePage() {
	const router = useRouter();
	const [searchInput, setSearchInput] = useState("");
	const [region, setRegion] = useState("na");

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		const parts = searchInput.trim().split("#");
		if (parts.length !== 2 || !parts[0] || !parts[1]) return;
		router.push(`/user/${encodeURIComponent(parts[0])}/${encodeURIComponent(parts[1])}?region=${region}`);
	};

	return (
		<section className="w-full min-h-[calc(100vh-4rem)] flex items-center justify-center">
			<div className="container px-4 md:px-6 mx-auto">
				<div className="flex flex-col items-center space-y-4 text-center">
					<div className="relative w-full max-w-[200px] aspect-square mb-6 mx-auto">
						<CrystalShard />
					</div>
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
							Welcome to challenges.lol
						</h1>
					</div>
					<form onSubmit={handleSearch} className="w-full max-w-sm space-y-2 mx-auto">
						<div className="flex space-x-2">
							<Select value={region} onValueChange={setRegion}>
								<SelectTrigger className="w-[80px] bg-popover">
									<SelectValue placeholder="Region" />
								</SelectTrigger>
								<SelectContent>
									{REGIONS.map(r => (
										<SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
									))}
								</SelectContent>
							</Select>
							<Input
								className="flex-1 bg-popover"
								placeholder="Player#Tag"
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
							/>
							<Button type="submit" size="icon" variant="secondary" disabled={!searchInput.includes("#")}>
								<Search className="h-4 w-4" />
								<span className="sr-only">Search</span>
							</Button>
						</div>
					</form>
					<div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
						<Button size="lg" asChild>
							<Link href="getting-started">
								Learn About Challenges <ArrowRight className="ml-2 h-4 w-4" />
							</Link>

						</Button>
						<Button
							size="lg"
							className="bg-gradient-to-r from-cyan-400 to-pink-500 text-white hover:from-cyan-600 hover:to-pink-600"
						>
							<Download className="mr-2 h-4 w-4" />
							Download Crystal
						</Button>
					</div>
				</div>
			</div>
		</section>
	)
}