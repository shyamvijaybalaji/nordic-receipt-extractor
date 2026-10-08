-- Phase 1: auth, upload, storage skeleton. No AI-related tables yet
-- (extracted_fields, vendor_category_preferences, usage_logs land in Phase 2/3).

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table public.profiles (
	id uuid primary key references auth.users (id) on delete cascade,
	plan text not null default 'free',
	monthly_doc_cap integer not null default 50,
	created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid () = id);

create policy "profiles_update_own" on public.profiles
for update
using (auth.uid () = id);

-- With "Automatically expose new tables" off, PostgREST has no access to this
-- table until it's granted explicitly — RLS alone isn't enough without this.
grant select, update on public.profiles to authenticated;

-- Auto-create a profile row the moment someone signs up.
create function public.handle_new_user () returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users for each row
execute procedure public.handle_new_user ();

-- ---------------------------------------------------------------------------
-- documents
-- ---------------------------------------------------------------------------
create table public.documents (
	id uuid primary key default gen_random_uuid (),
	user_id uuid not null references public.profiles (id) on delete cascade,
	storage_path text not null,
	original_filename text not null,
	mime_type text not null,
	status text not null default 'uploaded' check (
		status in (
			'uploaded',
			'processing',
			'done',
			'needs_review',
			'failed'
		)
	),
	uploaded_at timestamptz not null default now()
);

create index documents_user_id_idx on public.documents (user_id, uploaded_at desc);

alter table public.documents enable row level security;

create policy "documents_select_own" on public.documents for select using (auth.uid () = user_id);

create policy "documents_insert_own" on public.documents for insert
with
	check (auth.uid () = user_id);

create policy "documents_update_own" on public.documents
for update
using (auth.uid () = user_id);

create policy "documents_delete_own" on public.documents for delete using (auth.uid () = user_id);

grant select, insert, update, delete on public.documents to authenticated;

-- ---------------------------------------------------------------------------
-- storage: private "documents" bucket, one folder per user (named by their uid)
-- ---------------------------------------------------------------------------
insert into
	storage.buckets (
		id,
		name,
		public,
		file_size_limit,
		allowed_mime_types
	)
values (
	'documents',
	'documents',
	false,
	15728640, -- 15 MB
	array[
		'application/pdf',
		'image/jpeg',
		'image/png'
	]
)
on conflict (id) do nothing;

create policy "documents_storage_insert_own" on storage.objects for insert to authenticated
with
	check (
		bucket_id = 'documents'
		and (storage.foldername (name)) [1] = auth.uid ()::text
	);

create policy "documents_storage_select_own" on storage.objects for select to authenticated using (
	bucket_id = 'documents'
	and (storage.foldername (name)) [1] = auth.uid ()::text
);

create policy "documents_storage_delete_own" on storage.objects for delete to authenticated using (
	bucket_id = 'documents'
	and (storage.foldername (name)) [1] = auth.uid ()::text
);
