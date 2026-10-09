import type { PageServerLoad } from './$types';

export interface ExtractedFields {
	vendor: string | null;
	total: number | null;
	currency: string | null;
	category: string | null;
	category_source: string;
	needs_review: boolean;
}

export interface DocumentRow {
	id: string;
	original_filename: string;
	status: string;
	uploaded_at: string;
	failure_reason: string | null;
	extracted_fields: ExtractedFields | null;
}

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// RLS scopes this to the signed-in user automatically — no user_id filter needed here.
	// extracted_fields is a to-one embed (document_id is unique), so PostgREST
	// returns it as a single object, not an array.
	const { data, error } = await supabase
		.from('documents')
		.select(
			'id, original_filename, status, uploaded_at, failure_reason, extracted_fields(vendor, total, currency, category, category_source, needs_review)'
		)
		.order('uploaded_at', { ascending: false });

	if (error) {
		return { documents: [] as DocumentRow[], loadError: error.message };
	}

	return { documents: data as unknown as DocumentRow[], loadError: null };
};
