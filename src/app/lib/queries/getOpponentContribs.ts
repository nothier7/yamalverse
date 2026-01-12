// /lib/queries/getOpponentContribs.ts
import supabase from '../supabaseClient';

export type OpponentContrib = {
  opponent: string;
  games: number;
  goals: number;
  assists: number;
  contributions: number;
};

export type OpponentType = "Club" | "International" | "Both";

type Params = {
  season?: string | null;
  year?: number | null;
  type?: OpponentType; // UI will map "Both" -> null at RPC
};

export async function getOpponentContribs({ season = null, year = null, type = "Both" }: Params = {}) {
  if (season && year) {
    throw new Error("Provide either season OR year, not both.");
  }

  const p_type = type === "Both" ? null : type;

  const { data, error } = await supabase
    .rpc("get_yamal_opponent_contribs", { p_season: season, p_year: year, p_type })
    .returns<OpponentContrib[]>();

  if (error) {
    throw error;
  }
  
  return data ?? [];
}
