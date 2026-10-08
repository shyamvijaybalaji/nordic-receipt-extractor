import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { safeGetSession }, url }) => {
	const { session } = await safeGetSession();
	if (session) {
		redirect(303, url.searchParams.get('next') ?? '/documents');
	}
};

export const actions: Actions = {
	default: async ({ request, locals: { supabase }, url }) => {
		const formData = await request.formData();
		const email = String(formData.get('email') ?? '').trim();

		if (!email || !email.includes('@')) {
			return fail(400, { email, error: 'Enter a valid email address.' });
		}

		const next = url.searchParams.get('next') ?? '/documents';
		const { error } = await supabase.auth.signInWithOtp({
			email,
			options: {
				emailRedirectTo: `${url.origin}/auth/confirm?next=${encodeURIComponent(next)}`
			}
		});

		if (error) {
			return fail(400, { email, error: error.message });
		}

		return { email, sent: true };
	}
};
