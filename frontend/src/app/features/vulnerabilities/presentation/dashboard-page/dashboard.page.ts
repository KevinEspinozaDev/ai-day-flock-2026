import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { ChartConfiguration } from 'chart.js';
import { VulnerabilityReportStore } from '../../application/vulnerability-report.store';
import {
  CRITICALITY_LABELS,
  CRITICALITY_ORDER,
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  PrioritizedVulnerability,
  PriorityLevel,
  SEVERITY_LABELS,
  SEVERITY_ORDER,
  STATUS_LABELS,
} from '../../domain/vulnerability.models';
import { PRIORITY_COLORS, SERIES_PRIMARY, SEVERITY_COLORS, SURFACE } from '../chart-palette';
import { ChartComponent } from '../components/chart/chart.component';

type BarConfig = ChartConfiguration<'bar'>;

const countAxis = {
  beginAtZero: true,
  ticks: { precision: 0 },
  grid: { color: '#efeee9' },
  border: { display: false },
};
const categoryAxis = { grid: { display: false }, border: { color: '#c9c8c1' } };
const barStyle = { borderRadius: 4, borderSkipped: 'start' as const, maxBarThickness: 48 };

@Component({
  selector: 'app-dashboard-page',
  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTooltipModule,
    ChartComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly store = inject(VulnerabilityReportStore);

  protected readonly report = this.store.report;
  protected readonly summary = this.store.summary;

  // Widened to string keys: mat-table rows are untyped (`any`) in templates.
  protected readonly severityLabels: Record<string, string> = SEVERITY_LABELS;
  protected readonly severityColors: Record<string, string> = SEVERITY_COLORS;
  protected readonly criticalityLabels: Record<string, string> = CRITICALITY_LABELS;
  protected readonly statusLabels: Record<string, string> = STATUS_LABELS;
  protected readonly priorityLabels: Record<string, string> = PRIORITY_LABELS;
  protected readonly priorityColors: Record<string, string> = PRIORITY_COLORS;
  protected readonly priorityOrder = PRIORITY_ORDER;

  protected readonly displayedColumns = [
    'rank', 'priority', 'score', 'id', 'title', 'severity', 'cvss', 'asset', 'assetCriticality', 'flags', 'status',
  ];
  protected readonly priorityFilter = signal<PriorityLevel | 'ALL'>('ALL');
  protected readonly textFilter = signal('');
  protected readonly dataSource = new MatTableDataSource<PrioritizedVulnerability & { rank: number }>([]);

  private readonly sort = viewChild(MatSort);
  private readonly paginator = viewChild(MatPaginator);

  private readonly filteredRanking = computed(() => {
    const ranking = this.summary()?.ranking ?? [];
    const priority = this.priorityFilter();
    const term = this.textFilter().trim().toLowerCase();
    return ranking
      .map((v, index) => ({ ...v, rank: index + 1 }))
      .filter((v) => priority === 'ALL' || v.priority === priority)
      .filter(
        (v) =>
          !term ||
          [v.id, v.title, v.cve ?? '', v.asset, v.owner ?? ''].some((field) =>
            field.toLowerCase().includes(term),
          ),
      );
  });

  protected readonly severityChart = computed<BarConfig | null>(() => {
    const s = this.summary();
    if (!s) return null;
    return {
      type: 'bar',
      data: {
        labels: SEVERITY_ORDER.map((k) => SEVERITY_LABELS[k]),
        datasets: [
          {
            label: 'Vulnerabilidades activas',
            data: SEVERITY_ORDER.map((k) => s.bySeverity[k]),
            backgroundColor: SEVERITY_ORDER.map((k) => SEVERITY_COLORS[k]),
            ...barStyle,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { x: categoryAxis, y: countAxis },
      },
    };
  });

  protected readonly priorityChart = computed<BarConfig | null>(() => {
    const s = this.summary();
    if (!s) return null;
    return {
      type: 'bar',
      data: {
        labels: PRIORITY_ORDER.map((k) => PRIORITY_LABELS[k]),
        datasets: [
          {
            label: 'Vulnerabilidades activas',
            data: PRIORITY_ORDER.map((k) => s.byPriority[k]),
            backgroundColor: PRIORITY_ORDER.map((k) => PRIORITY_COLORS[k]),
            ...barStyle,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false } },
        scales: { x: categoryAxis, y: countAxis },
      },
    };
  });

  protected readonly impactChart = computed<BarConfig | null>(() => {
    const s = this.summary();
    if (!s) return null;
    return {
      type: 'bar',
      data: {
        labels: CRITICALITY_ORDER.map((c) => `Activo ${CRITICALITY_LABELS[c].toLowerCase()}`),
        datasets: SEVERITY_ORDER.map((severity) => ({
          label: SEVERITY_LABELS[severity],
          data: CRITICALITY_ORDER.map((c) => s.impactMatrix[c][severity]),
          backgroundColor: SEVERITY_COLORS[severity],
          borderColor: SURFACE,
          borderWidth: { top: 2 },
          borderSkipped: false,
          maxBarThickness: 64,
        })),
      },
      options: {
        plugins: { legend: { position: 'bottom' } },
        scales: {
          x: { ...categoryAxis, stacked: true },
          y: { ...countAxis, stacked: true },
        },
      },
    };
  });

  protected readonly assetsChart = computed<BarConfig | null>(() => {
    const s = this.summary();
    if (!s) return null;
    return {
      type: 'bar',
      data: {
        labels: s.topAssets.map((a) => a.asset),
        datasets: [
          {
            label: 'Riesgo acumulado',
            data: s.topAssets.map((a) => a.totalScore),
            backgroundColor: SERIES_PRIMARY,
            ...barStyle,
            maxBarThickness: 22,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              afterLabel: (ctx) => {
                const asset = s.topAssets[ctx.dataIndex];
                return `${asset.count} vulnerabilidades · criticidad ${CRITICALITY_LABELS[asset.criticality].toLowerCase()}`;
              },
            },
          },
        },
        scales: {
          x: { ...countAxis, title: { display: true, text: 'Suma de puntajes de riesgo' } },
          y: { grid: { display: false }, border: { color: '#c9c8c1' } },
        },
      },
    };
  });

  constructor() {
    effect(() => {
      this.dataSource.data = this.filteredRanking();
      this.paginator()?.firstPage();
    });
    effect(() => {
      this.dataSource.sort = this.sort() ?? null;
      this.dataSource.paginator = this.paginator() ?? null;
    });
  }

  protected onSearch(event: Event): void {
    this.textFilter.set((event.target as HTMLInputElement).value);
  }
}
