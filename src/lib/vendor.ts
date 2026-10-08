// Keep this in sync with the normalization in the n8n workflow's
// "Prepare Cache Lookup" node — both need to produce the same key for a
// given vendor name, or the cache never matches.
export function normalizeVendor(vendor: string): string {
	return vendor
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, ' ')
		.trim();
}
