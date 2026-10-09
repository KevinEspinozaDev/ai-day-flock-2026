import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router } from '@angular/router';
import { ImportVulnerabilitiesUseCase } from '../../application/import-vulnerabilities.use-case';
import { VulnerabilityReport } from '../../application/vulnerability-report.store';
import {
  ACCEPT_ATTRIBUTE,
  ALLOWED_EXTENSIONS,
  MAX_FILE_SIZE_BYTES,
} from '../../domain/spreadsheet-file.policy';

interface ExpectedColumn {
  name: string;
  required: boolean;
  hint: string;
}

@Component({
  selector: 'app-upload-page',
  imports: [
    DecimalPipe,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatExpansionModule,
  ],
  templateUrl: './upload.page.html',
  styleUrl: './upload.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadPage {
  private readonly importVulnerabilities = inject(ImportVulnerabilitiesUseCase);
  private readonly router = inject(Router);

  protected readonly accept = ACCEPT_ATTRIBUTE;
  protected readonly allowedExtensions = ALLOWED_EXTENSIONS.join(', ');
  protected readonly maxSizeMb = MAX_FILE_SIZE_BYTES / 1024 / 1024;

  protected readonly dragging = signal(false);
  protected readonly processing = signal(false);
  protected readonly selectedFile = signal<File | null>(null);
  protected readonly errors = signal<string[]>([]);
  protected readonly result = signal<VulnerabilityReport | null>(null);

  protected readonly columns: ExpectedColumn[] = [
    { name: 'ID', required: true, hint: 'Identificador único, p. ej. VULN-001' },
    { name: 'Título', required: true, hint: 'Descripción corta del hallazgo' },
    { name: 'Severidad', required: true, hint: 'Crítica, Alta, Media, Baja o Informativa' },
    { name: 'Activo', required: true, hint: 'Host, sistema o aplicación afectada' },
    { name: 'CVSS', required: false, hint: 'Puntaje base de 0 a 10' },
    { name: 'CVE', required: false, hint: 'p. ej. CVE-2021-44228' },
    { name: 'Criticidad del activo', required: false, hint: 'Alta, Media o Baja (impacto en el negocio)' },
    { name: 'Expuesto a Internet', required: false, hint: 'Sí / No' },
    { name: 'Exploit disponible', required: false, hint: 'Sí / No' },
    { name: 'Estado', required: false, hint: 'Abierta, En progreso, Resuelta, Riesgo aceptado' },
    { name: 'Responsable', required: false, hint: 'Equipo o persona a cargo' },
    { name: 'Fecha de detección', required: false, hint: 'Fecha del hallazgo' },
  ];

  protected onFileInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (file) void this.process(file);
  }

  protected onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  protected onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const files = event.dataTransfer?.files;
    if (!files?.length) return;
    if (files.length > 1) {
      this.errors.set(['Subí un solo archivo por vez.']);
      return;
    }
    void this.process(files[0]);
  }

  protected goToDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }

  private async process(file: File): Promise<void> {
    this.selectedFile.set(file);
    this.errors.set([]);
    this.result.set(null);
    this.processing.set(true);
    try {
      const outcome = await this.importVulnerabilities.execute(file);
      if (outcome.ok) {
        this.result.set(outcome.report);
      } else {
        this.errors.set(outcome.errors);
      }
    } catch {
      this.errors.set(['Ocurrió un error inesperado al procesar el archivo.']);
    } finally {
      this.processing.set(false);
    }
  }
}
