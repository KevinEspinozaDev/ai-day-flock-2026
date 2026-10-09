import { inject, Injectable } from '@angular/core';
import { validateSpreadsheetFile } from '../domain/spreadsheet-file.policy';
import { SpreadsheetContentError, VulnerabilityFileParser } from '../domain/vulnerability-file.parser';
import { VulnerabilityReport, VulnerabilityReportStore } from './vulnerability-report.store';

export type ImportResult =
  | { ok: true; report: VulnerabilityReport }
  | { ok: false; errors: string[] };

/** Validates the file, parses it and stores the resulting report. */
@Injectable({ providedIn: 'root' })
export class ImportVulnerabilitiesUseCase {
  private readonly parser = inject(VulnerabilityFileParser);
  private readonly store = inject(VulnerabilityReportStore);

  async execute(file: File): Promise<ImportResult> {
    const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const validation = validateSpreadsheetFile({
      name: file.name,
      size: file.size,
      type: file.type,
      header,
    });
    if (!validation.valid) {
      return { ok: false, errors: validation.errors };
    }

    try {
      const parsed = await this.parser.parse(file);
      const report: VulnerabilityReport = {
        fileName: file.name,
        sheetName: parsed.sheetName,
        importedAt: new Date().toISOString(),
        vulnerabilities: parsed.vulnerabilities,
        issues: parsed.issues,
      };
      this.store.set(report);
      return { ok: true, report };
    } catch (error) {
      if (error instanceof SpreadsheetContentError) {
        return { ok: false, errors: error.errors };
      }
      throw error;
    }
  }
}
