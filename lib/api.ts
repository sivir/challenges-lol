export const CRYSTAL_API_URL = (process.env.NEXT_PUBLIC_CRYSTAL_API_URL || "https://api.challenges.lol").replace(/\/$/, "");

/** Thrown for any non-2xx answer; `status` 404 means no such player. */
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function api_get<T>(path: string): Promise<T> {
  const res = await fetch(`${CRYSTAL_API_URL}${path}`, { headers: { accept: "application/json" } });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error ?? res.statusText);
  }
  return res.json();
}

export type RiotChallengeEntry = {
  challengeId: number;
  level: string;
  value: number;
};

export type RiotData = {
  totalPoints: {
    current: number;
    level: string;
    max: number;
    position: number | null;
    percentile: number | null;
  };
  preferences: {
    challengeIds: number[];
    title?: string;
  };
  challenges: RiotChallengeEntry[];
  categoryPoints?: Record<string, { current: number; level: string; max: number; percentile: number }>;
};

export type GetUserResponse = {
  puuid?: string;
  game_name?: string;
  tag_line?: string;
  region?: string;
  profile_icon_id?: number | null;
  summoner_level?: number | null;
  riot_data: RiotData;
  mastery_data: any[];
  fetched_at?: string | null;
  refreshing?: boolean;
};

export type UserResult =
  | { status: "ok"; data: GetUserResponse }
  | { status: "missing" }
  | { status: "unavailable" };

/** The API finds the player's region itself; a 404 means no such Riot ID. */
export async function getUserData(gameName: string, tagLine: string): Promise<UserResult> {
  try {
    const path = `/v1/players/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`;
    return { status: "ok", data: await api_get<GetUserResponse>(path) };
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return { status: "missing" };
    console.error("Error fetching user data:", e);
    return { status: "unavailable" };
  }
}

export type CatalogChallenge = {
  name: string;
  description: string;
  levelToIconPath?: Record<string, string>;
  thresholds?: Record<string, { value: number }>;
  tags?: Record<string, string>;
  queueIds?: number[];
  availableIds?: number[];
};

export type Catalog = {
  challenges: Record<string, CatalogChallenge>;
  /** Title item id → name. */
  titles: Record<string, string>;
};

export type CatalogChampion = { id: number; name: string; roles: string[] };

/** CommunityDragon's challenges and titles, with the LCU catalog's availableIds merged in. */
export function getCatalog(): Promise<Catalog> {
  return api_get<Catalog>("/v1/catalog");
}

export async function getCatalogChampions(): Promise<CatalogChampion[]> {
  return (await api_get<{ champions: CatalogChampion[] }>("/v1/catalog/champions")).champions;
}

export const levels = ["NONE", "IRON", "BRONZE", "SILVER", "GOLD", "PLATINUM", "DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"];

export function get_level_color(level: string): string {
  switch (level) {
    case "IRON": return "text-stone-400";
    case "BRONZE": return "text-amber-700";
    case "SILVER": return "text-slate-300";
    case "GOLD": return "text-yellow-400";
    case "PLATINUM": return "text-teal-300";
    case "DIAMOND": return "text-blue-400";
    case "MASTER": return "text-purple-400";
    case "GRANDMASTER": return "text-red-400";
    case "CHALLENGER": return "text-amber-300";
    default: return "text-muted-foreground";
  }
}

export function get_progress_color(level: string): string {
  switch (level) {
    case "IRON": return "bg-stone-400";
    case "BRONZE": return "bg-amber-700";
    case "SILVER": return "bg-slate-300";
    case "GOLD": return "bg-yellow-400";
    case "PLATINUM": return "bg-teal-300";
    case "DIAMOND": return "bg-blue-400";
    case "MASTER": return "bg-purple-400";
    case "GRANDMASTER": return "bg-red-400";
    case "CHALLENGER": return "bg-amber-300";
    default: return "bg-muted";
  }
}
