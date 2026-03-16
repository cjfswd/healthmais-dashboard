import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { UploadCloud, FileText } from 'lucide-react';
import { cn } from '@lib/utils';
import { useDashboard } from '@application/contexts/DashboardContext';
import { Button } from '@ui/components/ui/button';
import { Skeleton } from '@ui/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@ui/components/ui/select';
import { Card } from '@ui/components/ui/card';
import { FileSpreadsheet } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/dashboard/geral', label: 'Geral' },
  { to: '/dashboard/procedimentos', label: 'Procedimentos' },
  { to: '/dashboard/geografico', label: 'Geográfico' },
  { to: '/dashboard/operadoras', label: 'Operadoras' },
  { to: '/dashboard/faixa-etaria', label: 'Faixa Etária' },
  { to: '/dashboard/horas', label: 'Horas' },
  { to: '/dashboard/analitico', label: 'Analítico' },
] as const;

const ROUTE_TITLES: Record<string, string> = {
  '/dashboard/geral': 'Visão Geral',
  '/dashboard/procedimentos': 'Procedimentos',
  '/dashboard/geografico': 'Geográfico',
  '/dashboard/operadoras': 'Operadoras',
  '/dashboard/faixa-etaria': 'Faixa Etária',
  '/dashboard/horas': 'Atendimento Horas',
  '/dashboard/analitico': 'Análise Analítica',
};

const MES_LABELS: Record<string, string> = {
  '1': 'Jan', '2': 'Fev', '3': 'Mar', '4': 'Abr',
  '5': 'Mai', '6': 'Jun', '7': 'Jul', '8': 'Ago',
  '9': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    filterAno, setFilterAno,
    filterMes, setFilterMes,
    filterOperadora, setFilterOperadora,
    uniqueAnos, uniqueMeses, uniqueOperadoras,
    loading, fileName, handleFileUpload, handleFetchDefault,
    filteredData,
  } = useDashboard();


  const pageTitle = ROUTE_TITLES[location.pathname] ?? 'Dashboard';

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <Skeleton className="h-8 w-52" />
        <div className="flex gap-2 flex-wrap">
          {NAV_ITEMS.map(n => <Skeleton key={n.to} className="h-8 w-24 rounded-md" />)}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {[...Array(7)].map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
        </div>
        <Skeleton className="h-[350px] w-full rounded-lg" />
      </div>
    );
  }

  if (!filteredData.length && !fileName) {
    return (
      <div className="flex items-center justify-center p-4 min-h-[60vh]">
        <Card className="w-full max-w-md border border-zinc-200 rounded-lg shadow-sm">
          <div className="flex flex-col items-center gap-5 p-6">
            <div className="bg-zinc-100 w-14 h-14 rounded-md flex items-center justify-center">
              <FileSpreadsheet className="w-7 h-7 text-zinc-500" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-zinc-900">Healthmais Analytics</h2>
              <p className="text-zinc-500 text-sm mt-1">Carregue a base de dados para iniciar o dashboard.</p>
            </div>
            <div className="flex flex-col gap-3 w-full">
              <div className="border border-dashed border-zinc-300 rounded-md p-6 hover:bg-zinc-50 transition-colors flex flex-col items-center cursor-pointer relative">
                <input type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                <span className="font-semibold text-sm text-zinc-700">Subir Arquivo Excel</span>
              </div>
              <Button onClick={handleFetchDefault} className="h-10 rounded-md bg-zinc-900 hover:bg-zinc-800">
                Carregar Base Sistema
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page title + global filters */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900">{pageTitle}</h2>
          <p className="text-xs text-zinc-500 mt-0.5">• Dados Consolidados (2024-2025) — <span className="font-medium">{fileName}</span></p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Select value={filterOperadora} onValueChange={setFilterOperadora}>
            <SelectTrigger className="h-9 w-[200px] rounded-md border-zinc-200 text-sm font-medium">
              <SelectValue placeholder="Todas as Operadoras" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Todas as Operadoras</SelectItem>
              {uniqueOperadoras.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterAno} onValueChange={setFilterAno}>
            <SelectTrigger className="h-9 w-[130px] rounded-md border-zinc-200 text-sm font-medium">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Ano: Todos</SelectItem>
              {uniqueAnos.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filterMes} onValueChange={setFilterMes}>
            <SelectTrigger className="h-9 w-[130px] rounded-md border-zinc-200 text-sm font-medium">
              <SelectValue placeholder="Mês" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Todos">Mês: Todos</SelectItem>
              {uniqueMeses.map(m => <SelectItem key={m} value={m}>{MES_LABELS[m] ?? m}</SelectItem>)}
            </SelectContent>
          </Select>

          <Button variant="outline" className="h-9 rounded-md border-zinc-200 text-sm gap-1.5" onClick={() => navigate('/admin')}>
            <FileText size={14} />
            Inserir Dados
          </Button>
        </div>
      </div>

      {/* Tab nav — wraps naturally */}
      <nav className="flex flex-wrap gap-0 border-b border-zinc-200">
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => cn(
              'px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px',
              isActive
                ? 'border-zinc-900 text-zinc-900'
                : 'border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300'
            )}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Tab content — each page renders its own KPI strip + charts/tables */}
      <Outlet />
    </div>
  );
}
