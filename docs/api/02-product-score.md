# Product score — `products-score`

**Method:** `GET`  
**Query:** `productId` (uuid, required)

Computes the normalized score (README algorithm), persists it to `products.score`, and returns the breakdown. Ingredient rows use string `impact_score` labels such as `(+1)` and `(-2)`; the server maps them to -2…+2 for the calculation.

**Example**

```http
GET /functions/v1/products-score?productId=00000000-0000-0000-0000-000000000000
```

**Example response**

```json
{
  "success": true,
  "data": {
    "product": {
      "product_name": "...",
      "brand": "...",
      "category": "...",
      "image_url": "...",
      "score": 72,
      "rating": "Microbiome Friendly"
    },
    "ingredients": [
      {
        "ingredient_name": "Rayon",
        "inci_name": "Rayon",
        "classification": "Neutral",
        "plain_english_summary": null,
        "impact_score": "(0)"
      }
    ],
    "summary": {
      "beneficial_count": 1,
      "harmful_count": 0,
      "neutral_count": 2,
      "no_data_count": 0
    }
  }
}

```

Each ingredient object matches [`products-scan`](./01-barcode-scan.md): `ingredient_name`, `inci_name`, `classification`, `plain_english_summary`, and `impact_score` (stored labels such as `(0)` and `(+1)`, same as the database).
