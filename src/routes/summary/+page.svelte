<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	function formatUsd(n: number) {
		return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n);
	}
</script>

<svelte:head>
	<title>Monthly summary — Nordic Receipt Extractor</title>
</svelte:head>

<h1 style="font-size: 1.4rem;">This month</h1>

{#if data.loadError}
	<p class="error">Couldn't load usage: {data.loadError}</p>
{:else if data.summary}
	{@const s = data.summary}

	{#if s.spendAnomaly}
		<div class="card" style="border-color: var(--danger); margin-bottom: 1rem;">
			<p class="error" style="margin: 0;">
				Today's spend ({formatUsd(s.todayCost)}) is more than 3x this month's daily average ({formatUsd(
					s.avgDailyCost
				)}). Worth a look.
			</p>
		</div>
	{/if}

	<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem;">
		<div class="card">
			<p class="muted" style="margin: 0 0 0.3rem; font-size: 0.85rem;">Documents processed</p>
			<p style="margin: 0; font-size: 1.6rem; font-weight: 600;">
				{s.documentCount}{#if s.monthlyDocCap != null}<span class="muted" style="font-size: 1rem;">
						/ {s.monthlyDocCap}</span
					>{/if}
			</p>
		</div>
		<div class="card">
			<p class="muted" style="margin: 0 0 0.3rem; font-size: 0.85rem;">Total AI cost</p>
			<p style="margin: 0; font-size: 1.6rem; font-weight: 600;">{formatUsd(s.totalCost)}</p>
		</div>
		<div class="card">
			<p class="muted" style="margin: 0 0 0.3rem; font-size: 0.85rem;">Escalation rate</p>
			<p style="margin: 0; font-size: 1.6rem; font-weight: 600;">
				{(s.escalationRate * 100).toFixed(0)}%
			</p>
			<p class="muted" style="margin: 0.2rem 0 0; font-size: 0.8rem;">target: under 15%</p>
		</div>
		<div class="card">
			<p class="muted" style="margin: 0 0 0.3rem; font-size: 0.85rem;">Today's spend</p>
			<p style="margin: 0; font-size: 1.6rem; font-weight: 600;">{formatUsd(s.todayCost)}</p>
		</div>
	</div>

	<div class="card" style="margin-top: 1.5rem;">
		<h2 style="margin-top: 0; font-size: 1.1rem;">By model</h2>
		<table>
			<thead>
				<tr>
					<th>Model</th>
					<th>Calls</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td>Haiku</td>
					<td>{s.haikuCalls}</td>
				</tr>
				<tr>
					<td>Sonnet (escalated)</td>
					<td>{s.sonnetCalls}</td>
				</tr>
			</tbody>
		</table>
	</div>
{/if}
