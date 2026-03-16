import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { Activity, LogOut, Printer } from 'lucide-react';

const MOCK_SECTIONS = [
  { id: 'kpis', label: 'KPIs' },
  { id: 'faturamento', label: 'Faturamento' },
  { id: 'procedimentos', label: 'Procedimentos' },
  { id: 'operadoras', label: 'Operadoras' },
  { id: 'acomodacao', label: 'Acomodação' },
  { id: 'municipio', label: 'Município' },
  { id: 'faixa-etaria', label: 'Faixa Etária' },
  { id: 'pacote-horas', label: 'Pacote Horas' },
  { id: 'sexo', label: 'Sexo' },
  { id: 'analitico', label: 'Analítico' },
] as const;

export function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMockPage = location.pathname === '/dashboard-teste';
  const isEchartsPage = location.pathname === '/echarts-preview';
  const showSectionNav = isMockPage || isEchartsPage;

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pageLabel = isEchartsPage ? 'ECharts Preview' : 'Dashboard Mockup · Teste';

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* Main Content Area */}
      <main className="flex-1">
        {/* Top Navbar */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b border-zinc-200 flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="bg-zinc-900 text-zinc-50 p-1.5 rounded-md shadow-sm shrink-0">
              <Activity size={18} />
            </div>
            <div className="shrink-0">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 leading-none">Healthmais</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-3.5 h-3.5 rounded bg-zinc-900 flex items-center justify-center text-zinc-50 font-bold text-[7px] uppercase">U</div>
                <span className="text-[10px] font-medium text-zinc-400">Admin</span>
              </div>
            </div>

            {/* Dashboard section nav (mock + echarts preview) */}
            {showSectionNav && (
              <div className="hidden lg:flex lg:items-center lg:gap-1">
                <div className="w-px h-7 bg-zinc-200 mx-1 shrink-0" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider whitespace-nowrap shrink-0">{pageLabel}</span>
                <div className="w-px h-7 bg-zinc-200 mx-1" />
                <nav className="flex items-center gap-0.5">
                  {MOCK_SECTIONS.map(s => (
                    <button
                      key={s.id}
                      onClick={() => scrollTo(s.id)}
                      className="px-2 py-1 text-[10px] font-semibold text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {s.label}
                    </button>
                  ))}
                </nav>
                <div className="w-px h-7 bg-zinc-200 mx-1" />
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer whitespace-nowrap"
                  title="Exportar como PDF"
                >
                  <Printer size={12} />
                  PDF
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/')}
            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-md hover:bg-zinc-100 transition-all text-zinc-400 hover:text-zinc-900 border border-transparent hover:border-zinc-200 shrink-0"
          >
            <LogOut size={16} />
          </button>
        </header>

        {/* Content */}
        <div className="max-w-7xl mx-auto p-2 sm:p-6 animate-in fade-in duration-500">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function NavLink({ to, label }: { to: string, label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${isActive
          ? 'bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200'
          : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-50'
        }`}
    >
      {label}
    </Link>
  );
}
