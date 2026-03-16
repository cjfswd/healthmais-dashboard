import { useDashboard } from '@application/contexts/DashboardContext';
import { usePeriodLabel } from '@application/hooks/usePeriodLabel';
import { TipoProcedimentoChart } from '@ui/components/dashboard/TipoProcedimentoChart';
import { ProcedimentoTable } from '@ui/components/dashboard/ProcedimentoTable';
import { TabKpiStrip } from '@ui/components/dashboard/TabKpiStrip';

export function ProcedimentosPage() {
  const { categoryAggregation, filteredData } = useDashboard();
  const { label: period, isFullYear } = usePeriodLabel();
  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const data = categoryAggregation('procedimento');

  const totalVenda   = data.reduce((a, r) => a + (r.Venda  ?? 0), 0);
  const totalCusto   = data.reduce((a, r) => a + (r.Custo  ?? 0), 0);
  const totalGlosa   = data.reduce((a, r) => a + (r.Glosa  ?? 0), 0);
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
      <TipoProcedimentoChart data={data} currencyFormatter={fmt} />
      <ProcedimentoTable data={data.map(v => ({ ...v, Resultado: (v.Venda as number) - (v.Custo as number) }))} currencyFormatter={fmt} period={period} isFullYear={isFullYear} />
    </div>
  );
}
