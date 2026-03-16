import { Activity, FileSpreadsheet, UploadCloud, Layout } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@application/contexts/DashboardContext';

// UI Components
import { Button } from '@ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/components/ui/card';

// Dashboard Components
// Dashboard Components
import { AnaliticoPacientes } from '@ui/components/dashboard/AnaliticoPacientes';
import { AtendimentoHorasChart } from '@ui/components/dashboard/AtendimentoHorasChart';
import { FaixaEtariaSection } from '@ui/components/dashboard/FaixaEtariaSection';
import { FaturamentoMensalChart } from '@ui/components/dashboard/FaturamentoMensalChart';
import { KpiCard } from '@ui/components/dashboard/KpiCard';
import { MunicipioChart } from '@ui/components/dashboard/MunicipioChart';
import { OperadoraChart } from '@ui/components/dashboard/OperadoraChart';
import { PacoteHorasChart } from '@ui/components/dashboard/PacoteHorasChart';
import { PieDataChart } from '@ui/components/dashboard/PieDataChart';
import { ProcedimentoTable } from '@ui/components/dashboard/ProcedimentoTable';
import { TipoProcedimentoChart } from '@ui/components/dashboard/TipoProcedimentoChart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@ui/components/ui/select';
import { Badge } from '@ui/components/ui/badge';
import { Skeleton } from '@ui/components/ui/skeleton';

export function DashboardPage() {
  const navigate = useNavigate();
  const {
    filterAno,
    setFilterAno,
    filterOperadora,
    setFilterOperadora,
    loading,
    fileName,
    handleFileUpload,
    handleFetchDefault,
    filteredData,
    uniqueAnos,
    uniqueOperadoras,
    kpis,
    monthlyAggregation,
    faixaEtariaAggregation,
    categoryAggregation,
    pieAggregation,
    atendimentoHorasAggregation,
  } = useDashboard();

  const currencyFormatter = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0
    }).format(val);


  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-md" />
            <div className="space-y-1.5">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-24 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-zinc-100 mb-6 flex gap-6">
          <Skeleton className="h-8 w-40 rounded-sm" />
          <Skeleton className="h-8 w-64 rounded-sm" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 mb-6">
          {[...Array(7)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>

        <div className="space-y-8">
          <Skeleton className="h-[350px] w-full rounded-lg" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-[300px] rounded-lg" />
            <Skeleton className="h-[300px] rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!filteredData.length && !fileName) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[60vh]">
        <Card className="w-full max-w-md shadow-sm border border-zinc-200 rounded-lg p-2">
          <CardHeader className="text-center">
            <div className="mx-auto bg-zinc-100 w-14 h-14 rounded-md flex items-center justify-center mb-4">
              <FileSpreadsheet className="w-7 h-7 text-zinc-500" />
            </div>
            <CardTitle className="text-xl font-bold text-zinc-900">Healthmais Ecosystem</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <p className="text-zinc-500 text-sm text-center">Inicie seu dashboard carregando a base de dados oficial.</p>
            <div className="flex flex-col gap-3">
              <div className="border border-dashed border-zinc-300 rounded-md p-6 hover:bg-zinc-50 transition-colors flex flex-col items-center cursor-pointer relative">
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                <span className="font-semibold text-sm text-zinc-700">Subir Arquivo Excel</span>
              </div>
              <Button onClick={handleFetchDefault} className="h-10 rounded-md bg-zinc-900 hover:bg-zinc-800">
                Carregar Base Sistema
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-zinc-900 text-zinc-50 p-2 rounded-md shadow-sm">
            <Activity size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Healthmais Analytics</h1>
            <div className="flex items-center gap-2">
              <p className="text-xs text-zinc-500 font-medium">Dashboard Administrativo</p>
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 border-zinc-200 font-semibold px-2 py-0 h-5">
                {fileName}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate('/schema')} className="rounded-md border-zinc-200 shadow-sm gap-2 h-9">
            <Layout size={14} />
            Schema
          </Button>
          <Button variant="outline" onClick={() => navigate('/new-analysis')} className="rounded-md border-zinc-200 shadow-sm h-9">
            Nova Análise
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-6 flex flex-wrap gap-6 items-end">
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-0.5">Ano Exercício</span>
          <Select value={filterAno} onValueChange={setFilterAno}>
            <SelectTrigger className="w-[180px] h-9 rounded-md bg-zinc-50 border-zinc-200 focus:ring-zinc-400 font-medium text-sm">
              <SelectValue placeholder="Selecione o ano" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-zinc-200 shadow-md">
              <SelectItem value="Todos" className="rounded-sm">Todos os Anos</SelectItem>
              {uniqueAnos.map(a => (
                <SelectItem key={a} value={String(a)} className="rounded-sm">{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-0.5">Seleção de Operadora</span>
          <Select value={filterOperadora} onValueChange={setFilterOperadora}>
            <SelectTrigger className="w-[240px] h-9 rounded-md bg-zinc-50 border-zinc-200 focus:ring-zinc-400 font-medium text-sm">
              <SelectValue placeholder="Selecione a operadora" />
            </SelectTrigger>
            <SelectContent className="rounded-md border-zinc-200 shadow-md max-h-[300px]">
              <SelectItem value="Todos" className="rounded-sm">Todas Operadoras</SelectItem>
              {uniqueOperadoras.map(o => (
                <SelectItem key={o} value={o} className="rounded-sm">{o}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mb-8">
        {[
          { label: 'Faturamento Total', val: kpis.total, type: 'currency' as const, color: 'blue', tooltip: 'Soma total dos valores faturados no período selecionado.' },
          { label: 'Custo Total', val: kpis.custo, type: 'currency' as const, color: 'emerald', tooltip: 'Custo operacional acumulado referente aos procedimentos realizados.' },
          { label: 'Valor Glosado', val: kpis.glosa, type: 'currency' as const, color: 'rose', tooltip: 'Total de valores contestados ou não pagos pelas operadoras.' },
          { label: 'Resultado Bruto', val: kpis.resultado, type: 'currency' as const, color: kpis.resultado >= 0 ? 'emerald' : 'rose', tooltip: 'Diferença entre o Faturamento Total e o Custo Total.' },
          { label: 'Pacientes Ativos', val: kpis.pacientes, type: 'number' as const, color: 'blue', tooltip: 'Quantidade de pacientes únicos atendidos.' },
          { label: 'Média Mensal', val: kpis.media, type: 'currency' as const, color: 'indigo', tooltip: 'Média de faturamento mensal considerando os meses ativos.' },
          { label: 'Custo Médio/Pcte', val: kpis.custoMedio, type: 'currency' as const, color: 'purple', tooltip: 'Valor médio de custo investido por cada paciente atendido.' },
        ].map((kpi, idx) => (
          <KpiCard
            key={idx}
            label={kpi.label}
            value={kpi.val || 0}
            type={kpi.type}
            currencyFormatter={currencyFormatter}
            tooltip={kpi.tooltip}
          />
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="flex flex-col gap-10 mb-8">
        <FaturamentoMensalChart data={monthlyAggregation} currencyFormatter={currencyFormatter} />

        <FaixaEtariaSection data={faixaEtariaAggregation} currencyFormatter={currencyFormatter} />

        <MunicipioChart data={categoryAggregation('municipio')} currencyFormatter={currencyFormatter} />

        <OperadoraChart data={categoryAggregation('operadora')} currencyFormatter={currencyFormatter} />

        <TipoProcedimentoChart data={categoryAggregation('procedimento')} currencyFormatter={currencyFormatter} />

        <ProcedimentoTable data={categoryAggregation('procedimento').map(v => ({ ...v, Resultado: (v.Venda as number) - (v.Custo as number) }))} currencyFormatter={currencyFormatter} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AtendimentoHorasChart data={atendimentoHorasAggregation} />
          <PacoteHorasChart data={categoryAggregation('pacoteHoras')} currencyFormatter={currencyFormatter} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <PieDataChart data={pieAggregation('acomodacao')} title="Perfil de Acomodação (ID vs AD)" />
          <PieDataChart data={pieAggregation('sexo')} title="Distribuição por Sexo" />
        </div>
      </div>

      {/* Analytics Table */}
      <AnaliticoPacientes data={filteredData} currencyFormatter={currencyFormatter} />
    </div>
  );
}
