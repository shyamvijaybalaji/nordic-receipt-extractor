# Security Policy

This is a small, single-maintainer personal project — there's no formal
security program, but reports are welcome and taken seriously.

## Reporting a vulnerability

Please report security issues privately by emailing
**shyamvijaybalaji@gmail.com** rather than opening a public issue. Include:

- A description of the issue and its potential impact
- Steps to reproduce (or a proof of concept)
- Which part of the system it affects (the SvelteKit app, an n8n workflow,
  a Supabase RLS policy, etc.)

I'll acknowledge reports as soon as I can and aim to fix confirmed issues
promptly. There's no bug bounty — this is an unfunded personal project.

## Scope

In scope:
- The SvelteKit application in this repository
- The n8n workflow definitions in `n8n/` (as documentation of what runs in
  production — see note below)
- The Supabase schema/RLS policies in `supabase/migrations/`

Out of scope:
- The live n8n instance, Supabase project, and VPS infrastructure
  themselves (not publicly reachable in a way that invites testing, and
  not part of this repository)
- Third-party services this project depends on (Supabase, Anthropic, n8n,
  ClamAV) — report those upstream

## Notes for reviewers

- `n8n/*.json` files reference credentials by ID/name only; no secret
  values are committed anywhere in this repo.
- The Supabase **anon** key present in `n8n/*.json` and the app's config is
  meant to be public — access control is enforced by Postgres row-level
  security, not by keeping that key secret. A valid finding here would be a
  gap in an RLS policy, not the key's presence.
- All document uploads are scanned for malware before processing; user data
  (documents, extracted fields) is scoped per-user via RLS throughout.
