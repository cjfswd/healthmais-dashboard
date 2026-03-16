export interface Faturamento {
  mes: string;
  ano: number;
  quantidade: number;
  valorTotal: number;
  valorGlosado: number;
  custo: number;
  municipio: string;
  operadora: string;
  sexo: string;
  procedimento: string;
  acomodacao: string;
  pacoteHoras: string;
  faixaEtaria: string;
  pacienteId: string;
  tipoAssistencia: string;
  statusPaciente: string;
  nomePaciente: string;
}

export interface AggregationResult {
  name: string;
  Venda?: number;
  Custo?: number;
  Glosa?: number;
  Resultado?: number;
  count?: number;
  percent?: number;
  description?: string;
  value?: number;
}
export interface ColumnMetadata {
  name: string;
  type: string;
  sampleValue: unknown;
  enumValues?: string[];
  references?: { sheet: string; column: string };
  usedBy?: { sheet: string; column: string }[];
}

export interface SheetMetadata {
  name: string;
  columns: ColumnMetadata[];
}

export interface ExcelSchema {
  sheets: SheetMetadata[];
}
