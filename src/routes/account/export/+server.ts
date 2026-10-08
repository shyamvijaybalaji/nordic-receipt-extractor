import { buildAccountExportZip } from '#lib/gdpr-export.ts';
import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) error(401, 'Not signed in');

	const zip = await buildAccountExportZip(supabase, session.user.id);
	const date = new Date().toISOString().slice(0, 10);

	return new Response(zip, {
		headers: {
			'Content-Type': 'application/zip',
			'Content-Disposition': `attachment; filename="nordic-receipt-extractor-export-${date}.zip"`
		}
	});
};
