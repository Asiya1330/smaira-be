# Product Pipeline Spec

Base URL (local): `http://127.0.0.1:54321`  
Base URL (hosted): `https://<PROJECT_REF>.supabase.co`

All Edge Function responses:

```json
{ "success": true, "data": { } }
{ "success": false, "error": "message" }
```

---

## Flow (arrows)

```
User scan
  → GET products-scan?barcode=
       → found in DB → return product + ingredients (done)
       → OBF only → return OBF data + submissionPrompt (done)
       → not in DB → OBF → INCI → upsert product_submissions (scan_count++) → return response

User manual submit (optional)
  → POST product-submissions (ingredients optional)
       → row in product_submissions

Admin
  → GET admin?resource=submissions (enriched with scores)
  → approve / reject / edit ingredients
  → POST admin?resource=submissions&action=approve&id=
       → [NEW] insert ingredients + product_ingredients + products-score logic → live product
  → POST ingredients-score (optional: Claude batch scoring → flagged_ingredients)

Next scan
  → GET products-scan?barcode= → source: database
```

**Ingredient routing**

```
product_submissions.ingredients filled by user?
  → YES → submission ready for admin review / scoring
  → NO  → products-scan catalog miss may fetch OBF → INCI and upsert submission; or ingredients_not_found
```

---

## Existing (do not rebuild)

| Function | File |
|----------|------|
| `products-scan` | `supabase/functions/products-scan/` |
| `products-score` | `supabase/functions/products-score/` |
| `product-submissions` | `supabase/functions/product-submissions/` |
| `saved-products` | `supabase/functions/saved-products/` |
| `admin` | `supabase/functions/admin/` |
| `ingredients-score` | `supabase/functions/ingredients-score/` |
| OBF client | `supabase/functions/_shared/services/open-beauty-facts/client.ts` |
| Scoring | `supabase/functions/_shared/services/scoring/engine.ts` |

Tables today: `products`, `ingredients`, `product_ingredients`, `product_submissions`, `flagged_ingredients`, `saved_products`, `scoring_rules`

---

## 1. GET products-scan (exists)

**URL:** `GET $SUPABASE_URL/functions/v1/products-scan?barcode={barcode}`

```bash
curl -sS "$SUPABASE_URL/functions/v1/products-scan?barcode=1234567890123"
```

**Response — database**

```json
{
  "success": true,
  "data": {
    "source": "database",
    "product": { "id": "uuid", "barcode": "...", "product_name": "...", "score": 72 },
    "ingredients": [
      {
        "ingredient_name": "Niacinamide",
        "inci_name": "niacinamide",
        "classification": "Beneficial",
        "plain_english_summary": "...",
        "impact_score": "(+2)"
      }
    ],
    "submissionPrompt": null
  }
}
```

**Response — not_found (today)**

```json
{
  "success": true,
  "data": {
    "source": "not_found",
    "product": null,
    "ingredients": [],
    "submissionPrompt": {
      "message": "Product not found. Submit details so our team can review and add it.",
      "submitFunction": "product-submissions"
    }
  }
}
```

On catalog miss, upserts `product_submissions` (OBF → INCI). `scan_count` increments per **new authenticated user** (`scanned_user_ids`); each anonymous scan also increments. Response includes `submission: { id, scan_count }`.

---

## 2. POST product-submissions (exists)

**URL:** `POST $SUPABASE_URL/functions/v1/product-submissions`  
**Auth:** `Authorization: Bearer <jwt>`

```bash
curl -sS -X POST "$SUPABASE_URL/functions/v1/product-submissions" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "product_name": "Unknown lotion",
    "barcode": "1234567890123",
    "brand": "Brand",
    "ingredients": "Water, Glycerin, Niacinamide"
  }'
```

**Response**

```json
{
  "success": true,
  "data": { "id": "uuid", "status": "pending" }
}
```

---

## 3. GET products-score (exists)

**URL:** `GET $SUPABASE_URL/functions/v1/products-score?productId={uuid}`

```bash
curl -sS "$SUPABASE_URL/functions/v1/products-score?productId=11111111-2222-3333-4444-555555555555"
```

**Response**

```json
{
  "success": true,
  "data": {
    "product": {
      "product_name": "...",
      "brand": "...",
      "score": 72,
      "rating": "Microbiome Friendly"
    },
    "ingredients": [
      {
        "ingredient_name": "...",
        "inci_name": "...",
        "classification": "Beneficial",
        "impact_score": "(+1)"
      }
    ],
    "summary": {
      "beneficial_count": 1,
      "harmful_count": 0,
      "neutral_count": 0,
      "no_data_count": 0
    }
  }
}
```

---

## 4. Admin (exists — extend submissions list + approve)

**URL base:** `$SUPABASE_URL/functions/v1/admin`  
**Header:** `x-admin-secret: $ADMIN_SECRET`

### GET pending submissions

```bash
curl -sS "$SUPABASE_URL/functions/v1/admin?resource=submissions" \
  -H "x-admin-secret: $ADMIN_SECRET"
```

**Response (today)**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid",
      "product_name": "...",
      "brand": "...",
      "barcode": "...",
      "ingredients": "Water, Glycerin",
      "submitted_at": "2026-05-19T12:00:00Z",
      "status": "pending",
      "review_notes": null
    }
  ]
}
```

**Response [NEW] — include scores**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "barcode": "1234567890123",
      "product_name": "...",
      "ingredients": "Water, Glycerin",
      "scan_count": 5,
      "pipeline_status": "awaiting_admin_review",
      "retrieval_source": "inci_api",
      "ingredient_scores": [
        {
          "ingredient_name": "Niacinamide",
          "inci_name": "niacinamide",
          "suggested_impact_score": "(+2)",
          "confidence": "high",
          "brief_reasoning": "...",
          "needs_human_review": false,
          "source": "database",
          "admin_status": "pending"
        }
      ]
    }
  ]
}
```

### POST approve submission

```bash
curl -sS -X POST "$SUPABASE_URL/functions/v1/admin?resource=submissions&action=approve&id=SUBMISSION_UUID" \
  -H "x-admin-secret: $ADMIN_SECRET"
```

**Response (today)**

```json
{
  "success": true,
  "data": {
    "approved": true,
    "product": { "id": "uuid", "barcode": "1234567890123" }
  }
}
```

**[NEW]** Approve must also: create/link `ingredients`, `product_ingredients`, run score, set `products.score`.

### POST reject submission

```bash
curl -sS -X POST "$SUPABASE_URL/functions/v1/admin?resource=submissions&action=reject&id=SUBMISSION_UUID" \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"review_notes":"duplicate"}'
```

**Response**

```json
{ "success": true, "data": { "rejected": true } }
```

---

## External APIs

### Open Beauty Facts (used in products-scan today)

**URL:** `GET https://world.openbeautyfacts.org/api/v2/product/{barcode}.json`

```bash
curl -sS "https://world.openbeautyfacts.org/api/v2/product/3600530771944.json" \
  -H "User-Agent: ProbayaMicrobiomeApp/1.0"
```

**Response (shape)**

```json
{
  "status": 1,
  "product": {
    "code": "3600530771944",
    "product_name": "...",
    "brands": "...",
    "ingredients_text": "Aqua, Glycerin, ...",
    "ingredients": [{ "text": "aqua" }]
  }
}
```

Use `ingredients_text` or join `ingredients[].text`.

### INCI API (products-scan catalog miss)

**URL:** `GET https://api.inciapi.com/v1/products/{barcode}`  
**Auth:** `X-API-Key: sk_live_...` (required — register at https://inciapi.com/register)

```bash
curl -sS "https://api.inciapi.com/v1/products/0085275710434" \
  -H "X-API-Key: $INCI_API_KEY"
```

**Response (shape)**

```json
{
  "product": {
    "barcode": "0085275710434",
    "name": "CeraVe Foaming Facial Cleanser",
    "brand": "CeraVe",
    "ingredients": "Aqua/Water, Glycerin, ...",
    "details": {
      "inci": ["Aqua/Water", "Glycerin", "Niacinamide"]
    }
  }
}
```

Use `product.ingredients` or `product.details.inci`.

**Out of scope:** web scraping.

---

## New columns — `product_submissions`

| Column | Type | Notes |
|--------|------|-------|
| `scan_count` | integer NOT NULL DEFAULT 1 | Priority queue |
| `last_scanned_at` | timestamptz | Last failed scan |
| `pipeline_status` | text NOT NULL DEFAULT 'awaiting_retrieval' | See values below |
| `retrieval_source` | text | `user` \| `open_beauty_facts` \| `inci_api` |
| `last_retrieval_at` | timestamptz | |
| `last_scoring_at` | timestamptz | |
| `scoring_error` | text | |

`pipeline_status` values:

- `awaiting_retrieval`
- `ingredients_not_found`
- `ready_for_scoring`
- `scoring_failed`
- `awaiting_admin_review`
- `published`
- `rejected`

**Also consider:** `user_id` nullable (anonymous scan) OR fixed system user UUID.

**Index:** unique pending per barcode  
`CREATE UNIQUE INDEX ... ON product_submissions (barcode) WHERE status = 'pending';`

---

## New table — `submission_ingredient_scores`

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid PK | |
| `submission_id` | uuid FK → product_submissions | ON DELETE CASCADE |
| `ingredient_name` | text NOT NULL | |
| `inci_name` | text NOT NULL | |
| `suggested_impact_score` | text | `(-2)` … `(+2)` or No Data |
| `suggested_classification` | text | Beneficial / Harmful / Neutral / No Data |
| `confidence` | text | high / medium / low |
| `brief_reasoning` | text | |
| `needs_human_review` | boolean DEFAULT false | |
| `source` | text | database / claude |
| `admin_status` | text DEFAULT 'pending' | pending / approved / rejected / edited |
| `final_impact_score` | text | set on admin approve |
| `final_classification` | text | |
| `created_at` | timestamptz DEFAULT now() | |

---

## Env vars (new)

| Variable | Used by |
|----------|---------|
| `INCI_API_KEY` | products-scan (INCI fallback on catalog miss) |
| `ANTHROPIC_API_KEY` | ingredients-score |
| `ADMIN_SECRET` | admin, ingredients-score |

---

## Scoring rules (exists — do not change)

```
raw = sum(impact scores)           // (+2)→2, (-1)→-1, etc.
normalized = ((raw - n*-2) / (n*4)) * 100
final_score = round(0–100)
```

Ratings: 70–100 Microbiome Friendly | 40–69 Use With Caution | 0–39 Not Recommended

Impact labels in DB: `"(+2)"`, `"(+1)"`, `"(0)"`, `"(-1)"`, `"(-2)"`
