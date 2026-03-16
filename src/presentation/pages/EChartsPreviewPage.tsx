/**
 * EChartsPreviewPage
 *
 * Complete replica of MockDashboardTestPage but using ECharts (Canvas)
 * instead of Recharts (SVG) for all chart components.
 * Route: /echarts-preview
 */
import { useState, useMemo, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { FaixaEtariaTable } from '@ui/components/dashboard/FaixaEtariaTable';
import { ProcedimentoTable } from '@ui/components/dashboard/ProcedimentoTable';
import { AnaliticoPacientes } from '@ui/components/dashboard/AnaliticoPacientes';
import { TabKpiStrip } from '@ui/components/dashboard/TabKpiStrip';
import { DashboardCardHeader } from '@ui/components/dashboard/DashboardCardHeader';
import { Badge } from '@ui/components/ui/badge';
import { Card, CardContent } from '@ui/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/components/ui/table';
import { Building2, MapPin, Home, Clock, Users, BarChart3, Filter, ChevronUp, Eye, TrendingUp, Layers } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AggregationResult, Faturamento } from '@domain/models/faturamento';
import { type MetricKey, ALL_METRICS, METRIC_COLORS } from '@domain/models/metricKey';

// ── Helpers ───────────────────────────────────────────────────────────

const fmt = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

const fmtAxisK = (val: number) => `R$${val / 1000}k`;

const MONTH_NAMES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const;

const FAIXA_LABELS = ['0-18', '19-40', '41-60', '61-80', '80+'] as const;
const FAIXA_DESC: Record<string, string> = { '0-18': 'Pediátrico', '19-40': 'Adulto Jovem', '41-60': 'Adulto', '61-80': 'Idoso', '80+': 'Idoso Avançado' };

// ── Seed-based pseudo-random (deterministic) ──────────────────────────

function seededRand(seed: number) {
  let s = seed;
  return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
}

// ── Generate mock data ────────────────────────────────────────────────

const NOMES = [
  'Maria da Silva', 'João Oliveira', 'Ana Santos', 'Carlos Pereira',
  'Francisca Lima', 'Antônio Costa', 'Juliana Souza', 'Pedro Almeida',
  'Mariana Nascimento', 'Roberto Araújo', 'Beatriz Fernandes', 'José Martins',
  'Camila Rodrigues', 'Lucas Barbosa', 'Patrícia Ribeiro', 'Fernando Gomes',
  'Luciana Carvalho', 'Ricardo Mendes', 'Débora Rocha', 'Marcos Moreira',
  'Renata Dias', 'Gustavo Pinto', 'Fernanda Lopes', 'Thiago Correia',
  'Aline Nunes', 'Vinícius Teixeira', 'Paula Azevedo', 'Daniel Cardoso',
  'Tatiana Cruz', 'Marcelo Ramos', 'Bianca Melo', 'Leandro Ferreira',
  'Isabela Monteiro', 'Rafael Duarte', 'Priscila Vieira', 'Sérgio Borges',
  'Vanessa Freitas', 'Alexandre Campos', 'Simone Reis', 'Rodrigo Cunha',
];

const OPERADORA_NOMES = ['UNIMED', 'BRADESCO SAÚDE', 'AMIL', 'SULAMÉRICA', 'CASSI'];
const MUNICIPIO_NOMES = ['Rio de Janeiro', 'Niterói', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Petrópolis', 'Campos dos Goytacazes'];
const STATUS_NOMES = ['Internação', 'Alta', 'Internação', 'Alta', 'Internação', 'Óbito', 'Ouvidoria'];
const ACOMOD_NOMES = ['Internação Domiciliar (ID)', 'Atendimento Domiciliar (AD)'];
const PACOTE_LABELS = ['3H', '6H', '9H', '12H', '24H'];
const PROCEDIMENTO_NOMES = [
  'Fisioterapia Motora', 'Fisioterapia Respiratória', 'Fonoaudiologia',
  'Terapia Ocupacional', 'Enfermagem 24h', 'Nutrição Clínica', 'Psicologia', 'Assistência Social',
];
const YEARS = [2023, 2024];

const MOCK_PACIENTES: Faturamento[] = (() => {
  const rand = seededRand(42);
  const records: Faturamento[] = [];
  for (const ano of YEARS) {
    for (let i = 0; i < NOMES.length; i++) {
      const nMonths = 1 + Math.floor(rand() * 3);
      for (let m = 0; m < nMonths; m++) {
        const mes = 1 + Math.floor(rand() * 12);
        records.push({
          mes: String(mes), ano, quantidade: 1,
          valorTotal: 8_000 + Math.round(rand() * 45_000),
          valorGlosado: 500 + Math.round(rand() * 4_500),
          custo: 4_500 + Math.round(rand() * 28_000),
          municipio: MUNICIPIO_NOMES[i % MUNICIPIO_NOMES.length],
          operadora: OPERADORA_NOMES[i % OPERADORA_NOMES.length],
          sexo: i % 2 === 0 ? 'F' : 'M',
          procedimento: PROCEDIMENTO_NOMES[i % PROCEDIMENTO_NOMES.length],
          acomodacao: ACOMOD_NOMES[i % ACOMOD_NOMES.length],
          pacoteHoras: PACOTE_LABELS[i % PACOTE_LABELS.length],
          faixaEtaria: FAIXA_LABELS[i % FAIXA_LABELS.length],
          pacienteId: `PCX-${String(1000 + i)}`,
          tipoAssistencia: 'AD',
          statusPaciente: STATUS_NOMES[i % STATUS_NOMES.length],
          nomePaciente: NOMES[i],
        });
      }
    }
  }
  return records;
})();

// ── Aggregation utilities ─────────────────────────────────────────────

function aggregateByKey(data: Faturamento[], key: keyof Faturamento): AggregationResult[] {
  const map = new Map<string, { venda: number; custo: number; glosa: number; count: number }>();
  for (const r of data) {
    const k = String(r[key]);
    const cur = map.get(k) ?? { venda: 0, custo: 0, glosa: 0, count: 0 };
    cur.venda += r.valorTotal;
    cur.custo += r.custo;
    cur.glosa += r.valorGlosado;
    cur.count += 1;
    map.set(k, cur);
  }
  return Array.from(map.entries()).map(([name, v]) => ({
    name, Venda: v.venda, Custo: v.custo, Glosa: v.glosa, count: v.count, Resultado: v.venda - v.custo,
  }));
}

function monthlyAggregate(data: Faturamento[]): AggregationResult[] {
  const map = new Map<string, { venda: number; custo: number; glosa: number }>();
  for (const r of data) {
    const key = `${MONTH_NAMES[Number(r.mes) - 1]}/${String(r.ano).slice(2)}`;
    const cur = map.get(key) ?? { venda: 0, custo: 0, glosa: 0 };
    cur.venda += r.valorTotal;
    cur.custo += r.custo;
    cur.glosa += r.valorGlosado;
    map.set(key, cur);
  }
  const entries = Array.from(map.entries());
  entries.sort((a, b) => {
    const [mA, yA] = a[0].split('/');
    const [mB, yB] = b[0].split('/');
    const idxA = MONTH_NAMES.indexOf(mA as typeof MONTH_NAMES[number]);
    const idxB = MONTH_NAMES.indexOf(mB as typeof MONTH_NAMES[number]);
    return Number(yA) - Number(yB) || idxA - idxB;
  });
  return entries.map(([name, v]) => ({ name, Venda: v.venda, Custo: v.custo, Glosa: v.glosa }));
}

function faixaEtariaAggregate(data: Faturamento[]): AggregationResult[] {
  const total = data.length || 1;
  return aggregateByKey(data, 'faixaEtaria').map(r => ({
    ...r,
    description: FAIXA_DESC[r.name] ?? '',
    percent: ((r.count ?? 0) / total) * 100,
  }));
}

// ── Filter types ──────────────────────────────────────────────────────

type FilterMode = 'all' | 'full-year' | 'single-month' | 'month-range' | 'year-range';

interface TimeFilter {
  mode: FilterMode;
  year: number;
  month: number;
  yearEnd: number;
  monthEnd: number;
}



function applyFilter(data: Faturamento[], filter: TimeFilter): Faturamento[] {
  switch (filter.mode) {
    case 'all': return data;
    case 'full-year': return data.filter(r => r.ano === filter.year);
    case 'single-month': return data.filter(r => r.ano === filter.year && Number(r.mes) === filter.month);
    case 'month-range': {
      const start = filter.year * 100 + filter.month;
      const end = filter.yearEnd * 100 + filter.monthEnd;
      return data.filter(r => { const v = r.ano * 100 + Number(r.mes); return v >= start && v <= end; });
    }
    case 'year-range': return data.filter(r => r.ano >= filter.year && r.ano <= filter.yearEnd);
  }
}

function periodLabel(filter: TimeFilter): { label: string; isFullYear: boolean } {
  switch (filter.mode) {
    case 'all': return { label: '2023 — 2024', isFullYear: true };
    case 'full-year': return { label: `Ano ${filter.year}`, isFullYear: true };
    case 'single-month': return { label: `${MONTH_NAMES[filter.month - 1]}/${filter.year}`, isFullYear: false };
    case 'month-range': return { label: `${MONTH_NAMES[filter.month - 1]}/${filter.year} — ${MONTH_NAMES[filter.monthEnd - 1]}/${filter.yearEnd}`, isFullYear: false };
    case 'year-range': return { label: `${filter.year} — ${filter.yearEnd}`, isFullYear: true };
  }
}

// ── Colors ────────────────────────────────────────────────────────────

const BAR_COLORS = {
  Faturado: '#2563eb',
  Custo: '#10b981',
  Bruto: '#7c3aed',
  Líquido: '#0891b2',
  Glosa: '#ea580c',
} as const;

const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

// ── Responsive scroll wrapper ─────────────────────────────────────────

const MIN_CHART_WIDTH = 700;

function ScrollableChart({ children, height, minWidth = MIN_CHART_WIDTH }: { children: React.ReactNode; height: string; minWidth?: number }) {
  return (
    <div className={`overflow-x-auto ${height}`}>
      <div style={{ minWidth }} className="h-full">
        {children}
      </div>
    </div>
  );
}

// ── ECharts: Bar Chart ────────────────────────────────────────────────
// Custom renderItem series replicates the Recharts makeBarLabel approach
// for pixel-perfect label centering under each bar.

function EBarChart({ data, title, icon, visibleMetrics }: { data: AggregationResult[]; title: string; icon: LucideIcon; visibleMetrics: Set<MetricKey> }) {
  const enriched = data.map(r => ({ ...r, Bruto: (r.Venda ?? 0) - (r.Custo ?? 0), Líquido: (r.Venda ?? 0) - (r.Custo ?? 0) - (r.Glosa ?? 0) }));
  const vis = (k: MetricKey) => visibleMetrics.has(k);

  const metrics: { key: string; name: MetricKey; color: string }[] = [
    { key: 'Venda', name: 'Faturado', color: BAR_COLORS.Faturado },
    { key: 'Custo', name: 'Custo', color: BAR_COLORS.Custo },
    { key: 'Bruto', name: 'Bruto', color: BAR_COLORS.Bruto },
    { key: 'Líquido', name: 'Líquido', color: BAR_COLORS['Líquido'] },
    { key: 'Glosa', name: 'Glosa', color: BAR_COLORS.Glosa },
  ];

  const activeMetrics = metrics.filter(m => vis(m.name));

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis' as const,
      axisPointer: { type: 'shadow' as const },
      formatter: (params: Array<{ seriesName: string; value: number; marker: string }>) =>
        params.filter(p => p.seriesName && !p.seriesName.startsWith('_label'))
          .map(p => `${p.marker} ${p.seriesName}: ${fmt(p.value)}`).join('<br/>'),
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: { fontSize: 11, color: '#64748b' },
      itemWidth: 10, itemHeight: 10,
      itemGap: 16,
      // Hide the label helper series from legend
      data: activeMetrics.map(m => m.name),
    },
    grid: { top: 15, right: 20, bottom: 135, left: 70, containLabel: false },
    xAxis: {
      type: 'category' as const,
      data: enriched.map(d => d.name),
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#94a3b8', interval: 0, margin: 70 },
    },
    yAxis: {
      type: 'value' as const,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { fontSize: 11, color: '#94a3b8', formatter: fmtAxisK },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
    },
    series: [
      // Bar series (no labels — labels handled by custom series below)
      ...activeMetrics.map(m => ({
        name: m.name,
        type: 'bar' as const,
        data: enriched.map(d => (d as Record<string, unknown>)[m.key] as number),
        itemStyle: { color: m.color, borderRadius: [3, 3, 0, 0] },
        barGap: '10%',
        barCategoryGap: '20%',
      })),
      // Custom series to render rotated labels below each bar, pixel-perfect
      {
        name: '_labels',
        type: 'custom' as const,
        data: enriched.flatMap((d, catIdx) =>
          activeMetrics.map((m, metricIdx) => [catIdx, (d as Record<string, unknown>)[m.key] as number, metricIdx])
        ),
        renderItem: (_params: unknown, api: {
          value: (dim: number) => number;
          coord: (val: [number, number]) => [number, number];
          size: (val: [number, number]) => [number, number];
        }) => {
          const catIdx = api.value(0);
          const val = api.value(1);
          const metricIdx = api.value(2);
          if (!val) return { type: 'group', children: [] };

          const metric = activeMetrics[metricIdx];
          if (!metric) return { type: 'group', children: [] };

          // Get the baseline position (value = 0)
          const baseCoord = api.coord([catIdx, 0]);
          // Get the category width
          const catSize = api.size([1, 0]);
          const catWidth = catSize[0];

          // Calculate individual bar position within the group
          const totalBars = activeMetrics.length;
          const barGapRatio = 0.1;
          const catGapRatio = 0.2;
          const usableWidth = catWidth * (1 - catGapRatio);
          const totalGapWidth = usableWidth * barGapRatio * (totalBars - 1) / totalBars;
          const barWidth = (usableWidth - totalGapWidth) / totalBars;
          const groupStart = baseCoord[0] - usableWidth / 2;
          const barX = groupStart + metricIdx * (barWidth + totalGapWidth / Math.max(totalBars - 1, 1));
          const cx = barX + barWidth / 2;
          const by = baseCoord[1] + 14;

          return {
            type: 'text',
            x: cx,
            y: by,
            rotation: -Math.PI / 4, // 45° clockwise — text descends left→right
            style: {
              text: fmt(val),
              fill: metric.color,
              fontSize: 9,
              fontWeight: 700,
              textAlign: 'left',
              textVerticalAlign: 'middle',
            },
          };
        },
        z: 10,
        silent: true,
      },
    ],
  }), [enriched, visibleMetrics]);

  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
      <DashboardCardHeader icon={icon} title={title} description="Faturado · Custo · Bruto · Líquido · Glosa" />
      <CardContent className="h-[520px] pb-6">
        <ScrollableChart height="h-full" minWidth={1100}>
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
        </ScrollableChart>
      </CardContent>
    </Card>
  );
}

// ── ECharts: Area Chart ───────────────────────────────────────────────
// Item 3: explicit itemStyle.color + more spacing

function EAreaChart({ data, visibleMetrics }: { data: AggregationResult[]; visibleMetrics: Set<MetricKey> }) {
  const enriched = data.map(r => ({
    ...r,
    Bruto: (r.Venda ?? 0) - (r.Custo ?? 0),
    Líquido: (r.Venda ?? 0) - (r.Custo ?? 0) - (r.Glosa ?? 0),
  }));
  const vis = (k: MetricKey) => visibleMetrics.has(k);

  const metrics = [
    { key: 'Venda', name: 'Faturado' as MetricKey, color: '#2563eb' },
    { key: 'Custo', name: 'Custo' as MetricKey, color: '#10b981' },
    { key: 'Bruto', name: 'Bruto' as MetricKey, color: '#7c3aed' },
    { key: 'Líquido', name: 'Líquido' as MetricKey, color: '#0891b2' },
    { key: 'Glosa', name: 'Glosa' as MetricKey, color: '#ea580c' },
  ] as const;

  const option = useMemo(() => ({
    tooltip: {
      trigger: 'axis' as const,
      formatter: (params: Array<{ seriesName: string; value: number; marker: string }>) =>
        params.map(p => `${p.marker} ${p.seriesName}: ${fmt(p.value)}`).join('<br/>'),
    },
    legend: {
      bottom: 0,
      icon: 'circle',
      textStyle: { fontSize: 11, color: '#64748b' },
      itemWidth: 10, itemHeight: 10,
      itemGap: 16,
    },
    grid: { top: 20, right: 20, bottom: 50, left: 70, containLabel: false },
    xAxis: {
      type: 'category' as const,
      data: enriched.map(d => d.name),
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { fontSize: 12, color: '#94a3b8' },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value' as const,
      axisLine: { show: false }, axisTick: { show: false },
      axisLabel: { fontSize: 12, color: '#94a3b8', formatter: fmtAxisK },
      splitLine: { lineStyle: { color: '#f1f5f9', type: 'dashed' as const } },
    },
    series: metrics.filter(m => vis(m.name)).map(m => ({
      name: m.name,
      type: 'line' as const,
      smooth: true,
      symbol: 'none',
      color: m.color,
      itemStyle: { color: m.color },
      lineStyle: { width: 2, color: m.color },
      areaStyle: {
        color: {
          type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: m.color + '26' },
            { offset: 1, color: m.color + '00' },
          ],
        },
      },
      data: enriched.map(d => (d as Record<string, unknown>)[m.key] as number),
    })),
  }), [enriched, visibleMetrics]);

  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
      <DashboardCardHeader icon={TrendingUp} title="Faturamento Mensal" description="Faturado · Custo · Bruto · Líquido · Glosa" />
      <CardContent className="h-[360px] px-4 pb-4 pt-2">
        <ScrollableChart height="h-full">
          <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
        </ScrollableChart>
      </CardContent>
    </Card>
  );
}

// ── ECharts: Pie Chart ────────────────────────────────────────────────

function EPieChart({ data, title }: { data: { name: string; value: number }[]; title: string }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const option = useMemo(() => ({
    tooltip: {
      trigger: 'item' as const,
      formatter: (p: { name: string; value: number; percent: number; marker: string }) =>
        `${p.marker} ${p.name}: ${fmt(p.value)} (${p.percent.toFixed(1)}%)`,
    },
    legend: {
      orient: 'horizontal' as const,
      bottom: 0,
      left: 'center',
      icon: 'circle',
      textStyle: { fontSize: 11, color: '#64748b' },
      itemWidth: 10, itemHeight: 10,
      itemGap: 14,
      formatter: (name: string) => {
        const item = data.find(d => d.name === name);
        if (!item) return name;
        const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
        return `${name}  ${fmt(item.value)} (${pct}%)`;
      },
    },
    series: [{
      type: 'pie' as const,
      radius: ['40%', '62%'],
      center: ['50%', '35%'],
      padAngle: 3,
      itemStyle: { borderRadius: 4 },
      label: {
        show: true, position: 'outside' as const,
        formatter: (p: { percent: number }) => p.percent > 3 ? `${p.percent.toFixed(1)}%` : '',
        fontSize: 11, color: '#64748b',
      },
      labelLine: { show: true, length: 10, length2: 15 },
      data: data.map((d, i) => ({
        name: d.name, value: d.value,
        itemStyle: { color: PIE_COLORS[i % PIE_COLORS.length] },
      })),
    }],
  }), [data, total]);

  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm">
      <DashboardCardHeader icon={Layers} title={title} />
      <CardContent className="h-[440px] pt-4 pb-6">
        <ReactECharts option={option} style={{ height: '100%', width: '100%' }} notMerge />
      </CardContent>
    </Card>
  );
}

// ── Detail Table ──────────────────────────────────────────────────────

function DetailTable({ data, title, icon, columnLabel, period, isFullYear, visibleMetrics }: { data: AggregationResult[]; title: string; icon: LucideIcon; columnLabel: string; period: string; isFullYear: boolean; visibleMetrics: Set<MetricKey> }) {
  const tv = data.reduce((a, r) => a + (r.Venda ?? 0), 0);
  const tc = data.reduce((a, r) => a + (r.Custo ?? 0), 0);
  const tg = data.reduce((a, r) => a + (r.Glosa ?? 0), 0);
  const tb = tv - tc;
  const tl = tb - tg;
  const vis = (k: MetricKey) => visibleMetrics.has(k);
  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
      <DashboardCardHeader icon={icon} title={title} period={period} isFullYear={isFullYear} />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="hover:bg-transparent border-b border-zinc-200">
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">{columnLabel}</TableHead>
              {vis('Faturado') && <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Faturado</TableHead>}
              {vis('Custo') && <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Custo</TableHead>}
              {vis('Bruto') && <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Bruto</TableHead>}
              {vis('Líquido') && <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Líquido</TableHead>}
              {vis('Glosa') && <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Glosa</TableHead>}
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">% do Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => {
              const v = row.Venda ?? 0, c = row.Custo ?? 0, g = row.Glosa ?? 0;
              const b = v - c, l = b - g;
              return (
                <TableRow key={i} className="hover:bg-zinc-50 border-b border-zinc-100 last:border-0">
                  <TableCell className="font-medium text-zinc-800">{row.name}</TableCell>
                  {vis('Faturado') && <TableCell className="text-right text-zinc-700">{fmt(v)}</TableCell>}
                  {vis('Custo') && <TableCell className="text-right text-emerald-700 font-medium">{fmt(c)}</TableCell>}
                  {vis('Bruto') && <TableCell className={`text-right font-semibold ${b >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>{fmt(b)}</TableCell>}
                  {vis('Líquido') && <TableCell className={`text-right font-semibold ${l >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>{fmt(l)}</TableCell>}
                  {vis('Glosa') && <TableCell className="text-right text-orange-600 font-medium">{fmt(g)}</TableCell>}
                  <TableCell className="text-right text-zinc-500">{tv > 0 ? ((v / tv) * 100).toFixed(1) : '0'}%</TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-zinc-100 border-t-2 border-zinc-300 font-bold">
              <TableCell className="text-zinc-900">Total</TableCell>
              {vis('Faturado') && <TableCell className="text-right text-zinc-900">{fmt(tv)}</TableCell>}
              {vis('Custo') && <TableCell className="text-right text-emerald-700">{fmt(tc)}</TableCell>}
              {vis('Bruto') && <TableCell className={`text-right font-bold ${tb >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>{fmt(tb)}</TableCell>}
              {vis('Líquido') && <TableCell className={`text-right font-bold ${tl >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>{fmt(tl)}</TableCell>}
              {vis('Glosa') && <TableCell className="text-right text-orange-600">{fmt(tg)}</TableCell>}
              <TableCell className="text-right text-zinc-700">100%</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────

const selectClass = 'h-8 rounded-md border border-zinc-300 bg-white px-2 text-xs font-medium text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

function TimeFilterBar({ filter, onChange, visibleMetrics, onToggleMetric }: { filter: TimeFilter; onChange: (f: TimeFilter) => void; visibleMetrics: Set<MetricKey>; onToggleMetric: (k: MetricKey) => void }) {
  const set = (patch: Partial<TimeFilter>) => onChange({ ...filter, ...patch });

  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm">
      <CardContent className="p-2 sm:p-3">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Período</span>
          </div>
          <select className={selectClass} value={filter.mode} onChange={e => set({ mode: e.target.value as TimeFilter['mode'] })}>
            <option value="full-year">Ano Inteiro</option>
            <option value="single-month">Mês Único</option>
            <option value="month-range">Intervalo de Meses</option>
            <option value="year-range">Intervalo de Anos</option>
          </select>
          {(filter.mode === 'full-year' || filter.mode === 'single-month') && (
            <select className={selectClass} value={filter.year} onChange={e => set({ year: Number(e.target.value) })}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}
          {filter.mode === 'single-month' && (
            <select className={selectClass} value={filter.month} onChange={e => set({ month: Number(e.target.value) })}>
              {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          )}
          {filter.mode === 'month-range' && (
            <>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">De</span>
              <select className={selectClass} value={filter.month} onChange={e => set({ month: Number(e.target.value) })}>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select className={selectClass} value={filter.year} onChange={e => set({ year: Number(e.target.value) })}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Até</span>
              <select className={selectClass} value={filter.monthEnd} onChange={e => set({ monthEnd: Number(e.target.value) })}>
                {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
              </select>
              <select className={selectClass} value={filter.yearEnd} onChange={e => set({ yearEnd: Number(e.target.value) })}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}
          {filter.mode === 'year-range' && (
            <>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">De</span>
              <select className={selectClass} value={filter.year} onChange={e => set({ year: Number(e.target.value) })}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="text-[10px] font-bold text-zinc-400 uppercase">Até</span>
              <select className={selectClass} value={filter.yearEnd} onChange={e => set({ yearEnd: Number(e.target.value) })}>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}
          <Badge variant="secondary" className="hidden sm:inline-flex ml-auto bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2 h-6 text-[10px]">
            {periodLabel(filter).label}
          </Badge>
        </div>

        {/* Metric toggles */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-zinc-100">
          <div className="flex items-center gap-2 text-zinc-500">
            <Eye size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Métricas</span>
          </div>
          {ALL_METRICS.map(metric => {
            const active = visibleMetrics.has(metric);
            const color = METRIC_COLORS[metric];
            return (
              <button
                key={metric} type="button" onClick={() => onToggleMetric(metric)}
                className="flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer"
                style={active
                  ? { backgroundColor: color + '18', borderColor: color, color }
                  : { backgroundColor: 'transparent', borderColor: '#d4d4d8', color: '#a1a1aa' }
                }
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: active ? color : '#d4d4d8' }} />
                {metric}
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────

export function EChartsPreviewPage() {
  const [filter, setFilter] = useState<TimeFilter>({
    mode: 'all', year: 2024, month: 1, yearEnd: 2024, monthEnd: 12,
  });

  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricKey>>(() => new Set(ALL_METRICS));
  const toggleMetric = (key: MetricKey) =>
    setVisibleMetrics(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); } else { next.add(key); }
      return next;
    });

  const filtered = useMemo(() => applyFilter(MOCK_PACIENTES, filter), [filter]);
  const { label: period, isFullYear } = periodLabel(filter);

  const monthly = useMemo(() => monthlyAggregate(filtered), [filtered]);
  const operadoras = useMemo(() => aggregateByKey(filtered, 'operadora'), [filtered]);
  const procedimentos = useMemo(() => aggregateByKey(filtered, 'procedimento'), [filtered]);
  const municipios = useMemo(() => aggregateByKey(filtered, 'municipio'), [filtered]);
  const acomodacao = useMemo(() => aggregateByKey(filtered, 'acomodacao'), [filtered]);
  const pacoteHoras = useMemo(() => aggregateByKey(filtered, 'pacoteHoras'), [filtered]);
  const sexo = useMemo(() => aggregateByKey(filtered, 'sexo'), [filtered]);
  const faixaEtaria = useMemo(() => faixaEtariaAggregate(filtered), [filtered]);

  const totalVenda = filtered.reduce((a, r) => a + r.valorTotal, 0);
  const totalCusto = filtered.reduce((a, r) => a + r.custo, 0);
  const totalGlosa = filtered.reduce((a, r) => a + r.valorGlosado, 0);
  const bruto = totalVenda - totalCusto;
  const liquido = bruto - totalGlosa;
  const nMes = new Set(filtered.map(r => `${r.ano}-${r.mes}`)).size || 1;
  const nPac = new Set(filtered.map(r => r.pacienteId)).size || 1;

  const totals = { venda: totalVenda, custo: totalCusto, bruto, liquido, glosa: totalGlosa };

  const [showTop, setShowTop] = useState(false);
  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="space-y-6" id="page-top">

      {/* ── Print-only report header ───────────────────────────────── */}
      <div data-print-header>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 leading-none">Healthmais Analytics</h1>
          <p className="text-xs text-zinc-500">Dashboard ECharts · Dados de Teste</p>
        </div>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-3 h-6 text-xs ml-auto">
          Período: {period}
        </Badge>
      </div>

      {/* ── Filter ──────────────────────────────────────────────────── */}
      <div data-no-print>
        <TimeFilterBar filter={filter} onChange={setFilter} visibleMetrics={visibleMetrics} onToggleMetric={toggleMetric} />
      </div>

      {/* ── KPIs ────────────────────────────────────────────────────── */}
      <div id="kpis" className="scroll-mt-16" data-print-card>
        <TabKpiStrip
          totals={totals}
          monthlyAverages={filter.mode !== 'single-month' ? { venda: totals.venda / nMes, custo: totals.custo / nMes, bruto: totals.bruto / nMes, liquido: totals.liquido / nMes, glosa: totals.glosa / nMes } : undefined}
          patientAverages={{ venda: totals.venda / nPac, custo: totals.custo / nPac, bruto: totals.bruto / nPac, liquido: totals.liquido / nPac, glosa: totals.glosa / nPac }}
          currencyFormatter={fmt}
          visibleMetrics={visibleMetrics}
        />
      </div>

      {/* ── Faturamento Mensal ──────────────────────────────────────── */}
      <div id="faturamento" className="scroll-mt-16" data-print-card>
        <EAreaChart data={monthly} visibleMetrics={visibleMetrics} />
      </div>

      {/* ── Procedimentos ──────────────────────────────────────────── */}
      <div id="procedimentos" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <EBarChart data={procedimentos} title="Valor por Tipo de Procedimento" icon={Layers} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-table>
          <ProcedimentoTable data={procedimentos} currencyFormatter={fmt} period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Operadoras ─────────────────────────────────────────────── */}
      <div id="operadoras" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <EBarChart data={operadoras} title="Performance por Operadora" icon={Building2} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <EPieChart data={operadoras.map(o => ({ name: o.name, value: o.Venda ?? 0 }))} title="Distribuição por Operadora" />
        </div>
        <div data-print-table>
          <DetailTable data={operadoras} title="Detalhamento por Operadora" icon={Building2} columnLabel="Operadora" period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Acomodação ──────────────────────────────────────────────── */}
      <div id="acomodacao" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <EBarChart data={acomodacao} title="Performance por Acomodação" icon={Home} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <EPieChart data={acomodacao.map(o => ({ name: o.name, value: o.Venda ?? 0 }))} title="Distribuição por Acomodação" />
        </div>
        <div data-print-table>
          <DetailTable data={acomodacao} title="Detalhamento por Acomodação" icon={Home} columnLabel="Acomodação" period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Município ──────────────────────────────────────────────── */}
      <div id="municipio" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <EBarChart data={municipios} title="Distribuição por Município" icon={MapPin} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <EPieChart data={municipios.map(m => ({ name: m.name, value: m.Venda ?? 0 }))} title="Distribuição por Município" />
        </div>
        <div data-print-table>
          <DetailTable data={municipios} title="Detalhamento por Município" icon={MapPin} columnLabel="Município" period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Faixa Etária ───────────────────────────────────────────── */}
      <div id="faixa-etaria" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <EBarChart data={faixaEtaria} title="Performance por Faixa Etária" icon={BarChart3} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <EPieChart
            data={faixaEtaria.map(v => ({ name: v.description ? `${v.name} (${v.description})` : v.name, value: v.count || 0 }))}
            title="Distribuição de Pacientes por Idade"
          />
        </div>
        <div data-print-table>
          <FaixaEtariaTable data={faixaEtaria} currencyFormatter={fmt} period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Pacote de Horas ─────────────────────────────────────────── */}
      <div id="pacote-horas" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <EBarChart data={pacoteHoras} title="Performance por Pacote de Horas" icon={Clock} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <EPieChart data={pacoteHoras.map(p => ({ name: p.name, value: p.Venda ?? 0 }))} title="Distribuição por Pacote de Horas" />
        </div>
        <div data-print-card>
          <EBarChart data={pacoteHoras} title="Análise por Pacote de Horas" icon={Clock} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-table>
          <DetailTable data={pacoteHoras} title="Detalhamento por Pacote de Horas" icon={Clock} columnLabel="Pacote" period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Sexo ────────────────────────────────────────────────────── */}
      <div id="sexo" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <EBarChart data={sexo} title="Performance por Sexo" icon={Users} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <EPieChart data={sexo.map(s => ({ name: s.name === 'F' ? 'Feminino' : 'Masculino', value: s.Venda ?? 0 }))} title="Distribuição por Sexo" />
        </div>
        <div data-print-table>
          <DetailTable data={sexo} title="Detalhamento por Sexo" icon={Users} columnLabel="Sexo" period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Analítico Pacientes ─────────────────────────────────────── */}
      <div id="analitico" className="scroll-mt-16" data-print-table>
        <AnaliticoPacientes data={filtered} currencyFormatter={fmt} period={period} />
      </div>

      {/* ── Back to top ────────────────────────────────────────────── */}
      {showTop && (
        <button
          data-no-print
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-1.5 px-4 py-2.5 bg-zinc-900 text-white text-xs font-semibold rounded-full shadow-lg hover:bg-zinc-700 transition-colors cursor-pointer"
        >
          <ChevronUp size={14} />
          Topo
        </button>
      )}
    </div>
  );
}
