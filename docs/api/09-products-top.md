# products-top

Returns the top-scoring products within a single category, highest score first.

## Request

```
GET /functions/v1/products-top?category=<category>&limit=<n>
```

| Query param | Required | Description |
|-------------|----------|-------------|
| `category`  | yes      | Category to filter by (case-insensitive, e.g. `tampon`, `wash`). |
| `limit`     | no       | Number of products to return. Integer 1–50, default `3`. |

Products without a `score` are excluded. Results are ordered by `score` descending.

## Example

```
GET /functions/v1/products-top?category=tampon&limit=3
```

```json
{
  "success": true,
  "data": {
    "category": "tampon",
    "count": 3,
    "products": [
      {
        "id": "…",
        "barcode": "…",
        "product_name": "…",
        "brand": "…",
        "category": "tampon",
        "score": 92,
        "image_url": "…",
        "verified": true
      }
    ]
  }
}
```

Each `products[]` item is a full `products` table row.

## Errors

| Status | When |
|--------|------|
| 400    | `category` missing, or `limit` not an integer in 1–50. |
| 405    | Method other than `GET`. |

## Deploy

```bash
cd /Users/asiyabatool/Documents/projects/probaya
supabase functions deploy products-top
```
