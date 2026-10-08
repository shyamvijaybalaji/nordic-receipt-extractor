<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
	let submitting = $state(false);
</script>

<svelte:head>
	<title>Sign in — Nordic Receipt Extractor</title>
</svelte:head>

<div class="card" style="max-width: 420px; margin: 3rem auto;">
	<h1 style="margin-top: 0; font-size: 1.3rem;">Sign in</h1>

	{#if form?.sent}
		<p class="success">
			Check <strong>{form.email}</strong> for a sign-in link. It'll log you straight in — no password
			needed.
		</p>
	{:else}
		<p class="muted" style="margin-top: 0;">
			We'll email you a one-time link. No password to remember.
		</p>
		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update();
				};
			}}
		>
			<label for="email">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				required
				value={form?.email ?? ''}
			/>
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}
			<button class="btn btn-primary" type="submit" disabled={submitting} style="margin-top: 0.8rem;">
				{submitting ? 'Sending…' : 'Send sign-in link'}
			</button>
		</form>
	{/if}
</div>
