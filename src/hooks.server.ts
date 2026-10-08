import { createClient } from '#lib/supabase/server.ts';
import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { sequence } from '@sveltejs/kit/hooks';

const PROTECTED_PREFIXES = ['/documents', '/export'];

const attachSupabase: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createClient(event.cookies);

	event.locals.safeGetSession = async () => {
		const {
			data: { session }
		} = await event.locals.supabase.auth.getSession();
		if (!session) {
			return { session: null, user: null };
		}

		// getUser() re-validates the JWT against Supabase Auth rather than
		// trusting the (spoofable) session cookie's decoded payload.
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();
		if (error) {
			return { session: null, user: null };
		}

		return { session, user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

const requireAuth: Handle = async ({ event, resolve }) => {
	const { session } = await event.locals.safeGetSession();

	if (!session && PROTECTED_PREFIXES.some((prefix) => event.url.pathname.startsWith(prefix))) {
		redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
	}

	return resolve(event);
};

export const handle: Handle = sequence(attachSupabase, requireAuth);
