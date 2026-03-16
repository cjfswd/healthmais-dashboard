import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as XLSX from 'xlsx';
import { FaturamentoFactory } from '@domain/models/faturamento-factory';

interface ParseError {
  error: string;
}

export default async function handler(
  req: VercelRequest, 
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' } satisfies ParseError);
  }

  try {
    const { fileBuffer } = req.body as { fileBuffer?: string };
    if (!fileBuffer) {
      return res.status(400).json({ error: 'No file buffer provided' } satisfies ParseError);
    }

    const buffer = Buffer.from(fileBuffer, 'base64');
    const wb = XLSX.read(buffer, { type: 'buffer' });
    
    const sheetName = 'PROCEDIMENTOS_REALIZADOS';
    if (!wb.SheetNames.includes(sheetName)) {
      return res.status(400).json({ error: 'Sheet not found' } satisfies ParseError);
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

    return res.status(200).json(parsedData);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    console.error('Server error:', error);
    return res.status(500).json({ error: message } satisfies ParseError);
  }
}
