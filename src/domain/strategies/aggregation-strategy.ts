import type { Faturamento, AggregationResult } from '@domain/models/faturamento';

export interface AggregationStrategy {
  aggregate(data: Faturamento[]): AggregationResult[];
}

export class MonthlyAggregationStrategy implements AggregationStrategy {
  aggregate(data: Faturamento[]): AggregationResult[] {
    const agg: Record<string, {v: number, c: number, g: number, m: string, a: number}> = {};
    data.forEach(r => {
      const key = `${r.ano}-${r.mes}`;
      const entry = agg[key] ?? { v: 0, c: 0, g: 0, m: r.mes, a: r.ano };
      entry.v += r.valorTotal;
      entry.c += r.custo;
      entry.g += r.valorGlosado;
      agg[key] = entry;
    });
    const months = ['Jan','Fev','Mar', 'Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return Object.values(agg)
      .sort((a,b) => a.a !== b.a ? a.a - b.a : months.indexOf(a.m.substring(0,3)) - months.indexOf(b.m.substring(0,3)))
      .map(v => ({ 
        name: `${v.m}/${v.a}`, 
        Venda: v.v, 
        Custo: v.c,
        Glosa: v.g
      } satisfies AggregationResult));
  }
}

export class CategoryAggregationStrategy implements AggregationStrategy {
  constructor(private key: keyof Faturamento) {}

  aggregate(data: Faturamento[]): AggregationResult[] {
    const agg: Record<string, {v: number, c: number, g: number}> = {};
    data.forEach(r => {
      const k = String(r[this.key]);
      const entry = agg[k] ?? { v: 0, c: 0, g: 0 };
      entry.v += r.valorTotal;
      entry.c += r.custo;
      entry.g += r.valorGlosado;
      agg[k] = entry;
    });
    return Object.keys(agg)
      .map(k => ({ 
        name: k, 
        Venda: agg[k].v, 
        Custo: agg[k].c,
        Glosa: agg[k].g
      } satisfies AggregationResult))
      .sort((a,b) => (b.Venda ?? 0) - (a.Venda ?? 0));
  }
}

export class FaixaEtariaAggregationStrategy implements AggregationStrategy {
  aggregate(data: Faturamento[]): AggregationResult[] {
    const ranges = ['00-11', '12-17', '18-29', '30-59', '60-79', '80+', 'S/I'];
    const descriptions: Record<string, string> = {
      '00-11': 'Criança',
      '12-17': 'Adolescente',
      '18-29': 'Jovem Adulto',
      '30-59': 'Adulto',
      '60-79': 'Idoso',
      '80+': 'Idoso Av.',
      'S/I': 'S/Info'
    };

    const agg: Record<string, { patients: Set<string>, faturado: number, glosado: number }> = {};
    ranges.forEach(r => agg[r] = { patients: new Set(), faturado: 0, glosado: 0 });

    data.forEach(r => {
      const range = r.faixaEtaria || 'S/I';
      const target = agg[range] || agg['S/I'];
      target.patients.add(r.pacienteId);
      target.faturado += r.valorTotal;
      target.glosado += r.valorGlosado;
    });

    const allPatients = new Set(data.map(r => r.pacienteId)).size || 1;

    return ranges.map(range => ({
      name: range,
      description: descriptions[range],
      count: agg[range].patients.size,
      percent: (agg[range].patients.size / allPatients) * 100,
      Venda: agg[range].faturado,
      Glosa: agg[range].glosado
    } satisfies AggregationResult));
  }
}
