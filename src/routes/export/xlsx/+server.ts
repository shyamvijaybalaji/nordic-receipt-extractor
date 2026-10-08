import { fetchExportRows } from '#lib/export.ts';
import { error } from '@sveltejs/kit';
import ExcelJS from 'exceljs';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals: { supabase, safeGetSession } }) => {
	const { session } = await safeGetSession();
	if (!session) error(401, 'Not signed in');

	const rows = await fetchExportRows(supabase);

	const workbook = new ExcelJS.Workbook();
	const sheet = workbook.addWorksheet('Receipts');

	sheet.columns = [
		{ header: 'Date', key: 'date', width: 12 },
		{ header: 'Vendor', key: 'vendor', width: 24 },
		{ header: 'Description', key: 'description', width: 40 },
		{ header: 'Category', key: 'category', width: 18 },
		{ header: 'Currency', key: 'currency', width: 10 },
		{ header: 'Total', key: 'total', width: 12 },
		{ header: 'VAT amount', key: 'vat_amount', width: 12 },
		{ header: 'VAT rate (%)', key: 'vat_rate', width: 12 },
		{ header: 'Status', key: 'status', width: 14 },
		{ header: 'File', key: 'original_filename', width: 28 }
	];
	sheet.getRow(1).font = { bold: true };

	for (const row of rows) {
		sheet.addRow(row);
	}

	for (const col of ['total', 'vat_amount']) {
		sheet.getColumn(col).numFmt = '#,##0.00';
	}

	const buffer = await workbook.xlsx.writeBuffer();
	const date = new Date().toISOString().slice(0, 10);

	return new Response(buffer as ArrayBuffer, {
		headers: {
			'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
			'Content-Disposition': `attachment; filename="receipts-${date}.xlsx"`
		}
	});
};
