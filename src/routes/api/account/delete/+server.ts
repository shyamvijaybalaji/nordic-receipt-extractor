import { error, json } from '@sveltejs/kit';
import { N8N_DELETE_WEBHOOK_URL, N8N_WEBHOOK_SECRET } from '$app/env/private';
import type { RequestHandler } from './$types';

// n8n does the actual deletion (storage objects + the auth.users row, which
// cascades through profiles/documents/extracted_fields/vendor_category_preferences/
// usage_logs via FK) because that needs the service role key, which this
// endpoint never holds. We only confirm who's asking, then sign them out.
export const POST: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) {
		error(401, 'Not signed in');
	}

	const response = await fetch(N8N_DELETE_WEBHOOK_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Webhook-Secret': N8N_WEBHOOK_SECRET
		},
		body: JSON.stringify({ user_id: session.user.id })
	});

	if (!response.ok) {
		error(502, 'Failed to delete account');
	}

	await supabase.auth.signOut();

	return json({ deleted: true });
};
