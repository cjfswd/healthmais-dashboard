import { useDashboard } from '@application/contexts/DashboardContext';
import { usePeriodLabel } from '@application/hooks/usePeriodLabel';
import { FaixaEtariaSection } from '@ui/components/dashboard/FaixaEtariaSection';
import { TabKpiStrip } from '@ui/components/dashboard/TabKpiStrip';

export function FaixaEtariaPage() {
  const { faixaEtariaAggregation, filteredData } = useDashboard();
  const { label: period, isFullYear } = usePeriodLabel();
  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const data = faixaEtariaAggregation;
  const totalVenda  = data.reduce((a, r) => a + (r.Venda ?? 0), 0);
  const totalCusto  = data.reduce((a, r) => a + (r.Custo ?? 0), 0);
  const totalGlosa  = data.reduce((a, r) => a + (r.Glosa ?? 0), 0);
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
      <FaixaEtariaSection data={faixaEtariaAggregation} currencyFormatter={fmt} period={period} isFullYear={isFullYear} />
    </div>
  );
}
