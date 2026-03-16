import * as XLSX from 'xlsx';
import type { ExcelDiff, RowDiff, SheetDiff } from '@domain/models/excel-diff';

export class CompareExcelUseCase {
  async execute(originalBuffer: ArrayBuffer, newBuffer: ArrayBuffer): Promise<ExcelDiff> {
    const wb1 = XLSX.read(originalBuffer, { type: 'buffer' });
    const wb2 = XLSX.read(newBuffer, { type: 'buffer' });

    const diffs: SheetDiff[] = [];
    let totalAdded = 0;
    let totalRemoved = 0;
    let totalModified = 0;

    // We only compare sheets present in the new version
    for (const sheetName of wb2.SheetNames) {
      if (!wb1.SheetNames.includes(sheetName)) {
        // Entire sheet is new (simplification: we skip for now or treat all rows as added)
        continue;
      }

      const ws1 = wb1.Sheets[sheetName];
      const ws2 = wb2.Sheets[sheetName];

      const data1 = XLSX.utils.sheet_to_json<Record<string, any>>(ws1);
      const data2 = XLSX.utils.sheet_to_json<Record<string, any>>(ws2);

      // Use row index as the ultimate key for line-by-line comparison
      // This prevents duplicate keys from overwriting each other in the Map,
      // which was causing the diff to be empty.
      const map1 = new Map(data1.map((r, i) => [`row_${i}`, { data: r, rowNumber: i + 2 }]));
      const map2 = new Map(data2.map((r, i) => [`row_${i}`, { data: r, rowNumber: i + 2 }]));

      const rowDiffs: RowDiff[] = [];

      // Check for removals and modifications
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
              current: val2.data 
            });
            totalModified++;
          } else {
            rowDiffs.push({ id: key, status: 'unchanged', rowNumber: val2.rowNumber, current: val2.data });
          }
        }
      }

      // Check for additions
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
      summary: {
        added: totalAdded,
        removed: totalRemoved,
        modified: totalModified
      }
    };
  }
}
