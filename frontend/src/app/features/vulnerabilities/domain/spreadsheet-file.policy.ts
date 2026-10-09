/** Spreadsheet formats accepted by the importer. */
export const ALLOWED_EXTENSIONS = ['.xlsx', '.xlsm', '.xls', '.ods', '.xltx', '.xltm'] as const;

export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

export const ACCEPT_ATTRIBUTE = [
  ...ALLOWED_EXTENSIONS,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroEnabled.12',
  'application/vnd.ms-excel',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.template',
  'application/vnd.ms-excel.template.macroEnabled.12',
].join(',');

/** ZIP container: xlsx, xlsm, xltx, xltm, ods. */
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
/** OLE2 compound document: legacy xls. */
const OLE_SIGNATURE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1];

const EXPECTED_SIGNATURE: Record<(typeof ALLOWED_EXTENSIONS)[number], number[]> = {
  '.xlsx': ZIP_SIGNATURE,
  '.xlsm': ZIP_SIGNATURE,
  '.xltx': ZIP_SIGNATURE,
  '.xltm': ZIP_SIGNATURE,
  '.ods': ZIP_SIGNATURE,
  '.xls': OLE_SIGNATURE,
};

/** MIME types browsers report for clearly non-spreadsheet files. */
const REJECTED_MIME_PREFIXES = ['image/', 'video/', 'audio/', 'text/', 'application/pdf', 'application/json'];

export interface SpreadsheetFileInfo {
  name: string;
  size: number;
  type: string;
  /** First bytes of the file (at least 8). */
  header: Uint8Array;
}

export type FileValidationResult = { valid: true } | { valid: false; errors: string[] };

export function fileExtension(name: string): string {
  const dot = name.lastIndexOf('.');
  return dot >= 0 ? name.slice(dot).toLowerCase() : '';
}

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  return signature.every((byte, i) => bytes[i] === byte);
}

/**
 * Validates an uploaded spreadsheet: extension whitelist, size, MIME sanity
 * and the real file signature (magic bytes), so a renamed file is rejected.
 */
export function validateSpreadsheetFile(file: SpreadsheetFileInfo): FileValidationResult {
  const errors: string[] = [];
  const ext = fileExtension(file.name);

  if (!(ALLOWED_EXTENSIONS as readonly string[]).includes(ext)) {
    errors.push(`Formato no permitido (${ext || 'sin extensión'}). Usá: ${ALLOWED_EXTENSIONS.join(', ')}.`);
  }
  if (file.size === 0) {
    errors.push('El archivo está vacío.');
  } else if (file.size > MAX_FILE_SIZE_BYTES) {
    errors.push(`El archivo supera el máximo de ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`);
  }
  if (file.type && REJECTED_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix))) {
    errors.push(`El tipo de archivo (${file.type}) no corresponde a una planilla.`);
  }

  const signature = EXPECTED_SIGNATURE[ext as keyof typeof EXPECTED_SIGNATURE];
  if (signature && file.size > 0 && !startsWith(file.header, signature)) {
    errors.push('El contenido no corresponde a un archivo Excel/ODS válido (puede estar dañado o renombrado).');
  }

  return errors.length ? { valid: false, errors } : { valid: true };
}
