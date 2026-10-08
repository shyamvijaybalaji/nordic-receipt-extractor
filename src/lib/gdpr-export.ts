import type { SupabaseClient } from '@supabase/supabase-js';
import JSZip from 'jszip';

// GDPR data export: everything RLS lets the signed-in user see about
// themselves, bundled as data.json, plus their original uploaded files.
// All queries here are RLS-scoped to the caller's own session — no
// service role, no user_id filtering needed in the queries themselves.
export async function buildAccountExportZip(
	supabase: SupabaseClient,
	userId: string
): Promise<ArrayBuffer> {
	const [profile, documents, vendorPrefs, usageLogs] = await Promise.all([
		supabase.from('profiles').select('*').eq('id', userId).single(),
		supabase
			.from('documents')
			.select('*, extracted_fields(*)')
			.order('uploaded_at', { ascending: false }),
		supabase.from('vendor_category_preferences').select('*'),
		supabase.from('usage_logs').select('*').order('created_at', { ascending: false })
	]);

	const zip = new JSZip();
	zip.file(
		'data.json',
		JSON.stringify(
			{
				exported_at: new Date().toISOString(),
				profile: profile.data ?? null,
				documents: documents.data ?? [],
				vendor_category_preferences: vendorPrefs.data ?? [],
				usage_logs: usageLogs.data ?? []
			},
			null,
			2
		)
	);

	const { data: objects } = await supabase.storage.from('documents').list(userId);
	for (const object of objects ?? []) {
		const { data: fileBlob } = await supabase.storage
			.from('documents')
			.download(`${userId}/${object.name}`);
		if (fileBlob) {
			zip.file(`files/${object.name}`, await fileBlob.arrayBuffer());
		}
	}

	return zip.generateAsync({ type: 'arraybuffer' });
}
