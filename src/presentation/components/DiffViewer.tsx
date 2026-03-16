import React, { useState } from 'react';
import type { DiffStatus, ExcelDiff, RowDiff } from '@domain/models/excel-diff';
import { cn } from '@lib/utils';
import { Badge } from '@ui/components/ui/badge';
import { ScrollArea } from '@ui/components/ui/scroll-area';

interface DiffViewerProps {
  diff: ExcelDiff;
}

type FilterType = 'all' | DiffStatus;

const STATUS_LABELS: Record<string, string> = {
  all: 'Todos',
  added: 'Adicionadas',
  removed: 'Removidas',
  modified: 'Modificadas',
};

const FILTER_ACTIVE: Record<string, string> = {
  all: 'bg-zinc-900 text-white border-zinc-900',
  added: 'bg-emerald-600 text-white border-emerald-600',
  removed: 'bg-red-600 text-white border-red-600',
  modified: 'bg-amber-500 text-white border-amber-500',
};

const FILTER_INACTIVE = 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50';

const ROW_CARD: Record<string, string> = {
  added: 'border-l-4 border-l-emerald-500 border-t border-r border-b border-zinc-200 bg-emerald-50/20',
  removed: 'border-l-4 border-l-red-500 border-t border-r border-b border-zinc-200 bg-red-50/10',
  modified: 'border-l-4 border-l-amber-400 border-t border-r border-b border-zinc-200 bg-amber-50/10',
  unchanged: 'border border-zinc-200 bg-white',
};

const ROW_HEADER: Record<string, string> = {
  added: 'bg-emerald-50/60 border-b border-emerald-100',
  removed: 'bg-red-50/40 border-b border-red-100',
  modified: 'bg-amber-50/40 border-b border-amber-100',
  unchanged: 'bg-zinc-50/50 border-b border-zinc-100',
};

const STATUS_BADGE: Record<string, string> = {
  added: 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200',
  removed: 'bg-red-100 text-red-700 ring-1 ring-red-200',
  modified: 'bg-amber-100 text-amber-700 ring-1 ring-amber-200',
  unchanged: 'bg-zinc-100 text-zinc-500',
};

const STATUS_LABEL: Record<string, string> = {
  added: 'Adicionada',
  removed: 'Removida',
  modified: 'Modificada',
  unchanged: 'Inalterada',
};

export const DiffViewer: React.FC<DiffViewerProps> = ({ diff }) => {
  const [filters, setFilters] = useState<Record<string, FilterType>>({});

  const getFilter = (sheetName: string): FilterType => filters[sheetName] ?? 'all';
  const setFilter = (sheetName: string, f: FilterType) =>
    setFilters((prev) => ({ ...prev, [sheetName]: f }));

  const hasChanges = diff.summary.added > 0 || diff.summary.removed > 0 || diff.summary.modified > 0;

  return (
    <div className="space-y-6">
      {diff.diffs.map((sheet) => {
        const filter = getFilter(sheet.sheetName);

        const changedRows = hasChanges
          ? sheet.rows.filter((r) => r.status !== 'unchanged')
          : sheet.rows;

        const rowsToShow = filter === 'all'
          ? changedRows
          : changedRows.filter((r) => r.status === filter);

        const counts = {
          added: sheet.rows.filter((r) => r.status === 'added').length,
          removed: sheet.rows.filter((r) => r.status === 'removed').length,
          modified: sheet.rows.filter((r) => r.status === 'modified').length,
        };

        const filterOptions: FilterType[] = ['all', 'added', 'removed', 'modified'];

        return (
          <div key={sheet.sheetName} className="bg-white rounded-xl border border-zinc-200 overflow-hidden shadow-sm">
            {/* Sheet header */}
            <div className="px-4 py-3 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-zinc-900 text-sm">Planilha: {sheet.sheetName}</h3>
                {!hasChanges && (
                  <Badge variant="outline" className="text-[10px] uppercase h-5 bg-zinc-100 text-zinc-500 border-zinc-200">
                    Sem Alterações
                  </Badge>
                )}
              </div>
              <div className="flex gap-1.5">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                  +{counts.added}
                </span>
                <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full">
                  −{counts.removed}
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                  ~{counts.modified}
                </span>
              </div>
            </div>

            {/* Filter bar */}
            <div className="px-4 py-2 flex gap-2 border-b border-zinc-100 bg-white">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(sheet.sheetName, option)}
                  className={cn(
                    'text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-md border transition-all cursor-pointer',
                    filter === option ? FILTER_ACTIVE[option] : FILTER_INACTIVE
                  )}
                >
                  {STATUS_LABELS[option]}
                  {option !== 'all' && (() => {
                    const inactiveCounterColor: Record<string, string> = {
                      added:    'bg-emerald-100 text-emerald-700',
                      removed:  'bg-red-100 text-red-700',
                      modified: 'bg-amber-100 text-amber-700',
                    };
                    return (
                      <span className={cn(
                        'ml-1.5 rounded-full px-1 font-bold',
                        filter === option ? 'bg-white/20 text-white' : inactiveCounterColor[option]
                      )}>
                        {counts[option as keyof typeof counts]}
                      </span>
                    );
                  })()}
                </button>
              ))}
            </div>

            {/* Rows */}
            <ScrollArea className="h-[550px]">
              <div className="p-4 space-y-3">
                {rowsToShow.map((row, idx) => (
                  <div key={idx} className={cn('rounded-lg overflow-hidden shadow-xs', ROW_CARD[row.status] ?? ROW_CARD.unchanged)}>
                    <div className={cn('px-3 py-2 flex items-center gap-3', ROW_HEADER[row.status] ?? ROW_HEADER.unchanged)}>
                      <span className={cn('px-2 py-0.5 rounded text-[9px] font-bold uppercase', STATUS_BADGE[row.status] ?? '')}>
                        {STATUS_LABEL[row.status] ?? row.status}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">Linha {row.rowNumber}</span>
                      <span className="text-[10px] font-medium text-zinc-500 truncate max-w-[300px]">{row.id}</span>
                    </div>
                    <div className="p-3">
                      <ComparisonTable row={row} />
                    </div>
                  </div>
                ))}

                {rowsToShow.length === 0 && (
                  <div className="py-14 text-center text-zinc-400 font-medium text-xs">
                    Nenhuma alteração encontrada nesta categoria.
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
};

const ComparisonTable: React.FC<{ row: RowDiff }> = ({ row }) => {
  if (row.status === 'modified') {
    const original = row.original ?? {};
    const current = row.current ?? {};
    const allKeys = Array.from(new Set([...Object.keys(original), ...Object.keys(current)]));
    const changedFields = allKeys.filter((k) => JSON.stringify(original[k]) !== JSON.stringify(current[k]));

    return (
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr>
            <th className="p-2 border border-zinc-200 bg-zinc-50 text-left text-zinc-500 font-semibold uppercase tracking-tight text-[9px] w-1/4">
              Campo
            </th>
            <th className="p-2 border border-zinc-200 bg-red-50 text-left text-red-500 font-semibold uppercase tracking-tight text-[9px] w-[37.5%]">
              Original
            </th>
            <th className="p-2 border border-zinc-200 bg-emerald-50 text-left text-emerald-600 font-semibold uppercase tracking-tight text-[9px] w-[37.5%]">
              Novo
            </th>
          </tr>
        </thead>
        <tbody>
          {changedFields.map((key) => (
            <tr key={key} className="group">
              <td className="p-2 border border-zinc-200 font-medium text-zinc-700 bg-zinc-50/40">
                {key}
              </td>
              <td className="p-2 border border-zinc-200 text-red-700 bg-red-50/50 line-through decoration-red-300/70 font-mono">
                {String(original[key] ?? '—')}
              </td>
              <td className="p-2 border border-zinc-200 text-emerald-700 bg-emerald-50/50 font-medium font-mono">
                {String(current[key] ?? '—')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  const data = row.status === 'removed' ? row.original : row.current;
  if (!data) return null;

  const colStyle: Record<string, string> = {
    added:     'text-emerald-700 bg-emerald-50/40',
    removed:   'text-red-700 bg-red-50/40 line-through decoration-red-300/70',
    unchanged: 'text-zinc-600 bg-white',
  };
  const headerStyle: Record<string, string> = {
    added:     'bg-emerald-50 text-emerald-600',
    removed:   'bg-red-50 text-red-500',
    unchanged: 'bg-zinc-50 text-zinc-500',
  };
  const valClass = colStyle[row.status] ?? colStyle.unchanged;
  const hClass   = headerStyle[row.status] ?? headerStyle.unchanged;

  return (
    <table className="w-full border-collapse text-[11px]">
      <thead>
        <tr>
          <th className="p-2 border border-zinc-200 bg-zinc-50 text-left text-zinc-500 font-semibold uppercase tracking-tight text-[9px] w-1/4">
            Campo
          </th>
          <th className={cn('p-2 border border-zinc-200 text-left font-semibold uppercase tracking-tight text-[9px]', hClass)}>
            Valor
          </th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(data).map(([key, val]) => (
          <tr key={key}>
            <td className="p-2 border border-zinc-200 font-medium text-zinc-700 bg-zinc-50/40">
              {key}
            </td>
            <td className={cn('p-2 border border-zinc-200 font-mono', valClass)}>
              {String(val ?? '—')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
