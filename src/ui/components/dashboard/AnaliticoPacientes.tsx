import * as React from 'react';
import { Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/components/ui/table';
import { Card, CardContent } from '@ui/components/ui/card';
import { DashboardCardHeader } from '@ui/components/dashboard/DashboardCardHeader';
import { cn } from '@lib/utils';
import type { Faturamento } from '@domain/models/faturamento';

interface Props {
  data: Faturamento[];
  currencyFormatter: (val: number) => string;
  period?: string;
  isFullYear?: boolean;
}

export const AnaliticoPacientes: React.FC<Props> = ({ data, currencyFormatter, period, isFullYear }) => {


  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm overflow-hidden mb-12">
      <DashboardCardHeader
        icon={Users}
        title="Detalhamento por Paciente"
        period={period}
        isFullYear={isFullYear}
      />
      <CardContent className="p-0 overflow-auto">
        <Table>
          <TableHeader className="bg-zinc-50">
            <TableRow className="hover:bg-transparent border-b border-zinc-200">
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Paciente</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Município</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Status</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Acomodação</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider">Operadora</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Custo</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Bruto</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Líquido</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Glosa</TableHead>
              <TableHead className="font-semibold text-zinc-500 text-[10px] uppercase tracking-wider text-right">Faturado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 50).map((row, i) => (
              <TableRow key={i} className="hover:bg-zinc-50 transition-colors border-b border-zinc-100 last:border-0">
                <TableCell className="font-medium text-zinc-800">{row.pacienteId}</TableCell>
                <TableCell className="text-zinc-600 text-sm">{row.municipio}</TableCell>
                <TableCell>
                  <span className={cn(
                    "px-2 py-0.5 text-[10px] font-semibold rounded-md uppercase tracking-tight",
                    row.statusPaciente.includes('Alta')
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-zinc-100 text-zinc-600"
                  )}>
                    {row.statusPaciente}
                  </span>
                </TableCell>
                <TableCell className="text-zinc-600 text-sm">{row.acomodacao}</TableCell>
                <TableCell className="text-zinc-600 text-sm">{row.operadora}</TableCell>
                <TableCell className="text-right text-emerald-700 font-mono text-xs font-medium">{currencyFormatter(row.custo)}</TableCell>
                <TableCell className={cn('text-right font-mono text-xs font-semibold', (row.valorTotal - row.custo) >= 0 ? 'text-violet-600' : 'text-orange-600')}>{currencyFormatter(row.valorTotal - row.custo)}</TableCell>
                <TableCell className={cn('text-right font-mono text-xs font-semibold', (row.valorTotal - row.custo - row.valorGlosado) >= 0 ? 'text-cyan-600' : 'text-orange-600')}>{currencyFormatter(row.valorTotal - row.custo - row.valorGlosado)}</TableCell>
                <TableCell className="text-right text-orange-600 font-mono text-xs font-medium">{currencyFormatter(row.valorGlosado)}</TableCell>
                <TableCell className="text-right font-semibold text-zinc-900 font-mono text-xs">{currencyFormatter(row.valorTotal)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
