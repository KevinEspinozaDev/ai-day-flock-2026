import { Provider } from '@angular/core';
import { ReportRepository } from './application/vulnerability-report.store';
import { VulnerabilityFileParser } from './domain/vulnerability-file.parser';
import { SessionReportRepository } from './infrastructure/session-report.repository';
import { SheetJsVulnerabilityFileParser } from './infrastructure/sheetjs-vulnerability-file.parser';

/** Binds the vulnerability ports to their infrastructure adapters. */
export const vulnerabilitiesProviders: Provider[] = [
  { provide: VulnerabilityFileParser, useClass: SheetJsVulnerabilityFileParser },
  { provide: ReportRepository, useClass: SessionReportRepository },
];
