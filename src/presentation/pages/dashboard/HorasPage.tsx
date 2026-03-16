import { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { useDashboard } from '@application/contexts/DashboardContext';
import { usePeriodLabel } from '@application/hooks/usePeriodLabel';
import { TabKpiStrip } from '@ui/components/dashboard/TabKpiStrip';
import { DashboardCardHeader } from '@ui/components/dashboard/DashboardCardHeader';
import { Card, CardContent } from '@ui/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/components/ui/table';
import { Badge } from '@ui/components/ui/badge';
import { PACOTE_HORAS_NUMERICOS } from '@domain/constants/ref';

// --------------------------------------------------
// Types
// --------------------------------------------------

type PacoteKey = typeof PACOTE_HORAS_NUMERICOS[number];

interface PacoteStat {
  pacote: PacoteKey;
  venda: number;
  custo: number;
  glosa: number;
  pct: number;
}

interface PatientPacoteRow {
  pacienteId: string;
  nome: string;
  municipio: string;
  operadora: string;
  pacotes: Record<PacoteKey, { venda: number; custo: number; glosa: number }>;
  totalVenda: number;
  totalCusto: number;
  totalGlosa: number;
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

const fmt = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

const PACOTE_COLORS: Record<PacoteKey, { bar: string; dot: string }> = {
  '3H':  { bar: 'bg-blue-500',   dot: 'bg-blue-500' },
  '6H':  { bar: 'bg-indigo-500', dot: 'bg-indigo-500' },
  '9H':  { bar: 'bg-violet-500', dot: 'bg-violet-500' },
  '12H': { bar: 'bg-amber-500',  dot: 'bg-amber-500' },
  '24H': { bar: 'bg-rose-500',   dot: 'bg-rose-500' },
};

// --------------------------------------------------
// Component
// --------------------------------------------------

export function HorasPage() {
  const { filteredData } = useDashboard();
  const { label: period, isFullYear } = usePeriodLabel();

  const totalVenda = filteredData.reduce((a, r) => a + r.valorTotal, 0);
  const totalCusto = filteredData.reduce((a, r) => a + r.custo, 0);
  const totalGlosa = filteredData.reduce((a, r) => a + r.valorGlosado, 0);

  // ----- per-package summary -----
  const pacoteSummary = useMemo<PacoteStat[]>(() =>
    PACOTE_HORAS_NUMERICOS.map(p => {
      const rows = filteredData.filter(r => r.pacoteHoras === p);
      const venda = rows.reduce((a, r) => a + r.valorTotal, 0);
      const custo = rows.reduce((a, r) => a + r.custo, 0);
      const glosa = rows.reduce((a, r) => a + r.valorGlosado, 0);
      return { pacote: p, venda, custo, glosa, pct: totalVenda > 0 ? (venda / totalVenda) * 100 : 0 };
    }),
  [filteredData, totalVenda]);

  // ----- patient rows -----
  const patientRows = useMemo<PatientPacoteRow[]>(() => {
    const map = new Map<string, PatientPacoteRow>();

    filteredData.forEach(r => {
      if (!map.has(r.pacienteId)) {
        const emptyPacotes = Object.fromEntries(
          PACOTE_HORAS_NUMERICOS.map(p => [p, { venda: 0, custo: 0, glosa: 0 }])
        ) as Record<PacoteKey, { venda: number; custo: number; glosa: number }>;

        map.set(r.pacienteId, {
          pacienteId: r.pacienteId,
          nome: r.nomePaciente,
          municipio: r.municipio,
          operadora: r.operadora,
          pacotes: emptyPacotes,
          totalVenda: 0, totalCusto: 0, totalGlosa: 0,
        });
      }

      const entry = map.get(r.pacienteId)!;
      const p = r.pacoteHoras as PacoteKey;

      if ((PACOTE_HORAS_NUMERICOS as readonly string[]).includes(p)) {
        entry.pacotes[p].venda += r.valorTotal;
        entry.pacotes[p].custo += r.custo;
        entry.pacotes[p].glosa += r.valorGlosado;
      }

      entry.totalVenda += r.valorTotal;
      entry.totalCusto += r.custo;
      entry.totalGlosa += r.valorGlosado;
    });

    return Array.from(map.values())
      .sort((a, b) => b.totalVenda - a.totalVenda)
      .slice(0, 100);
  }, [filteredData]);

  const bruto = totalVenda - totalCusto;
  const liquido = bruto - totalGlosa;
  const nPac = new Set(filteredData.map(r => r.pacienteId)).size || 1;
  const nMes = new Set(filteredData.map(r => `${r.ano}-${r.mes}`)).size || 1;

  const totals = { venda: totalVenda, custo: totalCusto, bruto, liquido, glosa: totalGlosa };

  return (
    <div className="space-y-5">
      {/* ── KPIs: standard ────────────────────────────────────────── */}
      <TabKpiStrip
        totals={totals}
        monthlyAverages={{ venda: totals.venda / nMes, custo: totals.custo / nMes, bruto: totals.bruto / nMes, liquido: totals.liquido / nMes, glosa: totals.glosa / nMes }}
        patientAverages={{ venda: totals.venda / nPac, custo: totals.custo / nPac, bruto: totals.bruto / nPac, liquido: totals.liquido / nPac, glosa: totals.glosa / nPac }}
        currencyFormatter={fmt}
      />

      {/* ── Package detail cards ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-3">
        {pacoteSummary.map(({ pacote, venda, custo, glosa, pct }) => (
          <Card key={pacote} className="border border-zinc-200 rounded-lg shadow-sm flex-1 min-w-[150px]">
            <CardContent className="pt-3 pb-3 px-4 space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Pacote {pacote}</p>
                <Badge variant="secondary" className="text-[10px]">{pct.toFixed(1)}%</Badge>
              </div>
              <div className="h-1 w-full bg-zinc-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${PACOTE_COLORS[pacote].bar}`} style={{ width: `${Math.min(pct, 100)}%` }} />
              </div>
              <p className="text-base font-bold text-zinc-900 tabular-nums">{fmt(venda)}</p>
              <div className="border-t border-zinc-100 pt-1 space-y-0.5 text-[11px]">
                <div className="flex justify-between"><span className="text-zinc-400">Custo</span><span className="text-emerald-700 font-medium tabular-nums">{fmt(custo)}</span></div>
                <div className="flex justify-between"><span className="text-zinc-400">Glosa</span><span className="text-orange-600 font-medium tabular-nums">{fmt(glosa)}</span></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Patient breakdown — always-open transposed sub-table ─── */}
      <Card className="border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
        <DashboardCardHeader
          icon={Clock}
          title="Detalhamento por Paciente"
          period={period}
          isFullYear={isFullYear}
        />
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow className="hover:bg-transparent border-b border-zinc-200">
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider py-2">Nome / ID</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider py-2">Município</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider py-2">Operadora</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider py-2 text-right">Venda</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider py-2 text-right">Custo</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider py-2 text-right">Bruto</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider py-2 text-right">Líquido</TableHead>
                <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider py-2 text-right">Glosa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patientRows.map((row) => (
                <>
                  {/* Summary row */}
                  <TableRow key={row.pacienteId} className="hover:bg-zinc-50 border-b border-zinc-100">
                    <TableCell className="py-2">
                      <div className="font-medium text-zinc-800 text-sm">{row.nome !== 'S/I' ? row.nome : '—'}</div>
                      <div className="text-[10px] text-zinc-400 font-mono">{row.pacienteId}</div>
                    </TableCell>
                    <TableCell className="text-zinc-600 text-sm py-2">{row.municipio}</TableCell>
                    <TableCell className="text-zinc-600 text-sm py-2">{row.operadora}</TableCell>
                    <TableCell className="text-right font-semibold text-zinc-900 tabular-nums py-2">{fmt(row.totalVenda)}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-700 tabular-nums py-2">{fmt(row.totalCusto)}</TableCell>
                    <TableCell className={`text-right font-semibold tabular-nums py-2 ${(row.totalVenda - row.totalCusto) >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>{fmt(row.totalVenda - row.totalCusto)}</TableCell>
                    <TableCell className={`text-right font-semibold tabular-nums py-2 ${(row.totalVenda - row.totalCusto - row.totalGlosa) >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>{fmt(row.totalVenda - row.totalCusto - row.totalGlosa)}</TableCell>
                    <TableCell className="text-right font-semibold text-orange-600 tabular-nums py-2">{fmt(row.totalGlosa)}</TableCell>
                  </TableRow>

                  {/* Always-open breakdown per pacote (transposed) */}
                  <TableRow key={`${row.pacienteId}-detail`} className="bg-zinc-50/70 border-b border-zinc-200">
                    <TableCell colSpan={8} className="py-2 px-4">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-[9px] text-zinc-400 uppercase tracking-wider border-b border-zinc-200">
                            <th className="text-left pb-1 font-semibold w-24">Pacote</th>
                            <th className="text-right pb-1 font-semibold text-blue-600">Venda</th>
                            <th className="text-right pb-1 font-semibold text-emerald-700">Custo</th>
                            <th className="text-right pb-1 font-semibold text-violet-600">Bruto</th>
                            <th className="text-right pb-1 font-semibold text-cyan-600">Líquido</th>
                            <th className="text-right pb-1 font-semibold text-orange-600">Glosa</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PACOTE_HORAS_NUMERICOS.map(p => {
                            const { venda, custo, glosa } = row.pacotes[p];
                            if (venda === 0 && custo === 0 && glosa === 0) return null;
                            return (
                              <tr key={p} className="border-t border-zinc-100">
                                <td className="py-1 font-medium text-zinc-600">
                                  <div className="flex items-center gap-1.5">
                                    <div className={`w-1.5 h-1.5 rounded-full ${PACOTE_COLORS[p].dot}`} />
                                    {p}
                                  </div>
                                </td>
                                <td className="py-1 text-right tabular-nums text-zinc-700">{fmt(venda)}</td>
                                <td className="py-1 text-right tabular-nums text-emerald-700">{fmt(custo)}</td>
                                <td className={`py-1 text-right tabular-nums ${(venda - custo) >= 0 ? 'text-violet-600' : 'text-orange-600'}`}>{fmt(venda - custo)}</td>
                                <td className={`py-1 text-right tabular-nums ${(venda - custo - glosa) >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>{fmt(venda - custo - glosa)}</td>
                                <td className="py-1 text-right tabular-nums text-orange-600">{fmt(glosa)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </TableCell>
                  </TableRow>
                </>
              ))}
              {patientRows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-zinc-400 py-4 text-sm">
                    Sem dados para o período selecionado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
