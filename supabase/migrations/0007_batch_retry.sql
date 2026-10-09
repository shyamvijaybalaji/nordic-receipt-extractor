-- Phase 6: Batch API retry for documents that failed outright (API/network
-- errors) rather than needing user correction. batch_id is set once a
-- document is submitted to a batch and is never cleared — that's what
-- limits each document to exactly one automatic batch retry.

alter table public.documents add column batch_id text;

alter table public.documents drop constraint documents_status_check;

alter table public.documents
add constraint documents_status_check check (
	status in (
		'uploaded',
		'processing',
		'done',
		'needs_review',
		'failed',
		'capped',
		'batch_pending'
	)
);
