<script lang="ts">
	import '#lib/app.css';
	import favicon from '#lib/assets/favicon.svg';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import { createClient } from '#lib/supabase/client.ts';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
	let { session } = $derived(data);

	onMount(() => {
		const supabase = createClient();
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, newSession) => {
			if (newSession?.expires_at !== session?.expires_at) {
				invalidate('supabase:auth');
			}
		});

		return () => subscription.unsubscribe();
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="shell">
	<header>
		<a class="brand" href="/">Nordic Receipt Extractor</a>
		{#if session}
			<form method="POST" action="/logout">
				<button type="submit">Sign out</button>
			</form>
		{/if}
	</header>
	<main>
		{@render children()}
	</main>
</div>
