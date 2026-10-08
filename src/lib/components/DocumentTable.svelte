<script lang="ts">
	type DocumentRow = {
		id: string;
		original_filename: string;
		status: string;
		uploaded_at: string;
	};

	let { documents }: { documents: DocumentRow[] } = $props();

	const STATUS_LABEL: Record<string, string> = {
		uploaded: 'Queued',
		processing: 'Processing',
		done: 'Done',
		needs_review: 'Needs review',
		failed: 'Failed'
	};

	const STATUS_CLASS: Record<string, string> = {
		done: 'badge-done',
		needs_review: 'badge-review',
		failed: 'badge-failed'
	};

	function formatDate(iso: string) {
		return new Date(iso).toLocaleString(undefined, {
			dateStyle: 'medium',
			timeStyle: 'short'
		});
	}
</script>

{#if documents.length === 0}
	<p class="muted">No documents yet. Upload a receipt or invoice to get started.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>File</th>
				<th>Status</th>
				<th>Uploaded</th>
			</tr>
		</thead>
		<tbody>
			{#each documents as doc (doc.id)}
				<tr>
					<td>{doc.original_filename}</td>
					<td>
						<span class="badge {STATUS_CLASS[doc.status] ?? ''}">
							{STATUS_LABEL[doc.status] ?? doc.status}
						</span>
					</td>
					<td class="muted">{formatDate(doc.uploaded_at)}</td>
				</tr>
			{/each}
		</tbody>
	</table>
{/if}
