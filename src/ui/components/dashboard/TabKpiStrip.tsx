import * as React from 'react';
import { Card, CardContent } from '@ui/components/ui/card';
import { cn } from '@lib/utils';
import type { MetricKey } from '@domain/models/metricKey';
import { DEFAULT_VISIBLE_METRICS } from '@domain/models/metricKey';

// ── Structured KPI data ───────────────────────────────────────────
export interface FinancialKpis {
  venda: number;
  custo: number;
  bruto: number;
  liquido: number;
  glosa: number;
}

export interface StatusBreakdown {
  label: string;
  icon: string;
  count: number;
  kpis: FinancialKpis;
}

interface Props {
  totals: FinancialKpis;
  monthlyAverages?: FinancialKpis;
  patientAverages: FinancialKpis;
  statuses?: StatusBreakdown[];
  currencyFormatter: (val: number) => string;
  visibleMetrics?: Set<MetricKey>;
}

// ── Presentation config ───────────────────────────────────────────
const COLUMNS = [
  { key: 'venda' as const,   label: 'Faturado' as MetricKey,   color: 'text-blue-600' },
  { key: 'custo' as const,   label: 'Custo' as MetricKey,   color: 'text-emerald-700' },
  { key: 'bruto' as const,   label: 'Bruto' as MetricKey,   color: 'text-violet-600',  neg: 'text-orange-600' },
  { key: 'liquido' as const, label: 'Líquido' as MetricKey, color: 'text-cyan-600',    neg: 'text-orange-600' },
  { key: 'glosa' as const,   label: 'Glosa' as MetricKey,   color: 'text-orange-600' },
] as const;

const GRID_COLS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-2 sm:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5',
};

function pickColor(col: typeof COLUMNS[number], val: number) {
  if ('neg' in col && val < 0) return col.neg;
  return col.color;
}

// ── Avg row helper ────────────────────────────────────────────────
function AvgRow({ label, data, fmt, cols }: { label: string; data: FinancialKpis; fmt: (v: number) => string; cols: typeof COLUMNS[number][] }) {
  return (
    <div className={cn('grid gap-3', GRID_COLS[cols.length] ?? 'grid-cols-5')}>
      {cols.map(col => (
        <Card key={col.key} className="border border-zinc-100 rounded-lg bg-zinc-50/50">
          <CardContent className="p-3">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
              {label}
            </p>
            <p className={cn('text-sm font-semibold tracking-tight tabular-nums', pickColor(col, data[col.key]))}>
              {fmt(data[col.key])}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ── Component ─────────────────────────────────────────────────────
export const TabKpiStrip: React.FC<Props> = ({
  totals,
  monthlyAverages,
  patientAverages,
  statuses,
  currencyFormatter: fmt,
  visibleMetrics = DEFAULT_VISIBLE_METRICS,
}) => {
  const cols = COLUMNS.filter(c => visibleMetrics.has(c.label));
  const gridCls = GRID_COLS[cols.length] ?? 'grid-cols-5';

  return (
    <div className="space-y-3">
      {/* Row 1 — Totals */}
      <div className={cn('grid gap-3', gridCls)}>
        {cols.map(col => (
          <Card key={col.key} className="border border-zinc-200 rounded-lg shadow-sm">
            <CardContent className="p-3">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-0.5">
                {col.label}
              </p>
              <p className={cn('text-lg font-bold tracking-tight tabular-nums', pickColor(col, totals[col.key]))}>
                {fmt(totals[col.key])}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Row 2 — Monthly averages (hidden for single-month) */}
      {monthlyAverages && <AvgRow label="Média Mensal" data={monthlyAverages} fmt={fmt} cols={cols} />}

      {/* Row 3 — Per-patient averages */}
      <AvgRow label="Média/Paciente" data={patientAverages} fmt={fmt} cols={cols} />

      {/* Row 4 — Status breakdown (optional) */}
      {statuses && statuses.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {statuses.map(s => (
            <Card key={s.label} className="border border-zinc-200 rounded-lg shadow-sm">
              <CardContent className="p-3 space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-base leading-none">{s.icon}</span>
                  <p className="text-xs font-semibold text-zinc-700">{s.label}</p>
                  <span className="ml-auto text-[10px] font-bold text-zinc-400 tabular-nums">
                    {s.count} pcte{s.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="border-t border-zinc-100 pt-1.5 space-y-0.5 text-[11px]">
                  {cols.map(col => (
                    <div key={col.key} className="flex justify-between">
                      <span className="text-zinc-400">{col.label}</span>
                      <span className={cn('font-medium tabular-nums', pickColor(col, s.kpis[col.key]))}>
                        {fmt(s.kpis[col.key])}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
