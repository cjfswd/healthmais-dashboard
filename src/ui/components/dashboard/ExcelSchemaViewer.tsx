import { useState, useMemo } from 'react';
import { Table, Layout, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/components/ui/card';
import { Button } from '@ui/components/ui/button';
import { cn } from '@lib/utils';
import type { ExcelSchema } from '@domain/models/faturamento';

interface ExcelSchemaViewerProps {
  schema: ExcelSchema;
  onClose: () => void;
}

export function ExcelSchemaViewer({ schema, onClose }: ExcelSchemaViewerProps) {
  const [selectedSheetName, setSelectedSheetName] = useState<string>(
    schema.sheets[0]?.name || ''
  );

  const selectedSheet = useMemo(() => 
    schema.sheets.find((s) => s.name === selectedSheetName),
    [schema.sheets, selectedSheetName]
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-5xl h-[80vh] flex flex-col shadow-2xl border-0 overflow-hidden rounded-3xl bg-white">
        <CardHeader className="border-b border-slate-100 flex flex-row items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white p-2 rounded-xl">
              <Table size={20} />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Inspecionador de Dados</CardTitle>
              <p className="text-xs text-slate-500 font-medium">Arquitetura SQL-style do Excel</p>
            </div>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-full w-10 h-10 p-0 hover:bg-slate-100">
            <span className="text-xl">×</span>
          </Button>
        </CardHeader>
        
        <CardContent className="flex-1 flex overflow-hidden p-0">
          {/* Sidebar - Sheet List */}
          <div className="w-64 border-r border-slate-100 bg-slate-50/50 overflow-y-auto p-4 flex flex-col gap-2">
            <div className="px-2 mb-2 flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <Layout size={12} />
              <span>Tabelas / Abas</span>
            </div>
            {schema.sheets.map((sheet) => (
              <button
                key={sheet.name}
                onClick={() => setSelectedSheetName(sheet.name)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all text-left",
                  selectedSheetName === sheet.name
                    ? "bg-white text-blue-600 shadow-sm border border-slate-100"
                    : "text-slate-500 hover:bg-white hover:text-slate-700"
                )}
              >
                <Table size={16} className={cn(selectedSheetName === sheet.name ? "text-blue-500" : "text-slate-300")} />
                <span className="truncate">{sheet.name}</span>
              </button>
            ))}
          </div>

          {/* Main Content - Metadata Table */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-800">{selectedSheetName}</h2>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold rounded-md uppercase">
                  {selectedSheet?.columns.length || 0} Colunas
                </span>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <div className="border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80">
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-100">Coluna</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-100">Tipo (Detectado)</th>
                      <th className="px-6 py-4 font-bold text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-100">Exemplo de Dado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSheet?.columns.map((col, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 border-b border-slate-100">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                            <span className="font-semibold text-slate-700">{col.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-100">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-[11px] font-bold uppercase",
                            col.type === 'number' ? "bg-amber-50 text-amber-700" :
                            col.type === 'date' ? "bg-purple-50 text-purple-700" :
                            "bg-slate-100 text-slate-600"
                          )}>
                            {col.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b border-slate-100 text-slate-500 font-mono text-xs">
                          {col.sampleValue === null || col.sampleValue === undefined 
                            ? <span className="text-slate-300 italic">null</span> 
                            : String(col.sampleValue)
                          }
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 bg-blue-50/50 border-t border-blue-100 flex items-center gap-3 px-8">
              <Info size={16} className="text-blue-500" />
              <p className="text-xs text-blue-700 font-medium whitespace-nowrap">
                Os tipos são inferidos com base na primeira linha de dados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
