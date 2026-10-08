import type { PageServerLoad } from './$types';

export interface ExtractedFields {
	vendor: string | null;
	total: number | null;
	currency: string | null;
	category: string | null;
	needs_review: boolean;
}

export interface DocumentRow {
	id: string;
	original_filename: string;
	status: string;
	uploaded_at: string;
	extracted_fields: ExtractedFields[];
}

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// RLS scopes this to the signed-in user automatically — no user_id filter needed here.
	const { data, error } = await supabase
		.from('documents')
		.select(
			'id, original_filename, status, uploaded_at, extracted_fields(vendor, total, currency, category, needs_review)'
		)
		.order('uploaded_at', { ascending: false });

	if (error) {
		return { documents: [] as DocumentRow[], loadError: error.message };
	}

	return { documents: data as DocumentRow[], loadError: null };
};
