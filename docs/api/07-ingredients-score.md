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

```json
{
  "success": true,
  "data": {
    "ingredients": [
      {
        "ingredient_name": "Niacinamide",
        "inci_name": "niacinamide",
        "suggested_impact_score": "+2",
        "confidence": "high",
        "brief_reasoning": "Well-studied barrier support with strong safety data.",
        "needs_human_review": false,
        "flagged_id": "00000000-0000-0000-0000-000000000001"
      }
    ]
  }
}
```

**`suggested_impact_score` values:** `+2`, `+1`, `0`, `-1`, `-2`, `No Data`

**Flagged row fields** (database): `impact_score` as `"(+2)"` … `"(-2)"` or null for No Data; `classification` as `Beneficial`, `Harmful`, `Neutral`, or `No Data`; plus `confidence`, `brief_reasoning`, `needs_human_review`.

**Environment**

- `ANTHROPIC_API_KEY` — required
- `CLAUDE_MODEL` — optional (default `claude-sonnet-4-6`; update when Anthropic retires models)
- `ADMIN_SECRET` — required for this route
