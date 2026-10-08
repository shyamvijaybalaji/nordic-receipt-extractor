import { fetchExportRows, rowsToCsv } from '#lib/export.ts';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) error(401, 'Not signed in');

	const rows = await fetchExportRows(supabase);
	const csv = rowsToCsv(rows);
	const date = new Date().toISOString().slice(0, 10);

	return new Response(csv, {
		headers: {
			'Content-Type': 'text/csv; charset=utf-8',
			'Content-Disposition': `attachment; filename="receipts-${date}.csv"`
		}
	});
};
