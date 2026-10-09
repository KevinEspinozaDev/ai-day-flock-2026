import { Injectable } from '@angular/core';
import { ReportRepository, VulnerabilityReport } from '../application/vulnerability-report.store';

const KEY = 'vulnerability_report';

/**
 * Keeps the last imported report in sessionStorage: it survives a page refresh
 * but is discarded when the tab closes (and on logout).
 */
@Injectable()
export class SessionReportRepository extends ReportRepository {
  load(): VulnerabilityReport | null {
    try {
      const raw = sessionStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as VulnerabilityReport) : null;
    } catch {
      return null;
    }
  }

  save(report: VulnerabilityReport): void {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(report));
    } catch {
      // Storage full or unavailable: the report stays in memory only.
    }
  }

  clear(): void {
    sessionStorage.removeItem(KEY);
  }
}
