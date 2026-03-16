import * as XLSX from 'xlsx';
import { FaturamentoFactory } from '@domain/models/faturamento-factory';

self.onmessage = (e: MessageEvent<{ type: 'inspect' | 'parse', base64: string }>) => {
  const { type, base64 } = e.data;
  
  try {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const wb = XLSX.read(bytes, { type: 'array' });

    if (type === 'parse') {
      const sheetName = 'PROCEDIMENTOS_REALIZADOS';
      if (!wb.SheetNames.includes(sheetName)) {
        throw new Error(`Aba ${sheetName} não encontrada no arquivo.`);
      }

      const ws = wb.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(ws) as Record<string, unknown>[];
      
      const parsedData = rawData
        .filter((row) => typeof row.DADOS_PACIENTE === 'string')
        .map((row) => {
          try {
            return FaturamentoFactory.createFromRaw(row);
          } catch (e) {
            console.error('Validation error for row:', e);
            return null;
          }
        })
        .filter((item): item is NonNullable<typeof item> => item !== null);

      self.postMessage({ data: parsedData });
      return;
    }
    
    // Inspect Logic (existing)
    const sheetData: { name: string; columns: any[]; data: any[][] }[] = wb.SheetNames.map((name) => {
      const ws = wb.Sheets[name];
      const data = ws['!ref'] ? XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 }) : [];
      return { name, columns: [], data };
    });

    // 1. First Pass: Detect Enums
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

    // 2. Second Pass: Relationships
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
            if (otherCol.type === 'enum' && otherCol.enumSet) {
              let matches = 0;
              valuesToCheck.forEach(val => {
                if (otherCol.enumSet!.has(val)) matches++;
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
      columns: s.columns.map(({ enumSet, ...rest }) => rest)
    }));

    self.postMessage({ sheets: finalSheets });
  } catch (error) {
    self.postMessage({ error: String(error) });
  }
};
