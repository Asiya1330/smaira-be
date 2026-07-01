/** Probaya product categories used in the app catalog. */
export const DEFAULT_PROBAYA_CATEGORIES = [
  "adult incontinence underwear",
  "lubricant",
  "cup",
  "condom",
  "liner",
  "wipe",
  "pad",
  "wash",
  "period underwear",
  "tampon",
] as const;

/**
 * Maps each Probaya category to Open Beauty Facts category slugs.
 * Slugs include variants (singular/plural, localized tags) because OBF naming
 * is inconsistent — e.g. `lubricants` vs `personal-lubricants`, `fr:lingettes-intimes`.
 */
// export const PROBAYA_TO_OBF_SLUGS: Record<string, string[]> = {
//   "adult incontinence underwear": [
//     "adult-incontinence-underwear",
//     "incontinence-underwear",
//     "incontinence",
//   ],
//   lubricant: [
//     "lubricants",
//     "personal-lubricants",
//   ],
//   cup: [
//     "menstrual-cups",
//     "menstrual-cup",
//     "cup",
//     "cups",
//   ],
//   condom: [
//     "condoms",
//     "condom",
//   ],
//   liner: [
//     "panty-liners",
//     "panty-liner",
//     "liners",
//     "liner",
//   ],
//   wipe: [
//     "fr:lingettes-intimes",
//     "intimate-wipes",
//   ],
//   pad: [
//     "sanitary-pads",
//     "menstrual-pads",
//     "sanitary-pad",
//     "pads",
//     "pad",
//   ],
//   wash: [
//     // "wash",
//     // "face-wash",
//     // "body-wash",
//     // "shower-gel",
//     // "Showers and baths",
//     "Intimate wash gels",
//   ],
//   "period underwear": [
//     "period-underwear",
//     "underwear",
//     "fr:culottes-menstruelles"
//   ],
//   tampon: [
//     "tampons",
//     "tampon",
//   ],
// };

export const PROBAYA_TO_OBF_SLUGS: Record<string, string[]> = {
  "adult incontinence underwear": [],
  lubricant: [
    "Personal lubricants",
    "Lubricants",
    "fr:gels-lubrifiants",
  ],
  condom: [
    "Condoms",
    "fr:preservatifs",
  ],
  tampon: [
    "Tampons",
    "fr:tampons-reguliers",
  ],
  pad: [
    "fr:serviettes-hygieniques",
  ],
  liner: [
    "Intimate hygiene",
  ],
  wash: [
    "Intimate wash gels",
    "Intimate hygiene",
  ],
  wipe: [
    "fr:lingettes-intimes",
  ],
  cup: [],
  "period underwear": [
    "fr:culottes-menstruelles",
  ],
};

export function resolveProbayaCategories(
  input?: Array<string | { category: string }>,
): string[] {
  if (!input?.length) return [...DEFAULT_PROBAYA_CATEGORIES];
  return input.map((item) => {
    if (typeof item === "string") return item.trim();
    return item.category?.trim() ?? "";
  }).filter(Boolean);
}

export function obfSlugsForProbayaCategory(probayaCategory: string): string[] {
  const key = probayaCategory.trim().toLowerCase();
  const exact = PROBAYA_TO_OBF_SLUGS[probayaCategory.trim()];
  if (exact?.length) return exact;

  const normalized = Object.entries(PROBAYA_TO_OBF_SLUGS).find(
    ([k]) => k.toLowerCase() === key,
  );
  if (normalized) return normalized[1];

  return slugVariantsFromLabel(probayaCategory);
}

/** Fallback when no explicit mapping: try hyphenated singular/plural slugs. */
function slugVariantsFromLabel(label: string): string[] {
  const base = label.trim().toLowerCase().replace(/\s+/g, "-");
  const variants = new Set<string>([base]);
  if (!base.endsWith("s")) variants.add(`${base}s`);
  if (base.endsWith("s") && base.length > 1) variants.add(base.slice(0, -1));
  return [...variants];
}
