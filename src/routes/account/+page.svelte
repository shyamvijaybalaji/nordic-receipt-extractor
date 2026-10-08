<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let confirmText = $state('');
	let deleting = $state(false);
	let deleteError = $state('');

	function formatDate(iso: string | null) {
		if (!iso) return '—';
		return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
	}

	async function handleDelete() {
		if (confirmText !== data.email) return;

		deleting = true;
		deleteError = '';

		const response = await fetch('/api/account/delete', { method: 'POST' });

		if (!response.ok) {
			deleteError = "Couldn't delete your account. Please try again or contact support.";
			deleting = false;
			return;
		}

		await goto('/login');
	}
</script>

<svelte:head>
	<title>Account — Nordic Receipt Extractor</title>
</svelte:head>

<h1 style="font-size: 1.4rem;">Account</h1>

<div class="card" style="margin-top: 1rem;">
	<p style="margin: 0;"><strong>{data.email}</strong></p>
	<p class="muted" style="margin: 0.3rem 0 0; font-size: 0.85rem;">
		Plan: {data.plan ?? '—'} · Member since {formatDate(data.createdAt)}
	</p>
</div>

<div class="card" style="margin-top: 1.5rem;">
	<h2 style="margin-top: 0; font-size: 1.1rem;">Export your data</h2>
	<p class="muted" style="font-size: 0.9rem;">
		Download everything we hold about you — your documents, extracted fields, category
		preferences, and usage history — along with your original uploaded files, as a zip archive.
	</p>
	<a class="btn" href="/account/export">Export my data</a>
</div>

<div class="card" style="margin-top: 1.5rem; border-color: var(--danger);">
	<h2 style="margin-top: 0; font-size: 1.1rem;">Delete your account</h2>
	<p class="muted" style="font-size: 0.9rem;">
		This permanently deletes your account, all documents, extracted data, and uploaded files.
		This cannot be undone.
	</p>

	<label for="confirm-email" style="display: block; font-size: 0.85rem; margin-bottom: 0.3rem;">
		Type <strong>{data.email}</strong> to confirm
	</label>
	<input
		id="confirm-email"
		type="text"
		bind:value={confirmText}
		disabled={deleting}
		style="width: 100%; max-width: 320px; margin-bottom: 0.8rem;"
	/>

	{#if deleteError}
		<p class="error">{deleteError}</p>
	{/if}

	<button
		class="btn"
		style="background: var(--danger); color: white; border-color: var(--danger);"
		disabled={confirmText !== data.email || deleting}
		onclick={handleDelete}
	>
		{deleting ? 'Deleting…' : 'Permanently delete my account'}
	</button>
</div>
