import { supabase } from "./supabase";
import type { Profile, UserMatchWithOpportunity, MatchStatus } from "../types/database";

// ─── Profile ───────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // not found
    throw error;
  }
  return data;
}

export async function upsertProfile(profile: Partial<Profile> & { id: string }): Promise<Profile> {
  const { data, error } = await supabase
    .from("profiles")
    .upsert(profile, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteProfile(userId: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) throw error;
}

// ─── Matches ───────────────────────────────────────────────────────────────

export async function getUserMatches(userId: string): Promise<UserMatchWithOpportunity[]> {
  const { data, error } = await supabase
    .from("user_matches")
    .select(`
      *,
      opportunities (*)
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as UserMatchWithOpportunity[]) ?? [];
}

export async function updateMatchStatus(
  matchId: string,
  status: MatchStatus
): Promise<void> {
  const { error } = await supabase
    .from("user_matches")
    .update({ status })
    .eq("id", matchId);

  if (error) throw error;
}

// ─── Stats ─────────────────────────────────────────────────────────────────

export async function getMatchStats(userId: string) {
  const { data, error } = await supabase
    .from("user_matches")
    .select("status, created_at")
    .eq("user_id", userId);

  if (error) throw error;

  const matches = data ?? [];
  const today = new Date().toDateString();

  return {
    newToday: matches.filter(
      (m) =>
        m.status === "new" &&
        new Date(m.created_at).toDateString() === today
    ).length,
    saved: matches.filter((m) => m.status === "saved").length,
    applied: matches.filter((m) => m.status === "applied").length,
    total: matches.length,
  };
}

// ─── Single opportunity + match ────────────────────────────────────────────

export async function getOpportunityWithMatch(
  opportunityId: string,
  userId: string
): Promise<UserMatchWithOpportunity | null> {
  const { data, error } = await supabase
    .from("user_matches")
    .select(`
      *,
      opportunities (*)
    `)
    .eq("opportunity_id", opportunityId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as UserMatchWithOpportunity;
}
