/**
 * Domain constants extracted from the REF sheet of POWERBI.xlsx.
 * These are the canonical enum values for all categorical fields in the system.
 * Use these instead of raw strings anywhere they appear.
 */

export const SEXO = ['MASCULINO', 'FEMININO'] as const;
export type Sexo = typeof SEXO[number];

export const ACOMODACOES = ['ID', 'AD'] as const;
export type Acomodacao = typeof ACOMODACOES[number];

export const OPERADORAS = ['UNIMED NI RJ', 'CAMPERJ'] as const;
export type Operadora = typeof OPERADORAS[number];

export const STATUS_PACIENTE = [
  'ALTA',
  'INTERNAÇÃO',
  'SUSPENSÃO',
  'ÓBITO',
  'ATIVO',
  'HOSPITALIZAÇÃO',
  'OUVIDORIA',
] as const;
export type StatusPaciente = typeof STATUS_PACIENTE[number];

export const PACOTE_HORAS = ['3H', '6H', '9H', '12H', '24H', 'ASSISTÊNCIA'] as const;
export type PacoteHoras = typeof PACOTE_HORAS[number];

/** Subset used for the numeric pacote breakdown (excludes ASSISTÊNCIA) */
export const PACOTE_HORAS_NUMERICOS = ['3H', '6H', '9H', '12H', '24H'] as const;
export type PacoteHorasNumerico = typeof PACOTE_HORAS_NUMERICOS[number];

export const MUNICIPIOS_RJ = [
  'Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu',
  'Campos dos Goytacazes', 'Belford Roxo', 'Niterói', 'São João de Meriti',
  'Petrópolis', 'Volta Redonda', 'Macaé', 'Magé', 'Itaboraí', 'Cabo Frio',
  'Maricá', 'Nova Friburgo', 'Barra Mansa', 'Angra dos Reis', 'Mesquita',
  'Teresópolis', 'Rio das Ostras', 'Nilópolis', 'Queimados', 'Araruama',
  'Resende', 'Itaguaí', 'São Pedro da Aldeia', 'Itaperuna', 'Japeri',
  'Barra do Piraí', 'Saquarema', 'Seropédica', 'Três Rios', 'Valença',
  'Cachoeiras de Macacu', 'Rio Bonito', 'Guapimirim', 'Casimiro de Abreu',
  'Paraty', 'São Francisco de Itabapoana', 'Paraíba do Sul',
  'Santo Antônio de Pádua', 'Mangaratiba', 'Paracambi', 'Armação dos Búzios',
  'São Fidélis', 'São João da Barra', 'Bom Jesus do Itabapoana', 'Vassouras',
  'Tanguá', 'Arraial do Cabo', 'Itatiaia', 'Paty do Alferes', 'Bom Jardim',
  'Iguaba Grande', 'Piraí', 'Miracema', 'Miguel Pereira', 'Pinheiral',
  'Itaocara', 'Quissamã', 'São José do Vale do Rio Preto', 'Silva Jardim',
  'Conceição de Macabu', 'Cordeiro', 'Porto Real',
] as const;
export type MunicipioRJ = typeof MUNICIPIOS_RJ[number];

export const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MS', 'MT', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
] as const;
export type Estado = typeof ESTADOS[number];

export const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
                      'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const;
export type Mes = typeof MESES[number];

export const STATUS_SISTEMA = ['ATIVO', 'INATIVO'] as const;
export type StatusSistema = typeof STATUS_SISTEMA[number];
