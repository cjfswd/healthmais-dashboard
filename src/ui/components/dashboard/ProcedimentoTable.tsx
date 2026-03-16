import * as React from 'react';
import { Layers } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/components/ui/table';
import { Card, CardContent } from '@ui/components/ui/card';
import { DashboardCardHeader } from '@ui/components/dashboard/DashboardCardHeader';
import type { AggregationResult } from '@domain/models/faturamento';
import type { MetricKey } from '@domain/models/metricKey';
import { DEFAULT_VISIBLE_METRICS } from '@domain/models/metricKey';

interface Props {
  data: AggregationResult[];
  currencyFormatter: (val: number) => string;
  period?: string;
  isFullYear?: boolean;
  visibleMetrics?: Set<MetricKey>;
}

export const ProcedimentoTable: React.FC<Props> = ({ data, currencyFormatter, period, isFullYear, visibleMetrics = DEFAULT_VISIBLE_METRICS }) => {
  const vis = (k: MetricKey) => visibleMetrics.has(k);

  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
      <DashboardCardHeader
        icon={Layers}
        title="Detalhamento de Procedimentos"
        period={period}
        isFullYear={isFullYear}
      />
      <CardContent className="p-0">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="hover:bg-transparent border-b border-zinc-200">
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Procedimento</TableHead>
              {vis('Faturado') && <TableHead className="text-right font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Faturado</TableHead>}
              {vis('Custo') && <TableHead className="text-right font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Custo</TableHead>}
              {vis('Bruto') && <TableHead className="text-right font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Bruto</TableHead>}
              {vis('Líquido') && <TableHead className="text-right font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Líquido</TableHead>}
              {vis('Glosa') && <TableHead className="text-right font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Glosa</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((row, i) => {
              const v = row.Venda as number;
              const c = row.Custo as number;
              const g = row.Glosa ?? 0;
              const b = v - c;
              const l = b - g;
              return (
                <TableRow key={i} className="hover:bg-zinc-50 border-b border-zinc-100 last:border-0">
                  <TableCell className="font-medium text-zinc-800">{row.name}</TableCell>
                  {vis('Faturado') && <TableCell className="text-right text-zinc-700">{currencyFormatter(v)}</TableCell>}
                  {vis('Custo') && <TableCell className="text-right text-zinc-700">{currencyFormatter(c)}</TableCell>}
                  {vis('Bruto') && <TableCell className={`text-right font-semibold ${b >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>{currencyFormatter(b)}</TableCell>}
                  {vis('Líquido') && <TableCell className={`text-right font-semibold ${l >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>{currencyFormatter(l)}</TableCell>}
                  {vis('Glosa') && <TableCell className="text-right text-orange-600 font-medium">{currencyFormatter(g)}</TableCell>}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
