import { useNavigate } from 'react-router-dom';
import { FileSpreadsheet, UploadCloud, ArrowLeft, Database, Info } from 'lucide-react';
import { useDashboard } from '@application/contexts/DashboardContext';
import { Button } from '@ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/components/ui/card';
import { useEffect } from 'react';

export function NewAnalysisPage() {
  const navigate = useNavigate();
  const { handleFileUpload, handleFetchDefault } = useDashboard();

  useEffect(() => {
    // When entering "New Analysis", we don't necessarily want to clear data immediately
    // but if the user uploads a new one, it will overwrite.
  }, []);

  const onUploadSuccess = () => {
    navigate('/dashboard');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFileUpload(e);
    onUploadSuccess();
  };

  const handleDefaultLoad = async () => {
    await handleFetchDefault();
    onUploadSuccess();
  };

  return (
    <div className="animate-in fade-in duration-500 max-w-xl mx-auto py-10">
      <div className="flex items-center gap-4 mb-8 text-center sm:text-left justify-center sm:justify-start">
        <Button
          variant="ghost"
          onClick={() => navigate('/dashboard')}
          className="rounded-md w-9 h-9 p-0 hover:bg-zinc-100"
        >
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Nova Análise</h1>
          <p className="text-xs text-zinc-500 font-medium">Configure uma nova base de dados para seu dashboard</p>
        </div>
      </div>

      <Card className="w-full shadow-sm border border-zinc-200 rounded-lg p-6 bg-white">
        <CardHeader className="text-center p-0 mb-8">
          <div className="mx-auto bg-zinc-900 text-zinc-50 w-14 h-14 rounded-md flex items-center justify-center mb-4 shadow-sm">
            <FileSpreadsheet className="w-7 h-7" />
          </div>
          <CardTitle className="text-2xl font-bold text-zinc-900 tracking-tight">Healthmais Ecosystem</CardTitle>
          <p className="text-zinc-500 font-medium mt-1 text-sm">Selecione como deseja carregar os dados</p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 p-0">
          <div className="grid grid-cols-1 gap-5">
            <div className="group relative border border-dashed border-zinc-200 rounded-lg p-10 hover:border-zinc-400 hover:bg-zinc-50/50 transition-all flex flex-col items-center cursor-pointer overflow-hidden">
              <input
                type="file"
                accept=".xlsx, .xls"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="bg-zinc-100 group-hover:bg-zinc-200 p-3 rounded-md mb-3 transition-colors">
                <UploadCloud className="w-6 h-6 text-zinc-600 transition-colors" />
              </div>
              <span className="font-semibold text-zinc-800 text-base">Subir Arquivo Excel</span>
              <p className="text-xs text-zinc-400 mt-1">Arraste ou clique para selecionar</p>
            </div>

            <div className="flex items-center gap-3 py-1">
              <div className="h-px bg-zinc-100 flex-1"></div>
              <span className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">OU UTILIZE O PADRÃO</span>
              <div className="h-px bg-zinc-100 flex-1"></div>
            </div>

            <Button
              onClick={handleDefaultLoad}
              variant="ghost"
              className="h-16 rounded-md bg-zinc-900 text-zinc-50 hover:bg-zinc-800 hover:text-white flex items-center justify-between px-6 group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white/10 p-1.5 rounded">
                  <Database size={16} />
                </div>
                <div className="text-left">
                  <span className="block font-semibold text-sm">Carregar Base Sistema</span>
                  <span className="text-[10px] text-zinc-400">POWERBI.xlsx (Base Demonstrativa)</span>
                </div>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <ArrowLeft className="rotate-180" size={12} />
              </div>
            </Button>
          </div>

          <div className="mt-2 p-4 bg-zinc-50 rounded-md border border-zinc-100 flex gap-3">
            <div className="mt-0.5">
              <Info size={14} className="text-zinc-600" />
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed font-medium">
              Ao carregar uma nova base, todos os filtros e análises atuais serão reiniciados para refletir os novos dados.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
