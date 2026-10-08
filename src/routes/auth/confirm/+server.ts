import { redirect } from '@sveltejs/kit';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

// Handles the link Supabase emails for signInWithOtp (magic link).
export const GET: RequestHandler = async ({ url, locals: { supabase } }) => {
	const token_hash = url.searchParams.get('token_hash');
	const type = url.searchParams.get('type') as EmailOtpType | null;
	const next = url.searchParams.get('next') ?? '/documents';

	if (token_hash && type) {
		const { error } = await supabase.auth.verifyOtp({ token_hash, type });
		if (!error) {
			redirect(303, next);
		}
	}

	redirect(303, '/login?error=link_expired');
};
