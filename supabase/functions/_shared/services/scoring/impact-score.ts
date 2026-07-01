/**
 * Stored `ingredients.impact_score` labels, e.g. `(+1)`, `(-2)`, `(0)`.
 * Used for scoring math via {@link parseImpactScoreToNumber}.
 */
export const IMPACT_SCORE_LABELS = [
  "(-2)",
  "(-1)",
  "(0)",
  "(+1)",
  "(+2)",
] as const;

export type ImpactScoreLabel = (typeof IMPACT_SCORE_LABELS)[number];

const LABEL_SET = new Set<string>(IMPACT_SCORE_LABELS);

/** True if `s` is exactly one of the allowed parenthesis labels. */
export function isValidImpactScoreLabel(s: string): boolean {
  return LABEL_SET.has(s.trim());
}

/**
 * Parses a stored impact score to -2..+2 for scoring algorithms.
 * Accepts canonical parenthesis labels — `(+2)`, `(-1)`, `(0)` — and bare
 * numeric strings — `2`, `+1`, `0`, `-1`, `-2`.
 * Returns null if null/empty or not a valid score in that range.
 */
export function parseImpactScoreToNumber(
  value: string | null | undefined,
): number | null {
  if (value === null || value === undefined) return null;
  const t = String(value).trim();
  if (t === "") return null;

  const paren = t.match(/^\(([+-]?)(\d+)\)$/);
  if (paren) {
    const sign = paren[1] === "-" ? -1 : 1;
    const n = Number(paren[2]);
    if (!Number.isFinite(n)) return null;
    const v = sign * n;
    if (v < -2 || v > 2) return null;
    return v;
  }

  const bare = t.match(/^([+-]?\d+)$/);
  if (bare) {
    const v = Number(t);
    if (!Number.isFinite(v)) return null;
    if (v < -2 || v > 2) return null;
    return v;
  }

  return null;
}
