import { createServerClient } from '@supabase/ssr';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '$app/env/public';
import type { Cookies } from '@sveltejs/kit';

export function createClient(cookies: Cookies) {
	return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (cookiesToSet) => {
				for (const { name, value, options } of cookiesToSet) {
					cookies.set(name, value, { ...options, path: '/' });
				}
			}
		}
	});
}
