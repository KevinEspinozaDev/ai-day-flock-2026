import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  ChartConfiguration,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

Chart.defaults.font.family = 'Roboto, "Helvetica Neue", sans-serif';
Chart.defaults.color = '#52514e';
Chart.defaults.borderColor = '#e4e3dd';
Chart.defaults.plugins.tooltip.padding = 10;
Chart.defaults.plugins.tooltip.boxPadding = 4;
Chart.defaults.plugins.legend.labels.usePointStyle = true;
Chart.defaults.plugins.legend.labels.pointStyle = 'rectRounded';

/** Thin wrapper over Chart.js: re-renders when `config` changes and cleans up on destroy. */
@Component({
  selector: 'app-chart',
  template: `<div class="chart" [style.height.px]="height()">
    <canvas #canvas role="img" [attr.aria-label]="ariaLabel()"></canvas>
  </div>`,
  styles: `
    .chart {
      position: relative;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartComponent {
  readonly config = input.required<ChartConfiguration<'bar'>>();
  readonly ariaLabel = input.required<string>();
  readonly height = input(280);

  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart: Chart<'bar'> | null = null;

  constructor() {
    afterRenderEffect(() => {
      const config = this.config();
      this.chart?.destroy();
      this.chart = new Chart(this.canvas().nativeElement, {
        ...config,
        options: { responsive: true, maintainAspectRatio: false, ...config.options },
      });
    });
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
  }
}
