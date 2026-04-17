# Barcode scan — `products-scan`

**Method:** `GET`  
**Query:** `barcode` (required)

**Example**

```http
GET /functions/v1/products-scan?barcode=73010713192
```

**Example response**

```json
{
  "success": true,
  "data": {
    "source": "database",
    "product": { "id": "...", "name": "...", "barcode": "73010713192", "..." : "..." },
    "ingredients": [
      {
        "ingredient_name": "...",
        "inci_name": "...",
        "classification": "Neutral",
        "plain_english_summary": "...",
        "impact_score": "(0)"
      }
    ],
    "submissionPrompt": null
  }
}
```

If the product is only on Open Beauty Facts, `source` is `open_beauty_facts` and `submissionPrompt` may direct the client to `product-submissions`.

If nothing is found, `source` is `not_found` and `submissionPrompt` explains how to submit.
