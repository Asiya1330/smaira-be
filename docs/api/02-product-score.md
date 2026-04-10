# Product score — `products-score`

**Method:** `GET`  
**Query:** `productId` (uuid, required)

Computes the normalized score (README algorithm), persists it to `products.score`, and returns the breakdown.

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
