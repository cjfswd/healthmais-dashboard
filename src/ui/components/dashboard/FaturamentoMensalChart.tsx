import * as React from 'react';
import { TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
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

export const FaturamentoMensalChart: React.FC<Props> = ({ data, currencyFormatter, visibleMetrics = DEFAULT_VISIBLE_METRICS }) => {
  const vis = (k: MetricKey) => visibleMetrics.has(k);
  const enriched = data.map(r => ({
    ...r,
    Bruto: (r.Venda ?? 0) - (r.Custo ?? 0),
    Líquido: (r.Venda ?? 0) - (r.Custo ?? 0) - (r.Glosa ?? 0),
  }));

  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm">
      <DashboardCardHeader
        icon={TrendingUp}
        title="Faturamento Mensal"
        description="Faturado · Custo · Bruto · Líquido · Glosa"
      />
      <CardContent className="h-[320px] px-4 pb-4 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={enriched} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVenda" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCusto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorBruto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorLiquido" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0891b2" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#0891b2" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorGlosa" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ea580c" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#ea580c" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={(v) => `R$${v/1000}k`} />
            <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)'}} formatter={(val: unknown) => currencyFormatter(Number(val))} />
            <Legend verticalAlign="bottom" height={28} iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}/>
            {vis('Faturado') && <Area type="monotone" dataKey="Venda" name="Faturado" stroke="#2563eb" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1 }} fillOpacity={1} fill="url(#colorVenda)" />}
            {vis('Custo') && <Area type="monotone" dataKey="Custo" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1 }} fillOpacity={1} fill="url(#colorCusto)" />}
            {vis('Bruto') && <Area type="monotone" dataKey="Bruto" stroke="#7c3aed" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1 }} fillOpacity={1} fill="url(#colorBruto)" />}
            {vis('Líquido') && <Area type="monotone" dataKey="Líquido" stroke="#0891b2" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1 }} fillOpacity={1} fill="url(#colorLiquido)" />}
            {vis('Glosa') && <Area type="monotone" dataKey="Glosa" stroke="#ea580c" strokeWidth={2} dot={false} activeDot={{ r: 4, strokeWidth: 1 }} fillOpacity={1} fill="url(#colorGlosa)" />}
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
