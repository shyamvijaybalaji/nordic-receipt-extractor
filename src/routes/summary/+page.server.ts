import type { PageServerLoad } from './$types';

export interface MonthlySummary {
	documentCount: number;
	monthlyDocCap: number | null;
	totalCost: number;
	haikuCalls: number;
	sonnetCalls: number;
	escalationRate: number;
	todayCost: number;
	avgDailyCost: number;
	spendAnomaly: boolean;
}

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	const now = new Date();
	const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
	const startOfToday = new Date(
		Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
	).toISOString();

	const [{ data: logs, error }, { data: profile }] = await Promise.all([
		supabase
			.from('usage_logs')
			.select('model, cost_usd, document_id, created_at')
			.gte('created_at', startOfMonth),
		supabase.from('profiles').select('monthly_doc_cap').single()
	]);

	if (error || !logs) {
		return { loadError: error?.message ?? 'Could not load usage', summary: null as MonthlySummary | null };
	}

	const documentCount = new Set(logs.map((l) => l.document_id).filter(Boolean)).size;
	const totalCost = logs.reduce((sum, l) => sum + Number(l.cost_usd), 0);
	const haikuCalls = logs.filter((l) => l.model === 'haiku').length;
	const sonnetCalls = logs.filter((l) => l.model === 'sonnet').length;
	const escalationRate = haikuCalls > 0 ? sonnetCalls / haikuCalls : 0;

	const todayCost = logs
		.filter((l) => l.created_at >= startOfToday)
		.reduce((sum, l) => sum + Number(l.cost_usd), 0);

	// Basic anomaly check: today's spend vs. the daily average for the rest of
	// the month so far. Good enough to surface in the UI for Phase 4 — wiring
	// this to a real notification (email/Slack) is a pre-launch item, not an
	// MVP one.
	const daysSoFar = now.getUTCDate();
	const avgDailyCost = daysSoFar > 1 ? (totalCost - todayCost) / (daysSoFar - 1) : 0;
	const spendAnomaly = avgDailyCost > 0 && todayCost > avgDailyCost * 3;

	const summary: MonthlySummary = {
		documentCount,
		monthlyDocCap: profile?.monthly_doc_cap ?? null,
		totalCost,
		haikuCalls,
		sonnetCalls,
		escalationRate,
		todayCost,
		avgDailyCost,
		spendAnomaly
	};

	return { loadError: null, summary };
};
