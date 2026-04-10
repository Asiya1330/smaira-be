# Edge Functions layout

| Folder | Role |
|--------|------|
| `products-scan` | Barcode → DB → Open Beauty Facts → submission prompt |
| `products-score` | Load ingredients, run scoring algorithm, persist `products.score` |
| `saved-products` | User JWT — list / save / delete saved products |
| `product-submissions` | Authenticated product submission for review |
| `admin` | Flagged ingredients + submission approve/reject (`x-admin-secret`) |
| `_shared` | HTTP helpers, env, Supabase clients, domain services |

**Conventions**

- Handlers stay thin: validate input → call `_shared/services/*` → `jsonOk` / `jsonError`.
- Database access goes through `services/**/repository.ts` using `getAdminClient()` after auth rules are applied.
- Scoring math lives in `_shared/services/scoring/` only.

API docs for the frontend: `docs/api/`.
