import { getInciApiKey } from "../../config/env.ts";

export type InciProductLookup = {
  product_name: string;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  ingredients: string | null;
};

type InciApiProduct = {
  barcode?: string;
  name?: string;
  brand?: string;
  category?: string | string[];
  imageUrls?: string[];
  ingredients?: string;
  details?: {
    inci?: string[];
  };
};

type InciApiResponse = {
  product?: InciApiProduct;
};

const BASE_URL =
  "https://inciapi.com/v1/products";


/**
 * Lookup product by barcode on INCI API (inciapi.com).
 * Requires INCI_API_KEY env var.
 */
export async function fetchInciProductByBarcode(
  barcode: string,
): Promise<InciProductLookup | null> {
  const apiKey = getInciApiKey();
  if (!apiKey) return null;

  const url = `${BASE_URL}/${encodeURIComponent(barcode)}`;
  const res = await fetch(url, {
    headers: { "X-API-Key": apiKey },
  });
  if (!res.ok) return null;
  const payload = (await res.json()) as InciApiResponse;
  const mapped = mapInciProduct(payload?.product, barcode);
  return mapped;
}

function mapInciProduct(
  p: InciApiProduct | undefined,
  barcode: string,
): InciProductLookup | null {
  if (!p) return null;

  const ingredients = pickIngredientsText(p);
  const product_name = (p.name ?? "").trim() || `Pending — ${barcode}`;
  const brand = (p.brand ?? "").trim() || null;
  const category = pickCategory(p.category);
  const image_url = p.imageUrls?.[0]?.trim() || null;

  if (!ingredients && !p.name) return null;

  return {
    product_name,
    brand,
    category,
    image_url,
    ingredients,
  };
}

function pickIngredientsText(p: InciApiProduct): string | null {
  const raw = p.ingredients?.trim();
  if (raw) return raw;
  const inci = p.details?.inci;
  if (inci?.length) {
    return inci.map((s) => s.trim()).filter(Boolean).join(", ");
  }
  return null;
}

function pickCategory(category: string | string[] | undefined): string | null {
  if (!category) return null;
  if (Array.isArray(category)) {
    const first = category[0]?.trim();
    return first || null;
  }
  const c = category.trim();
  return c || null;
}
