import * as XLSX from 'xlsx';
import type { ProfileRecord } from './profileGenerator';

export interface ExportOptions {
  fileName?: string;
  sheetName?: string;
}

/**
 * Exports generated ProfileRecord array to a formatted Excel file (.xlsx)
 */
export function exportProfilesToExcel(
  records: ProfileRecord[],
  options: ExportOptions = {}
): void {
  if (!records || records.length === 0) {
    console.warn('Export canceled: No profile records provided.');
    return;
  }

  const { fileName = 'usa_profiles.xlsx', sheetName = 'Profiles' } = options;

  // 1. Map raw record fields to user-friendly Excel column headers
  const excelRows = records.map((record) => ({
    'Phone Number (Raw)': record.rawPhone,
    'Phone Number (Formatted)': record.formattedPhone,
    'Phone Valid': record.phoneValid ? '✓ Valid' : '✗ Invalid',
    'First Name': record.firstName,
    'Last Name': record.lastName,
    'Street Address': record.streetAddress,
    'City': record.city,
    'State': record.state,
    'ZIP Code': record.zipCode,
    'Address Valid': record.addressValid ? '✓ Valid' : '✗ Invalid',
  }));

  // 2. Generate Worksheet from JSON data
  const worksheet = XLSX.utils.json_to_sheet(excelRows);

  // 3. Dynamically calculate column widths based on maximum string lengths
  if (excelRows.length > 0) {
    const headers = Object.keys(excelRows[0]) as (keyof typeof excelRows[0])[];
    const colWidths = headers.map((header) => {
      const maxContentLength = Math.max(
        header.length,
        ...excelRows.map((row) => (row[header as keyof typeof row] ? String(row[header as keyof typeof row]).length : 0))
      );
      return { wch: maxContentLength + 4 }; // Add padding for readability
    });

    worksheet['!cols'] = colWidths;
  }

  // 4. Create Workbook and append the sheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // 5. Ensure file extension is correct
  const safeFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;

  // 6. Trigger direct file download in the browser
  XLSX.writeFile(workbook, safeFileName);
}
