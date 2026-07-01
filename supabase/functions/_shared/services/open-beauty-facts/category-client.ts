import type { ProductInsertRow } from "./map-product.ts";
import {
  isGenericObfProductName,
  mapObfProductToInsertRow,
  type ObfProductFields,
} from "./map-product.ts";
import {
  obfSlugsForProbayaCategory,
  resolveProbayaCategories,
} from "./probaya-category-map.ts";

const BASE = "https://world.openbeautyfacts.org";
const USER_AGENT = "ProbayaMicrobiomeApp/1.0";

type ObfCategoryPage = {
  count?: number;
  page?: number;
  page_count?: number;
  page_size?: number;
  products?: ObfProductFields[];
};

export type ObfCatalogCategoryGroup = {
  category: string;
  count: number;
  /** OBF category API URLs used to fetch this group (includes page_size and page). */
  fetch_urls: string[];
  products: ProductInsertRow[];
};

export type FetchObfCatalogInput = {
  /** Probaya categories; defaults to the 10 app categories when omitted. */
  categories?: Array<string | { category: string }>;
  page_size?: number;
};

function normalizeBarcode(raw: string | undefined): string | null {
  const code = raw?.trim();
  if (!code) return null;
  return code;
}

function pickRawName(p: ObfProductFields): string {
  return (p.product_name_en ?? p.product_name ?? p.generic_name_en ?? p.generic_name ?? "")
    .trim();
}

function includesAny(text: string, words: string[]): boolean {
  const t = text.toLowerCase();
  return words.some((word) => t.includes(word));
}

function slugMatches(slug: string, needles: string[]): boolean {
  const s = slug.toLowerCase();
  return needles.some((needle) => s.includes(needle.toLowerCase()));
}

function isRelevantForProbayaCategory(
  probayaCategory: string,
  item: ObfProductFields,
  sourceSlug: string,
): boolean {
  const name = pickRawName(item).toLowerCase();
  const tags = (item.categories_tags ?? []).map((t) => t.toLowerCase());
  const categories = (item.categories ?? "").toLowerCase();
  const haystack = `${name} ${categories} ${tags.join(" ")} ${sourceSlug}`.trim();

  const has = (words: string[]) => includesAny(haystack, words);

  const babySignals = [
    "baby",
    "bebe",
    "bébé",
    "infant",
    "pampers",
    "huggies",
    "waterwipes",
    "diaper",
    "nappy",
  ];

  const linerSignals = [
    "liner",
    "panty liner",
    "protège-slip",
    "protege-slip",
    "protège-lingerie",
    "protege-lingerie",
    "protège lingerie",
    "dailies",
    "pantiliner",
  ];

  switch (probayaCategory.toLowerCase()) {
    case "wipe":
      if (slugMatches(sourceSlug, ["lingettes-intimes"])) {
        return !has(babySignals);
      }
      return has(["lingettes-intimes", "lingettes intimes", "intimate wipe", "toallitas íntimas"]) &&
        !has(babySignals);
    case "wash":
      if (slugMatches(sourceSlug, ["intimate wash gels"])) return true;
      return has([
        "intimate wash",
        "toilette intime",
        "gel de toilette intime",
        "gel apaisant de toilette intime",
        "hygiene-intime",
      ]) && !has(["face wash", "shower gel", "shampoo", "body wash"]);
    case "liner":
      return has(linerSignals);
    case "pad":
      if (has(linerSignals)) return false;
      return has(["serviette", "sanitary pad", "menstrual pad"]) ||
        slugMatches(sourceSlug, ["serviettes-hygieniques"]);
    case "tampon":
      return has(["tampon"]) || slugMatches(sourceSlug, ["tampons", "tampons-reguliers"]);
    case "condom":
      return has(["condom", "preservatif", "préservatif"]) ||
        slugMatches(sourceSlug, ["condoms", "preservatifs"]);
    case "lubricant":
      if (has(["mineral oil"]) && !has(["lubric", "lubrifiant", "glijmiddel", "gel"])) {
        return false;
      }
      return has(["lubric", "glijmiddel", "lubrifiant", "personal lubricant"]) ||
        slugMatches(sourceSlug, ["lubricants", "gels-lubrifiants"]);
    case "cup":
      return has(["menstrual cup", "coupelle"]);
    case "period underwear":
      return has(["period underwear", "culotte menstruelle", "menstrual underwear"]) ||
        slugMatches(sourceSlug, ["culottes-menstruelles"]);
    case "adult incontinence underwear":
      return has(["incontinence", "adult diaper", "couches adultes"]);
    default:
      return true;
  }
}

export function categoryPageUrl(
  slug: string,
  page: number,
  pageSize: number,
): string {
  const encoded = encodeURIComponent(slug.trim());
  const suffix = page <= 1 ? "" : `/${page}`;
  const params = new URLSearchParams({ page_size: String(pageSize) });
  return `${BASE}/category/${encoded}${suffix}.json?${params}`;
}

/** Returns null on any OBF failure — caller continues with partial/next slug. */
async function fetchCategoryPage(
  slug: string,
  page: number,
  pageSize: number,
): Promise<ObfCategoryPage | null> {
  try {
    const res = await fetch(categoryPageUrl(slug, page, pageSize), {
      headers: { "User-Agent": USER_AGENT },
    });
    if (!res.ok) {
      console.warn(
        `OBF category "${slug}" page ${page} skipped (HTTP ${res.status})`,
      );
      return null;
    }
    return (await res.json()) as ObfCategoryPage;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`OBF category "${slug}" page ${page} skipped: ${msg}`);
    return null;
  }
}

type SlugFetchResult = {
  products: ObfProductFields[];
  fetch_urls: string[];
};

async function fetchAllProductsForObfSlug(
  slug: string,
  pageSize: number,
): Promise<SlugFetchResult> {
  const products: ObfProductFields[] = [];
  const fetch_urls: string[] = [];
  let page = 1;
  let pageCount = 1;

  do {
    fetch_urls.push(categoryPageUrl(slug, page, pageSize));
    const payload = await fetchCategoryPage(slug, page, pageSize);
    if (!payload) {
      if (page === 1) return { products: [], fetch_urls };
      break;
    }

    pageCount = payload.page_count ?? 1;
    products.push(...(payload.products ?? []));
    page++;
  } while (page <= pageCount);

  return { products, fetch_urls };
}

/**
 * Fetches OBF products grouped by Probaya category. Each Probaya category queries
 * one or more OBF slugs; products are deduped by barcode within the group.
 * OBF errors (401, 404, timeouts) are skipped — partial results are returned.
 */
export async function fetchObfCatalogByProbayaCategories(
  input: FetchObfCatalogInput = {},
): Promise<ObfCatalogCategoryGroup[]> {
  const probayaCategories = resolveProbayaCategories(input.categories);
  const pageSize = input.page_size ?? 100;
  const groups: ObfCatalogCategoryGroup[] = [];

  for (const probayaCategory of probayaCategories) {
    const obfSlugs = obfSlugsForProbayaCategory(probayaCategory);
    const byBarcode = new Map<string, ProductInsertRow>();
    const fetch_urls: string[] = [];

    for (const slug of obfSlugs) {
      try {
        const { products: obfProducts, fetch_urls: slugUrls } =
          await fetchAllProductsForObfSlug(slug, pageSize);
        fetch_urls.push(...slugUrls);

        for (const item of obfProducts) {
          const barcode = normalizeBarcode(item.code ?? item.id);
          if (!barcode || byBarcode.has(barcode)) continue;
          if (!isRelevantForProbayaCategory(probayaCategory, item, slug)) continue;

          const mapped = mapObfProductToInsertRow(item, barcode, {
            categoryLabel: probayaCategory,
            categorySlug: slug,
          });
          if (!mapped.product_name || isGenericObfProductName(mapped.product_name)) {
            continue;
          }
          byBarcode.set(barcode, mapped);
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        console.warn(
          `OBF slug "${slug}" for "${probayaCategory}" skipped: ${msg}`,
        );
      }
    }

    const products = [...byBarcode.values()];
    groups.push({
      category: probayaCategory,
      count: products.length,
      fetch_urls,
      products,
    });
  }

  return groups;
}
