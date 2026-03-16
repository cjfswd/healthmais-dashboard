/// <reference lib="webworker" />
import * as XLSX from 'xlsx';
import type { ExcelDiff, RowDiff, SheetDiff } from '../../domain/models/excel-diff';

const MAX_ROWS = 1000;

interface WorkerInput {
  originalBuffer: ArrayBuffer;
  newBuffer: ArrayBuffer;
}

function compareBuffers(originalBuffer: ArrayBuffer, newBuffer: ArrayBuffer): ExcelDiff {
  const wb1 = XLSX.read(originalBuffer, { type: 'buffer', sheetRows: MAX_ROWS + 1 });
  const wb2 = XLSX.read(newBuffer, { type: 'buffer', sheetRows: MAX_ROWS + 1 });

  const diffs: SheetDiff[] = [];
  let totalAdded = 0;
  let totalRemoved = 0;
  let totalModified = 0;

  for (const sheetName of wb2.SheetNames) {
    if (!wb1.SheetNames.includes(sheetName)) {
      continue;
    }

    const ws1 = wb1.Sheets[sheetName];
    const ws2 = wb2.Sheets[sheetName];

    const data1 = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws1);
    const data2 = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws2);

    // Use row index as key for accurate line-by-line comparison
    const map1 = new Map(data1.map((r, i) => [`row_${i}`, { data: r, rowNumber: i + 2 }]));
    const map2 = new Map(data2.map((r, i) => [`row_${i}`, { data: r, rowNumber: i + 2 }]));

    const rowDiffs: RowDiff[] = [];

    for (const [key, val1] of map1) {
      if (!map2.has(key)) {
        rowDiffs.push({ id: key, status: 'removed', rowNumber: val1.rowNumber, original: val1.data });
        totalRemoved++;
      } else {
        const val2 = map2.get(key)!;
        if (JSON.stringify(val1.data) !== JSON.stringify(val2.data)) {
          rowDiffs.push({
            id: key,
            status: 'modified',
            rowNumber: val2.rowNumber,
            original: val1.data,
            current: val2.data,
          });
          totalModified++;
        } else {
          rowDiffs.push({ id: key, status: 'unchanged', rowNumber: val2.rowNumber, current: val2.data });
        }
      }
    }

    for (const [key, val2] of map2) {
      if (!map1.has(key)) {
        rowDiffs.push({ id: key, status: 'added', rowNumber: val2.rowNumber, current: val2.data });
        totalAdded++;
      }
    }

    diffs.push({ sheetName, rows: rowDiffs });
  }

  return {
    diffs,
    summary: { added: totalAdded, removed: totalRemoved, modified: totalModified },
  };
}

self.addEventListener('message', (event: MessageEvent<WorkerInput>) => {
  try {
    const { originalBuffer, newBuffer } = event.data;
    const result = compareBuffers(originalBuffer, newBuffer);
    self.postMessage({ ok: true, result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown worker error';
    self.postMessage({ ok: false, error: message });
  }
});
