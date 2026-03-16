export type DiffStatus = 'added' | 'removed' | 'modified' | 'unchanged';

export interface RowDiff {
  id: string; // Key to track row (e.g. DADOS_PACIENTE + DATA)
  status: DiffStatus;
  rowNumber: number;
  original?: Record<string, any>;
  current?: Record<string, any>;
}

export interface SheetDiff {
  sheetName: string;
  rows: RowDiff[];
}

export interface ExcelDiff {
  diffs: SheetDiff[];
  summary: {
    added: number;
    removed: number;
    modified: number;
  };
}
