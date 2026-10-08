import type { SupabaseClient } from '@supabase/supabase-js';

export interface ExportRow {
	date: string | null;
	vendor: string | null;
	description: string | null;
	category: string | null;
	currency: string | null;
	total: number | null;
	vat_amount: number | null;
	vat_rate: number | null;
	status: string;
	original_filename: string;
}

export async function fetchExportRows(supabase: SupabaseClient): Promise<ExportRow[]> {
	// RLS scopes this to the signed-in user — only their own documents come back.
	const { data, error } = await supabase
		.from('documents')
		.select(
			'status, original_filename, extracted_fields(date, vendor, description, category, currency, total, vat_amount, vat_rate)'
		)
		.order('uploaded_at', { ascending: false });

	if (error) throw error;

	return (data ?? []).map((doc) => {
		const fields = Array.isArray(doc.extracted_fields) ? doc.extracted_fields[0] : undefined;
		return {
			date: fields?.date ?? null,
			vendor: fields?.vendor ?? null,
			description: fields?.description ?? null,
			category: fields?.category ?? null,
			currency: fields?.currency ?? null,
			total: fields?.total ?? null,
			vat_amount: fields?.vat_amount ?? null,
			vat_rate: fields?.vat_rate ?? null,
			status: doc.status,
			original_filename: doc.original_filename
		};
	});
}

function csvEscape(value: string): string {
	if (/[",\n]/.test(value)) {
		return `"${value.replace(/"/g, '""')}"`;
	}
	return value;
}

export function rowsToCsv(rows: ExportRow[]): string {
	const headers = [
		'Date',
		'Vendor',
		'Description',
		'Category',
		'Currency',
		'Total',
		'VAT amount',
		'VAT rate (%)',
		'Status',
		'File'
	];

	const lines = [headers.join(',')];

	for (const row of rows) {
		lines.push(
			[
				row.date ?? '',
				row.vendor ?? '',
				row.description ?? '',
				row.category ?? '',
				row.currency ?? '',
				row.total ?? '',
				row.vat_amount ?? '',
				row.vat_rate ?? '',
				row.status,
				row.original_filename
			]
				.map((v) => csvEscape(String(v)))
				.join(',')
		);
	}

	return lines.join('\r\n') + '\r\n';
}
