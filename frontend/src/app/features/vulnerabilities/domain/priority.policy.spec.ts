import { describe, expect, it } from 'vitest';
import { calculateRiskScore, prioritize, priorityFromScore, severityFromCvss } from './priority.policy';
import { buildSummary } from './vulnerability-summary';
import {
  AssetCriticality,
  PriorityLevel,
  Severity,
  Vulnerability,
  VulnerabilityStatus,
} from './vulnerability.models';

function vuln(overrides: Partial<Vulnerability> = {}): Vulnerability {
  return {
    id: 'V-1',
    title: 'Test',
    cve: null,
    severity: Severity.High,
    cvss: 7.5,
    asset: 'srv-1',
    assetCriticality: AssetCriticality.Medium,
    internetExposed: false,
    exploitAvailable: false,
    status: VulnerabilityStatus.Open,
    owner: null,
    detectedAt: null,
    ...overrides,
  };
}

describe('priority policy', () => {
  it('maps CVSS to qualitative severity', () => {
    expect(severityFromCvss(9.8)).toBe(Severity.Critical);
    expect(severityFromCvss(7)).toBe(Severity.High);
    expect(severityFromCvss(4)).toBe(Severity.Medium);
    expect(severityFromCvss(0.1)).toBe(Severity.Low);
    expect(severityFromCvss(0)).toBe(Severity.Info);
  });

  it('weights severity by asset impact, exploitability and exposure', () => {
    expect(calculateRiskScore(vuln())).toBe(60); // 75 × 0.8
    expect(calculateRiskScore(vuln({ assetCriticality: AssetCriticality.High }))).toBe(75);
    expect(
      calculateRiskScore(
        vuln({ assetCriticality: AssetCriticality.High, exploitAvailable: true, internetExposed: true }),
      ),
    ).toBe(100); // capped
  });

  it('uses the severity midpoint when CVSS is missing', () => {
    expect(calculateRiskScore(vuln({ cvss: null, severity: Severity.Critical, assetCriticality: AssetCriticality.High }))).toBe(95);
  });

  it('derives the priority from the score thresholds', () => {
    expect(priorityFromScore(90)).toBe(PriorityLevel.P1);
    expect(priorityFromScore(89)).toBe(PriorityLevel.P2);
    expect(priorityFromScore(70)).toBe(PriorityLevel.P2);
    expect(priorityFromScore(69)).toBe(PriorityLevel.P3);
    expect(priorityFromScore(40)).toBe(PriorityLevel.P3);
    expect(priorityFromScore(39)).toBe(PriorityLevel.P4);
    expect(prioritize(vuln()).priority).toBe(PriorityLevel.P3);
  });

  it('a medium bug on a critical exposed asset can outrank a critical bug on a low-impact asset', () => {
    const exposed = calculateRiskScore(
      vuln({ severity: Severity.High, cvss: 7.5, assetCriticality: AssetCriticality.High, internetExposed: true, exploitAvailable: true }),
    );
    const isolated = calculateRiskScore(vuln({ severity: Severity.Critical, cvss: 9.8, assetCriticality: AssetCriticality.Low }));
    expect(exposed).toBeGreaterThan(isolated);
  });
});

describe('buildSummary', () => {
  it('only prioritizes active vulnerabilities and sorts by risk', () => {
    const summary = buildSummary([
      vuln({ id: 'low', cvss: 3, severity: Severity.Low }),
      vuln({ id: 'top', cvss: 9.8, severity: Severity.Critical, assetCriticality: AssetCriticality.High, internetExposed: true, exploitAvailable: true }),
      vuln({ id: 'done', status: VulnerabilityStatus.Resolved }),
      vuln({ id: 'accepted', status: VulnerabilityStatus.RiskAccepted }),
    ]);

    expect(summary.total).toBe(4);
    expect(summary.active).toBe(2);
    expect(summary.closed).toBe(2);
    expect(summary.ranking.map((v) => v.id)).toEqual(['top', 'low']);
    expect(summary.p1).toBe(1);
    expect(summary.exposedWithExploit).toBe(1);
    expect(summary.bySeverity[Severity.Critical]).toBe(1);
    expect(summary.impactMatrix[AssetCriticality.High][Severity.Critical]).toBe(1);
    expect(summary.topAssets[0]).toMatchObject({ asset: 'srv-1', count: 2 });
  });
});
