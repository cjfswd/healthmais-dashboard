import { useState, useMemo } from 'react';
import { useDashboard } from '@application/contexts/DashboardContext';
import { usePeriodLabel } from '@application/hooks/usePeriodLabel';
import { AnaliticoPacientes } from '@ui/components/dashboard/AnaliticoPacientes';
import { TabKpiStrip } from '@ui/components/dashboard/TabKpiStrip';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@ui/components/ui/select';

const STATUS_ICONS: Record<string, string> = {
  'Alta': '✓',
  'Internação': '🏥',
  'Óbito': '⚠',
  'Ouvidoria': '📋',
};

export function AnaliticoPage() {
  const { filteredData, uniqueOperadoras } = useDashboard();
  const { label: period, isFullYear } = usePeriodLabel();
  const [subMunicipio, setSubMunicipio] = useState('Todos');
  const [subStatus,    setSubStatus]    = useState('Todos');
  const [subOperadora, setSubOperadora] = useState('Todos');

  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  const uniqueMunicipios = useMemo(() =>
    Array.from(new Set(filteredData.map(r => r.municipio))).sort(),
    [filteredData]);

  const uniqueStatuses = useMemo(() =>
    Array.from(new Set(filteredData.map(r => r.statusPaciente))).sort(),
    [filteredData]);

  const subFiltered = useMemo(() =>
    filteredData.filter(r => {
      if (subMunicipio !== 'Todos' && r.municipio !== subMunicipio) return false;
      if (subStatus    !== 'Todos' && r.statusPaciente !== subStatus) return false;
      if (subOperadora !== 'Todos' && r.operadora !== subOperadora) return false;
      return true;
    }),
    [filteredData, subMunicipio, subStatus, subOperadora]);

  const totalVenda = subFiltered.reduce((a, r) => a + r.valorTotal, 0);
  const totalCusto = subFiltered.reduce((a, r) => a + r.custo, 0);
  const totalGlosa = subFiltered.reduce((a, r) => a + r.valorGlosado, 0);
  const bruto = totalVenda - totalCusto;
  const liquido = bruto - totalGlosa;
  const totalPacientes = new Set(subFiltered.map(r => r.pacienteId)).size;
  const n = totalPacientes || 1;

  const statuses = useMemo(() => {
    return (['Internação', 'Alta', 'Óbito', 'Ouvidoria'] as const).map(s => {
      const rows = subFiltered.filter(r => r.statusPaciente === s);
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
  }, [subFiltered]);

  const nMes = new Set(subFiltered.map(r => `${r.ano}-${r.mes}`)).size || 1;
  const totals = { venda: totalVenda, custo: totalCusto, bruto, liquido, glosa: totalGlosa };

  return (
    <div className="space-y-6">
      {/* KPIs with status breakdown */}
      <TabKpiStrip
        totals={totals}
        monthlyAverages={{ venda: totals.venda / nMes, custo: totals.custo / nMes, bruto: totals.bruto / nMes, liquido: totals.liquido / nMes, glosa: totals.glosa / nMes }}
        patientAverages={{ venda: totals.venda / n, custo: totals.custo / n, bruto: totals.bruto / n, liquido: totals.liquido / n, glosa: totals.glosa / n }}
        statuses={statuses}
        currencyFormatter={fmt}
      />

      {/* Sub-filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Filtrar por Município', value: subMunicipio, onChange: setSubMunicipio, options: uniqueMunicipios, allLabel: 'Todos os Municípios' },
          { label: 'Filtrar por Status',    value: subStatus,    onChange: setSubStatus,    options: uniqueStatuses,   allLabel: 'Todos os Status' },
          { label: 'Filtrar por Operadora', value: subOperadora, onChange: setSubOperadora, options: uniqueOperadoras,  allLabel: 'Todas as Operadoras' },
        ].map(f => (
          <div key={f.label}>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{f.label}</p>
            <Select value={f.value} onValueChange={f.onChange}>
              <SelectTrigger className="h-9 text-sm border-zinc-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Todos">{f.allLabel}</SelectItem>
                {f.options.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>

      <AnaliticoPacientes data={subFiltered} currencyFormatter={fmt} period={period} isFullYear={isFullYear} />
    </div>
  );
}
