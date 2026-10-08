-- Phase 3: vendor-category memory + letting users correct a category,
-- which is what makes the cache useful in the first place.

create table public.vendor_category_preferences (
	id uuid primary key default gen_random_uuid (),
	user_id uuid not null references public.profiles (id) on delete cascade,
	vendor_normalized text not null,
	category text not null,
	updated_at timestamptz not null default now(),
	unique (user_id, vendor_normalized)
);

alter table public.vendor_category_preferences enable row level security;

create policy "vendor_prefs_select_own" on public.vendor_category_preferences for select using (auth.uid () = user_id);

create policy "vendor_prefs_upsert_own" on public.vendor_category_preferences for insert
with
	check (auth.uid () = user_id);

create policy "vendor_prefs_update_own" on public.vendor_category_preferences
for update
using (auth.uid () = user_id)
with
	check (auth.uid () = user_id);

grant select, insert, update on public.vendor_category_preferences to authenticated;

grant select, insert, update on public.vendor_category_preferences to service_role;

-- ---------------------------------------------------------------------------
-- Users can now correct a category themselves (the table view gets an inline
-- override) — extracted_fields was select-only for the client until now.
-- ---------------------------------------------------------------------------
create policy "extracted_fields_update_own" on public.extracted_fields
for update
using (
	document_id in (
		select id
		from public.documents
		where
			user_id = auth.uid ()
	)
)
with
	check (
		document_id in (
			select id
			from public.documents
			where
				user_id = auth.uid ()
		)
	);

grant update on public.extracted_fields to authenticated;
