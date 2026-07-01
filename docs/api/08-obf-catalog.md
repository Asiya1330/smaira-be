# OBF catalog import — `obf-catalog`

**Method:** `POST`  
**Auth:** `x-admin-secret: <ADMIN_SECRET>` (same as `admin`)

Fetches products from [Open Beauty Facts](https://world.openbeautyfacts.org) for **Probaya categories**, maps each product to **`products` table columns only**, and returns a **grouped array** for review before DB insert. **Does not write to the database.**

Probaya categories are mapped to one or more OBF category slugs (handling naming differences like `lubricant` → `lubricants`, `wipe` → `fr:lingettes-intimes`).

## Default Probaya categories (when body is empty)

1. adult incontinence underwear  
2. lubricant  
3. cup  
4. condom  
5. liner  
6. wipe  
7. pad  
8. wash  
9. period underwear  
10. tampon  

## Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `categories` | `(string \| { category: string })[]` | No | Probaya labels; omit for defaults above |
| `page_size` | `number` | No | OBF products per page (default `100`) |

## Example — default 10 categories

```http
POST /functions/v1/obf-catalog
x-admin-secret: <ADMIN_SECRET>
Content-Type: application/json

{}
```

## Example — explicit categories

```http
POST /functions/v1/obf-catalog
x-admin-secret: <ADMIN_SECRET>
Content-Type: application/json

{
  "categories": [
    { "category": "lubricant" },
    { "category": "tampon" },
    { "category": "pad" }
  ],
  "page_size": 100
}
```

## Example response

```json
{
  "success": true,
  "data": [
    {
      "category": "lubricant",
      "count": 1,
      "fetch_urls": [
        "https://world.openbeautyfacts.org/category/Personal%20lubricants.json?page_size=100"
      ],
      "products": [
        {
          "barcode": "8717344178716",
          "product_name": "Cobeco male water lubricant warm",
          "name": "Cobeco male water lubricant warm",
          "brand": "Cobeco pharma",
          "category": "lubricant",
          "size_count": "250ml",
          "ingredients_list": null,
          "image_url": "https://images.openbeautyfacts.org/...",
          "source_url": "https://world.openbeautyfacts.org/product/...",
          "score": null,
          "verified": false
        }
      ]
    },
    {
      "category": "tampon",
      
      "products": []
    }
  ]
}
```

Each group includes `count`, `fetch_urls` (every OBF category API URL requested, with `page_size` and page number), and `products[]`.

Each `products[]` item contains **only** `products` table columns (no `id`). The `category` field on each product is the **Probaya** label, not the OBF slug.

Generic OBF titles (e.g. `Classic`, `Condom`, `Original`) are enriched with brand and/or the product URL slug; products that still lack a usable name are omitted.

## OBF slug mapping

Mapping lives in `supabase/functions/_shared/services/open-beauty-facts/probaya-category-map.ts`. Examples:

| Probaya | OBF slugs tried |
|---------|-----------------|
| lubricant | `lubricants`, `personal-lubricants` |
| wipe | `fr:lingettes-intimes`, `intimate-wipes`, `Moist wipes`, `wipes` |
| wash | `wash`, `face-wash`, `body-wash`, `shower-gel`, `Showers and baths` |
| tampon | `tampons`, `tampon`, `Hygiene` |

Missing OBF slugs (404) are skipped silently. Categories with no matching OBF data return `"products": []`.

## Deploy

```bash
cd /Users/asiyabatool/Documents/projects/probaya
supabase functions deploy obf-catalog --no-verify-jwt
```

## Notes

- Products are deduped by **barcode within each Probaya category** (not globally).
- The same barcode may appear under multiple Probaya categories if multiple OBF slugs return it.
- Many feminine-hygiene products on OBF are sparse; empty groups are expected for some categories until OBF data grows.
