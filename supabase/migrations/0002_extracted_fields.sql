-- Phase 2: Haiku-only extraction pipeline results.
-- No vendor_category_preferences or usage_logs yet — those are Phase 3/4.

create table public.extracted_fields (
	id uuid primary key default gen_random_uuid (),
	document_id uuid not null unique references public.documents (id) on delete cascade,
	date date,
	vendor text,
	total numeric,
	currency text,
	vat_amount numeric,
	vat_rate numeric,
	description text,
	category text,
	category_source text not null default 'ai' check (category_source in ('ai', 'cache', 'user')),
	confidence jsonb,
	model_used text not null check (model_used in ('haiku', 'sonnet')),
	needs_review boolean not null default false,
	created_at timestamptz not null default now()
);

alter table public.extracted_fields enable row level security;

-- No user_id column here — ownership is inherited through documents, so the
-- policy joins through it rather than duplicating the column.
create policy "extracted_fields_select_own" on public.extracted_fields for select using (
	document_id in (
		select id from public.documents where user_id = auth.uid ()
	)
);

-- Only the client needs to READ extraction results (to render the table and
-- let a user override a category) — n8n writes them using the service role
-- key, which bypasses RLS entirely, so no insert/update/delete policy for
-- the client is needed or granted.
grant select on public.extracted_fields to authenticated;
