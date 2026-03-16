/**
 * MockDashboardTestPage
 *
 * Standalone page that renders the full dashboard with realistic mock data.
 * Does NOT depend on DashboardContext — all data is hardcoded inline.
 * Route: /dashboard-teste (no nav button, access via URL only).
 */
import { useState, useMemo, useEffect } from 'react';
import { FaturamentoMensalChart } from '@ui/components/dashboard/FaturamentoMensalChart';
import { OperadoraChart } from '@ui/components/dashboard/OperadoraChart';
import { TipoProcedimentoChart } from '@ui/components/dashboard/TipoProcedimentoChart';
import { MunicipioChart } from '@ui/components/dashboard/MunicipioChart';
import { ProcedimentoTable } from '@ui/components/dashboard/ProcedimentoTable';
import { FaixaEtariaTable } from '@ui/components/dashboard/FaixaEtariaTable';
import { PieDataChart } from '@ui/components/dashboard/PieDataChart';
import { PacoteHorasChart } from '@ui/components/dashboard/PacoteHorasChart';
import { AnaliticoPacientes } from '@ui/components/dashboard/AnaliticoPacientes';
import { TabKpiStrip } from '@ui/components/dashboard/TabKpiStrip';
import { DashboardCardHeader } from '@ui/components/dashboard/DashboardCardHeader';
import { Badge } from '@ui/components/ui/badge';
import { Card, CardContent } from '@ui/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/components/ui/table';
import { Building2, MapPin, Home, Clock, Users, BarChart3, Filter, ChevronUp, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { LucideIcon } from 'lucide-react';
import type { AggregationResult, Faturamento } from '@domain/models/faturamento';
import { type MetricKey, ALL_METRICS, METRIC_COLORS } from '@domain/models/metricKey';

// ── Helpers ───────────────────────────────────────────────────────────

const fmt = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

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
const STATUS_NOMES    = ['Internação', 'Alta', 'Internação', 'Alta', 'Internação', 'Óbito', 'Ouvidoria'];
const ACOMOD_NOMES    = ['Internação Domiciliar (ID)', 'Atendimento Domiciliar (AD)'];
const PACOTE_LABELS   = ['3H', '6H', '9H', '12H', '24H'];
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
      const nMonths = 1 + Math.floor(rand() * 3); // 1-3 records per patient per year
      for (let m = 0; m < nMonths; m++) {
        const mes = 1 + Math.floor(rand() * 12);
        records.push({
          mes: String(mes),
          ano,
          quantidade: 1,
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
    name,
    Venda: v.venda,
    Custo: v.custo,
    Glosa: v.glosa,
    count: v.count,
    Resultado: v.venda - v.custo,
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
  // Sort chronologically
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

const FILTER_LABELS: Record<FilterMode, string> = {
  'all': 'Todo o Período',
  'full-year': 'Ano Inteiro',
  'single-month': 'Mês Único',
  'month-range': 'Intervalo de Meses',
  'year-range': 'Intervalo de Anos',
};

function applyFilter(data: Faturamento[], filter: TimeFilter): Faturamento[] {
  switch (filter.mode) {
    case 'all':
      return data;
    case 'full-year':
      return data.filter(r => r.ano === filter.year);
    case 'single-month':
      return data.filter(r => r.ano === filter.year && Number(r.mes) === filter.month);
    case 'month-range': {
      const start = filter.year * 100 + filter.month;
      const end   = filter.yearEnd * 100 + filter.monthEnd;
      return data.filter(r => {
        const v = r.ano * 100 + Number(r.mes);
        return v >= start && v <= end;
      });
    }
    case 'year-range':
      return data.filter(r => r.ano >= filter.year && r.ano <= filter.yearEnd);
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

// ── Reusable inline helpers ───────────────────────────────────────────

const BAR_COLORS = {
  Faturado: '#2563eb',
  Custo: '#10b981',
  Bruto: '#7c3aed',
  Líquido: '#0891b2',
  Glosa: '#ea580c',
} as const;

const makeBarLabel = (color: string) =>
  ({ x, y, width, height, value }: { x: number; y: number; width: number; height: number; value: number }) => {
    if (!value) return <g />;
    const cx = x + width / 2;
    const by = y + height + 14;
    const txt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
    return (
      <text x={cx} y={by} textAnchor="start" fill={color} fontSize={9} fontWeight={700} transform={`rotate(45, ${cx}, ${by})`}>
        {txt}
      </text>
    );
  };

function MockPerformanceChart({ data, title, icon, visibleMetrics }: { data: AggregationResult[]; title: string; icon: LucideIcon; visibleMetrics: Set<MetricKey> }) {
  const enriched = data.map(r => ({ ...r, Bruto: (r.Venda ?? 0) - (r.Custo ?? 0), Líquido: (r.Venda ?? 0) - (r.Custo ?? 0) - (r.Glosa ?? 0) }));
  const vis = (k: MetricKey) => visibleMetrics.has(k);
  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm">
      <DashboardCardHeader icon={icon} title={title} description="Faturado · Custo · Bruto · Líquido · Glosa" />
      <CardContent className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enriched} margin={{ top: 50, right: 10, left: 10, bottom: 95 }} barGap={2} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} height={70} dy={70} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `R$${v / 1000}k`} />
            <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)' }} formatter={(val: unknown) => fmt(Number(val))} />
            <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '45px' }} />
            {vis('Faturado') && <Bar dataKey="Venda" name="Faturado" fill={BAR_COLORS.Faturado} radius={[3, 3, 0, 0]} label={makeBarLabel(BAR_COLORS.Faturado)} />}
            {vis('Custo') && <Bar dataKey="Custo" fill={BAR_COLORS.Custo} radius={[3, 3, 0, 0]} label={makeBarLabel(BAR_COLORS.Custo)} />}
            {vis('Bruto') && <Bar dataKey="Bruto" fill={BAR_COLORS.Bruto} radius={[3, 3, 0, 0]} label={makeBarLabel(BAR_COLORS.Bruto)} />}
            {vis('Líquido') && <Bar dataKey="Líquido" fill={BAR_COLORS.Líquido} radius={[3, 3, 0, 0]} label={makeBarLabel(BAR_COLORS.Líquido)} />}
            {vis('Glosa') && <Bar dataKey="Glosa" fill={BAR_COLORS.Glosa} radius={[3, 3, 0, 0]} label={makeBarLabel(BAR_COLORS.Glosa)} />}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function MockDetailTable({ data, title, icon, columnLabel, period, isFullYear, visibleMetrics }: { data: AggregationResult[]; title: string; icon: LucideIcon; columnLabel: string; period: string; isFullYear: boolean; visibleMetrics: Set<MetricKey> }) {
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
      </CardContent>
    </Card>
  );
}

// ── Filter bar sub-component ──────────────────────────────────────────

const selectClass = 'h-8 rounded-md border border-zinc-300 bg-white px-2 text-xs font-medium text-zinc-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

function TimeFilterBar({ filter, onChange, visibleMetrics, onToggleMetric }: { filter: TimeFilter; onChange: (f: TimeFilter) => void; visibleMetrics: Set<MetricKey>; onToggleMetric: (k: MetricKey) => void }) {
  const set = (patch: Partial<TimeFilter>) => onChange({ ...filter, ...patch });

  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm">
      <CardContent className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-zinc-500">
            <Filter size={14} />
            <span className="text-[10px] font-bold uppercase tracking-widest">Período</span>
          </div>

          {/* Mode selector */}
          <select
            className={selectClass}
            value={filter.mode}
            onChange={e => set({ mode: e.target.value as FilterMode })}
          >
            {Object.entries(FILTER_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>

          {/* Year (for full-year, single-month) */}
          {(filter.mode === 'full-year' || filter.mode === 'single-month') && (
            <select className={selectClass} value={filter.year} onChange={e => set({ year: Number(e.target.value) })}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          )}

          {/* Month (for single-month) */}
          {filter.mode === 'single-month' && (
            <select className={selectClass} value={filter.month} onChange={e => set({ month: Number(e.target.value) })}>
              {MONTH_NAMES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          )}

          {/* Month range: start */}
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

          {/* Year range */}
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

          {/* Active filter badge */}
          <Badge variant="secondary" className="ml-auto bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-2 h-6 text-[10px]">
            {periodLabel(filter).label}
          </Badge>
        </div>

        {/* ── Metric visibility toggles ────────────────────────── */}
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
                key={metric}
                type="button"
                onClick={() => onToggleMetric(metric)}
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

// ── Component ─────────────────────────────────────────────────────────

export function MockDashboardTestPage() {
  const [filter, setFilter] = useState<TimeFilter>({
    mode: 'all',
    year: 2024,
    month: 1,
    yearEnd: 2024,
    monthEnd: 12,
  });

  const [visibleMetrics, setVisibleMetrics] = useState<Set<MetricKey>>(() => new Set(ALL_METRICS));
  const toggleMetric = (key: MetricKey) =>
    setVisibleMetrics(prev => {
      const next = new Set(prev);
      if (next.has(key)) { if (next.size > 1) next.delete(key); } else { next.add(key); }
      return next;
    });

  // Filtered data
  const filtered = useMemo(() => applyFilter(MOCK_PACIENTES, filter), [filter]);
  const { label: period, isFullYear } = periodLabel(filter);

  // Aggregations
  const monthly      = useMemo(() => monthlyAggregate(filtered), [filtered]);
  const operadoras   = useMemo(() => aggregateByKey(filtered, 'operadora'), [filtered]);
  const procedimentos = useMemo(() => aggregateByKey(filtered, 'procedimento'), [filtered]);
  const municipios   = useMemo(() => aggregateByKey(filtered, 'municipio'), [filtered]);
  const acomodacao   = useMemo(() => aggregateByKey(filtered, 'acomodacao'), [filtered]);
  const pacoteHoras  = useMemo(() => aggregateByKey(filtered, 'pacoteHoras'), [filtered]);
  const sexo         = useMemo(() => aggregateByKey(filtered, 'sexo'), [filtered]);
  const faixaEtaria  = useMemo(() => faixaEtariaAggregate(filtered), [filtered]);

  // KPIs
  const totalVenda = filtered.reduce((a, r) => a + r.valorTotal, 0);
  const totalCusto = filtered.reduce((a, r) => a + r.custo, 0);
  const totalGlosa = filtered.reduce((a, r) => a + r.valorGlosado, 0);
  const bruto = totalVenda - totalCusto;
  const liquido = bruto - totalGlosa;
  const nMes = new Set(filtered.map(r => `${r.ano}-${r.mes}`)).size || 1;
  const nPac = new Set(filtered.map(r => r.pacienteId)).size || 1;

  const totals = { venda: totalVenda, custo: totalCusto, bruto, liquido, glosa: totalGlosa };

  const [showTop, setShowTop] = useState(false);

  // Track scroll position for back-to-top visibility
  useEffect(() => {
    const handler = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="space-y-6" id="page-top">

      {/* ── Print-only report header (hidden on screen) ──────────── */}
      <div data-print-header>
        <div>
          <h1 className="text-xl font-bold text-zinc-900 leading-none">Healthmais Analytics</h1>
          <p className="text-xs text-zinc-500">Dashboard Mockup · Dados de Teste</p>
        </div>
        <Badge variant="secondary" className="bg-blue-50 text-blue-700 border border-blue-200 font-semibold px-3 h-6 text-xs ml-auto">
          Período: {period}
        </Badge>
      </div>

      {/* ── Time Filter (hidden in print) ─────────────────────────── */}
      <div data-no-print>
        <TimeFilterBar filter={filter} onChange={setFilter} visibleMetrics={visibleMetrics} onToggleMetric={toggleMetric} />
      </div>

      {/* ── KPIs ─────────────────────────────────────────────────── */}
      <div id="kpis" className="scroll-mt-16" data-print-card>
        <TabKpiStrip
          totals={totals}
          monthlyAverages={filter.mode !== 'single-month' ? { venda: totals.venda / nMes, custo: totals.custo / nMes, bruto: totals.bruto / nMes, liquido: totals.liquido / nMes, glosa: totals.glosa / nMes } : undefined}
          patientAverages={{ venda: totals.venda / nPac, custo: totals.custo / nPac, bruto: totals.bruto / nPac, liquido: totals.liquido / nPac, glosa: totals.glosa / nPac }}
          currencyFormatter={fmt}
          visibleMetrics={visibleMetrics}
        />
      </div>

      {/* ── Faturamento Mensal ────────────────────────────────────── */}
      <div id="faturamento" className="scroll-mt-16" data-print-card>
        <FaturamentoMensalChart data={monthly} currencyFormatter={fmt} visibleMetrics={visibleMetrics} />
      </div>

      {/* ── Procedimentos ────────────────────────────────────────── */}
      <div id="procedimentos" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <TipoProcedimentoChart data={procedimentos} currencyFormatter={fmt} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-table>
          <ProcedimentoTable data={procedimentos} currencyFormatter={fmt} period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Operadoras ───────────────────────────────────────────── */}
      <div id="operadoras" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <OperadoraChart data={operadoras} currencyFormatter={fmt} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <PieDataChart data={operadoras.map(o => ({ name: o.name, value: o.Venda ?? 0 }))} title="Distribuição por Operadora" />
        </div>
        <div data-print-table>
          <MockDetailTable data={operadoras} title="Detalhamento por Operadora" icon={Building2} columnLabel="Operadora" period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Acomodação ───────────────────────────────────────────── */}
      <div id="acomodacao" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <MockPerformanceChart data={acomodacao} title="Performance por Acomodação" icon={Home} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <PieDataChart data={acomodacao.map(o => ({ name: o.name, value: o.Venda ?? 0 }))} title="Distribuição por Acomodação" />
        </div>
        <div data-print-table>
          <MockDetailTable data={acomodacao} title="Detalhamento por Acomodação" icon={Home} columnLabel="Acomodação" period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Município ────────────────────────────────────────────── */}
      <div id="municipio" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <MunicipioChart data={municipios} currencyFormatter={fmt} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <PieDataChart data={municipios.map(m => ({ name: m.name, value: m.Venda ?? 0 }))} title="Distribuição por Município" />
        </div>
        <div data-print-table>
          <MockDetailTable data={municipios} title="Detalhamento por Município" icon={MapPin} columnLabel="Município" period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Faixa Etária ─────────────────────────────────────────── */}
      <div id="faixa-etaria" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <MockPerformanceChart data={faixaEtaria} title="Performance por Faixa Etária" icon={BarChart3} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <PieDataChart
            data={faixaEtaria.map(v => ({ name: v.description ? `${v.name} (${v.description})` : v.name, value: v.count || 0 }))}
            title="Distribuição de Pacientes por Idade"
          />
        </div>
        <div data-print-table>
          <FaixaEtariaTable data={faixaEtaria} currencyFormatter={fmt} period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Pacote de Horas ──────────────────────────────────────── */}
      <div id="pacote-horas" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <MockPerformanceChart data={pacoteHoras} title="Performance por Pacote de Horas" icon={Clock} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <PieDataChart data={pacoteHoras.map(p => ({ name: p.name, value: p.Venda ?? 0 }))} title="Distribuição por Pacote de Horas" />
        </div>
        <div data-print-card>
          <PacoteHorasChart data={pacoteHoras} currencyFormatter={fmt} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-table>
          <MockDetailTable data={pacoteHoras} title="Detalhamento por Pacote de Horas" icon={Clock} columnLabel="Pacote" period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Sexo ─────────────────────────────────────────────────── */}
      <div id="sexo" className="space-y-6 scroll-mt-16">
        <div data-print-card>
          <MockPerformanceChart data={sexo} title="Performance por Sexo" icon={Users} visibleMetrics={visibleMetrics} />
        </div>
        <div data-print-card>
          <PieDataChart data={sexo.map(s => ({ name: s.name === 'F' ? 'Feminino' : 'Masculino', value: s.Venda ?? 0 }))} title="Distribuição por Sexo" />
        </div>
        <div data-print-table>
          <MockDetailTable data={sexo} title="Detalhamento por Sexo" icon={Users} columnLabel="Sexo" period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* ── Analítico Pacientes ──────────────────────────────────── */}
      <div id="analitico" className="scroll-mt-16" data-print-table>
        <AnaliticoPacientes data={filtered} currencyFormatter={fmt} period={period} />
      </div>

      {/* ── Back to top button (hidden in print) ──────────────────── */}
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

