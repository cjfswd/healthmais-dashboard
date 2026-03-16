import * as React from 'react';
import { Timer } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent } from '@ui/components/ui/card';
import { DashboardCardHeader } from '@ui/components/dashboard/DashboardCardHeader';
import type { AggregationResult } from '@domain/models/faturamento';
import type { MetricKey } from '@domain/models/metricKey';
import { DEFAULT_VISIBLE_METRICS } from '@domain/models/metricKey';

interface Props {
  data: AggregationResult[];
  currencyFormatter: (val: number) => string;
  visibleMetrics?: Set<MetricKey>;
}

const fmtLabel = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const makeBarLabel = (color: string) =>
  ({ x, y, width, height, value }: { x: number; y: number; width: number; height: number; value: number }) => {
    if (!value) return <g />;
    const cx = x + width / 2;
    const by = y + height + 14;
    return (
      <text x={cx} y={by} textAnchor="start" fill={color} fontSize={9} fontWeight={700} transform={`rotate(45, ${cx}, ${by})`}>
        {fmtLabel(value)}
      </text>
    );
  };

const BAR_COLORS = {
  Faturado: '#2563eb',
  Custo: '#10b981',
  Bruto: '#7c3aed',
  Líquido: '#0891b2',
  Glosa: '#ea580c',
} as const;

export const PacoteHorasChart: React.FC<Props> = ({ data, currencyFormatter, visibleMetrics = DEFAULT_VISIBLE_METRICS }) => {
  const enriched = data.map(r => ({ ...r, Bruto: (r.Venda ?? 0) - (r.Custo ?? 0), Líquido: (r.Venda ?? 0) - (r.Custo ?? 0) - (r.Glosa ?? 0) }));
  const vis = (k: MetricKey) => visibleMetrics.has(k);

  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm">
      <DashboardCardHeader icon={Timer} title="Análise por Pacote de Horas" description="Faturado · Custo · Bruto · Líquido · Glosa" />
      <CardContent className="h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enriched} margin={{ top: 50, right: 10, left: 10, bottom: 95 }} barGap={2} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} height={70} dy={70} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} tickFormatter={(v) => `R$${v/1000}k`} />
            <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)'}} formatter={(v: unknown) => currencyFormatter(Number(v))} />
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
};
