"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Bar, BarChart, ReferenceLine, ResponsiveContainer, Text, XAxis, YAxis } from "recharts";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { getUserData, RiotChallengeEntry, RiotData, levels, get_level_color, get_progress_color } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { DataContext, ChallengeData } from "@/lib/utils1";
import { build_mastery_class_data, compute_optimal_paths, points_to_target_level, type ChallengeThresholds } from "@/lib/optimal-path";

function challenge_icon_url(challenge: ChallengeData, level?: string): string {
    const icon_path =
        level && challenge.levelToIconPath[level]
            ? challenge.levelToIconPath[level]
            : (() => {
                  const order = ["CHALLENGER", "GRANDMASTER", "MASTER", "DIAMOND", "PLATINUM", "GOLD", "SILVER", "BRONZE", "IRON"];
                  for (const l of order) {
                      if (challenge.levelToIconPath[l]) return challenge.levelToIconPath[l];
                  }
                  return "";
              })();
    if (!icon_path) return "";
    const filename = icon_path.substring(40).toLowerCase();
    return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/assets/challenges/${filename}`;
}

function ChallengeSummary({ challenge, entry }: { challenge: ChallengeData; entry: RiotChallengeEntry }) {
    const next_level_index = levels.indexOf(entry.level) + 1;
    const next_level = next_level_index < levels.length ? levels[next_level_index] : "CHALLENGER";
    const thresholds = challenge.thresholds;
    const next_threshold = thresholds?.[next_level]?.value || thresholds?.MASTER?.value || entry.value || 1;

    const shown_levels = levels.filter((l) => l !== "NONE" && thresholds?.[l]?.value != null);

    return (
        <HoverCard openDelay={150} closeDelay={0}>
            <HoverCardTrigger asChild>
                <div className="cursor-help">
                    <div className="font-semibold text-sm truncate">{challenge.name}</div>
                </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80 space-y-3" align="start">
                <div className="space-y-1">
                    <div className={`text-sm font-semibold ${get_level_color(entry.level)}`}>{challenge.name}</div>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{challenge.description}</p>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Current progress</span>
                    <span className={get_level_color(entry.level)}>{entry.level}</span>
                </div>
                <div className="text-sm font-medium">{entry.value.toLocaleString()}</div>
                <div className="space-y-2">
                    <div className="text-xs font-medium text-muted-foreground">Tier thresholds</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                        {shown_levels.map((level) => (
                            <div key={level} className="contents">
                                <span className={get_level_color(level)}>{level}</span>
                                <span className="text-right text-muted-foreground">{thresholds![level]!.value.toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </HoverCardContent>
        </HoverCard>
    );
}

const level_colors: Record<string, string> = {
    IRON: "#a8a29e",
    BRONZE: "#b45309",
    SILVER: "#cbd5e1",
    GOLD: "#facc15",
    PLATINUM: "#5eead4",
    DIAMOND: "#60a5fa",
    MASTER: "#a78bfa",
    GRANDMASTER: "#f87171",
    CHALLENGER: "#fbbf24",
};

const CLASSES = ["Assassin", "Fighter", "Mage", "Marksman", "Support", "Tank"];
const M7_IDS = [401201, 401202, 401203, 401204, 401205, 401206];
const M10_IDS = [401207, 401208, 401209, 401210, 401211, 401212];
const HEADLINE_IDS = [401104, 401105, 401107, 401102, 401103, 401101];

type ProgressMode = "next" | "master";
type SortBy = "name" | "progress";
type SortDirection = "asc" | "desc";

export default function UserPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const gameName = decodeURIComponent(params.gameName as string);
    const tagLine = decodeURIComponent(params.tagLine as string);
    const region = searchParams.get("region") || "na";
    const riotId = `${gameName}#${tagLine}`;

    const { data, titles, loading: challengesLoading } = useContext(DataContext);
    const [riotData, setRiotData] = useState<RiotData | null>(null);
    const [actualName, setActualName] = useState(gameName);
    const [actualTag, setActualTag] = useState(tagLine);
    const [detectedRegion, setDetectedRegion] = useState(region);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [fetching, setFetching] = useState(true);

    const [search, set_search] = useState("");
    const [sort_by, set_sort_by] = useState<SortBy>("progress");
    const [sort_order, set_sort_order] = useState<SortDirection>("desc");
    const [progress_mode, set_progress_mode] = useState<ProgressMode>("next");
    const [hide_completed, set_hide_completed] = useState(true);
    const [hide_capstone, set_hide_capstone] = useState(true);
    const [hide_legacy, set_hide_legacy] = useState(true);
    const [tab, setTab] = useState<"challenges" | "mastery" | "skins" | "eternals">("challenges");
    const [masteryData, setMasteryData] = useState<any[]>([]);
    const [summonerData, setSummonerData] = useState<{
        profileIconId: number;
        summonerLevel: number;
    } | null>(null);
    const [championNames, setChampionNames] = useState<Map<number, string>>(new Map());
    const [classChampionIds, setClassChampionIds] = useState<Map<string, number[]>>(new Map());
    const [championRegion, setChampionRegion] = useState<Map<number, string>>(new Map());
    const [selectedClass, setSelectedClass] = useState("all");
    const [selectedRegion, setSelectedRegion] = useState("all");
    const [goalMode, setGoalMode] = useState<"max" | "m10" | "m7" | "m5" | "next">("max");
    const [masteryFilter, setMasteryFilter] = useState<"none" | "m5" | "m7" | "m10" | "custom">("none");
    const [customMasteryPoints, setCustomMasteryPoints] = useState("100000");

    const globetrotter_regions: { [key: number]: string } = {
        303501: "Bandle City",
        303502: "Bilgewater",
        303503: "Demacia",
        303504: "Freljord",
        303505: "Ionia",
        303506: "Ixtal",
        303507: "Noxus",
        303508: "Piltover",
        303509: "Shadow Isles",
        303510: "Shurima",
        303511: "Targon",
        303512: "Void",
        303513: "Zaun",
    };
    const regions = Object.values(globetrotter_regions);

    useEffect(() => {
        setFetching(true);
        setFetchError(null);
        getUserData(riotId, region)
            .then((result) => {
                if (!result) {
                    setFetchError("Failed to load player data. Check the Riot ID and region.");
                    return;
                }
                setRiotData(result.riot_data);
                setMasteryData(result.mastery_data || []);
                setSummonerData(result.summoner_data || null);
                if (result.gameName) setActualName(result.gameName);
                if (result.tagLine) setActualTag(result.tagLine);
                if (result.region) setDetectedRegion(result.region);
            })
            .catch(() => setFetchError("An error occurred while fetching data."))
            .finally(() => setFetching(false));
    }, [riotId, region]);

    useEffect(() => {
        document.title = `${actualName}#${actualTag} challenge data`;
    }, [actualName, actualTag]);

    useEffect(() => {
        fetch("https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json")
            .then((res) => res.json())
            .then((data: any[]) => {
                const names = new Map<number, string>();
                const class_map = new Map<string, number[]>();
                CLASSES.forEach((c) => class_map.set(c, []));
                for (const champ of data) {
                    if (champ.id > 0 && champ.id < 3000) {
                        names.set(champ.id, champ.name);
                        for (const role of champ.roles ?? []) {
                            const normalized = role.charAt(0).toUpperCase() + role.slice(1);
                            if (class_map.has(normalized)) {
                                class_map.get(normalized)!.push(champ.id);
                            }
                        }
                    }
                }
                setChampionNames(names);
                setClassChampionIds(class_map);
            })
            .catch((e) => console.error("champion-summary fetch error:", e));
    }, []);

    useEffect(() => {
        if (challengesLoading || !data.challenges) return;
        const map = new Map<number, string>();
        for (const [id, region_name] of Object.entries(globetrotter_regions)) {
            const ch = data.challenges[Number(id)];
            if (ch?.availableIds) {
                for (const cid of ch.availableIds) {
                    if (!map.has(cid)) map.set(cid, region_name);
                }
            }
        }
        setChampionRegion(map);
    }, [data.challenges, challengesLoading]);

    const merged_challenges = useMemo(() => {
        if (!riotData || challengesLoading) return [];
        const challenge_map = data.challenges;
        const user_challenges_map = new Map(riotData.challenges.map((c) => [c.challengeId, c]));

        return Object.entries(challenge_map)
            .map(([id, challenge]) => {
                const entry = user_challenges_map.get(Number(id));
                return { id: Number(id), challenge, entry };
            })
            .filter((x) => x.entry)
            .sort((a, b) => {
                const a_idx = levels.indexOf(a.entry!.level);
                const b_idx = levels.indexOf(b.entry!.level);
                if (a_idx !== b_idx) return a_idx - b_idx;
                return a.challenge.name.localeCompare(b.challenge.name);
            });
    }, [riotData, data.challenges, challengesLoading]);

    const get_challenge_progress = (challenge: ChallengeData, entry: RiotChallengeEntry, mode: ProgressMode) => {
        const next_level_index = levels.indexOf(entry.level) + 1;
        const next_level = next_level_index < levels.length ? levels[next_level_index] : "CHALLENGER";
        const master_threshold = challenge.thresholds?.MASTER?.value;
        const next_threshold = challenge.thresholds?.[next_level]?.value || master_threshold || entry.value || 1;
        const target_threshold = mode === "master" ? master_threshold || next_threshold : next_threshold;
        const progress = Math.min((entry.value / target_threshold) * 100, 100);
        return {
            progress,
            target_threshold,
            target_label: mode === "master" ? "MASTER" : next_level,
        };
    };

    const classData = useMemo(() => {
        if (!riotData || classChampionIds.size === 0 || masteryData.length === 0) return [];
        const mastery_by_champion = new Map(masteryData.map((m: any) => [m.championId, m]));
        const m7_current = new Map<number, number>();
        const m7_thresholds = new Map<number, ChallengeThresholds>();
        const m10_current = new Map<number, number>();
        const m10_thresholds = new Map<number, ChallengeThresholds>();
        for (const id of M7_IDS) {
            const entry = riotData.challenges.find((c) => c.challengeId === id);
            const def = data.challenges[id];
            m7_current.set(id, entry?.value ?? 0);
            m7_thresholds.set(id, (def?.thresholds ?? {}) as ChallengeThresholds);
        }
        for (const id of M10_IDS) {
            const entry = riotData.challenges.find((c) => c.challengeId === id);
            const def = data.challenges[id];
            m10_current.set(id, entry?.value ?? 0);
            m10_thresholds.set(id, (def?.thresholds ?? {}) as ChallengeThresholds);
        }
        return build_mastery_class_data({
            classes: CLASSES,
            m7_ids: M7_IDS,
            m10_ids: M10_IDS,
            class_champion_ids: classChampionIds,
            mastery_by_champion,
            champion_names: championNames,
            m7_challenge_current: m7_current,
            m7_challenge_thresholds: m7_thresholds,
            m10_challenge_current: m10_current,
            m10_challenge_thresholds: m10_thresholds,
        });
    }, [riotData, masteryData, classChampionIds, championNames, data.challenges]);

    const optimalPath = useMemo(() => {
        return compute_optimal_paths(classData);
    }, [classData]);

    const masterEffort = useMemo(() => {
        if (classData.length === 0 || masteryData.length === 0 || !optimalPath) return null;

        const path_ids = new Set(optimalPath.m10.champions.map((c) => c.id));
        const all_champions: {
            id: number;
            mastery_level: number;
            mastery_points: number;
            championPointsUntilNextLevel: number;
        }[] = masteryData.map((m: any) => ({
            id: m.championId,
            mastery_level: m.championLevel,
            mastery_points: m.championPoints,
            championPointsUntilNextLevel: m.championPointsUntilNextLevel,
        }));

        const m10_threshold = 75600;
        const effective_sort_val = (c: any) => path_ids.has(c.id) ? Math.max(c.mastery_points, m10_threshold) : c.mastery_points;
        const effective_sorted = [...all_champions].sort((a, b) => effective_sort_val(b) - effective_sort_val(a));
        const assigned = new Set<number>();
        const total_slots = 150;

        // Path champions - M10 effort (independent of Catch 'Em All)
        let rest_to_m10_needed = 0;
        for (const c of all_champions) {
            if (path_ids.has(c.id)) {
                rest_to_m10_needed += points_to_target_level(c.mastery_level, c.championPointsUntilNextLevel, 10);
            }
        }

        // Fill top 150 by effective points (path champs floored at M10)
        let catch_em_all_needed = 0;
        for (const c of effective_sorted) {
            if (assigned.size >= total_slots) break;
            assigned.add(c.id);
            const effective = effective_sort_val(c);
            catch_em_all_needed += Math.max(0, 100000 - effective);
        }

        // #1 - One Trick
        const top_all = effective_sorted[0];
        const top_champ_points = top_all?.mastery_points ?? 0;
        const one_trick_needed = Math.max(0, 840000 - top_champ_points);
        const one_trick_target_id = top_all?.id ?? 0;

        const catch_em_all_current = all_champions.filter((c) => c.mastery_points >= 100000).length;
        const count = assigned.size;

        return {
            total: catch_em_all_needed + rest_to_m10_needed + one_trick_needed,
            catch_em_all_needed,
            rest_to_m10_needed,
            one_trick_needed,
            count,
            path_total: optimalPath.m10.total_champions,
            top_champ_points,
            one_trick_target_id,
            catch_em_all_current,
            catch_em_all_target: 150,
            one_trick_target: 840000,
        };
    }, [classData, masteryData, optimalPath]);

    const champion_targets = useMemo(() => {
        const targets = new Map<number, { target: number; progress: number; label: string }>();
        if (!masteryData.length) return targets;
        const mp = [0, 1800, 4200, 6600, 9000, 10000, 11000, 11000, 11000];
        const total_to = (lvl: number) => {
            let s = 0;
            for (let i = 0; i < lvl; i++) s += mp[i] ?? 11000;
            return s;
        };
        const sorted = [...masteryData].sort((a: any, b: any) => b.championPoints - a.championPoints);

        if (goalMode === "next") {
            sorted.forEach((entry: any) => {
                const pts = entry.championPoints ?? 0;
                const remaining = entry.championPointsUntilNextLevel;
                if (remaining == null || remaining <= 0) {
                    targets.set(entry.championId, { target: pts, progress: 1, label: "MAX" });
                } else {
                    const target = pts + remaining;
                    targets.set(entry.championId, {
                        target,
                        progress: Math.min(pts / target, 1),
                        label: `M${entry.championLevel + 1}`,
                    });
                }
            });
            return targets;
        }
        if (goalMode === "m5") {
            const total = total_to(5);
            sorted.forEach((entry: any) => {
                targets.set(entry.championId, {
                    target: total,
                    progress: Math.min((entry.championPoints ?? 0) / total, 1),
                    label: "M5",
                });
            });
            return targets;
        }
        if (goalMode === "m7") {
            const total = total_to(7);
            sorted.forEach((entry: any) => {
                targets.set(entry.championId, {
                    target: total,
                    progress: Math.min((entry.championPoints ?? 0) / total, 1),
                    label: "M7",
                });
            });
            return targets;
        }
        if (goalMode === "m10") {
            const total = total_to(10);
            sorted.forEach((entry: any) => {
                targets.set(entry.championId, {
                    target: total,
                    progress: Math.min((entry.championPoints ?? 0) / total, 1),
                    label: "M10",
                });
            });
            return targets;
        }

        if (!optimalPath) return targets;
        const path_ids = new Set(optimalPath.m10.champions.map((c) => c.id));
        const assigned = new Set<number>();
        const total_slots = 150;
        const m10_threshold = 75600;

        const effective_sorted = [...masteryData].sort((a: any, b: any) => {
            const ea = path_ids.has(a.championId) ? Math.max(a.championPoints ?? 0, m10_threshold) : (a.championPoints ?? 0);
            const eb = path_ids.has(b.championId) ? Math.max(b.championPoints ?? 0, m10_threshold) : (b.championPoints ?? 0);
            return eb - ea;
        });

        effective_sorted.forEach((entry: any, i: number) => {
            const cid = entry.championId;
            const pts = entry.championPoints ?? 0;
            if (i === 0) {
                assigned.add(cid);
                targets.set(cid, { target: 840000, progress: Math.min(pts / 840000, 1), label: "840k" });
            } else if (assigned.size < total_slots) {
                assigned.add(cid);
                targets.set(cid, { target: 100000, progress: Math.min(pts / 100000, 1), label: "100k" });
            }
        });
        return targets;
    }, [masteryData, optimalPath, goalMode]);

    const champion_max_labels = useMemo(() => {
        const labels = new Map<number, "one_trick" | "catch_em_all">();
        if (!masteryData.length || !optimalPath) return labels;
        const path_ids = new Set(optimalPath.m10.champions.map((c) => c.id));
        const m10_threshold = 75600;
        const effective_sorted = [...masteryData].sort((a: any, b: any) => {
            const ea = path_ids.has(a.championId) ? Math.max(a.championPoints ?? 0, m10_threshold) : (a.championPoints ?? 0);
            const eb = path_ids.has(b.championId) ? Math.max(b.championPoints ?? 0, m10_threshold) : (b.championPoints ?? 0);
            return eb - ea;
        });
        effective_sorted.forEach((entry: any, i: number) => {
            if (i === 0) labels.set(entry.championId, "one_trick");
            else if (i < 150) labels.set(entry.championId, "catch_em_all");
        });
        return labels;
    }, [masteryData, optimalPath]);

    const filtered_challenges = useMemo(() => {
        let items = [...merged_challenges];

        if (hide_capstone) {
            items = items.filter((x) => x.challenge.tags?.isCapstone !== "Y");
        }

        if (search) {
            const q = search.toLowerCase();
            items = items.filter((x) => x.challenge.name.toLowerCase().includes(q) || x.challenge.description.toLowerCase().includes(q));
        }

        if (hide_legacy) {
            const category_roots = new Set(["1", "2", "3", "4", "5"]);
            const challenge_map: Record<string, ChallengeData | undefined> = data.challenges as any;
            function getRootParent(id: string): string {
                const ch = challenge_map[id];
                if (!ch?.tags?.parent) return id;
                if (ch.tags.isCategory === "true") return id;
                return getRootParent(ch.tags.parent);
            }
            items = items.filter((x) => category_roots.has(getRootParent(String(x.id))));
        }

        if (hide_completed) {
            const master_idx = levels.indexOf("MASTER");
            items = items.filter((x) => {
                if (levels.indexOf(x.entry!.level) >= master_idx) return false;
                const tiers = Object.keys(x.challenge.thresholds || {}).filter((l) => l !== "NONE");
                if (tiers.length === 0) return true;
                const max_tier = tiers.reduce((a, b) => (levels.indexOf(a) > levels.indexOf(b) ? a : b));
                return x.entry!.level !== max_tier;
            });
        }

        items.sort((a, b) => {
            if (sort_by === "name") {
                return a.challenge.name.localeCompare(b.challenge.name) * (sort_order === "asc" ? -1 : 1);
            }
            const a_prog = get_challenge_progress(a.challenge, a.entry!, progress_mode).progress;
            const b_prog = get_challenge_progress(b.challenge, b.entry!, progress_mode).progress;
            if (a_prog >= 100 && b_prog >= 100) {
                const a_li = levels.indexOf(a.entry!.level);
                const b_li = levels.indexOf(b.entry!.level);
                if (a_li !== b_li) return (b_li - a_li) * (sort_order === "asc" ? -1 : 1);
                return (b_prog - a_prog) * (sort_order === "asc" ? -1 : 1);
            }
            return (b_prog - a_prog) * (sort_order === "asc" ? -1 : 1);
        });

        return items;
    }, [merged_challenges, search, sort_by, sort_order, progress_mode, hide_completed, hide_capstone, hide_legacy, data]);

    const level_distribution = useMemo(() => {
        if (!merged_challenges.length) return [];
        const counts = new Map<string, number>();
        const totals = new Map<string, number>();
        for (const { entry } of merged_challenges) {
            counts.set(entry!.level, (counts.get(entry!.level) || 0) + 1);
            totals.set(entry!.level, (totals.get(entry!.level) || 0) + entry!.value);
        }
        return levels
            .filter((l) => l !== "NONE")
            .map((level) => ({
                name: level,
                count: counts.get(level) || 0,
                total: totals.get(level) || 0,
                fill: level_colors[level] || "#888",
            }));
    }, [merged_challenges]);

    const total_completion = useMemo(() => {
        if (!merged_challenges.length) return 0;
        const filtered = merged_challenges.filter((x) => {
            if (x.challenge.tags?.isCapstone === "Y") return false;
            const category_roots = new Set(["1", "2", "3", "4", "5"]);
            const challenge_map: Record<string, ChallengeData | undefined> = data.challenges as any;
            function getRootParent(id: string): string {
                const ch = challenge_map[id];
                if (!ch?.tags?.parent) return id;
                if (ch.tags.isCategory === "true") return id;
                return getRootParent(ch.tags.parent);
            }
            if (!category_roots.has(getRootParent(String(x.id)))) return false;
            return true;
        });
        if (!filtered.length) return 0;
        const total = filtered.reduce((sum, x) => {
            const tiers = Object.keys(x.challenge.thresholds || {}).filter((l) => l !== "NONE");
            const master_idx = levels.indexOf("MASTER");
            const max_tier = tiers.reduce((a, b) => (levels.indexOf(a) > levels.indexOf(b) ? a : b));
            const target_idx = Math.min(master_idx, levels.indexOf(max_tier));
            const target_level = levels[target_idx];
            const current_idx = levels.indexOf(x.entry!.level);
            if (current_idx >= target_idx) return sum + 100;
            const target_value = x.challenge.thresholds?.[target_level]?.value;
            if (!target_value) return sum + 0;
            return sum + Math.min((x.entry!.value / target_value) * 100, 100);
        }, 0);
        return total / filtered.length;
    }, [merged_challenges, data.challenges]);

    if (fetching) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-2">
                    <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
                    <p className="text-muted-foreground">Loading player data...</p>
                </div>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-center space-y-2 max-w-md">
                    <p className="text-destructive font-medium">{fetchError}</p>
                    <p className="text-muted-foreground text-sm">Make sure the Riot ID and region are correct.</p>
                </div>
            </div>
        );
    }

    if (!riotData) return null;

    const tp = riotData.totalPoints;

    const profile_icon_id = summonerData?.profileIconId;
    const profile_avatar_url = profile_icon_id ? `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${profile_icon_id}.jpg` : null;

    const banner_colors: Record<string, string> = {
        IRON: "from-stone-800/80 to-stone-900/80",
        BRONZE: "from-amber-800/80 to-amber-900/80",
        SILVER: "from-slate-500/80 to-slate-700/80",
        GOLD: "from-yellow-600/80 to-yellow-800/80",
        PLATINUM: "from-teal-600/80 to-teal-800/80",
        DIAMOND: "from-blue-600/80 to-blue-800/80",
        MASTER: "from-purple-600/80 to-purple-800/80",
        GRANDMASTER: "from-red-600/80 to-red-800/80",
        CHALLENGER: "from-amber-500/80 to-orange-700/80",
    };

    return (
        <div className="container mx-auto p-4 md:p-6 space-y-6 max-w-7xl">
            <div className="relative rounded-xl overflow-hidden border">
                <div className={`h-36 bg-gradient-to-r ${banner_colors[tp.level] || "from-muted to-muted/50"}`} />
                <div className="px-6 pb-4">
                    <div className="flex items-end gap-4 -mt-12">
                        <div className="rounded-full border-4 border-background bg-background w-24 h-24 flex items-center justify-center shrink-0 overflow-hidden">
                            {profile_avatar_url ? (
                                <Image src={profile_avatar_url} alt="" width={88} height={88} className="rounded-full" unoptimized />
                            ) : (
                                <div className={`text-3xl font-bold ${get_level_color(tp.level)}`}>{actualName.charAt(0).toUpperCase()}</div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pt-14">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-bold tracking-tight">{actualName}</h1>
                                <span className="text-muted-foreground">#{actualTag}</span>
                                <Badge variant="outline" className="text-xs">
                                    {detectedRegion.toUpperCase()}
                                </Badge>
                            </div>
                            {riotData.preferences?.title != null &&
                                (() => {
                                    const title_name = titles[Number(riotData.preferences.title)];
                                    return title_name ? <p className="text-sm text-muted-foreground mt-0.5">{title_name}</p> : null;
                                })()}
                        </div>
                    </div>
                    <div className="flex gap-6 mt-4 flex-wrap">
                        <div className="flex items-center gap-2">
                            <Badge className={`${get_level_color(tp.level).replace("text-", "bg-")} text-white`}>{tp.level}</Badge>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-muted-foreground">Points</span>
                            <span className="font-semibold">{tp.current.toLocaleString()}</span>
                        </div>
                        {/*<div className="flex items-center gap-1.5 text-sm">
                            <span className="text-muted-foreground">
                                Position
                            </span>
                            <span className="font-semibold">
                                {tp.position != null
                                    ? `#${tp.position.toLocaleString()}`
                                    : "--"}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-muted-foreground">Max</span>
                            <span className="font-semibold">
                                {tp.max.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-muted-foreground">Title</span>
                            <span className="font-semibold">
                                {riotData.preferences?.title != null
                                    ? (titles[
                                          Number(riotData.preferences.title)
                                      ] ?? "--")
                                    : "--"}
                            </span>
                        </div>*/}
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-muted-foreground">Level</span>
                            <span className="font-semibold">{summonerData?.summonerLevel ?? "--"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-semibold">{total_completion.toFixed(2)}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
                <Card className="xl:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium">Mastery Class Challenges</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-3">
                        <div className="flex flex-wrap">
                            {(() => {
                                const challenge_map = data.challenges;
                                return CLASSES.map((class_name, index) => {
                                    const m7_id = M7_IDS[index];
                                    const m10_id = M10_IDS[index];
                                    const m7_entry = riotData.challenges.find((c) => c.challengeId === m7_id);
                                    const m10_entry = riotData.challenges.find((c) => c.challengeId === m10_id);
                                    const m7_def = challenge_map[m7_id];
                                    const m10_def = challenge_map[m10_id];
                                    if (!m7_entry || !m10_entry || !m7_def || !m10_def) return null;

                                    const m7_thresholds = Object.entries(m7_def.thresholds || {})
                                        .sort(([, a]: any, [, b]: any) => a.value - b.value)
                                        .map(([, v]: any) => v.value);
                                    const m10_thresholds = Object.entries(m10_def.thresholds || {})
                                        .sort(([, a]: any, [, b]: any) => a.value - b.value)
                                        .map(([, v]: any) => v.value);
                                    const m7_current = m7_entry.value;
                                    const m10_current = m10_entry.value;
                                    const m7_max = m7_def.thresholds?.MASTER?.value ?? m7_thresholds[m7_thresholds.length - 1];
                                    const total_in_class = classChampionIds.get(class_name)?.length ?? 0;
                                    const m10_master_target = m10_def.thresholds?.MASTER?.value ?? m10_thresholds[m10_thresholds.length - 1];

                                    const chart_data = [
                                        {
                                            name: class_name,
                                            m7: m7_current,
                                            diff: m7_current - m10_current,
                                            m10: m10_current,
                                        },
                                    ];

                                    return (
                                        <div className="flex-1 min-w-[70px]" key={class_name}>
                                            <ResponsiveContainer width="100%" height={250}>
                                                <BarChart
                                                    data={chart_data}
                                                    margin={{
                                                        top: 5,
                                                        right: 5,
                                                        bottom: 5,
                                                        left: 5,
                                                    }}
                                                >
                                                    <XAxis dataKey="name" interval={0} tick={{ fontSize: 12 }} />
                                                    <YAxis
                                                        width={16}
                                                        ticks={(() => {
                                                            const t = m7_thresholds.filter((v: number) => v == m7_thresholds[6] || v >= m10_current);
                                                            if (total_in_class < m10_master_target && !t.includes(total_in_class)) t.push(total_in_class);
                                                            return t.sort((a: number, b: number) => a - b);
                                                        })()}
                                                        domain={[0, m7_max]}
                                                        interval={0}
                                                        tick={(props: any) => {
                                                            const { payload } = props;
                                                            const colors: Record<number, string> = {
                                                                [m7_thresholds[0]]: "#51484a",
                                                                [m7_thresholds[1]]: "#8c513a",
                                                                [m7_thresholds[2]]: "#80989d",
                                                                [m7_thresholds[3]]: "#cd8837",
                                                                [m7_thresholds[4]]: "#4e9996",
                                                                [m7_thresholds[5]]: "#576bce",
                                                                [m7_thresholds[6]]: "#9d48e0",
                                                            };
                                                            props.stroke = colors[payload.value] || "#888888";
                                                            return (
                                                                <Text {...props} fontSize={10}>
                                                                    {payload.value}
                                                                </Text>
                                                            );
                                                        }}
                                                    />
                                                    {total_in_class < m10_master_target && <ReferenceLine y={total_in_class} stroke="#ef4444" strokeDasharray="3 3" />}
                                                    <Bar dataKey="m10" stackId="a" fill="#60a5fa" />
                                                    <Bar dataKey="diff" stackId="a" fill="#2563eb" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    );
                                });
                            })()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-1">
                    <CardContent className="pt-4 pb-3">
                        <div className="space-y-3">
                            {(() => {
                                const challenge_map = data.challenges;
                                return HEADLINE_IDS.map((id) => {
                                    const entry = riotData.challenges.find((c) => c.challengeId === id);
                                    const def = challenge_map[id];
                                    if (!entry || !def) return null;

                                    const next_level_index = levels.indexOf(entry.level) + 1;
                                    const next_level = next_level_index < levels.length ? levels[next_level_index] : "CHALLENGER";
                                    const next_threshold = def.thresholds?.[next_level]?.value || def.thresholds?.MASTER?.value || def.thresholds?.[entry.level]?.value || entry.value;
                                    const progress = Math.min((entry.value / next_threshold) * 100, 100);

                                    return (
                                        <HoverCard key={id} openDelay={150} closeDelay={0}>
                                            <HoverCardTrigger asChild>
                                                <div className="space-y-1 cursor-help">
                                                    <div className="flex items-center gap-2">
                                                        <Image
                                                            src={challenge_icon_url(def, entry.level) || "https://placehold.co/32"}
                                                            alt={def.name}
                                                            width={32}
                                                            height={32}
                                                            className="w-8 h-8 rounded-full shrink-0"
                                                            unoptimized
                                                        />
                                                        <div className="min-w-0 flex-1 leading-none">
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className={`text-xs font-medium truncate ${get_level_color(entry.level)}`}>{def.name}</span>
                                                                <span className="text-[10px] text-muted-foreground shrink-0">
                                                                    {entry.value.toLocaleString()} / {next_threshold.toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <Progress value={progress} className="h-1 bg-muted mt-0.5" indicatorClassName={get_progress_color(entry.level)} />
                                                        </div>
                                                    </div>
                                                </div>
                                            </HoverCardTrigger>
                                            <HoverCardContent className="w-80 space-y-3" align="start">
                                                <div className="space-y-1">
                                                    <div className={`text-sm font-semibold ${get_level_color(entry.level)}`}>{def.name}</div>
                                                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">{def.description}</p>
                                                </div>
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-muted-foreground">Current progress</span>
                                                    <span className={get_level_color(entry.level)}>{entry.level}</span>
                                                </div>
                                                <div className="text-sm font-medium">{entry.value.toLocaleString()}</div>
                                                <div className="space-y-2">
                                                    <div className="text-xs font-medium text-muted-foreground">Tier thresholds</div>
                                                    <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                                        {levels
                                                            .filter((l) => l !== "NONE" && def.thresholds?.[l]?.value != null)
                                                            .map((level) => (
                                                                <div key={level} className="contents">
                                                                    <span className={get_level_color(level)}>{level}</span>
                                                                    <span className="text-right text-muted-foreground">{def.thresholds![level]!.value.toLocaleString()}</span>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            </HoverCardContent>
                                        </HoverCard>
                                    );
                                });
                            })()}
                        </div>
                    </CardContent>
                </Card>

                <Card className="xl:col-span-1 flex flex-col">
                    <CardContent className="flex-1 flex flex-col gap-3 pt-4">
                        {masterEffort && (
                            <div className="w-full space-y-1.5 text-xs">
                                <div className="flex justify-between items-baseline">
                                    <span className="text-muted-foreground">Path to M10</span>
                                    <span className="font-medium tabular-nums">{masterEffort.rest_to_m10_needed.toLocaleString()}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground pl-2 border-l border-border mb-1.5">
                                    {masterEffort.path_total} path champions
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-muted-foreground">Catch &apos;em All (150 × 100k)</span>
                                    <span className="font-medium tabular-nums">{masterEffort.catch_em_all_needed.toLocaleString()}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground pl-2 border-l border-border mb-1.5">
                                    {masterEffort.catch_em_all_current}/{masterEffort.catch_em_all_target} at 100k
                                </div>
                                <div className="flex justify-between items-baseline">
                                    <span className="text-muted-foreground">One Trick (top → 840k)</span>
                                    <span className="font-medium tabular-nums">{masterEffort.one_trick_needed.toLocaleString()}</span>
                                </div>
                                <div className="text-[10px] text-muted-foreground pl-2 border-l border-border mb-1.5">
                                    {championNames.get(masterEffort.one_trick_target_id) ?? `#${masterEffort.one_trick_target_id}`}: {masterEffort.top_champ_points.toLocaleString()} / 840,000
                                </div>
                                <Separator className="my-1" />
                                <div className="flex justify-between items-baseline text-xs font-semibold">
                                    <span>Total mastery points needed</span>
                                    <span className="tabular-nums">{masterEffort.total.toLocaleString()}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
                <button
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "challenges" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                    onClick={() => setTab("challenges")}
                >
                    Challenges
                </button>
                <button
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${tab === "mastery" ? "bg-background shadow-sm" : "hover:bg-background/50"}`}
                    onClick={() => setTab("mastery")}
                >
                    Mastery
                </button>
                <TooltipProvider>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <button className="px-4 py-1.5 text-sm font-medium rounded-md text-muted-foreground cursor-not-allowed select-none" onClick={() => {}}>
                                Skins
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Requires crystal, coming soon</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                    <Tooltip delayDuration={100}>
                        <TooltipTrigger asChild>
                            <button className="px-4 py-1.5 text-sm font-medium rounded-md text-muted-foreground cursor-not-allowed select-none" onClick={() => {}}>
                                Eternals
                            </button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>Requires crystal, coming soon</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {tab === "challenges" && (
                <>
                    <div className="flex items-center gap-4 flex-wrap">
                        <div className="relative">
                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search Challenges..." className="pl-8 w-[200px]" value={search} onChange={(e) => set_search(e.target.value)} />
                        </div>

                        <div className="flex items-center gap-1">
                            <Select onValueChange={(v) => set_sort_by(v as SortBy)} value={sort_by}>
                                <SelectTrigger className="w-[140px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="name">Name</SelectItem>
                                    <SelectItem value="progress">Progress</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant="outline"
                                size="icon"
                                onClick={() => set_sort_order((prev) => (prev === "asc" ? "desc" : "asc"))}
                                title={`Sort ${sort_order === "asc" ? "Ascending" : "Descending"}`}
                            >
                                {sort_order === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                            </Button>
                        </div>

                        <Select onValueChange={(v) => set_progress_mode(v as ProgressMode)} value={progress_mode}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Progress target" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="next">To Next Level</SelectItem>
                                <SelectItem value="master">To Master Tier</SelectItem>
                            </SelectContent>
                        </Select>

                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                            <Checkbox checked={hide_completed} onCheckedChange={(v) => set_hide_completed(v === true)} />
                            Hide Completed
                        </label>

                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                            <Checkbox checked={hide_capstone} onCheckedChange={(v) => set_hide_capstone(v === true)} />
                            Hide Capstones
                        </label>
                        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                            <Checkbox checked={hide_legacy} onCheckedChange={(v) => set_hide_legacy(v === true)} />
                            Hide Legacy
                        </label>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {filtered_challenges.map(({ id, challenge, entry }) => {
                            const { progress, target_threshold, target_label } = get_challenge_progress(challenge, entry!, progress_mode);
                            const show_target = !["MASTER", "GRANDMASTER", "CHALLENGER"].includes(entry!.level);

                            return (
                                <Card key={id} className="p-3 flex flex-col h-full">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Image
                                            src={challenge_icon_url(challenge, entry!.level) || "https://placehold.co/32"}
                                            alt={challenge.name}
                                            width={28}
                                            height={28}
                                            className="rounded-full shrink-0"
                                            unoptimized
                                        />
                                        <ChallengeSummary challenge={challenge} entry={entry!} />
                                    </div>
                                    <div className="text-xs text-muted-foreground line-clamp-2 mb-2 flex-1">{challenge.description}</div>
                                    <div className="mt-auto space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span className={get_level_color(entry!.level)}>{show_target ? `${entry!.level} → ${target_label}` : entry!.level}</span>
                                            <span className="text-muted-foreground">
                                                {entry!.value.toLocaleString()} / {target_threshold.toLocaleString()}
                                            </span>
                                        </div>
                                        <Progress value={progress} className="h-1.5 bg-muted" indicatorClassName={get_progress_color(entry!.level)} />
                                    </div>
                                </Card>
                            );
                        })}
                    </div>

                    {filtered_challenges.length === 0 && !fetching && <div className="text-center py-12 text-muted-foreground">No challenges match the current filters.</div>}
                </>
            )}

            {tab === "mastery" && (
                <>
                    {(() => {
                        const classIds = selectedClass === "all" ? null : classChampionIds.get(selectedClass);
                        const sorted = [...masteryData]
                            .sort((a: any, b: any) => b.championPoints - a.championPoints)
                            .filter((entry: any) => {
                                const cid = entry.championId;
                                if (classIds && !classIds.includes(cid)) return false;
                                if (selectedRegion !== "all" && championRegion.get(cid) !== selectedRegion) return false;
                                if (masteryFilter === "m5" && entry.championLevel >= 5) return false;
                                if (masteryFilter === "m7" && entry.championLevel >= 7) return false;
                                if (masteryFilter === "m10" && entry.championLevel >= 10) return false;
                                if (masteryFilter === "custom" && (entry.championPoints ?? 0) >= (Number(customMasteryPoints) || 0)) return false;
                                return true;
                            });
                        const champ_to_classes = new Map<number, string[]>();
                        for (const [cls, ids] of classChampionIds) {
                            for (const id of ids) {
                                const existing = champ_to_classes.get(id) ?? [];
                                existing.push(cls);
                                champ_to_classes.set(id, existing);
                            }
                        }
                        return (
                            <>
                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                                            <SelectTrigger className="w-[130px]">
                                                <SelectValue placeholder="Class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Classes</SelectItem>
                                                {CLASSES.map((c) => (
                                                    <SelectItem key={c} value={c}>
                                                        {c}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                                            <SelectTrigger className="w-[130px] opacity-50 cursor-not-allowed" disabled>
                                                <SelectValue placeholder="Region" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Regions</SelectItem>
                                                {regions.map((r) => (
                                                    <SelectItem key={r} value={r}>
                                                        {r}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Select value={masteryFilter} onValueChange={(v) => setMasteryFilter(v as "none" | "m5" | "m7" | "m10" | "custom")}>
                                            <SelectTrigger className="w-[130px]">
                                                <SelectValue placeholder="Hide above" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                <SelectItem value="m5">M5+</SelectItem>
                                                <SelectItem value="m7">M7+</SelectItem>
                                                <SelectItem value="m10">M10+</SelectItem>
                                                <SelectItem value="custom">Custom pts</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {masteryFilter === "custom" && (
                                            <div className="flex items-center gap-2">
                                                <Slider
                                                    value={[Number(customMasteryPoints) || 0]}
                                                    onValueChange={([v]) => setCustomMasteryPoints(String(v))}
                                                    min={0}
                                                    max={840000}
                                                    step={1000}
                                                    className="w-[140px]"
                                                />
                                                <Input
                                                    type="number"
                                                    value={customMasteryPoints}
                                                    onChange={(e) => setCustomMasteryPoints(e.target.value)}
                                                    className="w-[90px] h-7 text-xs"
                                                />
                                                {(() => {
                                                    const pts = Number(customMasteryPoints) || 0;
                                                    const mp = [0, 1800, 4200, 6600, 9000, 10000, 11000, 11000, 11000];
                                                    let cum = 0;
                                                    for (let lvl = 1; lvl <= 10; lvl++) {
                                                        const cost = lvl < mp.length ? mp[lvl] : 11000;
                                                        if (pts < cum + cost) return <span className="text-xs text-muted-foreground">M{lvl - 1}+</span>;
                                                        cum += cost;
                                                    }
                                                    return <span className="text-xs text-muted-foreground">M10+</span>;
                                                })()}
                                            </div>
                                        )}
                                    </div>
                                    <Select value={goalMode} onValueChange={(v) => setGoalMode(v as "max" | "m10" | "m7" | "m5" | "next")}>
                                        <SelectTrigger className="w-[120px]">
                                            <SelectValue placeholder="Goal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="max">Max Goal</SelectItem>
                                            <SelectItem value="m10">M10</SelectItem>
                                            <SelectItem value="m7">M7</SelectItem>
                                            <SelectItem value="m5">M5</SelectItem>
                                            <SelectItem value="next">Next Level</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Separator />

                                {masteryData.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No mastery data available.</p>
                                ) : sorted.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">No champions match the selected filters.</p>
                                ) : (
                                    <TooltipProvider>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                                            {sorted.map((entry: any, i: number) => {
                                                const points = entry.championPoints ?? 0;
                                                const level = entry.championLevel ?? 0;
                                                const champ_id = entry.championId;
                                                const champ_name = championNames.get(champ_id) ?? `Champion ${champ_id}`;
                                                const roles = champ_to_classes.get(champ_id) ?? [];
                                                const ct = champion_targets.get(champ_id);
                                                const path_champion_ids = new Set(optimalPath?.m10.champions.map((c: any) => c.id) ?? []);
                                                  const badges: string[] = [];
                                                  const ml = champion_max_labels.get(champ_id);
                                                  if (ml === "one_trick") {
                                                      badges.push("one_trick");
                                                      badges.push("catch_em_all");
                                                  } else if (ml === "catch_em_all") {
                                                      badges.push("catch_em_all");
                                                  }
                                                  if (path_champion_ids.has(champ_id)) badges.push("path");
                                                return (
                                                    <Card key={champ_id} className="p-2 space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <Image
                                                                src={`https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-icons/${champ_id}.png`}
                                                                alt=""
                                                                width={40}
                                                                height={40}
                                                                className="rounded-full shrink-0"
                                                                unoptimized
                                                            />
                                                            <div className="min-w-0 flex-1 space-y-0.5">
                                                                <div className="flex items-center gap-1 flex-wrap">
                                                                    <span className="text-xs font-medium truncate">{champ_name}</span>
                                                                    {badges.map((b) => (
                                                                        <Tooltip key={b} delayDuration={200}>
                                                                            <TooltipTrigger asChild>
                                                                                <span className={cn("text-sm leading-none cursor-help", b === "one_trick" ? "text-amber-400" : b === "catch_em_all" ? "text-cyan-400" : "text-emerald-400")}>
                                                                                    {b === "one_trick" ? "★" : b === "catch_em_all" ? "◎" : "◇"}
                                                                                </span>
                                                                            </TooltipTrigger>
                                                                            <TooltipContent side="top" className="text-xs">
                                                                                {b === "one_trick"
                                                                                    ? "One Trick - Top champion target: 840k points"
                                                                                    : b === "catch_em_all"
                                                                                      ? "Catch 'Em All - Top 150 champion target: 100k points"
                                                                                      : "Optimal champion to get Mastery 10 by class"}
                                                                            </TooltipContent>
                                                                        </Tooltip>
                                                                    ))}
                                                                </div>
                                                                {roles.length > 0 && (
                                                                    <div className="flex items-center gap-1 flex-wrap">
                                                                        {roles.slice(0, 2).map((r) => (
                                                                            <span key={r} className="text-[9px] px-1 rounded bg-primary/10 text-primary leading-none">
                                                                                {r}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                                    <span>M{level}</span>
                                                                    <span>{points.toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {ct && (
                                                            <div className="flex items-center gap-1">
                                                                <Progress
                                                                    value={ct.progress * 100}
                                                                    className="h-1 bg-muted flex-1"
                                                                    indicatorClassName={ct.progress >= 1 ? get_progress_color("GOLD") : "bg-primary"}
                                                                />
                                                                <span className="text-[10px] text-primary font-medium tabular-nums shrink-0">{ct.label}</span>
                                                            </div>
                                                        )}
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    </TooltipProvider>
                                )}
                            </>
                        );
                    })()}
                </>
            )}
        </div>
    );
}
