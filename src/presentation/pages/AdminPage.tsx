import React, { useState, useRef, useCallback } from 'react';
import { Upload, CheckCircle, XCircle, FileText } from 'lucide-react';
import { Button } from '@ui/components/ui/button';
import { DiffViewer } from '@presentation/components/DiffViewer';
import type { ExcelDiff } from '@domain/models/excel-diff';
import CompareWorker from '@application/workers/compare.worker?worker';

export const AdminPage: React.FC = () => {
  const [newFileBuffer, setNewFileBuffer] = useState<ArrayBuffer | null>(null);
  const [newFileName, setNewFileName] = useState<string>('');
  const [diff, setDiff] = useState<ExcelDiff | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  // Ref to reset the file input value so onChange fires even for the same file
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetInput = () => { if (fileInputRef.current) fileInputRef.current.value = ''; };

  // Cache production file so it is only downloaded once per session
  const cachedProductionBuffer = useRef<ArrayBuffer | null>(null);

  const fetchProductionBuffer = useCallback(async (): Promise<ArrayBuffer> => {
    if (cachedProductionBuffer.current) return cachedProductionBuffer.current;
    const res = await fetch('/POWERBI.xlsx');
    const buffer = await res.arrayBuffer();
    cachedProductionBuffer.current = buffer;
    return buffer;
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const [newBuffer, currentBuffer] = await Promise.all([
        file.arrayBuffer(),
        fetchProductionBuffer(),
      ]);

      setNewFileBuffer(newBuffer);
      setNewFileName(file.name);

      const result = await new Promise<ExcelDiff>((resolve, reject) => {
        const worker = new CompareWorker();
        worker.postMessage({ originalBuffer: currentBuffer, newBuffer }, [
          currentBuffer.slice(0),
          newBuffer.slice(0),
        ]);
        worker.onmessage = (event: MessageEvent<{ ok: true; result: ExcelDiff } | { ok: false; error: string }>) => {
          worker.terminate();
          if (event.data.ok) resolve(event.data.result);
          else reject(new Error(event.data.error));
        };
        worker.onerror = (err) => {
          worker.terminate();
          reject(err);
        };
      });

      setDiff(result);
    } catch (err) {
      console.error('Erro no processamento:', err);
      alert('Erro: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsUploading(false);
    }
  };


  const handleApprove = async () => {
    if (!newFileBuffer) return;
    setIsApproving(true);

    try {
      // 1. Convert ArrayBuffer to Base64 for GitHub API
      const uint8 = new Uint8Array(newFileBuffer);
      let binary = '';
      const chunk_size = 8192;
      for (let i = 0; i < uint8.length; i += chunk_size) {
        binary += String.fromCharCode.apply(null, uint8.subarray(i, i + chunk_size) as any);
      }
      const base64Content = btoa(binary);

      // 2. Direct GitHub API call
      const owner = import.meta.env.VITE_GITHUB_OWNER || 'cjfswds-projects';
      const repo = import.meta.env.VITE_GITHUB_REPO || 'xlxs';
      const path = 'public/POWERBI.xlsx';
      const token = import.meta.env.VITE_GITHUB_TOKEN;

      if (!token) {
        throw new Error('GITHUB_TOKEN não configurado no ambiente (.env)');
      }

      const getFileRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        headers: { 'Authorization': `token ${token}` }
      });
      const fileData = await getFileRes.json();
      const sha = fileData.sha;

      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
        method: 'PUT',
        headers: {
          'Authorization': `token ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Update ${path} via Admin Portal`,
          content: base64Content,
          sha: sha,
          branch: "main"
        })
      });

      if (res.ok) {
        alert('Arquivo enviado ao GitHub com sucesso! O build será iniciado.');
        setNewFileBuffer(null);
        setDiff(null);
        resetInput();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Erro no GitHub API');
      }
    } catch (err) {
      alert('Erro ao aprovar: ' + err);
    } finally {
      setIsApproving(false);
    }
  }; return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Administração</h1>
          <p className="text-zinc-500 text-sm mt-1">Gerencie versões do PowerBI Excel e aprove novas atualizações.</p>
        </div>

        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            id="excel-upload"
            className="hidden"
            accept=".xlsx"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <Button
            asChild
            className="rounded-md h-10 px-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-50 shadow-sm"
          >
            <label htmlFor="excel-upload" className="cursor-pointer flex items-center gap-2">
              <Upload size={16} />
              {isUploading ? 'Processando...' : 'Subir Nova Versão'}
            </label>
          </Button>
        </div>
      </div>

      {!newFileBuffer && (
        <div className="bg-white rounded-lg p-12 border border-zinc-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-zinc-50 rounded-lg flex items-center justify-center mx-auto text-zinc-400 border border-zinc-100">
            <FileText size={24} />
          </div>
          <p className="text-zinc-500 text-sm font-medium">Nenhuma versão pendente para revisão.</p>
        </div>
      )}

      {newFileBuffer && diff && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-400 space-y-6">
          <div className="bg-zinc-900 text-zinc-50 rounded-lg p-6 flex items-center justify-between border border-zinc-800">
            <div className="flex items-center gap-4">
              <div className="bg-zinc-800 p-3 rounded-md border border-zinc-700">
                <FileText size={20} />
              </div>
              <div>
                <div className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">Versão Pendente</div>
                <h2 className="text-lg font-semibold tracking-tight">{newFileName}</h2>
                <p className="text-zinc-500 text-xs mt-0.5">Carregado em {new Date().toLocaleString()}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md h-9 px-4 text-sm"
                onClick={() => { setNewFileBuffer(null); setDiff(null); resetInput(); }}
              >
                <XCircle size={16} className="mr-2" />
                Descartar
              </Button>
              <Button
                className="bg-zinc-50 text-zinc-950 hover:bg-zinc-200 rounded-md h-9 px-6 text-sm font-semibold"
                onClick={handleApprove}
                disabled={isApproving}
              >
                <CheckCircle size={16} className="mr-2" />
                {isApproving ? 'Aprovando...' : 'Aprovar e Buildar'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <StatsCard label="Adicionadas" value={diff.summary.added} color="text-emerald-600" />
            <StatsCard label="Removidas" value={diff.summary.removed} color="text-red-600" />
            <StatsCard label="Modificadas" value={diff.summary.modified} color="text-amber-600" />
          </div>

          <div className="rounded-lg overflow-hidden">
            <DiffViewer diff={diff} />
          </div>
        </div>
      )}
    </div>
  );
};

const StatsCard = ({ label, value, color }: { label: string, value: number, color: string }) => (
  <div className="bg-white p-5 rounded-lg border border-zinc-200 shadow-sm">
    <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{label}</div>
    <div className={`text-2xl font-bold mt-1 tracking-tight ${color}`}>{value}</div>
  </div>
);
