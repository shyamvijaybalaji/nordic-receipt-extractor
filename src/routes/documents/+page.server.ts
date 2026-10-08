import type { PageServerLoad } from './$types';

export interface DocumentRow {
	id: string;
	original_filename: string;
	status: string;
	uploaded_at: string;
}

export const load: PageServerLoad = async ({ locals: { supabase } }) => {
	// RLS scopes this to the signed-in user automatically — no user_id filter needed here.
	const { data, error } = await supabase
		.from('documents')
		.select('id, original_filename, status, uploaded_at')
		.order('uploaded_at', { ascending: false });

	if (error) {
		return { documents: [] as DocumentRow[], loadError: error.message };
	}

	return { documents: data as DocumentRow[], loadError: null };
};
