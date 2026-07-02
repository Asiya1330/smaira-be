# Ingredients score (Claude) — `ingredients-score`

**Method:** `POST`  
**Auth:** `x-admin-secret: <ADMIN_SECRET>` (same as `admin`)

Scores a list of ingredient names with Claude, inserts one row per ingredient into `flagged_ingredients` (status `Pending`), and returns the scores. Not wired into any product pipeline.

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `ingredients` | `string[]` | Yes | Ingredient display names or INCI strings to score |
| `prompt` | `string` | No | Extra instructions appended to the system scoring prompt |
| `product_ids` | `uuid[]` | No | Stored on each new flagged row (default `[]`) |

**Example**

```http
POST /functions/v1/ingredients-score
x-admin-secret: <ADMIN_SECRET>
Content-Type: application/json

{
  "ingredients": ["Niacinamide", "Fragrance"],
  "prompt": "Focus on menstrual care product context."
}
```

**Example response**

Each ingredient is scored independently. Successful items include full score data; failed items include the reason and the raw Claude response for debugging.

```json
{
  "success": true,
  "data": {
    "ingredients": [
      {
        "success": true,
        "ingredient_name": "Niacinamide",
        "inci_name": "niacinamide",
        "suggested_impact_score": "+2",
        "classification": "Beneficial",
        "confidence": "high",
        "severity_tier": null,
        "brief_reasoning": "Well-studied barrier support with strong safety data.",
        "plain_english_summary": "This ingredient supports skin barrier health.",
        "short_description": "Vitamin B3 derivative",
        "pubmed_link": null,
        "needs_human_review": false,
        "flagged_id": "00000000-0000-0000-0000-000000000001"
      },
      {
        "success": false,
        "ingredient_name": "tt",
        "reason": "inci_name is required",
        "claude_response": {
          "ingredient_name": "tt",
          "inci_name": null,
          "suggested_impact_score": "No Data",
          "classification": "No Data",
          "confidence": "low",
          "severity_tier": null,
          "brief_reasoning": "Not a recognized ingredient.",
          "plain_english_summary": "Unrecognizable ingredient.",
          "short_description": "Unrecognized",
          "needs_human_review": true,
          "pubmed_link": null
        }
      }
    ]
  }
}
```

**Per-ingredient result fields**

| Field | Present when | Description |
|-------|-------------|-------------|
| `success` | Always | `true` if parsed and flagged successfully, `false` otherwise |
| `ingredient_name` | Always | Name of the ingredient |
| `reason` | `success: false` | Why parsing failed (e.g. missing required field) |
| `claude_response` | `success: false` | Raw Claude response object for this ingredient |
| `inci_name` … `flagged_id` | `success: true` | Full scored ingredient data (see below) |

**`suggested_impact_score` values:** `+2`, `+1`, `0`, `-1`, `-2`, `No Data`

**Flagged row fields** (database — only inserted for `success: true` items): `impact_score` as `"(+2)"` … `"(-2)"` or null for No Data; `classification` as `Beneficial`, `Harmful`, `Neutral`, or `No Data`; plus `confidence`, `brief_reasoning`, `needs_human_review`.

**Environment**

- `ANTHROPIC_API_KEY` — required
- `CLAUDE_MODEL` — optional (default `claude-sonnet-4-6`; update when Anthropic retires models)
- `ADMIN_SECRET` — required for this route
