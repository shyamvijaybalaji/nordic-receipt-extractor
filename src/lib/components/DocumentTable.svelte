<script lang="ts">
	type ExtractedFields = {
		vendor: string | null;
		total: number | null;
		currency: string | null;
		category: string | null;
		category_source: string;
		needs_review: boolean;
	};

	type DocumentRow = {
		id: string;
		original_filename: string;
		status: string;
		uploaded_at: string;
		extracted_fields: ExtractedFields[];
	};

	let {
		documents,
		onCategoryChange
	}: {
		documents: DocumentRow[];
		onCategoryChange: (documentId: string, vendor: string | null, category: string) => void;
	} = $props();

	const STATUS_LABEL: Record<string, string> = {
		uploaded: 'Queued',
		processing: 'Processing',
		done: 'Done',
		needs_review: 'Needs review',
		failed: 'Failed',
		capped: 'Monthly limit reached'
	};

	const STATUS_CLASS: Record<string, string> = {
		done: 'badge-done',
		needs_review: 'badge-review',
		failed: 'badge-failed',
		capped: 'badge-failed'
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

	function handleCategoryBlur(
		event: FocusEvent & { currentTarget: HTMLInputElement },
		doc: DocumentRow,
		fields: ExtractedFields
	) {
		const value = event.currentTarget.value.trim();
		if (value && value !== (fields.category ?? '')) {
			onCategoryChange(doc.id, fields.vendor, value);
		}
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
					<td>
						{#if fields}
							<input
								class="category-input"
								type="text"
								value={fields.category ?? ''}
								placeholder="uncategorized"
								onblur={(e) => handleCategoryBlur(e, doc, fields)}
								onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
							/>
							{#if fields.category_source === 'cache'}
								<span class="muted" style="font-size: 0.78rem;" title="Remembered from a past correction"
									>remembered</span
								>
							{/if}
						{:else}
							—
						{/if}
					</td>
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

<style>
	.category-input {
		font: inherit;
		border: 1px solid transparent;
		border-radius: 4px;
		padding: 0.2rem 0.4rem;
		width: 10rem;
		background: transparent;
	}

	.category-input:hover,
	.category-input:focus {
		border-color: var(--border);
		background: var(--surface);
	}
</style>
