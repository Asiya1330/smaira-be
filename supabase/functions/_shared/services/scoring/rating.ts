import { getAdminClient } from "../../supabase/admin-client.ts";
import type { ScoringRuleRow } from "../../types/models.ts";

/** README default bands when `scoring_rules` is empty or unreadable. */
const DEFAULT_RULES: ScoringRuleRow[] = [
  { min_score: 70, max_score: 100, rating: "Microbiome Friendly" },
  { min_score: 40, max_score: 69, rating: "Use With Caution" },
  { min_score: 0, max_score: 39, rating: "Not Recommended" },
];

let cachedRules: ScoringRuleRow[] | null = null;

export async function loadScoringRules(): Promise<ScoringRuleRow[]> {
  if (cachedRules) return cachedRules;
  try {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("scoring_rules")
      .select("min_score, max_score, rating, color")
      .order("min_score", { ascending: false });
    if (error || !data?.length) {
      cachedRules = DEFAULT_RULES;
    } else {
      cachedRules = data as ScoringRuleRow[];
    }
  } catch {
    cachedRules = DEFAULT_RULES;
  }
  return cachedRules;
}

/** Synchronous rating from in-memory defaults (used when DB rules match README). */
export function ratingForScore(score: number): string {
  for (const r of DEFAULT_RULES) {
    if (score >= r.min_score && score <= r.max_score) return r.rating;
  }
  return "Not Recommended";
}

export async function ratingForScoreAsync(score: number): Promise<string> {
  const rules = await loadScoringRules();
  for (const r of rules) {
    if (score >= r.min_score && score <= r.max_score) return r.rating;
  }
  return "Not Recommended";
}
