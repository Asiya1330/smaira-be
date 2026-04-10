# Authentication

Sign up, sign in, and sign out are provided by **Supabase Auth**, not by a separate Edge Function.

Use the Supabase client in your app:

- `supabase.auth.signUp({ email, password, ... })`
- `supabase.auth.signInWithPassword({ email, password })`
- `supabase.auth.signOut()`

**Docs:** [Supabase Auth](https://supabase.com/docs/guides/auth)

Protected Edge Functions (`saved-products`, `product-submissions`) expect:

```http
Authorization: Bearer <user_jwt>
```

Obtain the session JWT from `supabase.auth.getSession()` after login.
