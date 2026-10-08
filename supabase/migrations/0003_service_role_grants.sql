-- "Automatically expose new tables" being off withholds default grants from
-- ALL Data API roles, not just anon/authenticated — service_role needs an
-- explicit grant too, or PostgREST returns 404 "table not found in schema
-- cache" for it (same response as "doesn't exist", by design, so a missing
-- grant can't be distinguished from a missing table).
--
-- service_role bypasses RLS (it has the BYPASSRLS role attribute), but RLS
-- bypass and table-level GRANTs are two separate things in Postgres — it
-- still needs GRANTs to be seen by PostgREST at all. This is what n8n
-- authenticates as to read documents and write extraction results.

grant select, insert, update, delete on public.profiles to service_role;

grant select, insert, update, delete on public.documents to service_role;

grant select, insert, update, delete on public.extracted_fields to service_role;
