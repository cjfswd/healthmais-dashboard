import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as XLSX from 'xlsx';

interface ColumnMetadata {
  name: string;
  type: string;
  sampleValue: unknown;
  enumValues?: string[];
  references?: { sheet: string; column: string };
  usedBy?: { sheet: string; column: string }[];
}

interface SheetMetadata {
  name: string;
  columns: ColumnMetadata[];
}

interface InspectResult {
  sheets: SheetMetadata[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fileBuffer } = req.body as { fileBuffer?: string };
    if (!fileBuffer) {
      return res.status(400).json({ error: 'No file buffer provided' });
    }

    const buffer = Buffer.from(fileBuffer, 'base64');
    const wb = XLSX.read(buffer, { type: 'buffer' });

    const sheetData: { name: string; columns: any[]; data: any[][] }[] = wb.SheetNames.map((name) => {
      const ws = wb.Sheets[name];
      const data = ws['!ref'] ? XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) : [];
      return { name, columns: [], data };
    });

    const processedSheets = sheetData.map((s) => {
      if (s.data.length === 0) return { name: s.name, columns: [] };

      const headers = s.data[0] as any[];
      const isRefSheet = s.name.toUpperCase().includes('REF');

      const columns = headers.map((header, C) => {
        const headerName = header ? String(header) : `Column ${C + 1}`;
        const isRefColumn = headerName.toUpperCase() === 'REF';
        const isTargetForEnum = isRefSheet || isRefColumn;

        const uniqueValues = new Set<string>();
        let sampleValue: any = null;
        let inferredType = 'string';

        for (let R = 1; R < s.data.length; R++) {
          const row = s.data[R];
          if (!row) continue;
          const val = row[C];
          
          if (val !== undefined && val !== null && val !== '') {
            if (sampleValue === null) {
              sampleValue = val;
              if (typeof val === 'number') inferredType = 'number';
              else if (typeof val === 'boolean') inferredType = 'boolean';
              else if (val instanceof Date) inferredType = 'date';
            }
            
            if (isTargetForEnum) {
              uniqueValues.add(String(val).trim());
              if (uniqueValues.size > 500) break; 
            }
          }
        }

        const isEnum = isTargetForEnum && uniqueValues.size > 0 && uniqueValues.size <= 500;
        
        return {
          name: headerName,
          type: isEnum ? 'enum' : inferredType,
          sampleValue,
          enumValues: isEnum ? Array.from(uniqueValues).sort() : undefined,
          enumSet: isEnum ? uniqueValues : undefined,
          references: undefined as { sheet: string, column: string } | undefined,
          usedBy: [] as { sheet: string, column: string }[]
        };
      });

      return { name: s.name, columns };
    });

    processedSheets.forEach((currentSheet, sIdx) => {
      currentSheet.columns.forEach((col) => {
        if (col.type === 'enum') return;

        const rawData = sheetData[sIdx].data;
        const colIdx = currentSheet.columns.indexOf(col);
        const valuesToCheck = new Set<string>();
        
        for (let r = 1; r < rawData.length && valuesToCheck.size < 100; r++) {
          const v = rawData[r][colIdx];
          if (v !== undefined && v !== null && v !== '') {
            valuesToCheck.add(String(v).trim());
          }
        }

        if (valuesToCheck.size === 0) return;

        for (const otherSheet of processedSheets) {
          if (otherSheet === currentSheet) continue;
          for (const otherCol of otherSheet.columns) {
            if (otherCol.type === 'enum' && (otherCol as any).enumSet) {
              let matches = 0;
              valuesToCheck.forEach(val => {
                if ((otherCol as any).enumSet.has(val)) matches++;
              });

              const matchRate = matches / valuesToCheck.size;
              if (matchRate >= 0.8) {
                col.references = { sheet: otherSheet.name, column: otherCol.name };
                otherCol.usedBy.push({ sheet: currentSheet.name, column: col.name });
                break;
              }
            }
          }
          if (col.references) break;
        }
      });
    });

    const finalSheets = processedSheets.map(s => ({
      name: s.name,
      columns: s.columns.map(({ enumSet, ...rest }: any) => rest)
    }));

    return res.status(200).json({ sheets: finalSheets } satisfies InspectResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return res.status(500).json({ error: message });
  }
}
