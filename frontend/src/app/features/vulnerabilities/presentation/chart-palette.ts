import { PriorityLevel, Severity } from '../domain/vulnerability.models';

/**
 * Severity uses the reserved status palette (always shown with a text label).
 * Priority is ordinal, so it uses one blue ramp: darker = more urgent.
 */
export const SEVERITY_COLORS: Record<Severity, string> = {
  [Severity.Critical]: '#d03b3b',
  [Severity.High]: '#ec835a',
  [Severity.Medium]: '#fab219',
  [Severity.Low]: '#2a78d6',
  [Severity.Info]: '#8f8e88',
};

export const PRIORITY_COLORS: Record<PriorityLevel, string> = {
  [PriorityLevel.P1]: '#104281',
  [PriorityLevel.P2]: '#256abf',
  [PriorityLevel.P3]: '#5598e7',
  [PriorityLevel.P4]: '#9ec5f4',
};

export const SERIES_PRIMARY = '#2a78d6';
export const SURFACE = '#ffffff';
