<script lang="ts">
	type ExtractedFields = {
		vendor: string | null;
		total: number | null;
		currency: string | null;
		category: string | null;
		needs_review: boolean;
	};

	type DocumentRow = {
		id: string;
		original_filename: string;
		status: string;
		uploaded_at: string;
		extracted_fields: ExtractedFields[];
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

	function formatTotal(fields: ExtractedFields | undefined) {
		if (!fields || fields.total == null) return '—';
		const amount = fields.currency
			? new Intl.NumberFormat(undefined, { style: 'currency', currency: fields.currency }).format(
					fields.total
				)
			: fields.total.toString();
		return amount;
	}
</script>

{#if documents.length === 0}
	<p class="muted">No documents yet. Upload a receipt or invoice to get started.</p>
{:else}
	<table>
		<thead>
			<tr>
				<th>File</th>
				<th>Vendor</th>
				<th>Total</th>
				<th>Category</th>
				<th>Status</th>
				<th>Uploaded</th>
			</tr>
		</thead>
		<tbody>
			{#each documents as doc (doc.id)}
				{@const fields = doc.extracted_fields?.[0]}
				<tr>
					<td>{doc.original_filename}</td>
					<td>{fields?.vendor ?? '—'}</td>
					<td>{formatTotal(fields)}</td>
					<td>{fields?.category ?? '—'}</td>
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
