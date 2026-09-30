import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import logoPng from '../assets/logo.png';

export interface BitacoraReportRecord {
  id: string | number;
  fecha?: string;
  tipoAcceso?: string;
  empresaNombre: string;
  placas?: string;
  color?: string;
  conductor: string;
  telefono?: string;
  corbatinNum?: string;
  num_pasajeros?: number;
  horaEntrada: string;
  horaSalida?: string;
  trabajos?: string;
  guardiaNombre?: string;
  estado?: string;
  observaciones?: string;
  vehicleId?: string;
}

export interface BitacoraReportOptions {
  titulo?: string;
  periodoNombre: string;
  fechaEmision?: string;
  supervisorNombre?: string;
  guardiaNombre?: string;
  empresaFiltro?: string;
  modalidadFiltro?: string;
  estatusFiltro?: string;
  records: BitacoraReportRecord[];
  kpis?: {
    totalMovimientos: number;
    totalEntradas: number;
    totalSalidas: number;
    balanceDentro: number;
    vehiculares?: number;
    peatonales?: number;
  };
}

// Cargar imagen del logo oficial de Las Palomas para incrustar en PDF
async function getLogoDataUrl(): Promise<string | null> {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth || img.width || 400;
        canvas.height = img.naturalHeight || img.height || 120;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/png'));
        } else {
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = logoPng;
    } catch {
      resolve(null);
    }
  });
}

// Formateador de horas a formato 12 hrs
function formatHoraVisual(raw?: string): string {
  if (!raw || raw === '—' || raw === '00:00 hrs' || raw === 'Dentro') return raw || '—';
  try {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) {
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    }
  } catch {}
  return raw.replace(/ hrs/i, '');
}

/**
 * Genera un PDF Ejecutivo de alta resolución para la Bitácora de Accesos
 */
export async function generateBitacoraPDF(options: BitacoraReportOptions): Promise<jsPDF> {
  const {
    titulo = 'BITÁCORA OFICIAL DE CONTROL DE ACCESOS Y REGISTRO VEHICULAR / PEATONAL',
    periodoNombre,
    fechaEmision = new Date().toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    supervisorNombre = 'Supervisor de Seguridad HOA',
    guardiaNombre = 'Oficial de Caseta Principal',
    empresaFiltro = 'Todas las Empresas',
    modalidadFiltro = 'Todas las Modalidades',
    records = []
  } = options;

  // Calcular KPIs si no vienen calculados
  const totalMovimientos = options.kpis?.totalMovimientos ?? records.length;
  const totalEntradas = options.kpis?.totalEntradas ?? records.filter(r => r.horaEntrada && r.horaEntrada !== '—').length;
  const totalSalidas = options.kpis?.totalSalidas ?? records.filter(r => r.horaSalida && r.horaSalida !== 'Dentro' && r.horaSalida !== '—').length;
  const balanceDentro = options.kpis?.balanceDentro ?? records.filter(r => !r.horaSalida || r.horaSalida === 'Dentro' || r.estado === 'Dentro').length;
  const vehiculares = options.kpis?.vehiculares ?? records.filter(r => r.tipoAcceso !== 'Peatonal' && r.vehicleId !== 'PEATONAL').length;
  const peatonales = options.kpis?.peatonales ?? records.filter(r => r.tipoAcceso === 'Peatonal' || r.vehicleId === 'PEATONAL').length;

  const [logoDataUrl, qrVerifyUrl] = await Promise.all([
    getLogoDataUrl(),
    QRCode.toDataURL(`LP-HOA|BITACORA|RECORDS:${records.length}|FECHA:${new Date().toISOString()}`, {
      width: 250,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#0D6E5F', light: '#ffffff' }
    }).catch(() => null)
  ]);

  // Dimensiones A4 Horizontal (Landscape): 297 mm de ancho x 210 mm de alto
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 297;
  const pageHeight = 210;
  const marginX = 10;
  const contentWidth = pageWidth - marginX * 2; // 277 mm
  const startY = 8;

  // Definición de columnas de la tabla (Suma total = 277 mm)
  const columns = [
    { header: 'FOLIO', width: 14, align: 'center' as const },
    { header: 'FECHA', width: 19, align: 'center' as const },
    { header: 'MODALIDAD', width: 22, align: 'center' as const },
    { header: 'EMPRESA CONTRATISTA', width: 44, align: 'left' as const },
    { header: 'PLACAS / ID', width: 24, align: 'center' as const },
    { header: 'CONDUCTOR / COLABORADOR', width: 38, align: 'left' as const },
    { header: 'PAS.', width: 10, align: 'center' as const },
    { header: 'CORB.', width: 14, align: 'center' as const },
    { header: 'ENTRADA', width: 18, align: 'center' as const },
    { header: 'SALIDA', width: 18, align: 'center' as const },
    { header: 'DESTINO / TRABAJOS', width: 34, align: 'left' as const },
    { header: 'ESTATUS', width: 22, align: 'center' as const }
  ];

  let currentPage = 1;

  // ─────────────────────────────────────────────────────────────────────────────
  // FUNCIÓN PARA DIBUJAR EL ENCABEZADO DE CADA PÁGINA
  // ─────────────────────────────────────────────────────────────────────────────
  const drawPageHeader = (isFirstPage: boolean) => {
    if (isFirstPage) {
      // ── BARRAS SUPERIORES DECORATIVAS ──
      pdf.setFillColor(13, 110, 95); // #0D6E5F Verde Esmeralda Institucional
      pdf.rect(marginX, startY, contentWidth, 24, 'F');

      pdf.setFillColor(217, 119, 6); // #D97706 Dorado de Acento
      pdf.rect(marginX, startY + 24, contentWidth, 1.2, 'F');

      // Logo HOA
      if (logoDataUrl) {
        try {
          pdf.addImage(logoDataUrl, 'PNG', marginX + 3, startY + 2.5, 42, 19);
        } catch {
          drawFallbackLogo(marginX + 4, startY + 12);
        }
      } else {
        drawFallbackLogo(marginX + 4, startY + 12);
      }

      // Títulos Principales en el Banner
      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(13);
      pdf.text('LAS PALOMAS ROCKY POINT HOA, A.C.', marginX + 48, startY + 8.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7.5);
      pdf.setTextColor(230, 244, 241);
      pdf.text('DEPARTAMENTO DE SEGURIDAD, VIGILANCIA Y CONTROL DE ACCESOS', marginX + 48, startY + 13.5);

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(254, 243, 199);
      pdf.text(titulo, marginX + 48, startY + 19.5);

      // Badge de Fecha y Folio en esquina superior derecha
      pdf.setFillColor(10, 84, 72);
      pdf.roundedRect(pageWidth - marginX - 58, startY + 3, 55, 18, 1.5, 1.5, 'F');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(255, 255, 255);
      pdf.text('AUDITORÍA DE ACCESOS', pageWidth - marginX - 55, startY + 7.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(204, 251, 241);
      pdf.text(`Emisión: ${fechaEmision}`, pageWidth - marginX - 55, startY + 12);
      pdf.text(`Filtro: ${empresaFiltro.length > 18 ? empresaFiltro.substring(0, 16) + '...' : empresaFiltro}`, pageWidth - marginX - 55, startY + 16.5);

      // ── BARRA DE METADATOS Y FILTROS ──
      const metaY = startY + 27;
      pdf.setFillColor(248, 250, 252);
      pdf.setDrawColor(226, 232, 240);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(marginX, metaY, contentWidth, 8, 1, 1, 'FD');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(15, 23, 42);
      pdf.text('PERIODO:', marginX + 3, metaY + 5.2);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(13, 110, 95);
      pdf.text(periodoNombre.toUpperCase(), marginX + 18, metaY + 5.2);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('SUPERVISOR:', marginX + 90, metaY + 5.2);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(supervisorNombre, marginX + 110, metaY + 5.2);

      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(15, 23, 42);
      pdf.text('MODALIDAD:', marginX + 180, metaY + 5.2);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(71, 85, 105);
      pdf.text(modalidadFiltro, marginX + 200, metaY + 5.2);

      // ── TARJETAS KPI RESUMEN EJECUTIVO (4 BLOQUES) ──
      const kpiY = metaY + 10.5;
      const kpiW = (contentWidth - 9) / 4; // 4 tarjetas con 3 mm de separación
      const kpiH = 13.5;

      const kpiData = [
        { label: 'TOTAL MOVIMIENTOS', value: totalMovimientos, sub: 'Flujo acumulado', bg: [241, 245, 249], border: [203, 213, 225], text: [15, 23, 42] },
        { label: 'INGRESOS (ENTRADAS)', value: totalEntradas, sub: `${vehiculares} vehiculares · ${peatonales} peatonales`, bg: [230, 244, 241], border: [13, 110, 95], text: [13, 110, 95] },
        { label: 'SALIDAS REGISTRADAS', value: totalSalidas, sub: 'Egresos completados', bg: [248, 250, 252], border: [148, 163, 184], text: [71, 85, 105] },
        { label: 'EN INSTALACIONES (DENTRO)', value: balanceDentro, sub: balanceDentro > 0 ? 'Permanencia activa' : 'Sin unidades en sitio', bg: balanceDentro > 0 ? [220, 252, 231] : [241, 245, 249], border: balanceDentro > 0 ? [22, 163, 74] : [203, 213, 225], text: balanceDentro > 0 ? [22, 163, 74] : [100, 116, 139] },
      ];

      kpiData.forEach((k, idx) => {
        const x = marginX + idx * (kpiW + 3);
        pdf.setFillColor(k.bg[0], k.bg[1], k.bg[2]);
        pdf.setDrawColor(k.border[0], k.border[1], k.border[2]);
        pdf.setLineWidth(0.4);
        pdf.roundedRect(x, kpiY, kpiW, kpiH, 1.2, 1.2, 'FD');

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6);
        pdf.setTextColor(71, 85, 105);
        pdf.text(k.label, x + 3, kpiY + 4);

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.setTextColor(k.text[0], k.text[1], k.text[2]);
        pdf.text(String(k.value), x + 3, kpiY + 9.5);

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(5.5);
        pdf.setTextColor(100, 116, 139);
        pdf.text(k.sub, x + 3, kpiY + 12.2);
      });

      return kpiY + kpiH + 3.5;
    } else {
      // ── ENCABEZADO COMPACTO PARA PÁGINAS 2 EN ADELANTE ──
      pdf.setFillColor(13, 110, 95);
      pdf.rect(marginX, startY, contentWidth, 10, 'F');

      pdf.setFillColor(217, 119, 6);
      pdf.rect(marginX, startY + 10, contentWidth, 0.8, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('LAS PALOMAS HOA · BITÁCORA OFICIAL DE ACCESOS (CONTINUACIÓN)', marginX + 4, startY + 6.5);

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(230, 244, 241);
      pdf.text(`Periodo: ${periodoNombre} · Pág. ${currentPage}`, pageWidth - marginX - 50, startY + 6.5);

      return startY + 13;
    }
  };

  const drawFallbackLogo = (x: number, y: number) => {
    pdf.setFont('times', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Las Palomas', x, y);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(204, 251, 241);
    pdf.text('Rocky Point HOA', x, y + 4);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FUNCIÓN PARA DIBUJAR EL ENCABEZADO DE LA TABLA
  // ─────────────────────────────────────────────────────────────────────────────
  const drawTableHeader = (tableY: number) => {
    const rowH = 6.5;

    pdf.setFillColor(10, 84, 72); // Esmeralda Oscuro de Contraste
    pdf.rect(marginX, tableY, contentWidth, rowH, 'F');

    let curX = marginX;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6.5);
    pdf.setTextColor(255, 255, 255);

    columns.forEach((col) => {
      if (col.align === 'center') {
        pdf.text(col.header, curX + col.width / 2, tableY + 4.3, { align: 'center' });
      } else {
        pdf.text(col.header, curX + 2, tableY + 4.3);
      }
      curX += col.width;
    });

    return tableY + rowH;
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // FUNCIÓN PARA DIBUJAR EL PIE DE PÁGINA
  // ─────────────────────────────────────────────────────────────────────────────
  const drawFooter = () => {
    const footerY = pageHeight - 9;

    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.3);
    pdf.line(marginX, footerY - 1.5, pageWidth - marginX, footerY - 1.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(6);
    pdf.setTextColor(100, 116, 139);
    pdf.text('LAS PALOMAS ROCKY POINT HOA, A.C. · DOCUMENTO OFICIAL DE AUDITORÍA Y SEGURIDAD', marginX, footerY + 2.5);

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor(148, 163, 184);
    pdf.text(`Generado: ${fechaEmision} por ${guardiaNombre}`, marginX + 115, footerY + 2.5);

    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(13, 110, 95);
    pdf.text(`Página ${currentPage}`, pageWidth - marginX - 18, footerY + 2.5, { align: 'right' });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // DIBUJAR CONTENIDO PRINCIPAL
  // ─────────────────────────────────────────────────────────────────────────────
  let currentY = drawPageHeader(true);
  currentY = drawTableHeader(currentY);

  const rowHeight = 6.2;
  const maxTableY = pageHeight - 24; // Dejar espacio para footer y eventual bloque de firmas

  if (records.length === 0) {
    pdf.setFillColor(248, 250, 252);
    pdf.rect(marginX, currentY, contentWidth, 20, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text('No se encontraron registros de accesos para los filtros y fechas seleccionadas.', pageWidth / 2, currentY + 11, { align: 'center' });
    currentY += 20;
  } else {
    records.forEach((rec, idx) => {
      // Si la fila no cabe en la página actual, crear nueva página
      if (currentY + rowHeight > maxTableY) {
        drawFooter();
        pdf.addPage('a4', 'landscape');
        currentPage++;
        currentY = drawPageHeader(false);
        currentY = drawTableHeader(currentY);
      }

      const isEven = idx % 2 === 0;
      pdf.setFillColor(isEven ? 255 : 248, isEven ? 255 : 250, isEven ? 255 : 252);
      pdf.rect(marginX, currentY, contentWidth, rowHeight, 'F');

      // Línea divisoria suave
      pdf.setDrawColor(241, 245, 249);
      pdf.setLineWidth(0.2);
      pdf.line(marginX, currentY + rowHeight, marginX + contentWidth, currentY + rowHeight);

      let cellX = marginX;

      // 1. Folio
      pdf.setFont('courier', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(15, 23, 42);
      pdf.text(String(rec.id), cellX + columns[0].width / 2, currentY + 4.2, { align: 'center' });
      cellX += columns[0].width;

      // 2. Fecha
      const fechaCorta = rec.fecha ? rec.fecha.substring(5) : (new Date().toISOString().substring(5, 10));
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      pdf.setTextColor(71, 85, 105);
      pdf.text(fechaCorta, cellX + columns[1].width / 2, currentY + 4.2, { align: 'center' });
      cellX += columns[1].width;

      // 3. Modalidad
      const esPeatonal = rec.tipoAcceso === 'Peatonal' || rec.vehicleId === 'PEATONAL';
      const esCorbatinVerde = rec.tipoAcceso === 'Corbatín Verde' || rec.corbatinNum?.startsWith('V-');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(5.5);

      if (esPeatonal) {
        pdf.setFillColor(224, 242, 254);
        pdf.roundedRect(cellX + 2, currentY + 1.2, columns[2].width - 4, 3.8, 0.8, 0.8, 'F');
        pdf.setTextColor(3, 105, 161);
        pdf.text('PEATONAL', cellX + columns[2].width / 2, currentY + 3.9, { align: 'center' });
      } else if (esCorbatinVerde) {
        pdf.setFillColor(220, 252, 231);
        pdf.roundedRect(cellX + 2, currentY + 1.2, columns[2].width - 4, 3.8, 0.8, 0.8, 'F');
        pdf.setTextColor(21, 128, 61);
        pdf.text('CORB. VERDE', cellX + columns[2].width / 2, currentY + 3.9, { align: 'center' });
      } else {
        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(cellX + 2, currentY + 1.2, columns[2].width - 4, 3.8, 0.8, 0.8, 'F');
        pdf.setTextColor(51, 65, 85);
        pdf.text('VEHICULAR', cellX + columns[2].width / 2, currentY + 3.9, { align: 'center' });
      }
      cellX += columns[2].width;

      // 4. Empresa Contratista
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);
      pdf.setTextColor(15, 23, 42);
      const empNombre = rec.empresaNombre || '—';
      const cleanEmp = empNombre.length > 25 ? empNombre.substring(0, 24) + '…' : empNombre;
      pdf.text(cleanEmp, cellX + 1.5, currentY + 4.2);
      cellX += columns[3].width;

      // 5. Placas / ID
      const placasText = rec.placas && rec.placas !== 'PEATONAL' ? rec.placas : (esPeatonal ? 'A PIE' : '—');
      if (placasText !== 'A PIE' && placasText !== '—') {
        pdf.setFillColor(15, 23, 42);
        pdf.roundedRect(cellX + 2, currentY + 1.2, columns[4].width - 4, 3.8, 0.8, 0.8, 'F');
        pdf.setFont('courier', 'bold');
        pdf.setFontSize(6);
        pdf.setTextColor(103, 232, 249); // Cyan placa
        pdf.text(placasText, cellX + columns[4].width / 2, currentY + 3.9, { align: 'center' });
      } else {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(6);
        pdf.setTextColor(100, 116, 139);
        pdf.text(placasText, cellX + columns[4].width / 2, currentY + 4.2, { align: 'center' });
      }
      cellX += columns[4].width;

      // 6. Conductor / Colaborador
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.setTextColor(30, 41, 59);
      const condNombre = rec.conductor || 'Personal externo';
      const cleanCond = condNombre.length > 23 ? condNombre.substring(0, 22) + '…' : condNombre;
      pdf.text(cleanCond, cellX + 1.5, currentY + 4.2);
      cellX += columns[5].width;

      // 7. Pasajeros
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      const numPas = Number(rec.num_pasajeros) || 0;
      pdf.setTextColor(numPas > 0 ? 180 : 100, numPas > 0 ? 83 : 116, numPas > 0 ? 9 : 139);
      pdf.text(String(numPas), cellX + columns[6].width / 2, currentY + 4.2, { align: 'center' });
      cellX += columns[6].width;

      // 8. Corbatín
      pdf.setFont('courier', 'bold');
      pdf.setFontSize(6);
      pdf.setTextColor(13, 110, 95);
      const corbText = rec.corbatinNum ? `#${rec.corbatinNum}` : '—';
      pdf.text(corbText, cellX + columns[7].width / 2, currentY + 4.2, { align: 'center' });
      cellX += columns[7].width;

      // 9. Hora Entrada
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6);
      pdf.setTextColor(13, 110, 95);
      pdf.text(formatHoraVisual(rec.horaEntrada), cellX + columns[8].width / 2, currentY + 4.2, { align: 'center' });
      cellX += columns[8].width;

      // 10. Hora Salida
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6);
      const salidaText = rec.horaSalida && rec.horaSalida !== 'Dentro' ? formatHoraVisual(rec.horaSalida) : '—';
      pdf.setTextColor(salidaText !== '—' ? 71 : 148, salidaText !== '—' ? 85 : 163, salidaText !== '—' ? 105 : 184);
      pdf.text(salidaText, cellX + columns[9].width / 2, currentY + 4.2, { align: 'center' });
      cellX += columns[9].width;

      // 11. Destino / Trabajos
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(5.8);
      pdf.setTextColor(71, 85, 105);
      const trabText = rec.trabajos || rec.observaciones || 'Mantenimiento';
      const cleanTrab = trabText.length > 22 ? trabText.substring(0, 21) + '…' : trabText;
      pdf.text(cleanTrab, cellX + 1.5, currentY + 4.2);
      cellX += columns[10].width;

      // 12. Estatus (Badge)
      const esDentro = !rec.horaSalida || rec.horaSalida === 'Dentro' || rec.estado === 'Dentro';
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(5.5);

      if (esDentro) {
        pdf.setFillColor(220, 252, 231);
        pdf.roundedRect(cellX + 2, currentY + 1.2, columns[11].width - 4, 3.8, 0.8, 0.8, 'F');
        pdf.setTextColor(22, 163, 74);
        pdf.text('DENTRO', cellX + columns[11].width / 2, currentY + 3.9, { align: 'center' });
      } else {
        pdf.setFillColor(241, 245, 249);
        pdf.roundedRect(cellX + 2, currentY + 1.2, columns[11].width - 4, 3.8, 0.8, 0.8, 'F');
        pdf.setTextColor(100, 116, 139);
        pdf.text('SALIDA', cellX + columns[11].width / 2, currentY + 3.9, { align: 'center' });
      }

      currentY += rowHeight;
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // SECCIÓN FINAL DE FIRMAS Y SELLOS DE AUDITORÍA
  // ─────────────────────────────────────────────────────────────────────────────
  const firmaSpaceNeeded = 26;
  if (currentY + firmaSpaceNeeded > pageHeight - 12) {
    drawFooter();
    pdf.addPage('a4', 'landscape');
    currentPage++;
    currentY = drawPageHeader(false);
  }

  const signY = Math.max(currentY + 5, pageHeight - 32);

  // Cuadro de firmas oficial
  pdf.setFillColor(248, 250, 252);
  pdf.setDrawColor(226, 232, 240);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(marginX, signY, contentWidth, 20, 1.5, 1.5, 'FD');

  const signColW = 85;

  // Firma 1: Oficial de Caseta
  const sign1X = marginX + 18;
  pdf.setDrawColor(148, 163, 184);
  pdf.setLineWidth(0.4);
  pdf.line(sign1X, signY + 12, sign1X + signColW, signY + 12);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('OFICIAL DE SEGURIDAD EN CASETA', sign1X + signColW / 2, signY + 15, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`${guardiaNombre} · Turno Operativo`, sign1X + signColW / 2, signY + 18, { align: 'center' });

  // Firma 2: Supervisor de Seguridad HOA
  const sign2X = pageWidth - marginX - signColW - 28;
  pdf.line(sign2X, signY + 12, sign2X + signColW, signY + 12);

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(6.5);
  pdf.setTextColor(15, 23, 42);
  pdf.text('SUPERVISOR GENERAL DE OPERACIONES & SEGURIDAD', sign2X + signColW / 2, signY + 15, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(5.5);
  pdf.setTextColor(100, 116, 139);
  pdf.text(`${supervisorNombre} · Las Palomas HOA, A.C.`, sign2X + signColW / 2, signY + 18, { align: 'center' });

  // QR de Verificación
  if (qrVerifyUrl) {
    try {
      pdf.addImage(qrVerifyUrl, 'PNG', pageWidth - marginX - 22, signY + 2.5, 15, 15);
    } catch {}
  }

  // Dibujar footer de la última página
  drawFooter();

  return pdf;
}

/**
 * Descarga directamente el PDF en el navegador
 */
export async function downloadBitacoraPDF(options: BitacoraReportOptions) {
  const pdf = await generateBitacoraPDF(options);
  const sanitizedPeriod = options.periodoNombre.replace(/[^a-zA-Z0-9_-]/g, '_');
  const today = new Date().toISOString().split('T')[0];
  pdf.save(`Reporte_Oficial_Bitacora_LasPalomas_${sanitizedPeriod}_${today}.pdf`);
}

/**
 * Abre el diálogo de impresión con el PDF generado
 */
export async function printBitacoraPDF(options: BitacoraReportOptions) {
  const pdf = await generateBitacoraPDF(options);
  pdf.autoPrint({ variant: 'non-conform' });
  const blobUrl = pdf.output('bloburl');
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = String(blobUrl);
  document.body.appendChild(iframe);
  iframe.onload = () => {
    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => {
        try {
          document.body.removeChild(iframe);
        } catch {}
      }, 60000);
    }, 300);
  };
}
