# Admin — `admin`

All routes require header:

```http
x-admin-secret: <same value as ADMIN_SECRET env>
```

Set `ADMIN_SECRET` in the project’s Edge Function secrets. Replace with JWT role checks for production if preferred.

---

## Flagged ingredients

### List flagged ingredients

**Method:** `GET`
**Route:** `/functions/v1/admin?resource=flagged-ingredients`

```http
GET /functions/v1/admin?resource=flagged-ingredients
x-admin-secret: ***
```

**Response (200)**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "product_ids": ["00000000-0000-0000-0000-000000000000"],
      "ingredient_name": "Example Ingredient",
      "inci_name": "example inci",
      "status": "Pending",
      "flagged_at": "2026-04-17T10:00:00.000Z"
    }
  ]
}
```

### Update flagged ingredient status

**Method:** `PUT`
**Route:** `/functions/v1/admin?resource=flagged-ingredients&id=<uuid>`
**Body (JSON):** `{ "status": "<Pending | Reviewed | Resolved>" }` (case-insensitive: `pending`, `reviewed`, `resolved`)

```http
PUT /functions/v1/admin?resource=flagged-ingredients&id=<uuid>
x-admin-secret: ***
Content-Type: application/json

{"status":"Reviewed"}
```

**Response (200):** `{ "success": true, "data": { "updated": true } }`

### Sync No Data ingredients into flagged table

**Method:** `POST`
**Route:** `/functions/v1/admin?resource=flagged-ingredients&action=sync-no-data`

```http
POST /functions/v1/admin?resource=flagged-ingredients&action=sync-no-data
x-admin-secret: ***
```

1. Loads `ingredients` with `classification = "No Data"`.
2. **One `flagged_ingredients` row per `inci_name`** when inserting (existing rows matched case-insensitively). All products linked via `product_ingredients` for that ingredient are merged into **`product_ids`** (sorted, unique). If there are no links, **`product_ids` is `[]`**.
3. **Upserts:** updates an existing flagged row for that INCI if one exists, otherwise inserts a new row.

**Response (200):**

```json
{
  "success": true,
  "data": {
    "synced": true,
    "inserted": 2,
    "updated": 6,
    "no_data_ingredient_count": 8
  }
}
```

- `no_data_ingredient_count` — number of `ingredients` rows with `classification = "No Data"`.
- `inserted` — new `flagged_ingredients` rows created.
- `updated` — existing rows updated (same INCI, refreshed `product_ids` / names).

---

## Submissions

### List pending submissions

**Method:** `GET`
**Route:** `/functions/v1/admin?resource=submissions`

```http
GET /functions/v1/admin?resource=submissions
x-admin-secret: ***
```

**Response (200):** `{ "success": true, "data": [ ...pending submissions ] }`

### Approve submission

Creates a `products` row and marks the submission approved.

**Method:** `POST`
**Route:** `/functions/v1/admin?resource=submissions&action=approve&id=<uuid>`

```http
POST /functions/v1/admin?resource=submissions&action=approve&id=<uuid>
x-admin-secret: ***
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "approved": true,
    "product": {
      "id": "uuid",
      "barcode": "1234567890123"
    }
  }
}
```

### Reject submission

**Method:** `POST`
**Route:** `/functions/v1/admin?resource=submissions&action=reject&id=<uuid>`
**Body (optional JSON):** `{ "review_notes": "Duplicate barcode" }`

```http
POST /functions/v1/admin?resource=submissions&action=reject&id=<uuid>
x-admin-secret: ***
Content-Type: application/json

{"review_notes":"Duplicate barcode"}
```

Empty body is allowed for reject.

**Response (200):** `{ "success": true, "data": { "rejected": true } }`

---

## Ingredients

### Create ingredient

**Method:** `POST`
**Route:** `/functions/v1/admin?resource=ingredients`

The body must include values for every column on the `ingredients` table (see project README / schema). Use the **database column names** below. `ingredient_id` is normally **omitted** on create so the server/database assigns a new UUID; if your deployment requires an explicit id, include `ingredient_id` as well.

**Body (JSON) — all fields required for admin create**

| Column | Type | Required | Notes |
|--------|------|----------|-------|
| ingredient_name | text | Yes | Common name |
| inci_name | text | Yes | Standardized INCI name — critical matching key |
| impact_score | text | Yes | One of `(-2)`, `(-1)`, `(0)`, `(+1)`, `(+2)` |
| classification | text | Yes | Beneficial / Harmful / Neutral / No Data |
| plain_english_summary | text | Yes | One-sentence user-facing explanation |
| study_title | text | Yes | Supporting clinical study title |
| pubmed_link | text | Yes | URL to PubMed study |
| year_published | integer | Yes | Year of publication |
| evidence_strength | text | Yes | Strong / Moderate / Weak |
| conflicting_evidence | text | Yes | Yes / No |
| notes | text | Yes | Researcher flags or additional notes |

```http
POST /functions/v1/admin?resource=ingredients
x-admin-secret: ***
Content-Type: application/json

{
  "ingredient_name": "Niacinamide",
  "inci_name": "niacinamide",
  "impact_score": "(+2)",
  "classification": "Beneficial",
  "plain_english_summary": "Supports skin barrier and is generally well tolerated.",
  "study_title": "Example RCT title",
  "pubmed_link": "https://pubmed.ncbi.nlm.nih.gov/example",
  "year_published": 2020,
  "evidence_strength": "Moderate",
  "conflicting_evidence": "No",
  "notes": "Internal review complete."
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "created": true,
    "ingredient": {
      "ingredient_id": "uuid",
      "ingredient_name": "Niacinamide",
      "inci_name": "niacinamide",
      "impact_score": "(+2)",
      "classification": "Beneficial",
      "plain_english_summary": "Supports skin barrier and is generally well tolerated.",
      "study_title": "Example RCT title",
      "pubmed_link": "https://pubmed.ncbi.nlm.nih.gov/example",
      "year_published": 2020,
      "evidence_strength": "Moderate",
      "conflicting_evidence": "No",
      "notes": "Internal review complete."
    }
  }
}
```

### Update ingredient

**Method:** `PATCH`
**Route:** `/functions/v1/admin?resource=ingredients&id=<uuid>`

**Body (JSON):** one or more columns from `ingredients` (same names as create). Typical edits: `impact_score`, `classification`, `plain_english_summary`; any other column may be included.

| Column | Required | Notes |
|--------|----------|-------|
| impact_score | No | text: `(-2)` … `(+2)` |
| classification | No | |
| plain_english_summary | No | |
| study_title | No | |
| pubmed_link | No | |
| year_published | No | |
| evidence_strength | No | |
| conflicting_evidence | No | |
| notes | No | |
| ingredient_name | No | |
| inci_name | No | |

```http
PATCH /functions/v1/admin?resource=ingredients&id=<uuid>
x-admin-secret: ***
Content-Type: application/json

{
  "impact_score": "(-1)",
  "classification": "Harmful",
  "plain_english_summary": "Can irritate sensitive skin in higher concentrations."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "updated": true,
    "ingredient": {
      "ingredient_id": "uuid",
      "impact_score": "(-1)",
      "classification": "Harmful",
      "plain_english_summary": "Can irritate sensitive skin in higher concentrations."
    }
  }
}
```

---

## Common error responses

```json
{ "success": false, "error": "Unauthorized" }
```

```json
{ "success": false, "error": "Query id is required" }
```

```json
{ "success": false, "error": "Body must include status" }
```
