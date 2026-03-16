import { z } from 'zod';
import type { Faturamento } from '@domain/models/faturamento';
import { FaturamentoSchema } from '@domain/schemas/faturamento-schema';
import { PACOTE_HORAS } from '@domain/constants/ref';

type RawExcelRow = Record<string, unknown> & {
  DADOS_PACIENTE?: string;
  DADOS_PROCEDIMENTO?: string;
  nome?: string;
  valor_total?: string | number;
  quantidade?: string | number;
  valor_glosado?: string | number;
  custo?: string | number;
  mes?: string | number;
  ano?: string | number;
};

export class FaturamentoFactory {
  static createFromRaw(row: RawExcelRow): Faturamento {
    const dadosPac = String(row.DADOS_PACIENTE || '').split(';');
    const dadosProc = String(row.DADOS_PROCEDIMENTO || '').split(';');
    
    const cleanPac = dadosPac.map(s => s.trim());
    const cleanProc = dadosProc.map(s => s.trim());

    const valorOriginal = Number(row.valor_total) || 0;
    const valorTotal = (valorOriginal === 0 && cleanProc[4]) 
      ? Number(cleanProc[4].replace(',', '.')) 
      : valorOriginal;

    const data = {
      mes: this.extractMonth(row, cleanPac),
      ano: this.extractYear(row, cleanPac),
      quantidade: Number(row.quantidade) || 0,
      valorTotal,
      valorGlosado: Number(row.valor_glosado) || 0,
      custo: Number(row.custo) || (valorTotal * 0.7),
      municipio: cleanPac[4] || 'S/I',
      operadora: cleanPac[2] || 'S/I',
      sexo: cleanPac[7] || 'S/I',
      procedimento: cleanProc[0] || 'S/I',
      acomodacao: cleanPac[5] || 'S/I',
      pacoteHoras: this.normalizePacote(cleanPac[8]),
      faixaEtaria: this.extractFaixaEtaria(cleanPac),
      pacienteId: cleanPac[11] || 'S/I',
      tipoAssistencia: cleanProc[1] || 'S/I',
      statusPaciente: cleanPac[10] || 'S/I',
      nomePaciente: String(row.nome || cleanPac[0] || 'S/I').trim(),
    } satisfies z.input<typeof FaturamentoSchema>;

    return FaturamentoSchema.parse(data);
  }

  private static extractMonth(row: RawExcelRow, cleanPac: string[]): string {
    let mesStr = String(row.mes || '');
    if (row.mes && !isNaN(Number(row.mes)) && Number(row.mes) > 12) {
      const date = new Date((Number(row.mes) - 25569) * 86400 * 1000);
      mesStr = date.toLocaleString('pt-BR', { month: 'short' });
    } else if (!row.mes && cleanPac[9] && !isNaN(Number(cleanPac[9]))) {
      const date = new Date((Number(cleanPac[9]) - 25569) * 86400 * 1000);
      mesStr = date.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    }
    return mesStr.charAt(0).toUpperCase() + mesStr.slice(1);
  }

  private static extractYear(row: RawExcelRow, cleanPac: string[]): number {
    if (row.ano) return Number(row.ano);
    if (cleanPac[9] && !isNaN(Number(cleanPac[9]))) {
      const date = new Date((Number(cleanPac[9]) - 25569) * 86400 * 1000);
      return date.getFullYear();
    }
    return 0;
  }
  
  private static extractFaixaEtaria(cleanPac: string[]): string {
    const ageValue = cleanPac[6];
    if (!ageValue) return 'S/I';
    
    const age = parseInt(ageValue.replace(/\D/g, ''));
    if (isNaN(age)) return 'S/I';

    if (age <= 11) return '00-11';
    if (age <= 17) return '12-17';
    if (age <= 29) return '18-29';
    if (age <= 59) return '30-59';
    if (age <= 79) return '60-79';
    return '80+'; 
  }
  private static normalizePacote(raw: string | undefined): string {
    if (!raw) return 'S/I';
    const upper = raw.trim().toUpperCase();
    // Match canonical constant (e.g. '3h' -> '3H', 'Assistência' -> 'ASSISTÊNCIA')
    const found = (PACOTE_HORAS as readonly string[]).find(
      p => p === upper || p.replace('H', '') === upper.replace('H', '')
    );
    return found ?? upper;
  }
}
