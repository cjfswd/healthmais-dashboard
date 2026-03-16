import { useDashboard } from '@application/contexts/DashboardContext';
import { usePeriodLabel } from '@application/hooks/usePeriodLabel';
import { MunicipioChart } from '@ui/components/dashboard/MunicipioChart';
import { TabKpiStrip } from '@ui/components/dashboard/TabKpiStrip';
import { DashboardCardHeader } from '@ui/components/dashboard/DashboardCardHeader';
import { MapPin } from 'lucide-react';
import { Card, CardContent } from '@ui/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/components/ui/table';

export function GeograficoPage() {
  const { categoryAggregation, filteredData } = useDashboard();
  const { label: period, isFullYear } = usePeriodLabel();
  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const data = categoryAggregation('municipio');
  const totalVenda = data.reduce((acc, r) => acc + (r.Venda ?? 0), 0);
  const totalCusto = data.reduce((acc, r) => acc + (r.Custo ?? 0), 0);
  const totalGlosa = data.reduce((acc, r) => acc + (r.Glosa ?? 0), 0);
  const bruto = totalVenda - totalCusto;
  const liquido = bruto - totalGlosa;
  const nPac = new Set(filteredData.map(r => r.pacienteId)).size || 1;
  const nMes = new Set(filteredData.map(r => `${r.ano}-${r.mes}`)).size || 1;

  const totals = { venda: totalVenda, custo: totalCusto, bruto, liquido, glosa: totalGlosa };

  return (
    <div className="space-y-6">
      <TabKpiStrip
        totals={totals}
        monthlyAverages={{ venda: totals.venda / nMes, custo: totals.custo / nMes, bruto: totals.bruto / nMes, liquido: totals.liquido / nMes, glosa: totals.glosa / nMes }}
        patientAverages={{ venda: totals.venda / nPac, custo: totals.custo / nPac, bruto: totals.bruto / nPac, liquido: totals.liquido / nPac, glosa: totals.glosa / nPac }}
        currencyFormatter={fmt}
      />

      <MunicipioChart data={data} currencyFormatter={fmt} />

      <Card className="border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
        <DashboardCardHeader icon={MapPin} title="Detalhamento por Município" period={period} isFullYear={isFullYear} />
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent border-b border-zinc-200">
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Município</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Venda</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Custo</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Bruto</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Líquido</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Glosa</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">% do Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((row, i) => (
                <TableRow key={i} className="hover:bg-zinc-50 border-b border-zinc-100 last:border-0">
                  <TableCell className="font-medium text-zinc-800">{row.name}</TableCell>
                  <TableCell className="text-right text-zinc-700">{fmt(row.Venda ?? 0)}</TableCell>
                  <TableCell className="text-right text-emerald-700 font-medium">{fmt(row.Custo ?? 0)}</TableCell>
                  <TableCell className={`text-right font-semibold ${((row.Venda ?? 0) - (row.Custo ?? 0)) >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>{fmt((row.Venda ?? 0) - (row.Custo ?? 0))}</TableCell>
                  <TableCell className={`text-right font-semibold ${((row.Venda ?? 0) - (row.Custo ?? 0) - (row.Glosa ?? 0)) >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>{fmt((row.Venda ?? 0) - (row.Custo ?? 0) - (row.Glosa ?? 0))}</TableCell>
                  <TableCell className="text-right text-orange-600 font-medium">{fmt(row.Glosa ?? 0)}</TableCell>
                  <TableCell className="text-right text-zinc-500">
                    {totalVenda > 0 ? (((row.Venda ?? 0) / totalVenda) * 100).toFixed(1) : '0'}%
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-zinc-100 border-t-2 border-zinc-300 font-bold">
                <TableCell className="text-zinc-900">Total</TableCell>
                <TableCell className="text-right text-zinc-900">{fmt(totalVenda)}</TableCell>
                <TableCell className="text-right text-emerald-700">{fmt(totalCusto)}</TableCell>
                <TableCell className={`text-right font-bold ${bruto >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>{fmt(bruto)}</TableCell>
                <TableCell className={`text-right font-bold ${liquido >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>{fmt(liquido)}</TableCell>
                <TableCell className="text-right text-orange-600">{fmt(totalGlosa)}</TableCell>
                <TableCell className="text-right text-zinc-700">100%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
