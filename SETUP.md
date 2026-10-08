# Setup — Phase 1

Phase 1 is auth + upload + storage only. No AI calls happen yet.

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com) — pick an **EU region** (e.g. Frankfurt) for data residency.
2. In **Project Settings → API**, copy the **Project URL** and **anon public** key.
3. Copy `.env.example` to `.env` and fill them in:

   ```
   SUPABASE_URL=https://xxxx.supabase.co
   SUPABASE_ANON_KEY=xxxx
   ```

## 2. Apply the database migration

In the Supabase dashboard, open **SQL Editor**, paste the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql), and run it.

This creates:

- `profiles` (one row per user, auto-created on signup) and `documents` (one row per upload), both with row-level security scoping every query to `auth.uid()`.
- A private Storage bucket named `documents` (15 MB limit, PDF/JPG/PNG only) with policies that let each user read/write only inside their own `{user_id}/...` folder.

If you'd rather use the Supabase CLI: `supabase db push` with this repo's `supabase/` folder linked to your project does the same thing.

## 3. Configure auth email redirect

In **Authentication → URL Configuration**, add to **Redirect URLs**:

- `http://localhost:5173/auth/confirm` (dev)
- `https://<your-production-domain>/auth/confirm` (once deployed)

This is where Supabase sends people after they click the magic-link email.

## 4. Run it

```bash
npm install
npm run dev
```

Sign in at `/login` with any email, click the link you receive, and you'll land on `/documents` able to upload PDFs/JPGs/PNGs. Uploaded files go straight to your private Storage bucket and appear in the table with status "Queued" — nothing calls Claude yet. That's Phase 2.
