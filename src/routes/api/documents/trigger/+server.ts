import { error, json } from '@sveltejs/kit';
import { N8N_WEBHOOK_SECRET, N8N_WEBHOOK_URL } from '$app/env/private';
import type { RequestHandler } from './$types';

// Fires after a client-side upload + row insert. Only forwards the document
// id — n8n re-reads the full row itself via the service role key, so this
// endpoint never has to be trusted with (or pass along) processing data.
export const POST: RequestHandler = async ({ request, locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) {
		error(401, 'Not signed in');
	}

	const { document_id } = await request.json();
	if (!document_id || typeof document_id !== 'string') {
		error(400, 'document_id is required');
	}

	// RLS-scoped lookup: confirms this document both exists and belongs to
	// the caller before we ever tell n8n to process it.
	const { data: doc, error: fetchError } = await supabase
		.from('documents')
		.select('id')
		.eq('id', document_id)
		.single();

	if (fetchError || !doc) {
		error(404, 'Document not found');
	}

	const response = await fetch(N8N_WEBHOOK_URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Webhook-Secret': N8N_WEBHOOK_SECRET
		},
		body: JSON.stringify({ document_id })
	});

	if (!response.ok) {
		error(502, 'Failed to start processing');
	}

	return json({ triggered: true });
};
