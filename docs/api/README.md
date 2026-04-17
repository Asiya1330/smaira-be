# Edge Functions API

Base URL (deployed):

`https://<PROJECT_REF>.supabase.co/functions/v1/<function-name>`

Local:

`http://127.0.0.1:54321/functions/v1/<function-name>`

All JSON responses use:

```json
{ "success": true, "data": ... }
```

or

```json
{ "success": false, "error": "message" }
```

| Document | Description |
|----------|-------------|
| [01-barcode-scan.md](./01-barcode-scan.md) | `products-scan` |
| [02-product-score.md](./02-product-score.md) | `products-score` |
| [03-authentication.md](./03-authentication.md) | Supabase Auth (client-side) |
| [04-saved-products.md](./04-saved-products.md) | `saved-products` |
| [05-product-submissions.md](./05-product-submissions.md) | `product-submissions` |
| [06-admin.md](./06-admin.md) | `admin` (flagged ingredients + No Data sync, submissions, ingredients CRUD) |

Environment secrets for functions (set in Supabase Dashboard or CLI):

- `SUPABASE_URL` — injected by platform
- `SUPABASE_ANON_KEY` — required for JWT validation in user-scoped routes
- `SUPABASE_SERVICE_ROLE_KEY` — server-side DB access (never expose to clients)
- `ADMIN_SECRET` — optional; required for `admin` function (`x-admin-secret` header)
