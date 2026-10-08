-- Phase 4: usage caps + cost observability.

create table public.usage_logs (
	id uuid primary key default gen_random_uuid (),
	user_id uuid not null references public.profiles (id) on delete cascade,
	-- ON DELETE SET NULL, not CASCADE: a cost record should outlive the
	-- document it was for, for accurate historical accounting.
	document_id uuid references public.documents (id) on delete set null,
	model text not null check (model in ('haiku', 'sonnet')),
	tokens_in integer not null,
	tokens_out integer not null,
	cost_usd numeric not null,
	latency_ms integer,
	created_at timestamptz not null default now()
);

create index usage_logs_user_month_idx on public.usage_logs (user_id, created_at);

alter table public.usage_logs enable row level security;

create policy "usage_logs_select_own" on public.usage_logs for select using (auth.uid () = user_id);

-- Client never writes here — n8n logs usage via the service role after every
-- Claude call. Only a read policy/grant for the client.
grant select on public.usage_logs to authenticated;

grant select, insert on public.usage_logs to service_role;

-- A capped document stopped before any AI call fired (enforced server-side in
-- n8n, before "Mark Processing") — distinct from 'failed' (something broke)
-- or 'needs_review' (ran, but validation wasn't clean).
alter table public.documents drop constraint documents_status_check;

alter table public.documents
add constraint documents_status_check check (
	status in (
		'uploaded',
		'processing',
		'done',
		'needs_review',
		'failed',
		'capped'
	)
);
