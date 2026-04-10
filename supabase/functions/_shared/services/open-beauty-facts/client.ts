import type { MappedObfProduct } from "../../types/api.ts";

type ObfResponse = {
  status: number;
  product?: {
    product_name?: string;
    product_name_en?: string;
    brands?: string;
    brands_tags?: string[];
    categories?: string;
    image_url?: string;
    code?: string;
    link?: string;
  };
};

const BASE = "https://world.openbeautyfacts.org/api/v0/product";

/**
 * Fallback lookup when barcode is missing from our DB.
 * @see https://openbeautyfacts.github.io/openfoodfacts-server/api/
 */
export async function fetchObfByBarcode(
  barcode: string,
): Promise<MappedObfProduct | null> {
  const url = `${BASE}/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, { headers: { "User-Agent": "ProbayaMicrobiomeApp/1.0" } });
  if (!res.ok) return null;
  const payload = (await res.json()) as ObfResponse;
  if (payload.status !== 1 || !payload.product) return null;
  const p = payload.product;
  const name = p.product_name_en ?? p.product_name ?? "Unknown product";
  const brand = p.brands?.split(",")[0]?.trim() ?? null;
  const category = p.categories?.split(",")[0]?.trim() ?? null;
  return {
    name,
    brand,
    barcode,
    category,
    image_url: p.image_url ?? null,
    source_url: p.link ?? null,
  };
}
