# Changelog

All notable changes to this project are documented here. Format loosely
follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); entries
are grouped by the project's own build phases rather than semver releases,
since this is a single-maintainer app without versioned releases.

## [Unreleased]

### Added
- Batch API retry: nightly Claude Batch API resubmission for documents that
  failed outright (API/network errors), separate from the needs-review
  escalation path — 50% cheaper than the synchronous retry, exactly once
  per document.
- Repo housekeeping: README, LICENSE (MIT), `.gitattributes`,
  `CONTRIBUTING.md`, `CODEOWNERS`, issue templates, PR template.

### Fixed
- `extracted_fields` was typed and queried as an array; it's actually a
  to-one embed (`document_id` is unique), so PostgREST returns a single
  object. Fixed across the documents page, CSV export, and the document
  table component.

## Phase 6 — Reliability, malware scanning (2026-10-09)

### Added
- Per-request retries (`retryOnFail`, up to 3 tries) on every HTTP call in
  the extraction workflow.
- Dedicated failure handling for Claude Haiku/Sonnet calls: a real API
  failure now marks the document `failed` with a reason instead of killing
  the whole execution.
- Dead Letter Sweep workflow: reclaims documents stuck in `processing` for
  over 15 minutes.
- Self-hosted ClamAV malware scanning on every upload, before any Claude
  call; infected files are rejected and their storage object removed.
- `failure_reason` column, surfaced as a tooltip on the Failed badge.

## Phase 5 — GDPR export and account deletion (2026-10-09)

### Added
- `/account` page: data export (zipped `data.json` + original files) and
  account deletion (type-to-confirm), both RLS-scoped.
- Account Deletion n8n workflow: removes storage objects, then deletes the
  Supabase Auth user, cascading through the schema.

## Phase 4 — Usage caps, cost logging, prompt caching (2026-10-09)

### Added
- Monthly usage caps and cost logging per document.
- Prompt caching on the extraction system prompt.
- `/summary` page showing monthly usage/cost.

## Phase 3 — Sonnet escalation, vendor memory, export (2026-10-09)

### Added
- Low-confidence Haiku extractions escalate to Sonnet.
- Vendor → category memory, with inline category override in the UI.
- CSV export of extracted document data.

## Phase 2 — Haiku extraction pipeline (2026-10-09)

### Added
- n8n extraction workflow: download upload, call Claude Haiku, parse and
  write `extracted_fields`.

## Phase 1 — Auth, upload, storage (2026-10-08)

### Added
- Supabase magic-link auth.
- `/documents` upload UI (PDF/JPG/PNG) backed by a private, RLS-scoped
  Storage bucket.
- Initial schema: `profiles`, `documents`.
