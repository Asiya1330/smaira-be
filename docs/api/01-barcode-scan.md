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
        "short_description": "...",
        "impact_score": "(0)",
        "point_contribution": 0
      }
    ],
    "concerns": [
      {
        "name": "Methylparaben",
        "severity": "High",
        "description": "Preservative often flagged for endocrine-safety concerns.",
        "learn_more_url": null
      }
    ],
    "submissionPrompt": null
  }
}
```

### `concerns`

Harmful ingredients summarised for the Microbiome Concerns cards. One object per
ingredient linked to the product whose `classification` is `Harmful`, sorted
`High` → `Moderate` → `Low`.

| Field | Source |
|-------|--------|
| `name` | `ingredients.ingredient_name` (verbatim label) |
| `severity` | From `impact_score`: `(-2)` → `High`, `(-1)` → `Moderate`, `(0)` → `Low`; `null`/other → `Moderate` |
| `description` | `plain_english_summary`, else `notes`, else a generic microbiome fallback |
| `learn_more_url` | `ingredients.pubmed_link`, else `null` |

Empty (`[]`) for non-database sources (OBF / not found), whose ingredients are unclassified.

### `point_contribution`

The exact number of points an ingredient moved the final 0–100 score, relative
to a neutral baseline. Use it for the "What Impacted" UI
(e.g. `Synthetic Fragrance: -15 points`, `Lactic Acid: +7 points`).

- Formula: `impact_score / (scoredCount * 4) * 100`, rounded to 1 decimal, where
  `scoredCount` is the number of ingredients with a valid impact score
  (`Beneficial`/`Harmful`/`Neutral`). Example: impact `-2` across 5 scored
  ingredients → `-2 / 20 * 100 = -10.0`.
- `null` for `No Data` / unscored ingredients (including all Open Beauty Facts
  results, which have no impact scores).
- The sum of all `point_contribution` values plus the 50-point neutral baseline
  approximates the product's final score (before clamping/rounding).

If the product is only on Open Beauty Facts, `source` is `open_beauty_facts` and `submissionPrompt` may direct the client to `product-submissions`.

If nothing is found, `source` is `not_found` and `submissionPrompt` explains how to submit.
