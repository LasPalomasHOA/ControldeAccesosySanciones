import ExcelJS from 'exceljs';

export interface ExportReportData {
  periodoNombre: string;
  fechaReporte: string;
  empresaFiltro: string;
  usuarioSupervisor: string;
  kpis: {
    totalEntradas: number;
    totalSalidas: number;
    totalMovimientos: number;
    balanceDentro: number;
    picoTraficoTexto: string;
    totalSanciones: number;
  };
  chartData: Array<{
    hora: string;
    entradas: number;
    salidas: number;
    movimientos: number;
  }>;
  dataModalidad: Array<{
    name: string;
    value: number;
    color?: string;
  }>;
  topEmpresas: Array<{
    name: string;
    accesos: number;
  }>;
  bitacora: Array<{
    id: string;
    fecha: string;
    tipoAcceso: string;
    empresaNombre: string;
    placas: string;
    color: string;
    conductor: string;
    telefono: string;
    corbatinNum: string;
    num_pasajeros: number;
    horaEntrada: string;
    horaSalida: string;
    trabajos: string;
    guardiaNombre: string;
    estado: string;
    observaciones: string;
  }>;
  sanciones?: Array<{
    id: string;
    fecha: string;
    empresaNombre: string;
    placas: string;
    tipo: string;
    medidaDisciplinaria: string;
    dictamen: string;
    status: string;
  }>;
}

// Paleta Corporativa de Las Palomas HOA
const COLORS = {
  primary: 'FF0D6E5F',       // Verde Esmeralda Institucional
  primaryDark: 'FF0A5448',   // Esmeralda Oscuro
  primaryLight: 'FFE6F4F1',  // Menta Claro
  headerText: 'FFFFFFFF',    // Blanco
  zebraLight: 'FFF8FAFC',    // Slate 50
  zebraWhite: 'FFFFFFFF',    // Blanco
  borderGray: 'FFE2E8F0',    // Slate 200
  cardBg: 'FFF1F5F9',        // Slate 100
  accentGold: 'FFD97706',    // Ámbar 600
  accentGoldBg: 'FFFEF3C7',  // Ámbar 100
  accentGreen: 'FF16A34A',   // Verde 600
  accentGreenBg: 'FFDCFCE7', // Verde 100
  textDark: 'FF0F172A',      // Slate 900
  textMuted: 'FF475569',     // Slate 600
};

// ─────────────────────────────────────────────────────────────────────────────
// GENERADORES CANVAS DE ALTA RESOLUCIÓN (2X RETINA) PARA GRÁFICAS EN EXCEL
// ─────────────────────────────────────────────────────────────────────────────

function createFlujoChartBase64(
  chartData: Array<{ hora: string; entradas: number; salidas: number; movimientos: number }>,
  periodoNombre: string
): string {
  const width = 900;
  const height = 440;
  const scale = 2;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);

  // Fondo
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  // Borde tarjeta
  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Cabecera del gráfico
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px sans-serif';
  ctx.fillText(`TENDENCIA Y VOLUMEN DE ACCESOS — ${periodoNombre.toUpperCase()}`, 30, 42);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px sans-serif';
  ctx.fillText('Comparativa de Ingresos (Entradas) vs Salidas Registradas', 30, 62);

  // Leyenda
  ctx.fillStyle = '#0D6E5F';
  ctx.fillRect(width - 240, 36, 14, 14);
  ctx.fillStyle = '#1E293B';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('Entradas', width - 220, 48);

  ctx.fillStyle = '#0284C7';
  ctx.fillRect(width - 130, 36, 14, 14);
  ctx.fillStyle = '#1E293B';
  ctx.fillText('Salidas', width - 110, 48);

  // Área de Gráfica
  const chartX = 60;
  const chartY = 90;
  const chartW = width - 90;
  const chartH = height - 150;

  // Encontrar valor máximo
  let maxVal = 5;
  chartData.forEach((d) => {
    if (d.entradas > maxVal) maxVal = d.entradas;
    if (d.salidas > maxVal) maxVal = d.salidas;
  });
  maxVal = Math.ceil(maxVal * 1.25); // Margen superior

  // Líneas de cuadrícula Y
  const gridSteps = 4;
  ctx.strokeStyle = '#F1F5F9';
  ctx.lineWidth = 1;
  ctx.fillStyle = '#94A3B8';
  ctx.font = '11px monospace';
  ctx.textAlign = 'right';

  for (let i = 0; i <= gridSteps; i++) {
    const yVal = Math.round((maxVal / gridSteps) * i);
    const yPos = chartY + chartH - (i / gridSteps) * chartH;

    ctx.beginPath();
    ctx.moveTo(chartX, yPos);
    ctx.lineTo(chartX + chartW, yPos);
    ctx.stroke();

    ctx.fillText(String(yVal), chartX - 10, yPos + 4);
  }

  // Eje X e Y
  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(chartX, chartY);
  ctx.lineTo(chartX, chartY + chartH);
  ctx.lineTo(chartX + chartW, chartY + chartH);
  ctx.stroke();

  // Dibujar barras
  const n = chartData.length || 1;
  const groupWidth = chartW / n;
  const barWidth = Math.max(8, Math.min(24, groupWidth * 0.35));

  chartData.forEach((d, i) => {
    const groupCenter = chartX + i * groupWidth + groupWidth / 2;

    const hEnt = (d.entradas / maxVal) * chartH;
    const hSal = (d.salidas / maxVal) * chartH;

    const xEnt = groupCenter - barWidth - 2;
    const yEnt = chartY + chartH - hEnt;

    const xSal = groupCenter + 2;
    const ySal = chartY + chartH - hSal;

    // Barra Entradas (Verde)
    ctx.fillStyle = '#0D6E5F';
    ctx.fillRect(xEnt, yEnt, barWidth, hEnt);

    // Barra Salidas (Azul)
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(xSal, ySal, barWidth, hSal);

    // Valores encima de las barras
    ctx.textAlign = 'center';
    ctx.font = 'bold 10px sans-serif';

    if (d.entradas > 0) {
      ctx.fillStyle = '#0D6E5F';
      ctx.fillText(String(d.entradas), xEnt + barWidth / 2, Math.max(chartY + 12, yEnt - 4));
    }
    if (d.salidas > 0) {
      ctx.fillStyle = '#0284C7';
      ctx.fillText(String(d.salidas), xSal + barWidth / 2, Math.max(chartY + 12, ySal - 4));
    }

    // Etiqueta Eje X
    ctx.fillStyle = '#475569';
    ctx.font = '10px sans-serif';
    ctx.save();
    ctx.translate(groupCenter, chartY + chartH + 18);
    if (n > 10) {
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = 'right';
    } else {
      ctx.textAlign = 'center';
    }
    ctx.fillText(d.hora, 0, 0);
    ctx.restore();
  });

  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
}

function createModalidadChartBase64(
  dataModalidad: Array<{ name: string; value: number; color?: string }>
): string {
  const width = 600;
  const height = 400;
  const scale = 2;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);

  // Fondo
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Cabecera
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('DISTRIBUCIÓN POR MODALIDAD DE ACCESO', 30, 42);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px sans-serif';
  ctx.fillText('Vehicular vs Peatonal en el periodo de auditoría', 30, 62);

  const total = dataModalidad.reduce((a, b) => a + b.value, 0) || 1;
  const centerX = 200;
  const centerY = 230;
  const outerR = 110;
  const innerR = 65;

  let startAngle = -Math.PI / 2;

  dataModalidad.forEach((item) => {
    const sliceAngle = (item.value / total) * (2 * Math.PI);
    const endAngle = startAngle + sliceAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerR, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerR, endAngle, startAngle, true);
    ctx.closePath();

    ctx.fillStyle = item.name.toLowerCase().includes('vehic') ? '#0D6E5F' : '#0284C7';
    ctx.fill();

    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    startAngle = endAngle;
  });

  // Centro de la Dona
  ctx.fillStyle = '#0F172A';
  ctx.textAlign = 'center';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(String(total), centerX, centerY - 2);

  ctx.fillStyle = '#64748B';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('TOTAL ACCESOS', centerX, centerY + 16);

  // Leyenda Lateral
  let legY = 160;
  dataModalidad.forEach((item) => {
    const isVeh = item.name.toLowerCase().includes('vehic');
    const color = isVeh ? '#0D6E5F' : '#0284C7';
    const pct = Math.round((item.value / total) * 100);

    // Cuadro de color
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(380, legY + 8, 8, 0, 2 * Math.PI);
    ctx.fill();

    // Texto nombre
    ctx.textAlign = 'left';
    ctx.fillStyle = '#1E293B';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(item.name, 400, legY + 8);

    // Cantidad y porcentaje
    ctx.fillStyle = '#64748B';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${item.value} registros (${pct}%)`, 400, legY + 26);

    legY += 60;
  });

  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
}

function createTopEmpresasChartBase64(
  topEmpresas: Array<{ name: string; accesos: number }>
): string {
  const width = 700;
  const height = 400;
  const scale = 2;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(scale, scale);

  // Fondo
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = '#E2E8F0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Cabecera
  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('TOP EMPRESAS CON MAYOR ACTIVIDAD', 30, 42);

  ctx.fillStyle = '#64748B';
  ctx.font = '12px sans-serif';
  ctx.fillText('Ranking de contratistas por volumen acumulado de entradas y salidas', 30, 62);

  const items = topEmpresas.slice(0, 5);
  const maxVal = Math.max(...items.map((i) => i.accesos), 1);

  let startY = 100;
  const barMaxW = 340;
  const rowH = 50;

  items.forEach((item, idx) => {
    const barW = Math.max(12, (item.accesos / maxVal) * barMaxW);

    // Badge de posición #1, #2...
    ctx.fillStyle = idx === 0 ? '#FEF3C7' : '#F1F5F9';
    ctx.fillRect(30, startY, 28, 28);
    ctx.fillStyle = idx === 0 ? '#B45309' : '#475569';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`#${idx + 1}`, 44, startY + 18);

    // Nombre empresa
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 12px sans-serif';
    const cleanName = item.name.length > 28 ? item.name.substring(0, 26) + '...' : item.name;
    ctx.fillText(cleanName, 68, startY + 18);

    // Barra de Progreso
    const barX = 260;
    ctx.fillStyle = '#F1F5F9';
    ctx.fillRect(barX, startY + 6, barMaxW, 16);

    ctx.fillStyle = idx === 0 ? '#0D6E5F' : '#14B8A6';
    ctx.fillRect(barX, startY + 6, barW, 16);

    // Etiqueta cantidad
    ctx.fillStyle = '#0D6E5F';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${item.accesos} accesos`, barX + barMaxW + 15, startY + 19);

    startY += rowH;
  });

  return canvas.toDataURL('image/png').replace(/^data:image\/png;base64,/, '');
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTADOR PRINCIPAL MULTI-PESTAÑA EN EXCEL (.XLSX)
// ─────────────────────────────────────────────────────────────────────────────

export async function exportSupervisorReportToExcel(data: ExportReportData) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Las Palomas Rocky Point HOA - Sistema de Seguridad';
  workbook.lastModifiedBy = data.usuarioSupervisor || 'Supervisor HOA';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Generar imágenes base64 de las gráficas
  const imgFlujo = createFlujoChartBase64(data.chartData, data.periodoNombre);
  const imgModalidad = createModalidadChartBase64(data.dataModalidad);
  const imgTopEmpresas = createTopEmpresasChartBase64(data.topEmpresas);

  // ═══════════════════════════════════════════════════════════════════════════
  // HOJA 1: DASHBOARD Y MÉTRICAS
  // ═══════════════════════════════════════════════════════════════════════════
  const wsDashboard = workbook.addWorksheet('Dashboard y Métricas', {
    views: [{ showGridLines: true }]
  });

  wsDashboard.columns = [
    { width: 4 },   // A
    { width: 22 },  // B
    { width: 16 },  // C
    { width: 16 },  // D
    { width: 16 },  // E
    { width: 6 },   // F
    { width: 24 },  // G
    { width: 16 },  // H
    { width: 16 },  // I
    { width: 16 },  // J
  ];

  // Banner Corporativo
  wsDashboard.mergeCells('B2:J2');
  const cellTitle = wsDashboard.getCell('B2');
  cellTitle.value = 'LAS PALOMAS ROCKY POINT HOA, A.C.';
  cellTitle.font = { name: 'Calibri', size: 16, bold: true, color: { argb: COLORS.headerText } };
  cellTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
  cellTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.getRow(2).height = 28;

  wsDashboard.mergeCells('B3:J3');
  const cellSub = wsDashboard.getCell('B3');
  cellSub.value = 'INFORME EJECUTIVO DE AUDITORÍA, CONTROL DE ACCESOS Y BITÁCORA VEHICULAR';
  cellSub.font = { name: 'Calibri', size: 11, bold: true, color: { argb: COLORS.primaryLight } };
  cellSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryDark } };
  cellSub.alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.getRow(3).height = 20;

  wsDashboard.mergeCells('B4:J4');
  const cellMeta = wsDashboard.getCell('B4');
  cellMeta.value = `Periodo Consultado: ${data.periodoNombre.toUpperCase()} | Fecha de Emisión: ${data.fechaReporte} | Filtro Empresa: ${data.empresaFiltro} | Supervisor Responsable: ${data.usuarioSupervisor}`;
  cellMeta.font = { name: 'Calibri', size: 9, italic: true, color: { argb: COLORS.textMuted } };
  cellMeta.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraLight } };
  cellMeta.alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.getRow(4).height = 18;

  // Tarjetas KPI
  const kpiStartRow = 6;

  // Tarjeta 1: Total Entradas
  wsDashboard.mergeCells(`B${kpiStartRow}:C${kpiStartRow}`);
  wsDashboard.getCell(`B${kpiStartRow}`).value = 'TOTAL INGRESOS (ENTRADAS)';
  wsDashboard.getCell(`B${kpiStartRow}`).font = { size: 9, bold: true, color: { argb: COLORS.primary } };
  wsDashboard.getCell(`B${kpiStartRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryLight } };
  wsDashboard.getCell(`B${kpiStartRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

  wsDashboard.mergeCells(`B${kpiStartRow + 1}:C${kpiStartRow + 1}`);
  wsDashboard.getCell(`B${kpiStartRow + 1}`).value = data.kpis.totalEntradas;
  wsDashboard.getCell(`B${kpiStartRow + 1}`).font = { size: 18, bold: true, color: { argb: COLORS.primaryDark } };
  wsDashboard.getCell(`B${kpiStartRow + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.getCell(`B${kpiStartRow + 1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraWhite } };

  // Tarjeta 2: Total Salidas
  wsDashboard.mergeCells(`D${kpiStartRow}:E${kpiStartRow}`);
  wsDashboard.getCell(`D${kpiStartRow}`).value = 'SALIDAS REGISTRADAS';
  wsDashboard.getCell(`D${kpiStartRow}`).font = { size: 9, bold: true, color: { argb: COLORS.textMuted } };
  wsDashboard.getCell(`D${kpiStartRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.cardBg } };
  wsDashboard.getCell(`D${kpiStartRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

  wsDashboard.mergeCells(`D${kpiStartRow + 1}:E${kpiStartRow + 1}`);
  wsDashboard.getCell(`D${kpiStartRow + 1}`).value = data.kpis.totalSalidas;
  wsDashboard.getCell(`D${kpiStartRow + 1}`).font = { size: 18, bold: true, color: { argb: COLORS.textDark } };
  wsDashboard.getCell(`D${kpiStartRow + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.getCell(`D${kpiStartRow + 1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraWhite } };

  // Tarjeta 3: Movimientos Totales
  wsDashboard.mergeCells(`G${kpiStartRow}:H${kpiStartRow}`);
  wsDashboard.getCell(`G${kpiStartRow}`).value = 'FLUJO TOTAL MOVIMIENTOS';
  wsDashboard.getCell(`G${kpiStartRow}`).font = { size: 9, bold: true, color: { argb: COLORS.accentGold } };
  wsDashboard.getCell(`G${kpiStartRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.accentGoldBg } };
  wsDashboard.getCell(`G${kpiStartRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

  wsDashboard.mergeCells(`G${kpiStartRow + 1}:H${kpiStartRow + 1}`);
  wsDashboard.getCell(`G${kpiStartRow + 1}`).value = data.kpis.totalMovimientos;
  wsDashboard.getCell(`G${kpiStartRow + 1}`).font = { size: 18, bold: true, color: { argb: COLORS.textDark } };
  wsDashboard.getCell(`G${kpiStartRow + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.getCell(`G${kpiStartRow + 1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraWhite } };

  // Tarjeta 4: En Sitio
  wsDashboard.mergeCells(`I${kpiStartRow}:J${kpiStartRow}`);
  wsDashboard.getCell(`I${kpiStartRow}`).value = 'EN INSTALACIONES (DENTRO)';
  wsDashboard.getCell(`I${kpiStartRow}`).font = { size: 9, bold: true, color: { argb: data.kpis.balanceDentro > 0 ? COLORS.accentGreen : COLORS.textMuted } };
  wsDashboard.getCell(`I${kpiStartRow}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: data.kpis.balanceDentro > 0 ? COLORS.accentGreenBg : COLORS.cardBg } };
  wsDashboard.getCell(`I${kpiStartRow}`).alignment = { horizontal: 'center', vertical: 'middle' };

  wsDashboard.mergeCells(`I${kpiStartRow + 1}:J${kpiStartRow + 1}`);
  wsDashboard.getCell(`I${kpiStartRow + 1}`).value = data.kpis.balanceDentro;
  wsDashboard.getCell(`I${kpiStartRow + 1}`).font = { size: 18, bold: true, color: { argb: data.kpis.balanceDentro > 0 ? COLORS.accentGreen : COLORS.textDark } };
  wsDashboard.getCell(`I${kpiStartRow + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
  wsDashboard.getCell(`I${kpiStartRow + 1}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.zebraWhite } };

  ['B', 'C', 'D', 'E', 'G', 'H', 'I', 'J'].forEach((col) => {
    [kpiStartRow, kpiStartRow + 1].forEach((row) => {
      const cell = wsDashboard.getCell(`${col}${row}`);
      cell.border = {
        top: { style: 'thin', color: { argb: COLORS.borderGray } },
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
        left: { style: 'thin', color: { argb: COLORS.borderGray } },
        right: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
  });

  // Tablas Estadísticas
  const tableStartRow = 9;

  // Tabla Izquierda: Desglose por Horas/Días
  wsDashboard.mergeCells(`B${tableStartRow}:E${tableStartRow}`);
  const tHeaderLeft = wsDashboard.getCell(`B${tableStartRow}`);
  tHeaderLeft.value = '📈 DESGLOSE DE FLUJO POR HORARIOS / INTERVALO';
  tHeaderLeft.font = { size: 10, bold: true, color: { argb: COLORS.headerText } };
  tHeaderLeft.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
  tHeaderLeft.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  const subHeadersLeft = ['Intervalo / Hora', 'Entradas', 'Salidas', 'Total Flujo'];
  subHeadersLeft.forEach((sh, idx) => {
    const colName = ['B', 'C', 'D', 'E'][idx];
    const cell = wsDashboard.getCell(`${colName}${tableStartRow + 1}`);
    cell.value = sh;
    cell.font = { size: 9, bold: true, color: { argb: COLORS.textDark } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryLight } };
    cell.alignment = { horizontal: idx === 0 ? 'left' : 'center', vertical: 'middle' };
    cell.border = { bottom: { style: 'medium', color: { argb: COLORS.primary } } };
  });

  let curRowLeft = tableStartRow + 2;
  data.chartData.forEach((item, rIdx) => {
    const bg = rIdx % 2 === 0 ? COLORS.zebraWhite : COLORS.zebraLight;
    const c1 = wsDashboard.getCell(`B${curRowLeft}`);
    const c2 = wsDashboard.getCell(`C${curRowLeft}`);
    const c3 = wsDashboard.getCell(`D${curRowLeft}`);
    const c4 = wsDashboard.getCell(`E${curRowLeft}`);

    c1.value = item.hora;
    c2.value = item.entradas;
    c3.value = item.salidas;
    c4.value = item.movimientos;

    [c1, c2, c3, c4].forEach((c, idx) => {
      c.font = { size: 9, color: { argb: COLORS.textDark } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.alignment = { horizontal: idx === 0 ? 'left' : 'center', vertical: 'middle' };
      c.border = {
        top: { style: 'thin', color: { argb: COLORS.borderGray } },
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
        left: { style: 'thin', color: { argb: COLORS.borderGray } },
        right: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
    curRowLeft++;
  });

  // Tabla Derecha 1: Modalidad
  wsDashboard.mergeCells(`G${tableStartRow}:J${tableStartRow}`);
  const tHeaderRight1 = wsDashboard.getCell(`G${tableStartRow}`);
  tHeaderRight1.value = '🚗 MODALIDAD DE ACCESO';
  tHeaderRight1.font = { size: 10, bold: true, color: { argb: COLORS.headerText } };
  tHeaderRight1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
  tHeaderRight1.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  const subHeadersRight1 = ['Tipo / Modalidad', 'Accesos Registrados', '% Participación', 'Estado'];
  subHeadersRight1.forEach((sh, idx) => {
    const colName = ['G', 'H', 'I', 'J'][idx];
    const cell = wsDashboard.getCell(`${colName}${tableStartRow + 1}`);
    cell.value = sh;
    cell.font = { size: 9, bold: true, color: { argb: COLORS.textDark } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryLight } };
    cell.alignment = { horizontal: idx === 0 ? 'left' : 'center', vertical: 'middle' };
    cell.border = { bottom: { style: 'medium', color: { argb: COLORS.primary } } };
  });

  const totalModalidad = data.dataModalidad.reduce((acc, m) => acc + m.value, 0) || 1;
  let curRowRight1 = tableStartRow + 2;
  data.dataModalidad.forEach((mod, rIdx) => {
    const bg = rIdx % 2 === 0 ? COLORS.zebraWhite : COLORS.zebraLight;
    const c1 = wsDashboard.getCell(`G${curRowRight1}`);
    const c2 = wsDashboard.getCell(`H${curRowRight1}`);
    const c3 = wsDashboard.getCell(`I${curRowRight1}`);
    const c4 = wsDashboard.getCell(`J${curRowRight1}`);

    const pct = Math.round((mod.value / totalModalidad) * 100);
    c1.value = mod.name;
    c2.value = mod.value;
    c3.value = `${pct}%`;
    c4.value = mod.value > 0 ? 'Activo' : 'Sin flujo';

    [c1, c2, c3, c4].forEach((c, idx) => {
      c.font = { size: 9, color: { argb: COLORS.textDark } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.alignment = { horizontal: idx === 0 ? 'left' : 'center', vertical: 'middle' };
      c.border = {
        top: { style: 'thin', color: { argb: COLORS.borderGray } },
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
        left: { style: 'thin', color: { argb: COLORS.borderGray } },
        right: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
    curRowRight1++;
  });

  // Tabla Derecha 2: Top Empresas
  const topEmpStartRow = curRowRight1 + 2;
  wsDashboard.mergeCells(`G${topEmpStartRow}:J${topEmpStartRow}`);
  const tHeaderTopEmp = wsDashboard.getCell(`G${topEmpStartRow}`);
  tHeaderTopEmp.value = '🏢 TOP EMPRESAS CON MAYOR TRÁFICO';
  tHeaderTopEmp.font = { size: 10, bold: true, color: { argb: COLORS.headerText } };
  tHeaderTopEmp.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryDark } };
  tHeaderTopEmp.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };

  const subHeadersTopEmp = ['Empresa Contratista', 'Accesos', '% Flujo Periodo', 'Puesto'];
  subHeadersTopEmp.forEach((sh, idx) => {
    const colName = ['G', 'H', 'I', 'J'][idx];
    const cell = wsDashboard.getCell(`${colName}${topEmpStartRow + 1}`);
    cell.value = sh;
    cell.font = { size: 9, bold: true, color: { argb: COLORS.textDark } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryLight } };
    cell.alignment = { horizontal: idx === 0 ? 'left' : 'center', vertical: 'middle' };
    cell.border = { bottom: { style: 'medium', color: { argb: COLORS.primary } } };
  });

  let curRowTopEmp = topEmpStartRow + 2;
  data.topEmpresas.slice(0, 5).forEach((emp, rIdx) => {
    const bg = rIdx % 2 === 0 ? COLORS.zebraWhite : COLORS.zebraLight;
    const c1 = wsDashboard.getCell(`G${curRowTopEmp}`);
    const c2 = wsDashboard.getCell(`H${curRowTopEmp}`);
    const c3 = wsDashboard.getCell(`I${curRowTopEmp}`);
    const c4 = wsDashboard.getCell(`J${curRowTopEmp}`);

    const pct = Math.round((emp.accesos / (data.kpis.totalMovimientos || 1)) * 100);
    c1.value = emp.name;
    c2.value = emp.accesos;
    c3.value = `${pct}%`;
    c4.value = `#${rIdx + 1}`;

    [c1, c2, c3, c4].forEach((c, idx) => {
      c.font = { size: 9, color: { argb: COLORS.textDark } };
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
      c.alignment = { horizontal: idx === 0 ? 'left' : 'center', vertical: 'middle' };
      c.border = {
        top: { style: 'thin', color: { argb: COLORS.borderGray } },
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
        left: { style: 'thin', color: { argb: COLORS.borderGray } },
        right: { style: 'thin', color: { argb: COLORS.borderGray } },
      };
    });
    curRowTopEmp++;
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // HOJA 2: GRÁFICAS Y ANÁLISIS VISUAL (PESTAÑA DEDICADA)
  // ═══════════════════════════════════════════════════════════════════════════
  const wsGraficas = workbook.addWorksheet('Gráficas y Análisis', {
    views: [{ showGridLines: true }]
  });

  wsGraficas.columns = [
    { width: 4 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 25 },
    { width: 4 },
  ];

  // Header Hoja de Gráficas
  wsGraficas.mergeCells('B2:G2');
  const gTitle = wsGraficas.getCell('B2');
  gTitle.value = 'LAS PALOMAS HOA · PANEL ANALÍTICO Y GRÁFICAS DEL SISTEMA';
  gTitle.font = { size: 14, bold: true, color: { argb: COLORS.headerText } };
  gTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
  gTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsGraficas.getRow(2).height = 28;

  wsGraficas.mergeCells('B3:G3');
  const gSub = wsGraficas.getCell('B3');
  gSub.value = `Periodo: ${data.periodoNombre} | Total Movimientos: ${data.kpis.totalMovimientos} | Generado el: ${data.fechaReporte}`;
  gSub.font = { size: 9, italic: true, color: { argb: COLORS.textMuted } };
  gSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryLight } };
  gSub.alignment = { horizontal: 'center', vertical: 'middle' };
  wsGraficas.getRow(3).height = 18;

  // Insertar Gráfica 1: Tendencia y Volumen
  if (imgFlujo) {
    const imgFlujoId = workbook.addImage({
      base64: imgFlujo,
      extension: 'png',
    });

    wsGraficas.addImage(imgFlujoId, {
      tl: { col: 1, row: 5 },
      ext: { width: 780, height: 380 },
      editAs: 'oneCell',
    });
  }

  // Insertar Gráfica 2: Modalidad (Donut)
  if (imgModalidad) {
    const imgModId = workbook.addImage({
      base64: imgModalidad,
      extension: 'png',
    });

    wsGraficas.addImage(imgModId, {
      tl: { col: 1, row: 26 },
      ext: { width: 420, height: 280 },
      editAs: 'oneCell',
    });
  }

  // Insertar Gráfica 3: Top Empresas
  if (imgTopEmpresas) {
    const imgTopId = workbook.addImage({
      base64: imgTopEmpresas,
      extension: 'png',
    });

    wsGraficas.addImage(imgTopId, {
      tl: { col: 4, row: 26 },
      ext: { width: 460, height: 280 },
      editAs: 'oneCell',
    });
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // HOJA 3: BITÁCORA DETALLADA DE ACCESOS
  // ═══════════════════════════════════════════════════════════════════════════
  const wsBitacora = workbook.addWorksheet('Bitácora Detallada', {
    views: [{ showGridLines: true }]
  });

  wsBitacora.columns = [
    { width: 8 },  // Folio
    { width: 13 }, // Fecha
    { width: 14 }, // Modalidad
    { width: 34 }, // Empresa
    { width: 15 }, // Placas
    { width: 14 }, // Color
    { width: 25 }, // Conductor
    { width: 16 }, // Teléfono
    { width: 14 }, // Corbatín
    { width: 12 }, // Pasajeros
    { width: 13 }, // Hora Entrada
    { width: 15 }, // Hora Salida
    { width: 32 }, // Destino / Trabajos
    { width: 22 }, // Guardia
    { width: 16 }, // Estatus
    { width: 30 }, // Observaciones
  ];

  wsBitacora.mergeCells('A1:P1');
  const bTitle = wsBitacora.getCell('A1');
  bTitle.value = 'LAS PALOMAS ROCKY POINT HOA · BITÁCORA GENERAL DE ACCESOS';
  bTitle.font = { size: 14, bold: true, color: { argb: COLORS.headerText } };
  bTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primary } };
  bTitle.alignment = { horizontal: 'center', vertical: 'middle' };
  wsBitacora.getRow(1).height = 26;

  wsBitacora.mergeCells('A2:P2');
  const bSub = wsBitacora.getCell('A2');
  bSub.value = `Registros Totales: ${data.bitacora.length} | Periodo: ${data.periodoNombre} | Generado el: ${data.fechaReporte}`;
  bSub.font = { size: 9, italic: true, color: { argb: COLORS.textMuted } };
  bSub.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryLight } };
  bSub.alignment = { horizontal: 'center', vertical: 'middle' };
  wsBitacora.getRow(2).height = 18;

  const headersBitacora = [
    'Folio',
    'Fecha',
    'Modalidad',
    'Empresa Contratista',
    'Vehículo / Placas',
    'Color Unidad',
    'Conductor / Colaborador',
    'Teléfono Celular',
    'Corbatín',
    'Pasajeros',
    'Hora Entrada',
    'Hora Salida',
    'Destino / Motivo de Acceso',
    'Oficial en Caseta',
    'Estatus',
    'Observaciones'
  ];

  const headerRowBitacora = wsBitacora.getRow(4);
  headerRowBitacora.values = headersBitacora;
  headerRowBitacora.height = 24;

  headersBitacora.forEach((_, idx) => {
    const cell = headerRowBitacora.getCell(idx + 1);
    cell.font = { size: 9, bold: true, color: { argb: COLORS.headerText } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.primaryDark } };
    cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.primary } },
      bottom: { style: 'medium', color: { argb: COLORS.primary } },
      left: { style: 'thin', color: { argb: COLORS.borderGray } },
      right: { style: 'thin', color: { argb: COLORS.borderGray } },
    };
  });

  let bRowIdx = 5;
  data.bitacora.forEach((b, idx) => {
    const isZebra = idx % 2 === 1;
    const bgRow = isZebra ? COLORS.zebraLight : COLORS.zebraWhite;
    const row = wsBitacora.getRow(bRowIdx);

    row.values = [
      Number(b.id) || b.id,
      b.fecha,
      b.tipoAcceso || 'Vehicular',
      b.empresaNombre || '—',
      b.placas || 'PEATONAL',
      b.color || 'N/A',
      b.conductor || 'Personal Acreditado',
      b.telefono || 'N/A',
      b.corbatinNum || '—',
      Number(b.num_pasajeros) || 0,
      b.horaEntrada || '00:00',
      b.horaSalida || 'Dentro',
      b.trabajos || 'Mantenimiento general',
      b.guardiaNombre || 'Guardia de Turno',
      b.estado || (b.horaSalida ? 'Salida Registrada' : 'Dentro'),
      b.observaciones || 'Sin incidencias'
    ];
    row.height = 20;

    row.eachCell((cell, colNum) => {
      cell.font = { size: 9, color: { argb: COLORS.textDark } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bgRow } };
      cell.border = {
        top: { style: 'thin', color: { argb: COLORS.borderGray } },
        bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
        left: { style: 'thin', color: { argb: COLORS.borderGray } },
        right: { style: 'thin', color: { argb: COLORS.borderGray } },
      };

      if ([1, 2, 3, 5, 6, 8, 9, 10, 11, 12, 15].includes(colNum)) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      }

      if (colNum === 15) {
        if (cell.value === 'Dentro') {
          cell.font = { size: 9, bold: true, color: { argb: COLORS.accentGreen } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: COLORS.accentGreenBg } };
        }
      }
    });

    bRowIdx++;
  });

  wsBitacora.autoFilter = {
    from: { row: 4, column: 1 },
    to: { row: bRowIdx - 1, column: headersBitacora.length }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // HOJA 4: RESOLUCIONES Y SANCIONES (SI EXISTEN)
  // ═══════════════════════════════════════════════════════════════════════════
  if (data.sanciones && data.sanciones.length > 0) {
    const wsSanciones = workbook.addWorksheet('Resoluciones y Sanciones', {
      views: [{ showGridLines: true }]
    });

    wsSanciones.columns = [
      { width: 10 },
      { width: 14 },
      { width: 32 },
      { width: 15 },
      { width: 30 },
      { width: 34 },
      { width: 28 },
      { width: 16 },
    ];

    wsSanciones.mergeCells('A1:H1');
    const sTitle = wsSanciones.getCell('A1');
    sTitle.value = 'LAS PALOMAS HOA · REGISTRO OFICIAL DE SANCIONES Y RESOLUCIONES';
    sTitle.font = { size: 13, bold: true, color: { argb: COLORS.headerText } };
    sTitle.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF991B1B' } };
    sTitle.alignment = { horizontal: 'center', vertical: 'middle' };
    wsSanciones.getRow(1).height = 26;

    const headersSanciones = [
      'Folio',
      'Fecha',
      'Empresa Infractora',
      'Placas / Unidad',
      'Falta / Infracción',
      'Medida Disciplinaria Aplicada',
      'Dictamen de Supervisión',
      'Estatus'
    ];

    const sHeaderRow = wsSanciones.getRow(3);
    sHeaderRow.values = headersSanciones;
    sHeaderRow.height = 22;

    headersSanciones.forEach((_, idx) => {
      const cell = sHeaderRow.getCell(idx + 1);
      cell.font = { size: 9, bold: true, color: { argb: COLORS.headerText } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7F1D1D' } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.border = { bottom: { style: 'medium', color: { argb: 'FF991B1B' } } };
    });

    let sRowIdx = 4;
    data.sanciones.forEach((s, idx) => {
      const isZebra = idx % 2 === 1;
      const bg = isZebra ? COLORS.zebraLight : COLORS.zebraWhite;
      const row = wsSanciones.getRow(sRowIdx);

      row.values = [
        s.id,
        s.fecha,
        s.empresaNombre,
        s.placas,
        s.tipo,
        s.medidaDisciplinaria,
        s.dictamen || 'Aprobada por comité de supervisión',
        s.status
      ];
      row.height = 20;

      row.eachCell((cell, colNum) => {
        cell.font = { size: 9, color: { argb: COLORS.textDark } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: bg } };
        cell.border = {
          top: { style: 'thin', color: { argb: COLORS.borderGray } },
          bottom: { style: 'thin', color: { argb: COLORS.borderGray } },
          left: { style: 'thin', color: { argb: COLORS.borderGray } },
          right: { style: 'thin', color: { argb: COLORS.borderGray } },
        };
        if ([1, 2, 4, 8].includes(colNum)) {
          cell.alignment = { horizontal: 'center', vertical: 'middle' };
        } else {
          cell.alignment = { horizontal: 'left', vertical: 'middle' };
        }
      });
      sRowIdx++;
    });

    wsSanciones.autoFilter = {
      from: { row: 3, column: 1 },
      to: { row: sRowIdx - 1, column: headersSanciones.length }
    };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // DESCARGA DE ARCHIVO .XLSX
  // ═══════════════════════════════════════════════════════════════════════════
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const sanitizedPeriod = data.periodoNombre.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.download = `Reporte_Ejecutivo_LasPalomas_${sanitizedPeriod}_${new Date().toISOString().split('T')[0]}.xlsx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
