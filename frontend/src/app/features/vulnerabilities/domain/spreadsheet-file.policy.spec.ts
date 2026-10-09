import { describe, expect, it } from 'vitest';
import { MAX_FILE_SIZE_BYTES, validateSpreadsheetFile } from './spreadsheet-file.policy';

const ZIP = new Uint8Array([0x50, 0x4b, 0x03, 0x04, 0, 0, 0, 0]);
const OLE = new Uint8Array([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);
const PDF = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]);

describe('validateSpreadsheetFile', () => {
  it.each(['report.xlsx', 'REPORT.XLSM', 'plantilla.xltx', 'plantilla.xltm', 'calc.ods'])('accepts %s with a ZIP signature', (name) => {
    expect(validateSpreadsheetFile({ name, size: 1000, type: '', header: ZIP }).valid).toBe(true);
  });

  it('accepts legacy .xls with an OLE signature', () => {
    expect(validateSpreadsheetFile({ name: 'old.xls', size: 1000, type: 'application/vnd.ms-excel', header: OLE }).valid).toBe(true);
  });

  it.each(['data.csv', 'report.pdf', 'book.xlsb', 'noext'])('rejects %s', (name) => {
    expect(validateSpreadsheetFile({ name, size: 1000, type: '', header: ZIP }).valid).toBe(false);
  });

  it('rejects a renamed file whose content is not a spreadsheet', () => {
    const result = validateSpreadsheetFile({ name: 'fake.xlsx', size: 1000, type: '', header: PDF });
    expect(result.valid).toBe(false);
  });

  it('rejects an .xls that is actually a ZIP and vice versa', () => {
    expect(validateSpreadsheetFile({ name: 'a.xls', size: 10, type: '', header: ZIP }).valid).toBe(false);
    expect(validateSpreadsheetFile({ name: 'a.xlsx', size: 10, type: '', header: OLE }).valid).toBe(false);
  });

  it('rejects empty and oversized files and wrong MIME types', () => {
    expect(validateSpreadsheetFile({ name: 'a.xlsx', size: 0, type: '', header: new Uint8Array() }).valid).toBe(false);
    expect(validateSpreadsheetFile({ name: 'a.xlsx', size: MAX_FILE_SIZE_BYTES + 1, type: '', header: ZIP }).valid).toBe(false);
    expect(validateSpreadsheetFile({ name: 'a.xlsx', size: 10, type: 'image/png', header: ZIP }).valid).toBe(false);
  });
});
