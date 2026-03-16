import * as React from 'react';
import { Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/components/ui/table';
import { Card, CardContent } from '@ui/components/ui/card';
import { DashboardCardHeader } from '@ui/components/dashboard/DashboardCardHeader';
import { Badge } from '@ui/components/ui/badge';
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

export const FaixaEtariaTable: React.FC<Props> = ({ data, currencyFormatter, period, isFullYear, visibleMetrics = DEFAULT_VISIBLE_METRICS }) => {
  const vis = (k: MetricKey) => visibleMetrics.has(k);
  const totalAtivos = data.reduce((acc, curr) => acc + (curr.count || 0), 0);
  const totalFaturado = data.reduce((acc, curr) => acc + (curr.Venda || 0), 0);
  const totalCusto = data.reduce((acc, curr) => acc + (curr.Custo || 0), 0);
  const totalGlosado = data.reduce((acc, curr) => acc + (curr.Glosa || 0), 0);

  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
      <DashboardCardHeader
        icon={Users}
        title="Perfil por Faixa Etária"
        period={period}
        isFullYear={isFullYear}
      />
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent border-b border-zinc-200">
                <TableHead className="px-6 py-3 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Faixa Etária</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-center">Pacientes</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-center">%</TableHead>
                <TableHead className="px-4 py-3 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Descrição</TableHead>
                {vis('Faturado') && <TableHead className="px-4 py-3 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Faturado</TableHead>}
                {vis('Custo') && <TableHead className="px-4 py-3 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Custo</TableHead>}
                {vis('Bruto') && <TableHead className="px-4 py-3 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Bruto</TableHead>}
                {vis('Líquido') && <TableHead className="px-4 py-3 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Líquido</TableHead>}
                {vis('Glosa') && <TableHead className="px-6 py-3 font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Glosa</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => {
                const v = row.Venda || 0;
                const c = row.Custo || 0;
                const g = row.Glosa || 0;
                const b = v - c;
                const l = b - g;
                return (
                  <TableRow key={i} className="hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0">
                    <TableCell className="px-6 py-2 font-medium text-zinc-800">{row.name.trim()}</TableCell>
                    <TableCell className="px-4 py-2 text-center text-zinc-600">{row.count}</TableCell>
                    <TableCell className="px-4 py-2 text-center">
                      <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 border-zinc-200 font-semibold text-[10px]">
                        {row.percent?.toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-2 text-zinc-500 text-xs">{row.description}</TableCell>
                    {vis('Faturado') && <TableCell className="px-4 py-2 text-right font-semibold text-zinc-900">{currencyFormatter(v)}</TableCell>}
                    {vis('Custo') && <TableCell className="px-4 py-2 text-right text-emerald-700 font-medium">{currencyFormatter(c)}</TableCell>}
                    {vis('Bruto') && <TableCell className={`px-4 py-2 text-right font-semibold ${b >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>{currencyFormatter(b)}</TableCell>}
                    {vis('Líquido') && <TableCell className={`px-4 py-2 text-right font-semibold ${l >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>{currencyFormatter(l)}</TableCell>}
                    {vis('Glosa') && <TableCell className="px-6 py-2 text-right font-medium text-orange-600">{currencyFormatter(g)}</TableCell>}
                  </TableRow>
                );
              })}
              {/* Footer Total */}
              <TableRow className="bg-zinc-100 border-t-2 border-zinc-300 font-bold">
                <TableCell className="px-6 py-2 text-[10px] uppercase tracking-widest font-bold text-zinc-900">Total Ativos</TableCell>
                <TableCell className="px-4 py-2 text-center font-bold text-zinc-900">{totalAtivos}</TableCell>
                <TableCell className="px-4 py-2 text-center font-bold text-zinc-700">100%</TableCell>
                <TableCell className="px-4 py-2"></TableCell>
                {vis('Faturado') && <TableCell className="px-4 py-2 text-right font-bold text-zinc-900">{currencyFormatter(totalFaturado)}</TableCell>}
                {vis('Custo') && <TableCell className="px-4 py-2 text-right font-bold text-emerald-700">{currencyFormatter(totalCusto)}</TableCell>}
                {vis('Bruto') && <TableCell className={`px-4 py-2 text-right font-bold ${(totalFaturado - totalCusto) >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>{currencyFormatter(totalFaturado - totalCusto)}</TableCell>}
                {vis('Líquido') && <TableCell className={`px-4 py-2 text-right font-bold ${(totalFaturado - totalCusto - totalGlosado) >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>{currencyFormatter(totalFaturado - totalCusto - totalGlosado)}</TableCell>}
                {vis('Glosa') && <TableCell className="px-6 py-2 text-right font-bold text-orange-600">{currencyFormatter(totalGlosado)}</TableCell>}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
