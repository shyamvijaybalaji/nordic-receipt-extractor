<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DocumentTable from '#lib/components/DocumentTable.svelte';
	import UploadZone from '#lib/components/UploadZone.svelte';
	import { createClient } from '#lib/supabase/client.ts';
	import { normalizeVendor } from '#lib/vendor.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let uploading = $state(false);
	let errors = $state<string[]>([]);
	let categoryError = $state('');

	async function handleFiles(files: File[]) {
		const userId = data.session?.user.id;
		if (!userId) return;

		uploading = true;
		errors = [];
		const supabase = createClient();

		for (const file of files) {
			const path = `${userId}/${crypto.randomUUID()}-${file.name}`;

			const { error: uploadError } = await supabase.storage
				.from('documents')
				.upload(path, file, { contentType: file.type, upsert: false });

			if (uploadError) {
				errors = [...errors, `${file.name}: ${uploadError.message}`];
				continue;
			}

			const { data: inserted, error: insertError } = await supabase
				.from('documents')
				.insert({
					user_id: userId,
					storage_path: path,
					original_filename: file.name,
					mime_type: file.type,
					status: 'uploaded'
				})
				.select('id')
				.single();

			if (insertError) {
				errors = [...errors, `${file.name}: ${insertError.message}`];
				continue;
			}

			const triggerResponse = await fetch('/api/documents/trigger', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ document_id: inserted.id })
			});

			if (!triggerResponse.ok) {
				errors = [...errors, `${file.name}: uploaded, but couldn't start processing`];
			}
		}

		uploading = false;
		await invalidateAll();
	}

	async function handleCategoryChange(
		documentId: string,
		vendor: string | null,
		category: string
	) {
		const userId = data.session?.user.id;
		if (!userId) return;

		categoryError = '';
		const supabase = createClient();

		const { error: updateError } = await supabase
			.from('extracted_fields')
			.update({ category, category_source: 'user' })
			.eq('document_id', documentId);

		if (updateError) {
			categoryError = `Couldn't save category: ${updateError.message}`;
			return;
		}

		if (vendor) {
			const { error: upsertError } = await supabase.from('vendor_category_preferences').upsert(
				{
					user_id: userId,
					vendor_normalized: normalizeVendor(vendor),
					category,
					updated_at: new Date().toISOString()
				},
				{ onConflict: 'user_id,vendor_normalized' }
			);

			if (upsertError) {
				categoryError = `Category saved, but couldn't remember it for ${vendor}: ${upsertError.message}`;
			}
		}

		await invalidateAll();
	}
</script>

<svelte:head>
	<title>Documents — Nordic Receipt Extractor</title>
</svelte:head>

<div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
	<h1 style="font-size: 1.4rem; margin: 0;">Documents</h1>
	{#if data.documents.length > 0}
		<div style="display: flex; gap: 0.5rem;">
			<a class="btn" href="/export/csv">Export CSV</a>
			<a class="btn" href="/export/xlsx">Export Excel</a>
		</div>
	{/if}
</div>

<div style="margin-top: 1rem;">
	<UploadZone onFiles={handleFiles} disabled={uploading} />
</div>

{#if uploading}
	<p class="muted" style="margin-top: 0.6rem;">Uploading…</p>
{/if}

{#if errors.length}
	<ul class="error" style="margin: 0.6rem 0 0; padding-left: 1.2rem;">
		{#each errors as message (message)}
			<li>{message}</li>
		{/each}
	</ul>
{/if}

{#if categoryError}
	<p class="error" style="margin-top: 0.6rem;">{categoryError}</p>
{/if}

<div class="card" style="margin-top: 1.5rem;">
	{#if data.loadError}
		<p class="error">Couldn't load documents: {data.loadError}</p>
	{:else}
		<DocumentTable documents={data.documents} onCategoryChange={handleCategoryChange} />
	{/if}
</div>
