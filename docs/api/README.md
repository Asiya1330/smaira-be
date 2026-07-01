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
| [07-ingredients-score.md](./07-ingredients-score.md) | `ingredients-score` (Claude batch scoring → `flagged_ingredients`) |
| [08-obf-catalog.md](./08-obf-catalog.md) | `obf-catalog` (OBF category fetch → `products`-shaped preview, no DB write) |
| [09-products-top.md](./09-products-top.md) | `products-top` (top-scoring products by category) |

Environment secrets for functions (set in Supabase Dashboard or CLI):

- `SUPABASE_URL` — injected by platform
- `SUPABASE_ANON_KEY` — required for JWT validation in user-scoped routes
- `SUPABASE_SERVICE_ROLE_KEY` — server-side DB access (never expose to clients)
- `ADMIN_SECRET` — optional; required for `admin`, `ingredients-score`, and `obf-catalog` (`x-admin-secret` header)
- `ANTHROPIC_API_KEY` — required for `ingredients-score`
- `CLAUDE_MODEL` — optional; Claude model id for `ingredients-score` (default `claude-sonnet-4-6`)
