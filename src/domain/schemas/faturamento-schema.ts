import { z } from 'zod';

export const FaturamentoSchema = z.object({
  mes: z.string(),
  ano: z.number(),
  quantidade: z.number().default(0),
  valorTotal: z.number().default(0),
  valorGlosado: z.number().default(0),
  custo: z.number().default(0),
  municipio: z.string().default('S/I'),
  operadora: z.string().default('S/I'),
  sexo: z.string().default('S/I'),
  procedimento: z.string().default('S/I'),
  acomodacao: z.string().default('S/I'),
  pacoteHoras: z.string().default('S/I'),
  faixaEtaria: z.string().default('S/I'),
  pacienteId: z.string().default('S/I'),
  tipoAssistencia: z.string().default('S/I'),
  statusPaciente: z.string().default('S/I'),
  nomePaciente: z.string().default('S/I'),
});

export type FaturamentoDTO = z.infer<typeof FaturamentoSchema>;
