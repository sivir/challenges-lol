import Image from 'next/image'
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

export default function HomePage() {
	return (
		<section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
			<div className="container px-4 md:px-6 mx-auto">
				<div className="flex flex-col items-center space-y-4 text-center">
					<div className="relative w-full max-w-2xl aspect-video mb-8 mx-auto">
						<Image
							src="https://placehold.co/600x300/png"
							alt="Crystal App"
							width={600}
							height={300}
							className="rounded-lg object-cover shadow-2xl"
							style={{
								transform: 'perspective(1000px) rotateX(5deg)',
								maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
								WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
							}}
						/>
					</div>
					<div className="space-y-2">
						<h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
							Welcome to challenges.lol
						</h1>
					</div>
					<div className="w-full max-w-sm space-y-2 mx-auto">
						<form className="flex space-x-2">
							<Select disabled defaultValue="na">
								<SelectTrigger className="w-[80px] bg-popover">
									<SelectValue placeholder="Region" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="na">NA</SelectItem>
									<SelectItem value="eu">EU</SelectItem>
								</SelectContent>
							</Select>
							<Input disabled
								className="flex-1 bg-popover"
								placeholder="Search challenges or users"
								type="search"
							/>
							<Button disabled type="submit" size="icon" variant="secondary">
								<Search className="h-4 w-4" />
								<span className="sr-only">Search</span>
							</Button>
						</form>
					</div>
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