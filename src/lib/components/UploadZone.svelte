<script lang="ts">
	const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
	const MAX_BYTES = 15 * 1024 * 1024;

	let { onFiles, disabled = false }: { onFiles: (files: File[]) => void; disabled?: boolean } =
		$props();

	let dragOver = $state(false);
	let rejected = $state<string[]>([]);
	let fileInput: HTMLInputElement | undefined = $state();

	function filterValid(fileList: FileList | File[]) {
		const accepted: File[] = [];
		const bad: string[] = [];

		for (const file of fileList) {
			if (!ACCEPTED_TYPES.includes(file.type)) {
				bad.push(`${file.name} — unsupported type`);
			} else if (file.size > MAX_BYTES) {
				bad.push(`${file.name} — over 15 MB`);
			} else {
				accepted.push(file);
			}
		}

		rejected = bad;
		return accepted;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		if (disabled || !event.dataTransfer) return;
		const valid = filterValid(event.dataTransfer.files);
		if (valid.length) onFiles(valid);
	}

	function handlePick(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		if (!input.files?.length) return;
		const valid = filterValid(input.files);
		if (valid.length) onFiles(valid);
		input.value = '';
	}
</script>

<div
	class="dropzone"
	class:dragover={dragOver}
	class:disabled
	role="button"
	tabindex="0"
	ondragover={(e) => {
		e.preventDefault();
		if (!disabled) dragOver = true;
	}}
	ondragleave={() => (dragOver = false)}
	ondrop={handleDrop}
	onclick={() => !disabled && fileInput?.click()}
	onkeydown={(e) => {
		if (!disabled && (e.key === 'Enter' || e.key === ' ')) fileInput?.click();
	}}
>
	<p style="margin: 0 0 0.3rem;">Drop PDFs or photos of receipts here, or click to choose files</p>
	<p class="muted" style="margin: 0; font-size: 0.85rem;">PDF, JPG or PNG — up to 15 MB each</p>
	<input
		bind:this={fileInput}
		type="file"
		multiple
		accept={ACCEPTED_TYPES.join(',')}
		{disabled}
		onchange={handlePick}
		style="display: none;"
	/>
</div>

{#if rejected.length}
	<ul class="error" style="margin: 0.5rem 0 0; padding-left: 1.2rem;">
		{#each rejected as reason (reason)}
			<li>{reason}</li>
		{/each}
	</ul>
{/if}

<style>
	.dropzone {
		border: 2px dashed var(--border);
		border-radius: 10px;
		padding: 2rem 1rem;
		text-align: center;
		cursor: pointer;
		background: var(--surface);
	}

	.dropzone.dragover {
		border-color: var(--accent);
		background: #eff6ff;
	}

	.dropzone.disabled {
		cursor: not-allowed;
		opacity: 0.6;
	}
</style>
