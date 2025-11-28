import "./style.css";
import Image from "next/image";

export default function Page() {
	const features = [
		{
			title: "Challenge Tracking",
			description: "Automatically track your progress across for mastery and champion completion challenges like S- ARAM, S+ Rift, Arena wins, and more",
			image: "/home.png",
		},
		{
			title: "Lobby Integration",
			description: "Integrate with your lobby to show teammate Globetrotter/Harmony progress as well as Arena and ARAM champion challenge completions",
			image: "/lobby.png",
		},
		{
			title: "Skin and Eternals Tracking",
			description: "Track your skin and eternal challenge progress, showing the closest eternals to completion and accounting for skins in loot",
			image: "/skins.png",
		},
		{
			title: "Globetrotter/Harmony Team Builder",
			description: "Build Globetrotter/Harmony teams and copy the champion list for others in your lobby",
			image: "/team.png",
		},
	];

	return (
		<div className="min-h-screen flex flex-col items-center justify-center p-8 md:p-24 space-y-20">
			{/* Hero Section */}
			<div className="text-center space-y-8 max-w-4xl mx-auto z-10">
				<h1 className="text-7xl md:text-9xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 drop-shadow-sm pb-4 leading-tight">
					Crystal	
				</h1>
				<p className="text-2xl md:text-3xl text-slate-600 font-light leading-relaxed max-w-2xl mx-auto">
					The ultimate companion for tracking your League of Legends challenges, skins, and more. 
				</p>
				<div className="pt-4">
					<a href="https://github.com/sivir/crystal/releases" target="_blank" className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-pink-500 text-white text-lg font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
						Download for Windows
					</a>
				</div>
			</div>

			{/* Features Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl z-10">
				{features.map((feature, index) => (
					<div 
						key={index}
						className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/40 bg-white/30 p-8 shadow-xl backdrop-blur-md transition-all hover:scale-[1.02] hover:bg-white/40 hover:shadow-2xl"
					>
						<div className="relative aspect-video w-full overflow-hidden rounded-2xl mb-6 shadow-inner bg-white/50">
							<Image
								src={feature.image}
								alt={feature.title}
								fill
								className="object-cover transition-transform duration-500 group-hover:scale-110"
							/>
						</div>
						<h3 className="text-3xl font-bold text-slate-800 mb-4">{feature.title}</h3>
						<p className="text-slate-600 leading-relaxed text-lg">{feature.description}</p>
					</div>
				))}
			</div>
		</div>
	);
}