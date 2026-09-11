import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Clock,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  Car,
  UserCheck,
  Building2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  BarChart3,
  PieChart as PieChartIcon,
  Search,
  FileCheck2,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  RefreshCw,
  Calendar,
  Layers
} from 'lucide-react';
import { exportSupervisorReportToExcel } from '../utils/excelReportExporter';

export interface BitacoraItem {
  id: string;
  empresaNombre: string;
  vehicleId?: string;
  placas: string;
  color?: string;
  conductor: string;
  telefono?: string;
  corbatinNum?: string;
  fecha?: string;
  created_at?: string;
  raw_hora_entrada?: string;
  raw_hora_salida?: string;
  horaEntrada: string;
  horaSalida?: string;
  trabajos: string;
  guardiaNombre: string;
  estado: 'Dentro' | 'Salida Registrada';
  tipoAcceso?: 'Vehicular' | 'Peatonal';
  observaciones?: string;
  num_pasajeros?: number;
}

export interface SancionItem {
  id: string;
  vehicleId?: string;
  empresaNombre: string;
  placas: string;
  tipo: string;
  fecha: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  medidaDisciplinaria?: string;
  status: string;
  descripcion?: string;
  apelacion?: {
    dictamenSupervisor?: string;
    [key: string]: any;
  };
}

interface SupervisorHistorialProps {
  bitacora: BitacoraItem[];
  sanciones: SancionItem[];
  onRefresh?: () => void;
}

type SubTab = 'graficas' | 'ultimos10' | 'sanciones';
type PeriodFilter = 'dia' | 'semana' | 'mes' | 'anio' | 'rango';
type ChartType = 'bar' | 'area';

// Formateador de horas a formato amigable 12 hrs AM/PM
function formatHoraVisual(raw?: string): string {
  if (!raw || raw === '—' || raw === '00:00 hrs') return raw || '—';
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
  } catch { }
  return raw.replace(/ hrs/i, '');
}

export const SupervisorHistorial: React.FC<SupervisorHistorialProps> = ({
  bitacora,
  sanciones,
  onRefresh
}) => {
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('graficas');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  // Filtros de tiempo para la gráfica
  const [periodo, setPeriodo] = useState<PeriodFilter>('dia');
  const [chartType, setChartType] = useState<ChartType>('bar');

  // Fechas de filtro basadas en la fecha actual local
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr); // YYYY-MM-DD
  const [selectedMonth, setSelectedMonth] = useState<string>(todayStr.substring(0, 7)); // YYYY-MM
  const [selectedYear, setSelectedYear] = useState<string>(todayStr.substring(0, 4)); // YYYY
  const [rangoInicio, setRangoInicio] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });
  const [rangoFin, setRangoFin] = useState<string>(todayStr);

  // Filtro de empresa opcional en gráficas
  const [selectedEmpresa, setSelectedEmpresa] = useState<string>('todas');

  // Filtro rápido en últimos 10
  const [filtroTipo10, setFiltroTipo10] = useState<'todos' | 'entradas' | 'salidas'>('todos');

  // Filtro en historial de sanciones
  const [searchSanciones, setSearchSanciones] = useState<string>('');
  const [filtroEstatusSancion, setFiltroEstatusSancion] = useState<string>('todos');

  // Manejador de actualización manual
  const handleRefreshClick = async () => {
    if (!onRefresh) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  // Lista de empresas reales para selectores
  const empresasList = useMemo(() => {
    const set = new Set<string>();
    (bitacora || []).forEach(b => {
      if (b.empresaNombre && b.empresaNombre.trim()) {
        set.add(b.empresaNombre.trim());
      }
    });
    return Array.from(set).sort();
  }, [bitacora]);

  // Dataset 100% REAL conectado a la base de datos PostgreSQL
  const allAccesosDataset = useMemo(() => {
    return bitacora || [];
  }, [bitacora]);

  // Función auxiliar robusta para parsear la fecha de un registro real
  const getRecordDate = (item: BitacoraItem): string => {
    // 1. Probar campo fecha directo si viene como YYYY-MM-DD
    if (item.fecha && /^\d{4}-\d{2}-\d{2}$/.test(item.fecha.trim())) {
      return item.fecha.trim();
    }
    // 2. Probar raw_hora_entrada, created_at o fecha con ISO
    const raw = item.raw_hora_entrada || item.created_at || item.fecha || item.horaEntrada;
    if (raw) {
      try {
        const d = new Date(raw);
        if (!isNaN(d.getTime())) {
          const y = d.getFullYear();
          const m = String(d.getMonth() + 1).padStart(2, '0');
          const day = String(d.getDate()).padStart(2, '0');
          return `${y}-${m}-${day}`;
        }
      } catch { }
    }
    return '';
  };

  // Función auxiliar para extraer hora real (0-23)
  const getRecordHour = (item: BitacoraItem, type: 'entrada' | 'salida'): number | null => {
    const raw = type === 'entrada'
      ? (item.raw_hora_entrada || item.created_at || item.horaEntrada)
      : (item.raw_hora_salida || item.horaSalida);

    if (!raw) return null;

    try {
      const d = new Date(raw);
      if (!isNaN(d.getTime())) {
        return d.getHours();
      }
    } catch { }

    const match = String(raw).match(/(\d{1,2}):(\d{2})/);
    if (match) {
      let h = parseInt(match[1], 10);
      if (/PM/i.test(raw) && h < 12) h += 12;
      if (/AM/i.test(raw) && h === 12) h = 0;
      return h;
    }
    return null;
  };

  // Cálculo de datos analíticos basados en los datos reales de PostgreSQL
  const chartAnalytics = useMemo(() => {
    let filtered = allAccesosDataset;

    if (selectedEmpresa !== 'todas') {
      filtered = filtered.filter(item => item.empresaNombre === selectedEmpresa);
    }

    let chartData: Array<{ label: string; entradas: number; salidas: number; total: number; fullDate?: string }> = [];
    let title = '';
    let subtitle = '';

    if (periodo === 'dia') {
      const targetDate = selectedDate;
      const dayItems = filtered.filter(item => getRecordDate(item) === targetDate);

      const hoursMap: Record<number, { entradas: number; salidas: number }> = {};
      for (let h = 6; h <= 21; h++) {
        hoursMap[h] = { entradas: 0, salidas: 0 };
      }

      dayItems.forEach(item => {
        const hIn = getRecordHour(item, 'entrada');
        if (hIn !== null) {
          if (!hoursMap[hIn]) hoursMap[hIn] = { entradas: 0, salidas: 0 };
          hoursMap[hIn].entradas += 1;
        }

        if (item.horaSalida || item.raw_hora_salida || item.estado === 'Salida Registrada') {
          const hOut = getRecordHour(item, 'salida');
          if (hOut !== null) {
            if (!hoursMap[hOut]) hoursMap[hOut] = { entradas: 0, salidas: 0 };
            hoursMap[hOut].salidas += 1;
          }
        }
      });

      const sortedHours = Object.keys(hoursMap)
        .map(Number)
        .sort((a, b) => a - b);

      chartData = sortedHours.map(h => {
        const label = `${String(h).padStart(2, '0')}:00`;
        const ent = hoursMap[h].entradas;
        const sal = hoursMap[h].salidas;
        return {
          label,
          entradas: ent,
          salidas: sal,
          total: ent + sal
        };
      });

      const parts = targetDate.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(y, m - 1, d);
      const formattedDateText = !isNaN(dateObj.getTime())
        ? dateObj.toLocaleDateString('es-MX', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        : targetDate;

      title = `Flujo por Hora — ${formattedDateText}`;
      subtitle = `Distribución horaria de ingresos y salidas en caseta (${dayItems.length} registros en BD)`;
    } else if (periodo === 'semana') {
      const parts = selectedDate.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const target = new Date(y, m - 1, d);
      const dayOfWeek = target.getDay();
      const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(target);
      monday.setDate(target.getDate() + diffToMonday);

      const daysOfWeekLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      const weekDates: { dateStr: string; label: string }[] = [];

      for (let i = 0; i < 7; i++) {
        const cur = new Date(monday);
        cur.setDate(monday.getDate() + i);
        const curY = cur.getFullYear();
        const curM = String(cur.getMonth() + 1).padStart(2, '0');
        const curD = String(cur.getDate()).padStart(2, '0');
        const curDateStr = `${curY}-${curM}-${curD}`;
        const dayNum = cur.getDate();
        const monthShort = cur.toLocaleDateString('es-MX', { month: 'short' });
        weekDates.push({
          dateStr: curDateStr,
          label: `${daysOfWeekLabels[i]} ${dayNum} ${monthShort}`
        });
      }

      chartData = weekDates.map(({ dateStr, label }) => {
        const dayItems = filtered.filter(item => getRecordDate(item) === dateStr);
        const ent = dayItems.length;
        const sal = dayItems.filter(item => item.horaSalida || item.raw_hora_salida || item.estado === 'Salida Registrada').length;
        return {
          label,
          entradas: ent,
          salidas: sal,
          total: ent + sal,
          fullDate: dateStr
        };
      });

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      title = `Semana del ${monday.getDate()} de ${monday.toLocaleDateString('es-MX', { month: 'short' })} al ${sunday.getDate()} de ${sunday.toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}`;
      subtitle = `Comparativo diario de entradas y salidas de la semana`;
    } else if (periodo === 'mes') {
      const parts = selectedMonth.split('-');
      const year = parseInt(parts[0], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
      const monthName = new Date(year, monthIndex, 1).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

      chartData = [];
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayItems = filtered.filter(item => getRecordDate(item) === dateStr);
        const ent = dayItems.length;
        const sal = dayItems.filter(item => item.horaSalida || item.raw_hora_salida || item.estado === 'Salida Registrada').length;

        chartData.push({
          label: `Día ${day}`,
          entradas: ent,
          salidas: sal,
          total: ent + sal,
          fullDate: dateStr
        });
      }

      title = `Mes de ${monthName.toUpperCase()}`;
      subtitle = `Flujo diario a lo largo de los ${daysInMonth} días del mes`;
    } else if (periodo === 'anio') {
      const year = parseInt(selectedYear, 10);
      const monthsNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

      chartData = monthsNames.map((mName, mIdx) => {
        const monthPrefix = `${year}-${String(mIdx + 1).padStart(2, '0')}`;
        const monthItems = filtered.filter(item => {
          const rDate = getRecordDate(item);
          return rDate.startsWith(monthPrefix);
        });
        const ent = monthItems.length;
        const sal = monthItems.filter(item => item.horaSalida || item.raw_hora_salida || item.estado === 'Salida Registrada').length;

        return {
          label: mName,
          entradas: ent,
          salidas: sal,
          total: ent + sal
        };
      });

      title = `Flujo Anual ${year}`;
      subtitle = `Resumen mensual de entradas y salidas registradas en el año ${year}`;
    } else if (periodo === 'rango') {
      const start = new Date(rangoInicio);
      const end = new Date(rangoFin);

      const actualStart = start <= end ? start : end;
      const actualEnd = start <= end ? end : start;

      const diffDays = Math.min(60, Math.max(1, Math.round((actualEnd.getTime() - actualStart.getTime()) / (1000 * 3600 * 24)) + 1));

      chartData = [];
      for (let i = 0; i < diffDays; i++) {
        const cur = new Date(actualStart);
        cur.setDate(actualStart.getDate() + i);
        const curY = cur.getFullYear();
        const curM = String(cur.getMonth() + 1).padStart(2, '0');
        const curD = String(cur.getDate()).padStart(2, '0');
        const dateStr = `${curY}-${curM}-${curD}`;
        const dayLabel = cur.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });

        const dayItems = filtered.filter(item => getRecordDate(item) === dateStr);
        const ent = dayItems.length;
        const sal = dayItems.filter(item => item.horaSalida || item.raw_hora_salida || item.estado === 'Salida Registrada').length;

        chartData.push({
          label: dayLabel,
          entradas: ent,
          salidas: sal,
          total: ent + sal,
          fullDate: dateStr
        });
      }

      title = `Rango: ${rangoInicio} al ${rangoFin}`;
      subtitle = `Flujo acumulado durante el periodo seleccionado (${diffDays} días)`;
    }

    const totalEntradas = chartData.reduce((acc, curr) => acc + curr.entradas, 0);
    const totalSalidas = chartData.reduce((acc, curr) => acc + curr.salidas, 0);
    const totalMovimientos = totalEntradas + totalSalidas;
    const balanceDentro = Math.max(0, totalEntradas - totalSalidas);

    let peakItem = chartData.find(c => c.total > 0) || chartData[0];
    chartData.forEach(item => {
      if (item.total > (peakItem?.total || 0)) {
        peakItem = item;
      }
    });

    let totalVehicular = 0;
    let totalPeatonal = 0;
    const empresasCountMap: Record<string, number> = {};

    filtered.forEach(item => {
      const recDate = getRecordDate(item);
      let inScope = false;

      if (periodo === 'dia') inScope = recDate === selectedDate;
      else if (periodo === 'semana') inScope = chartData.some(c => c.fullDate === recDate);
      else if (periodo === 'mes') inScope = recDate.startsWith(selectedMonth);
      else if (periodo === 'anio') inScope = recDate.startsWith(selectedYear);
      else if (periodo === 'rango') inScope = recDate >= rangoInicio && recDate <= rangoFin;

      if (inScope) {
        if (item.tipoAcceso === 'Peatonal' || item.placas?.includes('PEATONAL') || item.vehicleId === 'PEATONAL') {
          totalPeatonal++;
        } else {
          totalVehicular++;
        }

        const emp = item.empresaNombre || 'Sin Empresa Asignada';
        empresasCountMap[emp] = (empresasCountMap[emp] || 0) + 1;
      }
    });

    const dataPieTipo = (totalVehicular === 0 && totalPeatonal === 0)
      ? [{ name: 'Sin registros', value: 1, color: '#CBD5E1' }]
      : [
        { name: 'Vehicular', value: totalVehicular, color: '#0D6E5F' },
        { name: 'Peatonal', value: totalPeatonal, color: '#0284C7' }
      ];

    const topEmpresasData = Object.entries(empresasCountMap)
      .map(([name, count]) => ({ name: name.length > 22 ? name.substring(0, 20) + '...' : name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      chartData,
      title,
      subtitle,
      totalEntradas,
      totalSalidas,
      totalMovimientos,
      balanceDentro,
      peakLabel: (peakItem?.total && peakItem.total > 0) ? peakItem.label : 'Sin picos',
      peakValue: peakItem?.total || 0,
      dataPieTipo,
      topEmpresasData,
      totalVehicular,
      totalPeatonal
    };
  }, [
    allAccesosDataset,
    periodo,
    selectedDate,
    selectedMonth,
    selectedYear,
    rangoInicio,
    rangoFin,
    selectedEmpresa
  ]);

  // Recuento de todos los movimientos de la base de datos de caseta
  const { todosMovimientos, movimientosFiltrados, ultimosMovimientosCards, metricasMovimientos } = useMemo(() => {
    const sorted = [...allAccesosDataset].sort((a, b) => {
      const timeA = a.created_at || a.raw_hora_entrada || a.fecha || '';
      const timeB = b.created_at || b.raw_hora_entrada || b.fecha || '';
      return timeB.localeCompare(timeA);
    });

    interface MovimientoEvento {
      id: string;
      accesoId: string;
      tipoMovimiento: 'ENTRADA' | 'SALIDA';
      fecha: string;
      hora: string;
      placas: string;
      conductor: string;
      empresaNombre: string;
      corbatinNum: string;
      tipoAcceso: 'Vehicular' | 'Peatonal';
      num_pasajeros: number;
      guardiaNombre: string;
      trabajos: string;
      color?: string;
      telefono?: string;
      estadoAcceso: string;
      timestampSort: number;
    }

    const eventos: MovimientoEvento[] = [];

    sorted.forEach(item => {
      const recDate = getRecordDate(item) || todayStr;
      const isPeatonal = item.tipoAcceso === 'Peatonal' || item.placas?.includes('PEATONAL') || item.vehicleId === 'PEATONAL';

      const rawCorb = item.corbatinNum || (item as any).corbatinNumero || (item as any).corbatin?.numero || (item as any).vehiculo?.corbatines?.[0]?.numero;
      const cleanCorbatin = !isPeatonal && rawCorb && rawCorb !== '—' && rawCorb !== 'null' && rawCorb !== 'undefined'
        ? (String(rawCorb).startsWith('#') ? String(rawCorb) : `#${rawCorb}`)
        : '—';

      const cleanTrabajos = (item.trabajos && item.trabajos !== 'x')
        ? item.trabajos
        : ((item as any).ubicacion_trabajo && (item as any).ubicacion_trabajo !== 'x')
          ? (item as any).ubicacion_trabajo
          : ((item.observaciones && item.observaciones !== 'x' && !item.observaciones.startsWith('Chofer [') && !item.observaciones.startsWith('Peatonal ['))
            ? item.observaciones
            : (isPeatonal ? 'Labores y mantenimiento a pie' : 'Mantenimiento / Acceso regular'));

      const empNombre = item.empresaNombre || (item as any).vehiculo?.empresa?.razon_social || (item as any).conductor?.empresa?.razon_social || 'Empresa Contratista';

      // Evento de ENTRADA
      if (item.horaEntrada || item.raw_hora_entrada) {
        let ts = new Date(`${recDate}T12:00:00`).getTime();
        if (item.raw_hora_entrada) {
          const parsed = new Date(item.raw_hora_entrada).getTime();
          if (!isNaN(parsed)) ts = parsed;
        }
        eventos.push({
          id: `in_${item.id}`,
          accesoId: item.id,
          tipoMovimiento: 'ENTRADA',
          fecha: recDate,
          hora: formatHoraVisual(item.horaEntrada || item.raw_hora_entrada),
          placas: item.placas,
          conductor: item.conductor || 'Conductor Autorizado',
          empresaNombre: empNombre,
          corbatinNum: cleanCorbatin,
          tipoAcceso: isPeatonal ? 'Peatonal' : 'Vehicular',
          num_pasajeros: item.num_pasajeros || 0,
          guardiaNombre: item.guardiaNombre || 'Oficial en Caseta',
          trabajos: cleanTrabajos,
          color: item.color,
          telefono: item.telefono,
          estadoAcceso: item.estado,
          timestampSort: ts
        });
      }

      // Evento de SALIDA
      if (item.horaSalida || item.raw_hora_salida || item.estado === 'Salida Registrada') {
        let tsOut = new Date(`${recDate}T18:00:00`).getTime();
        if (item.raw_hora_salida) {
          const parsedOut = new Date(item.raw_hora_salida).getTime();
          if (!isNaN(parsedOut)) tsOut = parsedOut;
        }
        eventos.push({
          id: `out_${item.id}`,
          accesoId: item.id,
          tipoMovimiento: 'SALIDA',
          fecha: recDate,
          hora: formatHoraVisual(item.horaSalida || item.raw_hora_salida),
          placas: item.placas,
          conductor: item.conductor || 'Conductor Autorizado',
          empresaNombre: empNombre,
          corbatinNum: cleanCorbatin,
          tipoAcceso: isPeatonal ? 'Peatonal' : 'Vehicular',
          num_pasajeros: item.num_pasajeros || 0,
          guardiaNombre: item.guardiaNombre || 'Oficial en Caseta',
          trabajos: cleanTrabajos,
          color: item.color,
          telefono: item.telefono,
          estadoAcceso: 'Salida Registrada',
          timestampSort: tsOut + 1000
        });
      }
    });

    eventos.sort((a, b) => b.timestampSort - a.timestampSort);

    const totalEntradas = eventos.filter(e => e.tipoMovimiento === 'ENTRADA').length;
    const totalSalidas = eventos.filter(e => e.tipoMovimiento === 'SALIDA').length;

    let filtrados = eventos;
    if (filtroTipo10 === 'entradas') {
      filtrados = eventos.filter(e => e.tipoMovimiento === 'ENTRADA');
    } else if (filtroTipo10 === 'salidas') {
      filtrados = eventos.filter(e => e.tipoMovimiento === 'SALIDA');
    }

    return {
      todosMovimientos: eventos,
      movimientosFiltrados: filtrados,
      ultimosMovimientosCards: filtrados.slice(0, 8),
      metricasMovimientos: {
        entradas: totalEntradas,
        salidas: totalSalidas,
        total: eventos.length
      }
    };
  }, [allAccesosDataset, filtroTipo10, todayStr]);

  // Historial de Sanciones filtrado de PostgreSQL
  const sancionesFiltradas = useMemo(() => {
    return (sanciones || []).filter(s => {
      const matchText = searchSanciones === '' ||
        s.id.toLowerCase().includes(searchSanciones.toLowerCase()) ||
        s.empresaNombre.toLowerCase().includes(searchSanciones.toLowerCase()) ||
        s.placas.toLowerCase().includes(searchSanciones.toLowerCase()) ||
        s.tipo.toLowerCase().includes(searchSanciones.toLowerCase());

      const matchEstatus = filtroEstatusSancion === 'todos' ||
        s.status.toLowerCase() === filtroEstatusSancion.toLowerCase();

      return matchText && matchEstatus;
    });
  }, [sanciones, searchSanciones, filtroEstatusSancion]);

  // Exportación Ejecutiva a Excel con Plantilla Corporativa y Gráficas
  const handleExportarExcel = async () => {
    if (isExportingExcel) return;
    setIsExportingExcel(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const periodoNombre = chartAnalytics.title || `Periodo: ${periodo.toUpperCase()}`;

      const mappedBitacora = allAccesosDataset.map((b) => ({
        id: String(b.id),
        fecha: b.fecha || getRecordDate(b) || today,
        tipoAcceso: b.tipoAcceso || (b.vehicleId === "PEATONAL" ? "Peatonal" : "Vehicular"),
        empresaNombre: b.empresaNombre || '—',
        placas: b.placas || 'PEATONAL',
        color: b.color || 'N/A',
        conductor: b.conductor || 'Personal Acreditado',
        telefono: b.telefono || 'N/A',
        corbatinNum: b.corbatinNum || '—',
        num_pasajeros: Number(b.num_pasajeros) || 0,
        horaEntrada: formatHoraVisual(b.horaEntrada || b.raw_hora_entrada),
        horaSalida: b.horaSalida ? formatHoraVisual(b.horaSalida || b.raw_hora_salida) : 'Dentro',
        trabajos: b.trabajos || 'Mantenimiento / Acceso regular',
        guardiaNombre: b.guardiaNombre || 'Oficial en Caseta',
        estado: b.estado || (b.horaSalida ? 'Salida Registrada' : 'Dentro'),
        observaciones: b.observaciones || 'Sin observaciones'
      }));

      const mappedSanciones = (sancionesFiltradas || []).map((s) => ({
        id: String(s.id),
        fecha: s.fecha || today,
        empresaNombre: s.empresaNombre || '—',
        placas: s.placas || 'N/A',
        tipo: s.tipo || 'Infracción al Reglamento',
        medidaDisciplinaria: s.medidaDisciplinaria || 'Sanción oficial',
        dictamen: s.apelacion?.dictamenSupervisor || 'Resolución aprobada por comité de supervisión',
        status: s.status || 'Activa'
      }));

      await exportSupervisorReportToExcel({
        periodoNombre,
        fechaReporte: new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        empresaFiltro: selectedEmpresa === 'todas' ? 'Todas las Empresas' : selectedEmpresa,
        usuarioSupervisor: 'Supervisor de Seguridad HOA',
        kpis: {
          totalEntradas: chartAnalytics.totalEntradas,
          totalSalidas: chartAnalytics.totalSalidas,
          totalMovimientos: chartAnalytics.totalMovimientos,
          balanceDentro: chartAnalytics.balanceDentro,
          picoTraficoTexto: chartAnalytics.peakLabel ? `${chartAnalytics.peakLabel} (${chartAnalytics.peakValue} accesos)` : 'N/A',
          totalSanciones: sancionesFiltradas.length,
        },
        chartData: chartAnalytics.chartData.map((d) => ({
          hora: d.label,
          entradas: d.entradas,
          salidas: d.salidas,
          movimientos: d.total
        })),
        dataModalidad: chartAnalytics.dataPieTipo.map((m) => ({
          name: m.name,
          value: m.value,
          color: m.color
        })),
        topEmpresas: chartAnalytics.topEmpresasData.map((e) => ({
          name: e.name,
          accesos: e.count
        })),
        bitacora: mappedBitacora,
        sanciones: mappedSanciones
      });
    } catch (err) {
      console.error('Error al generar Excel ejecutivo:', err);
      alert('Hubo un error al generar el archivo Excel. Por favor intente nuevamente.');
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Helpers para cambiar fecha en día/semana/mes
  const handleNextDate = () => {
    if (periodo === 'dia' || periodo === 'semana') {
      const parts = selectedDate.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const next = new Date(y, m - 1, d);
      next.setDate(next.getDate() + (periodo === 'semana' ? 7 : 1));
      const nextY = next.getFullYear();
      const nextM = String(next.getMonth() + 1).padStart(2, '0');
      const nextD = String(next.getDate()).padStart(2, '0');
      setSelectedDate(`${nextY}-${nextM}-${nextD}`);
    } else if (periodo === 'mes') {
      const parts = selectedMonth.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const cur = new Date(y, m - 1, 1);
      cur.setMonth(cur.getMonth() + 1);
      const nextMonthStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonth(nextMonthStr);
    } else if (periodo === 'anio') {
      setSelectedYear(String(parseInt(selectedYear, 10) + 1));
    }
  };

  const handlePrevDate = () => {
    if (periodo === 'dia' || periodo === 'semana') {
      const parts = selectedDate.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const d = parseInt(parts[2], 10);
      const prev = new Date(y, m - 1, d);
      prev.setDate(prev.getDate() - (periodo === 'semana' ? 7 : 1));
      const prevY = prev.getFullYear();
      const prevM = String(prev.getMonth() + 1).padStart(2, '0');
      const prevD = String(prev.getDate()).padStart(2, '0');
      setSelectedDate(`${prevY}-${prevM}-${prevD}`);
    } else if (periodo === 'mes') {
      const parts = selectedMonth.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10);
      const cur = new Date(y, m - 1, 1);
      cur.setMonth(cur.getMonth() - 1);
      const prevMonthStr = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`;
      setSelectedMonth(prevMonthStr);
    } else if (periodo === 'anio') {
      setSelectedYear(String(parseInt(selectedYear, 10) - 1));
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* ─── Encabezado Principal & Sub-pestañas ─────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
        {/* Fila Superior: Título con Icono a la Izquierda y Botones de Acción a la Derecha */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-xl bg-emerald-50 text-[#0D6E5F] border border-emerald-200/70 shrink-0">
              <BarChart3 className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900">
                  Historial y Métricas de Acceso
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                  PostgreSQL Real ({allAccesosDataset.length} registros)
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Auditoría analítica en tiempo real de entradas, salidas y resoluciones disciplinarias
              </p>
            </div>
          </div>

          {/* Botones de Actualización y Exportar a Excel */}
          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            {onRefresh && (
              <button
                onClick={handleRefreshClick}
                disabled={isRefreshing}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all cursor-pointer shadow-xs disabled:opacity-50"
                title="Sincronizar y recargar datos de la base de datos"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>Actualizar</span>
              </button>
            )}

            <button
              onClick={handleExportarExcel}
              disabled={isExportingExcel}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#0D6E5F] hover:bg-[#095247] text-white shadow-xs transition-all duration-150 cursor-pointer whitespace-nowrap disabled:opacity-60"
              title="Exportar informe ejecutivo con métricas, bitácora y gráficas en formato Microsoft Excel (.XLSX)"
            >
              {isExportingExcel ? (
                <>
                  <RefreshCw className="w-4 h-4 text-emerald-200 animate-spin" />
                  <span>Generando Excel...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                  <span>Exportar a Excel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Fila Inferior: Sub-pestañas de navegación */}
        <div className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('graficas')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${activeSubTab === 'graficas'
                ? 'bg-[#0D6E5F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Gráficas de Accesos</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ultimos10')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${activeSubTab === 'ultimos10'
                ? 'bg-[#0D6E5F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            <Clock className="w-4 h-4" />
            <span>Últimos Movimientos</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeSubTab === 'ultimos10' ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-700'
              }`}>
              {todosMovimientos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveSubTab('sanciones')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${activeSubTab === 'sanciones'
                ? 'bg-[#0D6E5F] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Resoluciones / Sanciones ({sanciones.length})</span>
          </button>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* 1. SUB-PESTAÑA: GRÁFICAS DE ACCESOS (ENTRADAS Y SALIDAS)               */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'graficas' && (
        <div className="space-y-6">
          {/* Barra de Filtros Temporales */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Selector de tipo de periodo: Día, Semana, Mes, Año, Rango */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-1 flex items-center gap-1">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Periodo:
                </span>
                {(['dia', 'semana', 'mes', 'anio', 'rango'] as PeriodFilter[]).map(p => {
                  const labels: Record<PeriodFilter, string> = {
                    dia: 'Día',
                    semana: 'Semana',
                    mes: 'Mes',
                    anio: 'Año',
                    rango: 'Rango de Días'
                  };
                  const active = periodo === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setPeriodo(p)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${active
                          ? 'bg-[#0D6E5F] text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
              </div>

              {/* Filtro específico según el periodo seleccionado */}
              <div className="flex flex-wrap items-center gap-2">
                {periodo === 'dia' && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                    <button
                      onClick={handlePrevDate}
                      title="Día anterior"
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value || todayStr)}
                      className="bg-white border border-slate-300 px-2.5 py-1 text-xs rounded-lg font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleNextDate}
                      title="Día siguiente"
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedDate(todayStr)}
                      className="px-2 py-1 text-[11px] font-bold text-[#0D6E5F] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Hoy
                    </button>
                  </div>
                )}

                {periodo === 'semana' && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                    <button
                      onClick={handlePrevDate}
                      title="Semana anterior"
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={e => setSelectedDate(e.target.value || todayStr)}
                      className="bg-white border border-slate-300 px-2.5 py-1 text-xs rounded-lg font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleNextDate}
                      title="Semana siguiente"
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedDate(todayStr)}
                      className="px-2 py-1 text-[11px] font-bold text-[#0D6E5F] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Esta Semana
                    </button>
                  </div>
                )}

                {periodo === 'mes' && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                    <button
                      onClick={handlePrevDate}
                      title="Mes anterior"
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={e => setSelectedMonth(e.target.value || todayStr.substring(0, 7))}
                      className="bg-white border border-slate-300 px-2.5 py-1 text-xs rounded-lg font-mono font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      onClick={handleNextDate}
                      title="Mes siguiente"
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedMonth(todayStr.substring(0, 7))}
                      className="px-2 py-1 text-[11px] font-bold text-[#0D6E5F] hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Este Mes
                    </button>
                  </div>
                )}

                {periodo === 'anio' && (
                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 p-1 rounded-xl">
                    <button
                      onClick={handlePrevDate}
                      title="Año anterior"
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <select
                      value={selectedYear}
                      onChange={e => setSelectedYear(e.target.value)}
                      className="bg-white border border-slate-300 px-3 py-1 text-xs rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                    >
                      {['2024', '2025', '2026', '2027'].map(y => (
                        <option key={y} value={y}>{y}</option>
                      ))}
                    </select>
                    <button
                      onClick={handleNextDate}
                      title="Año siguiente"
                      className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {periodo === 'rango' && (
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-50 border border-slate-200 p-1.5 rounded-xl">
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Desde:</span>
                      <input
                        type="date"
                        value={rangoInicio}
                        onChange={e => setRangoInicio(e.target.value)}
                        className="bg-white border border-slate-300 px-2 py-1 text-xs rounded-lg font-mono font-medium text-slate-800"
                      />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Hasta:</span>
                      <input
                        type="date"
                        value={rangoFin}
                        onChange={e => setRangoFin(e.target.value)}
                        className="bg-white border border-slate-300 px-2 py-1 text-xs rounded-lg font-mono font-medium text-slate-800"
                      />
                    </div>
                  </div>
                )}

                {/* Filtro Empresa */}
                <select
                  value={selectedEmpresa}
                  onChange={e => setSelectedEmpresa(e.target.value)}
                  className="bg-slate-100 border border-slate-200 text-xs rounded-xl px-3 py-2 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer max-w-[200px] truncate"
                >
                  <option value="todas">Todas las Empresas ({empresasList.length})</option>
                  {empresasList.map(emp => (
                    <option key={emp} value={emp}>{emp}</option>
                  ))}
                </select>

                {/* Toggle Gráfica Barras / Área */}
                <div className="flex items-center border border-slate-200 rounded-xl bg-slate-100 p-0.5">
                  <button
                    onClick={() => setChartType('bar')}
                    title="Gráfica de Columnas"
                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${chartType === 'bar' ? 'bg-white text-[#0D6E5F] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChartType('area')}
                    title="Gráfica de Área / Tendencia"
                    className={`p-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${chartType === 'area' ? 'bg-white text-[#0D6E5F] shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                  >
                    <TrendingUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjetas KPI de Métricas del Periodo */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Entradas</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <ArrowDownRight className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
                {chartAnalytics.totalEntradas}
              </div>
              <div className="mt-1 text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                <span>Ingresos en periodo</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-sky-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Salidas</span>
                <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
                  <ArrowUpRight className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
                {chartAnalytics.totalSalidas}
              </div>
              <div className="mt-1 text-[11px] text-sky-600 font-medium flex items-center gap-1">
                <span>Salidas registradas</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Movimientos</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <ArrowLeftRight className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 font-mono">
                {chartAnalytics.totalMovimientos}
              </div>
              <div className="mt-1 text-[11px] text-slate-500 font-medium">
                Flujo total acumulado
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-teal-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Dentro / Balance</span>
                <span className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <Car className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-2xl font-black text-teal-800 font-mono">
                {chartAnalytics.balanceDentro}
              </div>
              <div className="mt-1 text-[11px] text-teal-600 font-medium">
                En instalaciones actualmente
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs hover:border-indigo-300 transition-all col-span-2 sm:col-span-2 lg:col-span-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pico de Mayor Tráfico</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
                  <Sparkles className="w-4 h-4" />
                </span>
              </div>
              <div className="mt-2 text-lg font-black text-slate-900 truncate" title={chartAnalytics.peakLabel}>
                {chartAnalytics.peakLabel}
              </div>
              <div className="mt-1 text-[11px] text-indigo-600 font-semibold">
                {chartAnalytics.peakValue > 0 ? `${chartAnalytics.peakValue} accesos registrados` : 'Sin accesos registrados'}
              </div>
            </div>
          </div>

          {/* Gráfica Principal: Entradas vs Salidas */}
          <div
            id="chart-flujo-accesos"
            data-chart-title="Flujo de Accesos por Intervalo"
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{chartAnalytics.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{chartAnalytics.subtitle}</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#0D6E5F]"></span>
                  <span className="font-semibold text-slate-700">Entradas</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-md bg-[#0284C7]"></span>
                  <span className="font-semibold text-slate-700">Salidas</span>
                </div>
              </div>
            </div>

            <div className="h-[340px] w-full pt-2">
              {chartAnalytics.chartData.length === 0 || chartAnalytics.totalMovimientos === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <BarChart3 className="w-8 h-8 mb-2 text-slate-300" />
                  <span>No hay registros en la base de datos para el periodo seleccionado.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === 'bar' ? (
                    <BarChart
                      data={chartAnalytics.chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#64748B' }}
                        interval={0}
                        angle={chartAnalytics.chartData.length > 12 ? -45 : 0}
                        textAnchor={chartAnalytics.chartData.length > 12 ? 'end' : 'middle'}
                        height={chartAnalytics.chartData.length > 12 ? 50 : 30}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const ent = payload.find(p => p.dataKey === 'entradas')?.value || 0;
                            const sal = payload.find(p => p.dataKey === 'salidas')?.value || 0;
                            return (
                              <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700 space-y-1.5 min-w-[150px]">
                                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">{label}</div>
                                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                                  <span>🟢 Entradas:</span>
                                  <span className="font-mono">{ent}</span>
                                </div>
                                <div className="flex items-center justify-between text-sky-400 font-semibold">
                                  <span>🔵 Salidas:</span>
                                  <span className="font-mono">{sal}</span>
                                </div>
                                <div className="flex items-center justify-between text-amber-300 font-bold pt-1 border-t border-slate-700">
                                  <span>Total Flujo:</span>
                                  <span className="font-mono">{Number(ent) + Number(sal)}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="entradas" fill="#0D6E5F" name="Entradas" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="salidas" fill="#0284C7" name="Salidas" radius={[4, 4, 0, 0]} maxBarSize={32} />
                    </BarChart>
                  ) : (
                    <AreaChart
                      data={chartAnalytics.chartData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                    >
                      <defs>
                        <linearGradient id="gradEntradas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0D6E5F" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#0D6E5F" stopOpacity={0.05} />
                        </linearGradient>
                        <linearGradient id="gradSalidas" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284C7" stopOpacity={0.6} />
                          <stop offset="95%" stopColor="#0284C7" stopOpacity={0.05} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 11, fill: '#64748B' }}
                        interval={0}
                        angle={chartAnalytics.chartData.length > 12 ? -45 : 0}
                        textAnchor={chartAnalytics.chartData.length > 12 ? 'end' : 'middle'}
                        height={chartAnalytics.chartData.length > 12 ? 50 : 30}
                      />
                      <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                      <Tooltip
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            const ent = payload.find(p => p.dataKey === 'entradas')?.value || 0;
                            const sal = payload.find(p => p.dataKey === 'salidas')?.value || 0;
                            return (
                              <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-700 space-y-1.5 min-w-[150px]">
                                <div className="font-bold text-slate-200 border-b border-slate-700 pb-1">{label}</div>
                                <div className="flex items-center justify-between text-emerald-400 font-semibold">
                                  <span>🟢 Entradas:</span>
                                  <span className="font-mono">{ent}</span>
                                </div>
                                <div className="flex items-center justify-between text-sky-400 font-semibold">
                                  <span>🔵 Salidas:</span>
                                  <span className="font-mono">{sal}</span>
                                </div>
                                <div className="flex items-center justify-between text-amber-300 font-bold pt-1 border-t border-slate-700">
                                  <span>Total Flujo:</span>
                                  <span className="font-mono">{Number(ent) + Number(sal)}</span>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area type="monotone" dataKey="entradas" stroke="#0D6E5F" strokeWidth={2.5} fillOpacity={1} fill="url(#gradEntradas)" name="Entradas" />
                      <Area type="monotone" dataKey="salidas" stroke="#0284C7" strokeWidth={2.5} fillOpacity={1} fill="url(#gradSalidas)" name="Salidas" />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Gráficas Complementarias: Distribución Vehicular vs Peatonal & Top Empresas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Donut Chart: Tipo de Acceso */}
            <div
              id="chart-modalidad-accesos"
              data-chart-title="Modalidad de Acceso"
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-[#0D6E5F]" />
                  Modalidad de Acceso
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Vehicular vs Peatonal en el periodo</p>
              </div>

              <div className="h-[200px] w-full my-2 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartAnalytics.dataPieTipo}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartAnalytics.dataPieTipo.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any, name: any) => [`${val} accesos`, name]}
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                  <span className="w-3 h-3 rounded-full bg-[#0D6E5F]"></span>
                  <div>
                    <div className="font-semibold text-slate-800">Vehicular</div>
                    <div className="text-[11px] text-slate-500 font-mono font-bold">{chartAnalytics.totalVehicular} registros</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
                  <span className="w-3 h-3 rounded-full bg-[#0284C7]"></span>
                  <div>
                    <div className="font-semibold text-slate-800">Peatonal</div>
                    <div className="text-[11px] text-slate-500 font-mono font-bold">{chartAnalytics.totalPeatonal} registros</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top 5 Empresas con Mayor Volumen */}
            <div
              id="chart-top-empresas"
              data-chart-title="Top Empresas con Mayor Actividad"
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs lg:col-span-2 flex flex-col justify-between"
            >
              <div>
                <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0D6E5F]" />
                  Top Empresas con Mayor Actividad
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Empresas con mayor volumen de entradas y salidas</p>
              </div>

              <div className="h-[220px] w-full pt-3">
                {chartAnalytics.topEmpresasData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                    Sin registros de empresas en el periodo seleccionado.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={chartAnalytics.topEmpresasData}
                      margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11, fill: '#334155' }}
                        width={130}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.75rem', color: '#fff', fontSize: '12px' }}
                        formatter={(val: any) => [`${val} movimientos`, 'Accesos']}
                      />
                      <Bar dataKey="count" fill="#1A9980" radius={[0, 6, 6, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* 2. SUB-PESTAÑA: RECUENTO DE LAS ÚLTIMAS 10 ENTRADAS / SALIDAS           */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'ultimos10' && (
        <div className="space-y-6">
          {/* Banner Resumen de los 10 movimientos */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#0D6E5F]" />
                Flujo Cronológico Reciente (Últimos Movimientos)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Seguimiento en vivo de las operaciones de entrada y salida procesadas en caseta ({allAccesosDataset.length} registros totales en PostgreSQL)
              </p>
            </div>

            {/* Filtros rápidos dentro de los movimientos */}
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
              <button
                onClick={() => setFiltroTipo10('todos')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${filtroTipo10 === 'todos' ? 'bg-[#0D6E5F] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                Todos ({metricasMovimientos.total})
              </button>
              <button
                onClick={() => setFiltroTipo10('entradas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${filtroTipo10 === 'entradas' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400" />
                Entradas ({metricasMovimientos.entradas})
              </button>
              <button
                onClick={() => setFiltroTipo10('salidas')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${filtroTipo10 === 'salidas' ? 'bg-sky-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-sky-400" />
                Salidas ({metricasMovimientos.salidas})
              </button>
            </div>
          </div>

          {/* Tarjetas Visuales de los Movimientos Recientes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ultimosMovimientosCards.length === 0 ? (
              <div className="col-span-2 bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                No hay movimientos registrados en la base de datos de caseta.
              </div>
            ) : (
              ultimosMovimientosCards.map((mov, idx) => {
                const isEntrada = mov.tipoMovimiento === 'ENTRADA';
                return (
                  <div
                    key={mov.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-md hover:border-slate-300 transition-all space-y-3"
                  >
                    {/* Header de la Tarjeta con Badges */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold tracking-wider ${isEntrada
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-sky-50 text-sky-800 border border-sky-200'
                            }`}
                        >
                          {isEntrada ? (
                            <>
                              <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600" />
                              <span>ENTRADA REGISTRADA</span>
                            </>
                          ) : (
                            <>
                              <ArrowUpRight className="w-3.5 h-3.5 text-sky-600" />
                              <span>SALIDA REGISTRADA</span>
                            </>
                          )}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-900 font-mono">
                          {mov.hora}
                        </span>
                        <div className="text-[10px] text-slate-400 font-medium">
                          {mov.fecha}
                        </div>
                      </div>
                    </div>

                    {/* Información Principal: Conductor, Empresa, Placas */}
                    <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-100 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5 text-[#0D6E5F]" />
                            <span>{mov.conductor}</span>
                          </div>
                          <div className="text-[11px] text-slate-600 flex items-center gap-1.5 mt-0.5">
                            <Building2 className="w-3 h-3 text-slate-400" />
                            <span className="truncate max-w-[220px]" title={mov.empresaNombre}>
                              {mov.empresaNombre}
                            </span>
                          </div>
                        </div>

                        {/* Placa o Badge Peatonal */}
                        <div className="text-right">
                          {mov.tipoAcceso === 'Peatonal' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              Peatonal
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-200 text-slate-900">
                              {mov.placas}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Detalles secundarios: Corbatín, Pasajeros, Destino */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-[11px] text-slate-600">
                        <div>
                          <span className="text-slate-400">Corbatín: </span>
                          <span className="font-bold text-[#0D6E5F]">{mov.corbatinNum}</span>
                        </div>
                        <div>
                          <span className="text-slate-400">Pasajeros: </span>
                          <span className="font-semibold text-slate-700">
                            {mov.num_pasajeros > 0 ? `+${mov.num_pasajeros} extra` : 'Solo'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Footer: Guardia y Destino */}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                      <div className="truncate max-w-[240px]" title={mov.trabajos}>
                        <span className="font-semibold text-slate-600">Destino: </span>
                        {mov.trabajos}
                      </div>
                      <div className="text-[10px] text-slate-400 shrink-0 font-medium">
                        {mov.guardiaNombre}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Tabla Desglosada Completa */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                Tabla Detallada de Operaciones de Caseta
              </h4>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500 font-mono">
                  {movimientosFiltrados.length} registros listados
                </span>
                <button
                  onClick={handleExportarExcel}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto max-h-[530px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-slate-50 z-10 shadow-xs">
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="text-center px-3 py-3 w-12">#</th>
                    <th className="text-left px-3 py-3">Movimiento</th>
                    <th className="text-left px-3 py-3">Fecha y Hora</th>
                    <th className="text-left px-3 py-3">Empresa</th>
                    <th className="text-left px-3 py-3">Conductor</th>
                    <th className="text-center px-3 py-3">Placas / Modalidad</th>
                    <th className="text-center px-3 py-3">Corbatín</th>
                    <th className="text-left px-3 py-3">Destino / Trabajo</th>
                    <th className="text-left px-3 py-3">Oficial</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {movimientosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-5 py-8 text-center text-xs text-slate-500">
                        No hay movimientos registrados en la base de datos de caseta.
                      </td>
                    </tr>
                  ) : (
                    movimientosFiltrados.map((mov, idx) => (
                      <tr key={mov.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold ${mov.tipoMovimiento === 'ENTRADA'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-800'
                              }`}
                          >
                            {mov.tipoMovimiento === 'ENTRADA' ? (
                              <ArrowDownRight className="w-3 h-3" />
                            ) : (
                              <ArrowUpRight className="w-3 h-3" />
                            )}
                            {mov.tipoMovimiento}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-mono text-slate-700">
                          <span className="font-bold">{mov.hora}</span>
                          <span className="text-slate-400 block text-[10px]">{mov.fecha}</span>
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-900 truncate max-w-[180px]" title={mov.empresaNombre}>
                          {mov.empresaNombre}
                        </td>
                        <td className="px-3 py-2.5 text-slate-800 font-medium">
                          {mov.conductor}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                            {mov.placas}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center font-mono font-bold text-[#0D6E5F]">
                          {mov.corbatinNum}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600 truncate max-w-[200px]" title={mov.trabajos}>
                          {mov.trabajos}
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 text-[11px]">
                          {mov.guardiaNombre}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════ */}
      {/* 3. SUB-PESTAÑA: HISTORIAL DE RESOLUCIONES Y SANCIONES                   */}
      {/* ════════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === 'sanciones' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-[#0D6E5F]" />
                Historial de Resoluciones y Medidas Disciplinarias
              </h3>
              <p className="text-xs text-slate-500">
                Dictámenes de comités HOA, apelaciones atendidas y suspensiones vehiculares registradas en PostgreSQL
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Buscar por folio, placas, empresa..."
                  value={searchSanciones}
                  onChange={e => setSearchSanciones(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 w-52 sm:w-64"
                />
              </div>

              <select
                value={filtroEstatusSancion}
                onChange={e => setFiltroEstatusSancion(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="todos">Todos los estatus</option>
                <option value="activa">Activa</option>
                <option value="ratificada">Ratificada</option>
                <option value="aclarada">Aclarada</option>
                <option value="cumplida">Cumplida</option>
                <option value="en apelación">En Apelación</option>
              </select>

              <button
                onClick={handleExportarExcel}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors cursor-pointer"
                title="Exportar sanciones a Excel"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto max-h-[460px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-slate-50 z-10 shadow-xs">
                  <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                    {['Folio', 'Fecha', 'Empresa', 'Placas', 'Falta', 'Resolución / Dictamen', 'Estatus'].map(h => (
                      <th key={h} className="text-left px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sancionesFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-5 py-12 text-center text-xs text-slate-500">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                        Sin historial de sanciones o resoluciones que coincidan con la búsqueda.
                      </td>
                    </tr>
                  ) : (
                    sancionesFiltradas.map(s => (
                      <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3 font-mono font-bold text-xs text-slate-800">{s.id}</td>
                        <td className="px-5 py-3 text-xs text-slate-500">{s.fecha}</td>
                        <td className="px-5 py-3 text-xs font-semibold text-slate-900">{s.empresaNombre}</td>
                        <td className="px-5 py-3 text-xs font-mono font-bold text-slate-800">{s.placas}</td>
                        <td className="px-5 py-3 text-xs text-slate-700">{s.tipo}</td>
                        <td className="px-5 py-3 text-xs text-slate-600">
                          {s.apelacion?.dictamenSupervisor || s.medidaDisciplinaria || 'Dictamen oficial emitido'}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${s.status === 'Activa' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                              s.status === 'Ratificada' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                                s.status === 'Aclarada' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                  s.status === 'Cumplida' ? 'bg-slate-100 text-slate-700 border border-slate-200' :
                                    'bg-sky-100 text-sky-800 border border-sky-200'
                            }`}>
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupervisorHistorial;
