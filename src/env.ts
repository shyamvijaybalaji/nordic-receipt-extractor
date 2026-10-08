import { defineEnvVars } from '@sveltejs/kit/env';

function required(name: string) {
	return (value: string | undefined) => {
		if (!value) {
			throw new Error(`${name} is required — see SETUP.md to configure your Supabase project.`);
		}
		return value;
	};
}

export const variables = defineEnvVars({
	SUPABASE_URL: {
		public: true,
		schema: required('SUPABASE_URL'),
		description: "Supabase project URL, from Project Settings -> API."
	},
	SUPABASE_ANON_KEY: {
		public: true,
		schema: required('SUPABASE_ANON_KEY'),
		description: "Supabase anon/public API key, from Project Settings -> API."
	}
});
