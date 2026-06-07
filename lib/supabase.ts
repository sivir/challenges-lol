import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://jvnhtmgsncslprdrnkth.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bmh0bWdzbmNzbHByZHJua3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ2Mjc4ODMsImV4cCI6MjAxMDIwMzg4M30.OOjwsPjGHEc-x8MlhrOX64tJTNENqKqEq2635HKErrk";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  riot_data: RiotData;
  mastery_data: any[];
  lcu_data: any;
  summoner_data?: {
    profileIconId: number;
    summonerLevel: number;
  };
  gameName?: string;
  tagLine?: string;
  region?: string;
};

export async function getUserData(riotId: string, region: string): Promise<GetUserResponse | null> {
  try {
    const { data, error } = await supabase.functions.invoke<GetUserResponse>("get-user", {
      body: { riot_id: riotId, region },
    });
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("Error fetching user data:", e);
    return null;
  }
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
