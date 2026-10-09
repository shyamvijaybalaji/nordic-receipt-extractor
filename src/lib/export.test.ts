import { describe, expect, it } from 'vitest';
import { rowsToCsv, type ExportRow } from './export';

const baseRow: ExportRow = {
	date: '2026-10-09',
	vendor: 'Netto Supermarked',
	description: null,
	category: 'Groceries',
	currency: 'DKK',
	total: 160.02,
	vat_amount: 26.67,
	vat_rate: 25,
	status: 'done',
	original_filename: 'netto-receipt.png'
};

describe('rowsToCsv', () => {
	it('includes the header row', () => {
		const csv = rowsToCsv([]);
		expect(csv).toBe(
			'Date,Vendor,Description,Category,Currency,Total,VAT amount,VAT rate (%),Status,File\r\n'
		);
	});

	it('renders a row with all fields populated', () => {
		const csv = rowsToCsv([baseRow]);
		const lines = csv.trim().split('\r\n');
		expect(lines).toHaveLength(2);
		expect(lines[1]).toBe(
			'2026-10-09,Netto Supermarked,,Groceries,DKK,160.02,26.67,25,done,netto-receipt.png'
		);
	});

	it('renders missing fields as empty, not "null"', () => {
		const row: ExportRow = { ...baseRow, vendor: null, total: null, category: null };
		const csv = rowsToCsv([row]);
		const [, dataLine] = csv.trim().split('\r\n');
		expect(dataLine).toBe('2026-10-09,,,,DKK,,26.67,25,done,netto-receipt.png');
	});

	it('quotes fields containing commas', () => {
		const row: ExportRow = { ...baseRow, vendor: 'Netto, Vesterbro' };
		const csv = rowsToCsv([row]);
		expect(csv).toContain('"Netto, Vesterbro"');
	});
});
