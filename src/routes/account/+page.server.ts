import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	const { data: profile } = await supabase
		.from('profiles')
		.select('plan, created_at')
		.eq('id', session!.user.id)
		.single();

	return {
		email: session!.user.email ?? null,
		plan: profile?.plan ?? null,
		createdAt: profile?.created_at ?? null
	};
};
