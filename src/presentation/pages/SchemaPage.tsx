import { useState, useMemo, useEffect } from 'react';
import { Table, ArrowLeft, Download, Link, GitBranch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboard } from '@application/contexts/DashboardContext';
import { Button } from '@ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/components/ui/card';
import { Badge } from '@ui/components/ui/badge';
import { cn } from '@lib/utils';

export function SchemaPage() {
  const navigate = useNavigate();
  const { schema, inspectCurrentFile } = useDashboard();
  const [selectedSheetName, setSelectedSheetName] = useState<string>('');

  useEffect(() => {
    if (!schema) {
      inspectCurrentFile();
    }
  }, [schema, inspectCurrentFile]);

  useEffect(() => {
    if (schema && schema.sheets.length > 0 && !selectedSheetName) {
      setSelectedSheetName(schema.sheets[0].name);
    }
  }, [schema, selectedSheetName]);

  const selectedSheet = useMemo(() => 
    schema?.sheets.find((s) => s.name === selectedSheetName),
    [schema?.sheets, selectedSheetName]
  );

  if (!schema) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center font-medium text-zinc-500 animate-pulse">
        Carregando documentação do schema...
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="rounded-md w-9 h-9 p-0 hover:bg-zinc-100"
          >
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Documentação Excel</h1>
            <p className="text-xs text-zinc-500 font-medium">Estrutura de dados e tipos inferidos do projeto</p>
          </div>
        </div>
        
        <Button variant="outline" className="rounded-md border-zinc-200 shadow-sm gap-2 h-9 text-sm">
          <Download size={14} />
          Baixar Modelo
        </Button>
      </div>

      <Card className="w-full h-[75vh] flex flex-col shadow-sm border border-zinc-200 overflow-hidden rounded-lg bg-white">
        <CardHeader className="border-b border-zinc-100 flex flex-row items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="bg-zinc-900 text-zinc-50 p-2 rounded-md">
              <Table size={18} />
            </div>
            <div>
              <CardTitle className="text-lg font-bold">Inspecionador de Dados</CardTitle>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Arquitetura SQL-style do Excel</p>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex overflow-hidden p-0">
          {/* Sidebar - Sheet List */}
          <div className="w-64 border-r border-zinc-100 bg-zinc-50/50 overflow-y-auto p-3 flex flex-col gap-1">
            <div className="px-2 mb-2 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest py-1">
              <span>Tabelas / Abas</span>
            </div>
            {schema.sheets.map((sheet) => (
              <button
                key={sheet.name}
                onClick={() => setSelectedSheetName(sheet.name)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all text-left",
                  selectedSheetName === sheet.name
                    ? "bg-white text-zinc-900 shadow-sm border border-zinc-200 ring-1 ring-zinc-200"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700"
                )}
              >
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  selectedSheetName === sheet.name ? "bg-zinc-900" : "bg-zinc-300"
                )} />
                <span className="truncate">{sheet.name}</span>
              </button>
            ))}
          </div>

          {/* Main Content - Metadata Table */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 bg-white/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-zinc-800">{selectedSheetName}</h2>
                <Badge variant="outline" className="text-[10px] font-bold h-5 bg-zinc-50 text-zinc-500 border-zinc-100">
                  {selectedSheet?.columns.length || 0} Colunas
                </Badge>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                  <tr className="bg-zinc-50">
                    <th className="px-6 py-3 font-bold text-zinc-500 uppercase text-[10px] tracking-widest border-b border-zinc-100">Coluna</th>
                    <th className="px-6 py-3 font-bold text-zinc-500 uppercase text-[10px] tracking-widest border-b border-zinc-100">Tipo (Detectado)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {selectedSheet?.columns.map((col, idx) => (
                    <tr key={idx} className="hover:bg-zinc-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-1 h-1 rounded-full bg-zinc-900 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          <span className="font-semibold text-zinc-700">{col.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={cn(
                            "inline-flex w-fit px-2 py-0.5 rounded text-[10px] font-bold uppercase border",
                            col.type === 'number' ? "bg-amber-50 text-amber-700 border-amber-100" :
                            col.type === 'date' ? "bg-blue-50 text-blue-700 border-blue-100" :
                            col.type === 'enum' ? "bg-zinc-100 text-zinc-900 border-zinc-200" :
                            "bg-emerald-50 text-emerald-700 border-emerald-100"
                          )}>
                            {col.type}
                          </span>
                          
                          {col.type === 'enum' && col.enumValues && (
                            <div className="flex flex-wrap gap-1 max-w-md">
                              {col.enumValues.map((val) => (
                                <span 
                                  key={val} 
                                  className="px-1.5 py-0.5 bg-white text-zinc-500 rounded border border-zinc-100 text-[9px] font-medium"
                                >
                                  {val}
                                </span>
                              ))}
                            </div>
                          )}
                          {col.references && (
                            <div className="flex items-center gap-1.5 mt-0.5 text-[9px] font-semibold text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100 w-fit">
                              <Link size={10} />
                              <span>FK: {col.references.sheet}.{col.references.column}</span>
                            </div>
                          )}

                          {col.usedBy && col.usedBy.length > 0 && (
                            <div className="flex flex-col gap-1 mt-0.5">
                              {col.usedBy.map((ref, ridx) => (
                                <div key={ridx} className="flex items-center gap-1.5 text-[9px] font-semibold text-zinc-500 bg-zinc-50 px-1.5 py-0.5 rounded border border-zinc-100 w-fit">
                                  <GitBranch size={10} />
                                  <span>Usado em: {ref.sheet}.{ref.column}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
