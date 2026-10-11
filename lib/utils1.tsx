"use client";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import React, { createContext, useContext, useEffect, useState } from "react";
import { getCatalog } from "@/lib/api";

export type ChallengeData = {
  name: string;
  description: string;
  levelToIconPath: { [x: string]: string };
  thresholds?: { [key: string]: { value: number } };
  tags?: { isCapstone?: string; parent?: string; isCategory?: string; priority?: string };
  source?: string;
  availableIds?: number[];
};

export type TitleMap = { [itemId: number]: string };

export const DataContext = createContext<{data: {challenges: { [a: number]: ChallengeData }}, titles: TitleMap, loading: boolean}>({ data: { challenges: {}}, titles: {}, loading: true });

export const DataProvider = ({children}: Readonly<{children: React.ReactNode;}>) => {
	const [data, setData] = useState({ challenges: {} });
	const [titles, setTitles] = useState<TitleMap>({});
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getCatalog()
			.then((catalog) => {
				const challenges: { [a: number]: ChallengeData } = {};
				for (const [id, c] of Object.entries(catalog.challenges)) {
					challenges[Number(id)] = { ...c, levelToIconPath: c.levelToIconPath ?? {} };
				}
				setData({ challenges });
				setTitles(catalog.titles ?? {});
			})
			.catch((e) => console.error("catalog fetch error:", e))
			.finally(() => setLoading(false));
	}, []);

	return (
		<DataContext.Provider value={{ data, titles, loading }}>
			{children}
		</DataContext.Provider>
	);
}

function highest_level_icon(challenge: { [x: string]: string; }) {
	const levels = ["CHALLENGER", "GRANDMASTER", "MASTER", "DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON"];
	for (const level of levels) {
		console.log(level, challenge[level]);
		if (challenge[level]) {
			return challenge[level];
		}
	}
	return "IRON";
}

export function InlineChallenge({ challenge }: { challenge: number }) {
	const { data, loading } = useContext(DataContext);

	if (loading) {
		return <>Loading...</>;
	}

	if (data.challenges[challenge] === undefined) {
		return <>No data found</>;
	}

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
	                <span className="inline-flex items-center px-1 py-0 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors">
					{/*<span className="inline-flex items-center rounded bg-muted text-muted-foreground">*/}
	                    <Image className="mr-1" src={"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/challenges/" + highest_level_icon(data.challenges[challenge].levelToIconPath).substring(40).toLowerCase()} width={14} height={14} alt="icon"/>
						{data.challenges[challenge].name}
					</span>
				</TooltipTrigger>
				<TooltipContent>
					<p>{data.challenges[challenge].description}</p>
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}