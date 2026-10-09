# nordic-receipt-extractor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Validate .gitpod.yml](https://github.com/shyamvijaybalaji/nordic-receipt-extractor/actions/workflows/validate-gitpod.yml/badge.svg)](https://github.com/shyamvijaybalaji/nordic-receipt-extractor/actions/workflows/validate-gitpod.yml)

A SvelteKit + Supabase app that extracts structured data (vendor, total,
currency, VAT, category) from uploaded receipts and invoices using Claude,
and exports the results for bookkeeping.

## How it works

1. A user signs in (Supabase magic-link auth) and uploads a PDF/JPG/PNG to
   `/documents`. The file lands in a private Supabase Storage bucket, scoped
   to that user by row-level security.
2. An n8n workflow (see [`n8n/`](n8n)) picks up the upload, scans it for
   malware (ClamAV), and sends it to Claude (Haiku first, escalating to
   Sonnet when confidence is low) to extract the receipt fields.
3. Results are written back to Supabase; the user can review/correct the
   category inline, and export everything as CSV from `/export`.
4. Failures and timeouts are self-healing: a dead-letter sweep reclaims
   stuck documents, and a nightly Batch API job retries documents that
   failed outright at half the per-token cost.

## Project layout

- `src/routes/` — SvelteKit pages: `login`, `documents` (upload + table),
  `export`, `summary` (monthly usage/cost), `account` (GDPR export/delete).
- `src/lib/` — shared helpers (`export.ts` CSV generation, `vendor.ts`
  vendor-category memory, `gdpr-export.ts`, Supabase client setup).
- `supabase/migrations/` — schema, RLS policies, and grants, applied in
  order.
- `n8n/` — exported workflow JSON for every background job: extraction,
  account deletion, dead-letter sweep, and the Batch API retry
  submit/poll pair.

## Setup

See [`SETUP.md`](SETUP.md) for the Phase 1 walkthrough (Supabase project,
migration, auth redirect, local dev server). Required environment
variables are listed in [`.env.example`](.env.example); later phases add
the n8n webhook and Claude-related config on top of that.

```bash
npm install
npm run dev
```

## Status

Built in phases, tracked in order: auth/upload/storage → Haiku extraction
→ Sonnet escalation + vendor memory + export → usage caps/cost logging →
GDPR export/delete → reliability (retries, dead-letter, malware scanning,
Batch API retry). This is a personal/small-scale project, not a public
product, shared here in source form for reference.
