<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Nordic Receipt Extractor</title>
</svelte:head>

<div class="card">
	<h1 style="margin-top: 0;">Turn receipts into clean, exportable data</h1>
	<p class="muted">
		Upload invoices and receipts, get back categorized rows with date, vendor, total, VAT and
		currency — ready to export as CSV or Excel.
	</p>
	{#if data.session}
		<a class="btn btn-primary" href="/documents">Go to your documents</a>
	{:else}
		<a class="btn btn-primary" href="/login">Sign in to get started</a>
	{/if}
</div>
