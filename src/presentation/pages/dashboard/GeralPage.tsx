import { useDashboard } from '@application/contexts/DashboardContext';
import { FaturamentoMensalChart } from '@ui/components/dashboard/FaturamentoMensalChart';
import { TabKpiStrip } from '@ui/components/dashboard/TabKpiStrip';

const STATUS_ICONS: Record<string, string> = {
  'Alta': '✓',
  'Internação': '🏥',
  'Óbito': '⚠',
  'Ouvidoria': '📋',
};

export function GeralPage() {
  const { kpis, monthlyAggregation, filteredData } = useDashboard();
  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const totalGlosa = kpis.glosa ?? 0;
  const bruto = kpis.total - kpis.custo;
  const liquido = bruto - totalGlosa;
  const nPac = kpis.pacientes || 1;
  const nMes = new Set(filteredData.map(r => `${r.ano}-${r.mes}`)).size || 1;

  const totals = { venda: kpis.total, custo: kpis.custo, bruto, liquido, glosa: totalGlosa };

  const statuses = (['Internação', 'Alta', 'Óbito', 'Ouvidoria'] as const).map(s => {
    const rows = filteredData.filter(r => r.statusPaciente === s);
    const venda = rows.reduce((a, r) => a + r.valorTotal, 0);
    const custo = rows.reduce((a, r) => a + r.custo, 0);
    const glosa = rows.reduce((a, r) => a + r.valorGlosado, 0);
    return {
      label: s,
      icon: STATUS_ICONS[s] ?? '—',
      count: new Set(rows.map(r => r.pacienteId)).size,
      kpis: { venda, custo, bruto: venda - custo, liquido: venda - custo - glosa, glosa },
    };
  });

  return (
    <div className="space-y-6">
      <TabKpiStrip
        totals={totals}
        monthlyAverages={{ venda: totals.venda / nMes, custo: totals.custo / nMes, bruto: totals.bruto / nMes, liquido: totals.liquido / nMes, glosa: totals.glosa / nMes }}
        patientAverages={{ venda: totals.venda / nPac, custo: totals.custo / nPac, bruto: totals.bruto / nPac, liquido: totals.liquido / nPac, glosa: totals.glosa / nPac }}
        statuses={statuses}
        currencyFormatter={fmt}
      />
      <FaturamentoMensalChart data={monthlyAggregation} currencyFormatter={fmt} />
    </div>
  );
}
