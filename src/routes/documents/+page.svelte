<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import DocumentTable from '#lib/components/DocumentTable.svelte';
	import UploadZone from '#lib/components/UploadZone.svelte';
	import { createClient } from '#lib/supabase/client.ts';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let uploading = $state(false);
	let errors = $state<string[]>([]);

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
</script>

<svelte:head>
	<title>Documents — Nordic Receipt Extractor</title>
</svelte:head>

<h1 style="font-size: 1.4rem;">Documents</h1>

<UploadZone onFiles={handleFiles} disabled={uploading} />

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

<div class="card" style="margin-top: 1.5rem;">
	{#if data.loadError}
		<p class="error">Couldn't load documents: {data.loadError}</p>
	{:else}
		<DocumentTable documents={data.documents} />
	{/if}
</div>
