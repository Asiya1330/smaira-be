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
      "name": "...",
      "brand": "...",
      "category": "...",
      "image_url": "...",
      "score": 72,
      "rating": "Microbiome Friendly"
    },
    "ingredients": [],
    "summary": {
      "beneficial_count": 1,
      "harmful_count": 0,
      "neutral_count": 2,
      "no_data_count": 0
    }
  }
}

```
