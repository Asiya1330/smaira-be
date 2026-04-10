# Admin — `admin`

All routes require header:

```http
x-admin-secret: <same value as ADMIN_SECRET env>
```

Set `ADMIN_SECRET` in the project’s Edge Function secrets. Replace with JWT role checks for production if preferred.

---

## Flagged ingredients

**List**

```http
GET /functions/v1/admin?resource=flagged-ingredients
x-admin-secret: ***
```

**Update status**

```http
PUT /functions/v1/admin?resource=flagged-ingredients&id=<uuid>
x-admin-secret: ***
Content-Type: application/json

{"status":"In Progress"}
```

---

## Submissions

**List pending**

```http
GET /functions/v1/admin?resource=submissions
x-admin-secret: ***
```

**Approve** (creates a `products` row and marks submission approved)

```http
POST /functions/v1/admin?resource=submissions&action=approve&id=<uuid>
x-admin-secret: ***
```

**Reject**

```http
POST /functions/v1/admin?resource=submissions&action=reject&id=<uuid>
x-admin-secret: ***
Content-Type: application/json

{"review_notes":"Duplicate barcode"}
```

Empty body is allowed for reject.
