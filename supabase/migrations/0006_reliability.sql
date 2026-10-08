-- Phase 6: reliability. Retries live entirely in n8n node config (no schema
-- change needed) — this just gives a failed document somewhere to record
-- why, instead of 'failed' being a dead end with no explanation.

alter table public.documents add column failure_reason text;
