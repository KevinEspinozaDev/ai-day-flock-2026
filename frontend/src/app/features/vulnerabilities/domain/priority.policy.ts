import {
  AssetCriticality,
  PrioritizedVulnerability,
  PriorityLevel,
  SEVERITY_ORDER,
  Severity,
  Vulnerability,
  VulnerabilityStatus,
} from './vulnerability.models';

/** Score used when the row has no CVSS: midpoint of each severity band. */
const DEFAULT_CVSS: Record<Severity, number> = {
  [Severity.Critical]: 9.5,
  [Severity.High]: 7.5,
  [Severity.Medium]: 5.5,
  [Severity.Low]: 2.5,
  [Severity.Info]: 0,
};

const CRITICALITY_FACTOR: Record<AssetCriticality, number> = {
  [AssetCriticality.High]: 1,
  [AssetCriticality.Medium]: 0.8,
  [AssetCriticality.Low]: 0.6,
};

export const EXPLOIT_FACTOR = 1.2;
export const EXPOSURE_FACTOR = 1.15;

export const PRIORITY_THRESHOLDS: ReadonlyArray<{ min: number; level: PriorityLevel }> = [
  { min: 90, level: PriorityLevel.P1 },
  { min: 70, level: PriorityLevel.P2 },
  { min: 40, level: PriorityLevel.P3 },
  { min: 0, level: PriorityLevel.P4 },
];

/** Maps a CVSS v3 base score to its qualitative severity. */
export function severityFromCvss(cvss: number): Severity {
  if (cvss >= 9) return Severity.Critical;
  if (cvss >= 7) return Severity.High;
  if (cvss >= 4) return Severity.Medium;
  if (cvss > 0) return Severity.Low;
  return Severity.Info;
}

/**
 * Risk score 0–100 = severity (CVSS × 10) × asset impact × exploitability × exposure.
 */
export function calculateRiskScore(v: Vulnerability): number {
  const base = (v.cvss ?? DEFAULT_CVSS[v.severity]) * 10;
  const score =
    base *
    CRITICALITY_FACTOR[v.assetCriticality] *
    (v.exploitAvailable ? EXPLOIT_FACTOR : 1) *
    (v.internetExposed ? EXPOSURE_FACTOR : 1);
  return Math.min(100, Math.max(0, Math.round(score)));
}

export function priorityFromScore(score: number): PriorityLevel {
  return PRIORITY_THRESHOLDS.find((t) => score >= t.min)!.level;
}

export function isActive(v: Vulnerability): boolean {
  return v.status === VulnerabilityStatus.Open || v.status === VulnerabilityStatus.InProgress;
}

export function prioritize(v: Vulnerability): PrioritizedVulnerability {
  const score = calculateRiskScore(v);
  return { ...v, score, priority: priorityFromScore(score) };
}

/** Highest risk first; ties broken by severity, then CVSS. */
export function compareByRisk(a: PrioritizedVulnerability, b: PrioritizedVulnerability): number {
  return (
    b.score - a.score ||
    SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity) ||
    (b.cvss ?? 0) - (a.cvss ?? 0)
  );
}
