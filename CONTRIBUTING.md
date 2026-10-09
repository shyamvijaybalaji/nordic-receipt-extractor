# Contributing

This is a private, single-maintainer project — there's no external
contribution process. This doc exists to keep conventions consistent across
sessions and over time, not to onboard outside contributors.

## Local setup

See [`SETUP.md`](SETUP.md) and [`.env.example`](.env.example).

```bash
npm install
npm run dev
npm run check   # svelte-check + TypeScript
```

## Database changes

- Every schema change is a new file in `supabase/migrations/`, numbered
  sequentially (`0008_...sql` after `0007_batch_retry.sql`). Never edit an
  already-applied migration — add a new one.
- "Automatically expose new tables" is OFF on this Supabase project, so any
  new table needs explicit `grant` statements for whichever of
  `anon`/`authenticated`/`service_role` touch it. A missing grant shows up as
  a PostgREST 404 ("table not found in schema cache"), indistinguishable from
  the table not existing — check grants before assuming the table is wrong.
- Apply migrations via the Supabase SQL Editor (no linked CLI project in this
  repo yet) and keep the file in sync with what was actually run.

## n8n workflows

- `n8n/*.json` are exported copies of the workflows running on the VPS —
  they're documentation/backup, not auto-deployed. After changing a workflow
  in n8n, re-export it and commit the updated JSON so the repo reflects
  what's actually live.
- Credential references (`credentials.httpHeaderAuth.id`) point at
  credentials stored in n8n itself; the JSON never contains secret values,
  only credential IDs and names.

## Commit style

Early phases used `Phase N: <summary>` commit messages tracking the build
plan. Later work uses a plain imperative summary (`Add X`, `Fix Y`). Either
is fine — prioritize a clear one-line summary of *why* over *what* (the diff
already shows what changed).

## Code style

- SvelteKit 2 + Svelte 5 runes (`$state`, `$props`, `$derived`) — not the
  older `export let` / stores-based API.
- TypeScript everywhere in `src/`; keep row/shape types next to the query
  that produces them (see `src/lib/export.ts`, `src/routes/documents/+page.server.ts`)
  rather than a central types file.
- No test suite yet — verify changes by running the app locally
  (`npm run dev`) against a real Supabase project and, where relevant, the
  n8n extraction pipeline.
