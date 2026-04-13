import type { IngredientDetail } from "../../types/api.ts";
import type { ProductRow } from "../../types/models.ts";

/** Sentinel id for OBF-only products (not yet in `products`). */
export const OBF_EPHEMERAL_PRODUCT_ID = "00000000-0000-0000-0000-000000000000";

type ObfV2Response = {
  status: number;
  product?: ObfV2Product;
};

type ObfV2Product = {
  code?: string;
  product_name?: string;
  product_name_en?: string;
  brands?: string;
  categories?: string;
  categories_hierarchy?: string[];
  image_url?: string;
  image_front_url?: string;
  link?: string;
  ingredients?: ObfIngredient[];
  ingredients_text?: string;
  labels?: string;
  labels_tags?: string[];
};

type ObfIngredient = {
  id?: string;
  text?: string;
};

const BASE = "https://world.openbeautyfacts.org/api/v2/product";

/**
 * Fallback lookup when barcode is missing from our DB.
 * @see https://openbeautyfacts.github.io/openfoodfacts-server/api/
 */
export async function fetchObfByBarcode(
  barcode: string,
): Promise<{ product: ProductRow; ingredients: IngredientDetail[] } | null> {
  const url = `${BASE}/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, { headers: { "User-Agent": "ProbayaMicrobiomeApp/1.0" } });
  if (!res.ok) return null;
  const payload = (await res.json()) as ObfV2Response;
  if (payload.status !== 1 || !payload.product) return null;
  const p = payload.product;
  const product = mapObfToProductRow(p, barcode);
  const ingredients = mapObfIngredientsToDetails(p);
  return { product, ingredients };
}

function mapObfToProductRow(p: ObfV2Product, barcode: string): ProductRow {
  const name = pickProductName(p, barcode);
  const brand = pickBrand(p);
  const category = pickCategory(p);
  const image_url = p.image_front_url ?? p.image_url ?? null;
  const source_url = (p.link?.trim() || obfProductPageUrl(barcode)) || null;

  return {
    id: OBF_EPHEMERAL_PRODUCT_ID,
    name,
    brand,
    barcode,
    category,
    image_url,
    score: null,
    organic: inferOrganic(p),
    certifications: pickCertifications(p),
    preservatives: null,
    fragrance_type: null,
    synthetic_materials: null,
    bleaching_method: null,
    ph_level: null,
    source_url,
    verified: false,
  };
}

function pickProductName(p: ObfV2Product, barcode: string): string {
  const n = (p.product_name_en ?? p.product_name ?? "").trim();
  if (n) return n;
  const cat = pickCategory(p);
  if (cat) return cat;
  return `Product ${barcode}`;
}

function pickBrand(p: ObfV2Product): string | null {
  const raw = p.brands?.trim();
  if (!raw) return null;
  return raw.split(",")[0]?.trim() ?? null;
}

function pickCategory(p: ObfV2Product): string | null {
  const first = p.categories?.split(",")[0]?.trim();
  if (first) return first;
  const h = p.categories_hierarchy;
  if (h?.length) {
    const leaf = h[h.length - 1];
    return leaf.replace(/^..:/, "").replace(/-/g, " ");
  }
  return null;
}

function obfProductPageUrl(barcode: string): string {
  return `https://world.openbeautyfacts.org/product/${encodeURIComponent(barcode)}`;
}

function inferOrganic(p: ObfV2Product): string | null {
  const tags = p.labels_tags ?? [];
  if (tags.some((t) => t.includes("organic") || t.includes("bio"))) return "Yes";
  return null;
}

function pickCertifications(p: ObfV2Product): string | null {
  const labels = p.labels?.trim();
  if (labels) return labels;
  const tags = p.labels_tags?.filter((t) => t.startsWith("en:")).map((t) =>
    t.replace(/^..:/, "").replace(/-/g, " ")
  );
  if (tags?.length) return [...new Set(tags)].join(", ");
  return null;
}

function mapObfIngredientsToDetails(p: ObfV2Product): IngredientDetail[] {
  const structured = p.ingredients;
  if (structured?.length) {
    return structured.map((ing) => {
      const label = ingredientLabel(ing);
      return {
        ingredient_name: label,
        inci_name: label,
        classification: null,
        plain_english_summary: null,
        impact_score: null,
      };
    });
  }
  const text = p.ingredients_text?.trim();
  if (!text) return [];
  return splitIngredientsText(text);
}

function ingredientLabel(ing: ObfIngredient): string {
  const t = ing.text?.trim();
  if (t) return t;
  const id = ing.id?.trim();
  if (id) return taxonomyIdToLabel(id);
  return "Unknown ingredient";
}

function taxonomyIdToLabel(id: string): string {
  const withoutLang = id.replace(/^[a-z]{2}:/, "");
  return withoutLang.replace(/-/g, " ").trim() || id;
}

/** Best-effort split when only `ingredients_text` is present (comma / semicolon). */
function splitIngredientsText(raw: string): IngredientDetail[] {
  const parts = raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  return parts.map((label) => ({
    ingredient_name: label,
    inci_name: label,
    classification: null,
    plain_english_summary: null,
    impact_score: null,
  }));
}
