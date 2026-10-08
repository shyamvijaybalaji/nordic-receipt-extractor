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
	},
	N8N_WEBHOOK_URL: {
		schema: required('N8N_WEBHOOK_URL'),
		description: "n8n production webhook URL that kicks off document extraction."
	},
	N8N_WEBHOOK_SECRET: {
		schema: required('N8N_WEBHOOK_SECRET'),
		description: "Shared secret sent as X-Webhook-Secret to authenticate the call to n8n."
	},
	N8N_DELETE_WEBHOOK_URL: {
		schema: required('N8N_DELETE_WEBHOOK_URL'),
		description: "n8n production webhook URL that performs full account deletion."
	}
});
