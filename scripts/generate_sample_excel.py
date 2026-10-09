"""Genera assets/vulnerabilidades-ejemplo.xlsx (datos ficticios de ejemplo).

Uso: python scripts/generate_sample_excel.py   (requiere: pip install openpyxl)
"""
from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

HEADERS = [
    "ID", "Título", "CVE", "Severidad", "CVSS", "Activo", "Criticidad del activo",
    "Expuesto a Internet", "Exploit disponible", "Estado", "Responsable", "Fecha de detección",
]

# (título, cve, severidad, cvss, activo, criticidad, expuesto, exploit, estado, responsable, fecha)
ROWS = [
    ("Ejecución remota de código en Apache Log4j (Log4Shell)", "CVE-2021-44228", "Crítica", 10.0, "api-pagos-prod", "Alta", "Sí", "Sí", "Abierta", "Equipo Pagos", date(2026, 9, 2)),
    ("Inyección SQL en MOVEit Transfer", "CVE-2023-34362", "Crítica", 9.8, "sftp-proveedores", "Alta", "Sí", "Sí", "En progreso", "Infraestructura", date(2026, 8, 28)),
    ("Spring4Shell: RCE en Spring Framework", "CVE-2022-22965", "Crítica", 9.8, "portal-clientes", "Alta", "Sí", "Sí", "Abierta", "Equipo Portal", date(2026, 9, 10)),
    ("Inyección de comandos en GlobalProtect de PAN-OS", "CVE-2024-3400", "Crítica", 10.0, "fw-perimetral-01", "Alta", "Sí", "Sí", "Abierta", "Redes", date(2026, 9, 15)),
    ("Citrix Bleed: fuga de sesión en NetScaler", "CVE-2023-4966", "Crítica", 9.4, "vpn-gateway", "Alta", "Sí", "Sí", "En progreso", "Redes", date(2026, 9, 1)),
    ("Elevación de privilegios en interfaz web de Cisco IOS XE", "CVE-2023-20198", "Crítica", 10.0, "router-sucursal-ba", "Media", "No", "Sí", "Abierta", "Redes", date(2026, 8, 20)),
    ("BlueKeep: RCE en Remote Desktop Services", "CVE-2019-0708", "Crítica", 9.8, "srv-legacy-contable", "Media", "No", "Sí", "Abierta", "Infraestructura", date(2026, 7, 30)),
    ("Elevación de privilegios en Microsoft Outlook", "CVE-2023-23397", "Crítica", 9.8, "pc-finanzas-012", "Media", "No", "Sí", "Abierta", "Mesa de ayuda", date(2026, 9, 5)),
    ("Desbordamiento de heap en curl (SOCKS5)", "CVE-2023-38545", "Crítica", 9.8, "worker-batch-03", "Baja", "No", "No", "Abierta", "Plataforma", date(2026, 9, 18)),
    ("PrintNightmare: RCE en Windows Print Spooler", "CVE-2021-34527", "Alta", 8.8, "srv-impresion", "Media", "No", "Sí", "Abierta", "Infraestructura", date(2026, 8, 12)),
    ("regreSSHion: condición de carrera en OpenSSH", "CVE-2024-6387", "Alta", 8.1, "bastion-ssh", "Alta", "Sí", "Sí", "Abierta", "Plataforma", date(2026, 9, 21)),
    ("HTTP/2 Rapid Reset (denegación de servicio)", "CVE-2023-44487", "Alta", 7.5, "lb-publico", "Alta", "Sí", "Sí", "En progreso", "Plataforma", date(2026, 9, 3)),
    ("Heartbleed: lectura de memoria en OpenSSL", "CVE-2014-0160", "Alta", 7.5, "srv-legacy-contable", "Media", "No", "Sí", "Abierta", "Infraestructura", date(2026, 6, 14)),
    ("Path traversal en Apache HTTP Server 2.4.49", "CVE-2021-41773", "Alta", 7.5, "web-institucional", "Media", "Sí", "Sí", "Abierta", "Equipo Web", date(2026, 9, 8)),
    ("Bucle infinito en OpenSSL al parsear certificados", "CVE-2022-0778", "Alta", 7.5, "api-interna-rrhh", "Baja", "No", "No", "Abierta", "Equipo RRHH", date(2026, 8, 25)),
    ("Credenciales por defecto en panel de administración", None, "Alta", 8.6, "panel-admin-cms", "Alta", "Sí", "No", "Abierta", "Equipo Web", date(2026, 9, 22)),
    ("Bucket de almacenamiento con lectura pública", None, "Alta", 7.5, "storage-reportes", "Alta", "Sí", "No", "Abierta", "Plataforma", date(2026, 9, 24)),
    ("JWT firmado con secreto débil", None, "Alta", 7.4, "api-pagos-prod", "Alta", "Sí", "No", "En progreso", "Equipo Pagos", date(2026, 9, 12)),
    ("Dependencia npm con prototype pollution", None, "Alta", 7.3, "portal-clientes", "Alta", "Sí", "No", "Abierta", "Equipo Portal", date(2026, 9, 16)),
    ("Falta de rate limiting en endpoint de login", None, "Media", 5.3, "portal-clientes", "Alta", "Sí", "No", "Abierta", "Equipo Portal", date(2026, 9, 16)),
    ("TLS 1.0 y 1.1 habilitados", None, "Media", 5.9, "web-institucional", "Media", "Sí", "No", "Abierta", "Equipo Web", date(2026, 8, 30)),
    ("Cross-Site Scripting reflejado en buscador", None, "Media", 6.1, "web-institucional", "Media", "Sí", "No", "Abierta", "Equipo Web", date(2026, 9, 9)),
    ("Listado de directorios habilitado", None, "Media", 5.3, "srv-archivos-intranet", "Baja", "No", "No", "Abierta", "Infraestructura", date(2026, 8, 18)),
    ("Cookies de sesión sin atributo Secure", None, "Media", 4.3, "intranet", "Media", "No", "No", "Abierta", "Equipo Intranet", date(2026, 9, 4)),
    ("Kernel Linux desactualizado", None, "Media", 5.5, "worker-batch-03", "Baja", "No", "No", "En progreso", "Plataforma", date(2026, 9, 11)),
    ("SMBv1 habilitado", None, "Media", 5.9, "srv-impresion", "Media", "No", "No", "Abierta", "Infraestructura", date(2026, 8, 2)),
    ("Política de contraseñas débil en Active Directory", None, "Media", 6.5, "dc-principal", "Alta", "No", "No", "Abierta", "Infraestructura", date(2026, 7, 21)),
    ("Exposición de versión en cabeceras HTTP", None, "Baja", 3.7, "api-interna-rrhh", "Baja", "No", "No", "Abierta", "Equipo RRHH", date(2026, 9, 19)),
    ("Falta cabecera Strict-Transport-Security", None, "Baja", 3.1, "portal-clientes", "Alta", "Sí", "No", "Abierta", "Equipo Portal", date(2026, 9, 16)),
    ("Autocompletado habilitado en formularios sensibles", None, "Baja", 2.4, "intranet", "Media", "No", "No", "Abierta", "Equipo Intranet", date(2026, 9, 4)),
    ("Banner SSH revela versión del sistema operativo", None, "Baja", 2.6, "bastion-ssh", "Alta", "Sí", "No", "Abierta", "Plataforma", date(2026, 9, 21)),
    ("Certificado TLS próximo a vencer", None, "Informativa", None, "lb-publico", "Alta", "Sí", "No", "Abierta", "Plataforma", date(2026, 9, 25)),
    ("Puerto de administración abierto en red interna", None, "Informativa", None, "router-sucursal-ba", "Media", "No", "No", "Abierta", "Redes", date(2026, 8, 20)),
    ("Inyección SQL en módulo de reportes (corregida)", None, "Crítica", 9.1, "intranet", "Media", "No", "No", "Resuelta", "Equipo Intranet", date(2026, 6, 3)),
    ("EternalBlue en servidor de archivos (parcheado)", "CVE-2017-0144", "Alta", 8.1, "srv-archivos-intranet", "Baja", "No", "Sí", "Resuelta", "Infraestructura", date(2026, 5, 11)),
    ("Clickjacking en página de ayuda", None, "Baja", 3.1, "web-institucional", "Media", "Sí", "No", "Riesgo aceptado", "Equipo Web", date(2026, 7, 7)),
]

SEVERITY_FILL = {
    "Crítica": "F6D5D5", "Alta": "FBE3D9", "Media": "FEF0CF", "Baja": "D9E7F8", "Informativa": "ECECEA",
}


def main() -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Vulnerabilidades"
    ws.append(HEADERS)
    for i, row in enumerate(ROWS, start=1):
        ws.append([f"VULN-{i:03d}", *row])

    header_fill = PatternFill("solid", fgColor="1F3B63")
    for cell in ws[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = header_fill
        cell.alignment = Alignment(vertical="center", wrap_text=True)
    ws.row_dimensions[1].height = 30

    for row in ws.iter_rows(min_row=2):
        sev = row[3]
        sev.fill = PatternFill("solid", fgColor=SEVERITY_FILL[sev.value])
        row[4].number_format = "0.0"
        row[11].number_format = "dd/mm/yyyy"

    widths = [11, 52, 16, 13, 7, 22, 20, 18, 17, 16, 18, 18]
    for idx, width in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(idx)].width = width
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = ws.dimensions

    last = len(ROWS) + 200
    for col, options in {
        "D": '"Crítica,Alta,Media,Baja,Informativa"',
        "G": '"Alta,Media,Baja"',
        "H": '"Sí,No"',
        "I": '"Sí,No"',
        "J": '"Abierta,En progreso,Resuelta,Riesgo aceptado"',
    }.items():
        dv = DataValidation(type="list", formula1=options, allow_blank=True)
        dv.add(f"{col}2:{col}{last}")
        ws.add_data_validation(dv)
    cvss = DataValidation(type="decimal", operator="between", formula1="0", formula2="10", allow_blank=True)
    cvss.error = "El CVSS debe estar entre 0 y 10"
    cvss.add(f"E2:E{last}")
    ws.add_data_validation(cvss)

    help_ws = wb.create_sheet("Instrucciones")
    help_ws.column_dimensions["A"].width = 110
    for line in [
        "Planilla de ejemplo para VulnPrio (datos ficticios).",
        "",
        "La app lee SOLO la primera hoja. La primera fila deben ser los encabezados.",
        "Columnas obligatorias: ID, Título, Severidad, Activo.",
        "Severidad: Crítica, Alta, Media, Baja o Informativa (si falta, se deriva del CVSS).",
        "Criticidad del activo: Alta, Media o Baja (impacto en el negocio). Por defecto: Media.",
        "Expuesto a Internet / Exploit disponible: Sí o No.",
        "Estado: Abierta, En progreso, Resuelta o Riesgo aceptado. Solo se priorizan Abiertas y En progreso.",
        "",
        "Puntaje de riesgo (0-100) = CVSS x 10 x criticidad del activo (1 / 0,8 / 0,6) x 1,2 si hay exploit x 1,15 si está expuesto.",
        "Prioridad: P1 >= 90 · P2 >= 70 · P3 >= 40 · P4 < 40.",
    ]:
        help_ws.append([line])
    help_ws["A1"].font = Font(bold=True, size=13)

    out = Path(__file__).resolve().parent.parent / "assets" / "vulnerabilidades-ejemplo.xlsx"
    out.parent.mkdir(parents=True, exist_ok=True)
    wb.save(out)
    print(f"Generado {out} ({len(ROWS)} filas)")


if __name__ == "__main__":
    main()
