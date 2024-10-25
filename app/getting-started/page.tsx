import Image from 'next/image';
import { DataProvider, InlineChallenge } from "@/lib/utils1";

export default function AboutPage() {
	return (
		<div className="container mx-auto px-4 py-8">
			<DataProvider>
			<h1 className="text-3xl font-bold mb-8 text-center">Getting Started with Challenges</h1>

			<div className="space-y-12">
				<section className="flex flex-col md:flex-row items-center md:items-start gap-8">
					<div className="md:w-3/4">
						<h2 className="text-2xl font-semibold mb-4">What are challenges?</h2>
						<p className="text-gray-600 dark:text-gray-300">
							Challenges are a (relatively) new way to show progression on your league account! Some people like grinding challenges to progress their gem, some want titles or challenge tokens to show off on their profile,
							some want to climb the challenge leaderboard. Whatever your reason is, unlike rank, challenge points can never go down! You can find a list of challenges in-game by going to your profile and then clicking the challenges tab.
						</p>
					</div>
					<div className="md:w-1/4 flex justify-center">
						<Image
							src="/what-are-challenges.png"
							alt="Mission illustration"
							width={200}
							height={200}
							className="object-contain"
						/>
					</div>
				</section>

				<section className="flex flex-col md:flex-row-reverse items-center md:items-start gap-8">
					<div className="md:w-3/4">
						<h2 className="text-2xl font-semibold mb-4">How to get challenge points</h2>
						<p className="text-gray-600 dark:text-gray-300">
							Each challenge is worth points based on your tier in the challenge. Most challenges are worth up to 100 points, at master tier. Some challenges can be progressed beyond to grandmaster and challenger tier,
							but reaching those tiers don't give you more points. Some challenges only go up to tiers below master, meaning that the maximum points you can get from that challenge is less than 100.
							You can check how many points you're getting from a particular challenge by the number on the top left. Also, challenges are typically sorted into capstones, which also give points by tier, same as challenges!
						</p>
					</div>
					<div className="md:w-1/4 flex justify-center">
						<Image
							src="/challengepoints.png"
							alt="Challenges illustration"
							width={200}
							height={200}
							className="object-contain"
						/>
					</div>
				</section>

				<section className="flex flex-col md:flex-row items-center md:items-start gap-8">
					<div className="md:w-3/4">
						<h2 className="text-2xl font-semibold mb-4">Which challenges to start with</h2>
						<p className="text-gray-600 dark:text-gray-300">
							There are two different ways to decide which challenge you can get started with right now. First, you can look at the challenges you have available at challenges.darkintaqt.com and see which one you're closest to completing.
							Or, you could try for the challenges that you can concentrate a majority of your efforts on in a game, such as <InlineChallenge challenge={103302}/> or <InlineChallenge challenge={301103}/>. There are also challenges that take a very long time that you should be passively trying to complete.
							<InlineChallenge challenge={402204}/> and <InlineChallenge challenge={402205}/> are usually the ones that most people are left with, although challenges like <InlineChallenge challenge={301302}/> and <InlineChallenge challenge={204101}/> can take quite some time as well if you're not a support main.
						</p>
					</div>
					<div className="md:w-1/4 flex justify-center">
						<Image
							src="https://placehold.co/200/png"
							alt="Community illustration"
							width={200}
							height={200}
							className="object-contain"
						/>
					</div>
				</section>

				<section className="flex flex-col md:flex-row-reverse items-center md:items-start gap-8">
					<div className="md:w-3/4">
						<h2 className="text-2xl font-semibold mb-4">What champions to play</h2>
						<p className="text-gray-600 dark:text-gray-300">
							The hardest challenges to complete by far are the mastery challenges. To complete them all you'd need 100,000 mastery points on 150 different champions, and mastery 10 on a lot of champions per class.
							This means that aside from your highest mastery champion (for the one-trick challenge you need 840k mastery points on a single champion!), you should always be trying to play a champion that you are not yet mastery 10 on.
							If you're getting started with challenges going through the fast clear champions like Shyvana and Karthus are a good idea to get challenges like <InlineChallenge challenge={203403}/> out of the way. If you're trying to play for <InlineChallenge challenge={203407}/> or <InlineChallenge challenge={203408}/>, champions like Warwick with high sustain and early 1v1 potential are really strong
						</p>
					</div>
					<div className="md:w-1/4 flex justify-center">
						<Image
							src="https://placehold.co/200/png"
							alt="Career growth illustration"
							width={200}
							height={200}
							className="object-contain"
						/>
					</div>
				</section>

				<section className="flex flex-col md:flex-row items-center md:items-start gap-8">
					<div className="md:w-3/4">
						<h2 className="text-2xl font-semibold mb-4">Globetrotter and Harmony challenges</h2>
						<p className="text-gray-600 dark:text-gray-300">
							The easiest way to get points is through the Globetrotter and Harmony challenge categories, which require you to play as a 5-stack and win games with certain champion types or regions. Sometimes these challenges can be combined for efficiency as long as players are comfortable on the restricted champion pool.
							These challenges are worth 100 points each at masters and most only require 8-10 wins with the given conditions, making them one of the fastest ways to get points. However, you would need to have 5 people on board, but don't worry there always more challenge enjoyers that are in the same boat as you! Find them at [discord server link]
						</p>
					</div>
					<div className="md:w-1/4 flex justify-center">
						<Image
							src="https://placehold.co/200/png"
							alt="Innovation illustration"
							width={200}
							height={200}
							className="object-contain"
						/>
					</div>
				</section>
			</div>
			</DataProvider>
		</div>
	)
}