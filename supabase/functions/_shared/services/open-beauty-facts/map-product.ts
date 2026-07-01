import type { ProductRow } from "../../types/models.ts";

/** Shared Open Beauty Facts product fields (v2 product + category listing). */
export type ObfProductFields = {
  code?: string;
  id?: string;
  product_name?: string;
  product_name_en?: string;
  generic_name?: string;
  generic_name_en?: string;
  brands?: string;
  categories?: string;
  categories_hierarchy?: string[];
  categories_tags?: string[];
  image_url?: string;
  image_front_url?: string;
  link?: string;
  url?: string;
  ingredients_text?: string;
  ingredients_text_en?: string;
  ingredients?: Array<{ id?: string; text?: string }>;
  labels?: string;
  labels_tags?: string[];
  quantity?: string;
  product_quantity?: number | string;
  product_quantity_unit?: string;
};

export type MapObfProductOptions = {
  /** Probaya category label stored in `products.category` (preferred). */
  categoryLabel?: string;
  /** OBF category slug used for the fetch (fallback for `products.category`). */
  categorySlug?: string;
};

/** Product row shape for DB insert — all `products` columns except `id`. */
export type ProductInsertRow = Omit<ProductRow, "id">;

export function mapObfProductToInsertRow(
  p: ObfProductFields,
  barcode: string,
  options?: MapObfProductOptions,
): ProductInsertRow {
  const brand = pickBrand(p);
  const product_name = pickProductName(p, barcode, brand);
  const category = pickCategory(p, options?.categoryLabel, options?.categorySlug);
  const image_url = p.image_front_url ?? p.image_url ?? null;
  const source_url = (p.link?.trim() || p.url?.trim() || obfProductPageUrl(barcode)) ||
    null;

  return {
    barcode,
    product_name,
    name: product_name,
    brand,
    category,
    size_count: pickSizeCount(p),
    absorbency: null,
    ingredients_list: pickIngredientsList(p),
    material_composition: null,
    bleaching_method: null,
    synthetic_materials: null,
    preservatives: null,
    fragrance_type: null,
    antibacterial_agents: null,
    ph_level: null,
    usda_organic: inferOrganic(p),
    gots_certified: inferCertification(p, "gots"),
    oeko_tex_certified: inferCertification(p, "oeko-tex"),
    gyno_approved: inferCertification(p, "gynecologist-tested"),
    image_url,
    score: null,
    organic: null,
    certifications: null,
    source_url,
    verified: false,
  };
}

function pickProductName(
  p: ObfProductFields,
  barcode: string,
  brand: string | null,
): string | null {
  const candidates = [
    p.product_name_en,
    p.product_name,
    p.generic_name_en,
    p.generic_name,
  ];

  for (const candidate of candidates) {
    const n = candidate?.trim();
    if (!n) continue;
    const resolved = resolveProductTitle(n, brand, p);
    if (resolved && !isGenericObfProductName(resolved)) return resolved;
  }

  const fromUrl = titleFromObfProductUrl(p.link ?? p.url, brand);
  if (fromUrl && !isGenericObfProductName(fromUrl)) return fromUrl;

  return null;
}

function resolveProductTitle(
  rawName: string,
  brand: string | null,
  p: ObfProductFields,
): string | null {
  const name = rawName.trim();
  if (!name) return null;
  if (!isWeakProductTitle(name)) return name;

  if (brand) {
    const brandLower = brand.toLowerCase();
    const nameLower = name.toLowerCase();
    if (nameLower.includes(brandLower)) return name;
    const combined = `${brand} ${name}`.trim();
    if (!isWeakProductTitle(combined) && !isGenericObfProductName(combined)) {
      return combined;
    }
  }

  const fromUrl = titleFromObfProductUrl(p.link ?? p.url, brand);
  if (fromUrl) return fromUrl;

  return brand ? `${brand} ${name}` : name;
}

function titleFromObfProductUrl(
  url: string | undefined,
  brand: string | null,
): string | null {
  if (!url) return null;
  const match = url.match(/\/product\/[^/]+\/([^?#]+)/i);
  if (!match?.[1]) return null;

  const slug = decodeURIComponent(match[1]).trim();
  if (!slug) return null;

  const parts = slug.split("-").filter(Boolean);
  if (parts.length === 0) return null;

  const titleFromSlug = parts
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

  if (!brand) return titleFromSlug;

  const brandSlug = brand.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(
    /(^-|-$)/g,
    "",
  );
  const brandParts = brandSlug.split("-").filter(Boolean);

  if (brandParts.length > 0) {
    const tail = parts.slice(-brandParts.length).join("-");
    if (tail === brandParts.join("-")) {
      const productParts = parts.slice(0, -brandParts.length);
      if (productParts.length > 0) {
        const productTitle = productParts
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(" ");
        return `${brand} ${productTitle}`.trim();
      }
    }
  }

  const brandLower = brand.toLowerCase();
  if (!titleFromSlug.toLowerCase().includes(brandLower)) {
    return `${brand} ${titleFromSlug}`.trim();
  }

  return titleFromSlug;
}

export function isGenericObfProductName(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return true;
  if (normalized.length < 3) return true;

  const genericNames = new Set([
    "accessories",
    "hygiene",
    "body",
    "face",
    "hair",
    "product",
    "products",
    "wipe",
    "wipes",
    "wash",
    "body wash",
    "pads",
    "pad",
    "tampon",
    "tampons",
    "condom",
    "condoms",
    "original",
    "classic",
    "incorrect product type",
    "open-beauty-facts",
    "nana",
    "serviettes hygiéniques",
    "serviettes hygieniques",
    "serviette hygiénique",
    "serviette hygienique",
  ]);
  if (genericNames.has(normalized)) return true;
  if (/^\d+\s+(condoms?|pcs?|pi[eè]ces?)$/i.test(normalized)) return true;

  return isWeakProductTitle(name);
}

function isWeakProductTitle(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return true;

  const weakTitles = new Set([
    "classic",
    "classic natural",
    "original",
    "original normal",
    "original super",
    "procomfort",
    "skin thin",
    "condom",
    "condoms",
    "tampons",
    "tampon",
    "ultra normal",
    "ultra long",
    "play feel",
  ]);
  if (weakTitles.has(normalized)) return true;
  if (/^\d+\s+condoms?$/i.test(normalized)) return true;

  return false;
}

function pickBrand(p: ObfProductFields): string | null {
  const raw = p.brands?.trim();
  if (!raw) return null;
  return raw.split(",")[0]?.trim() ?? null;
}

function pickCategory(
  p: ObfProductFields,
  categoryLabel?: string,
  categorySlug?: string,
): string | null {
  if (categoryLabel?.trim()) return categoryLabel.trim();
  if (categorySlug?.trim()) return formatCategorySlug(categorySlug.trim());
  const tag = p.categories_tags?.find((t) => t.startsWith("en:"));
  if (tag) return formatCategorySlug(tag.replace(/^en:/, ""));
  const first = p.categories?.split(",")[0]?.trim();
  if (first) return first;
  const h = p.categories_hierarchy;
  if (h?.length) {
    const leaf = h[h.length - 1];
    return leaf.replace(/^..:/, "").replace(/-/g, " ");
  }
  return null;
}

function formatCategorySlug(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function pickSizeCount(p: ObfProductFields): string | null {
  const q = p.quantity?.trim();
  if (q) return q;
  const amount = p.product_quantity;
  const unit = p.product_quantity_unit?.trim();
  if (amount != null && amount !== "") {
    return unit ? `${amount}${unit}` : String(amount);
  }
  return null;
}

function pickIngredientsList(p: ObfProductFields): string | null {
  const text = (p.ingredients_text_en ?? p.ingredients_text ?? "").trim();
  if (!text) return null;
  if (text.length > 400) return null;
  if (
    /préservatif|preservatif|utilisation|notice|médecin|medical device|grossesse|un préservatif/i
      .test(text.slice(0, 120))
  ) {
    return null;
  }
  return text;
}

function obfProductPageUrl(barcode: string): string {
  return `https://world.openbeautyfacts.org/product/${encodeURIComponent(barcode)}`;
}

function inferOrganic(p: ObfProductFields): boolean | null {
  const tags = p.labels_tags ?? [];
  if (tags.some((t) => t.includes("organic") || t.includes("bio"))) return true;
  return null;
}

function inferCertification(p: ObfProductFields, keyword: string): boolean | null {
  const labels = p.labels?.toLowerCase() ?? "";
  const tags = p.labels_tags ?? [];
  if (labels.includes(keyword) || tags.some((t) => t.toLowerCase().includes(keyword))) {
    return true;
  }
  return null;
}
