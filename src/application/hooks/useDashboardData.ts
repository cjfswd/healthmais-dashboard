import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ChangeEvent } from 'react';
import type { Faturamento, AggregationResult, ExcelSchema } from '@domain/models/faturamento';
import { ExcelApi } from '@infrastructure/api/excel-api';
import { 
  MonthlyAggregationStrategy, 
  CategoryAggregationStrategy,
  FaixaEtariaAggregationStrategy
} from '@domain/strategies/aggregation-strategy';

export const useDashboardData = () => {
  const [faturamentoData, setFaturamentoData] = useState<Faturamento[] | null>(null);
  const [filterAno, setFilterAno] = useState<string>('Todos');
  const [filterMes, setFilterMes] = useState<string>('Todos');
  const [filterOperadora, setFilterOperadora] = useState<string>('Todos');
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [schema, setSchema] = useState<ExcelSchema | null>(null);

  const inspectCurrentFile = useCallback(async (base64?: string) => {
    try {
      let activeBase64 = base64;
      if (!activeBase64) {
        setLoading(true);
        const response = await fetch('/POWERBI.xlsx');
        if (!response.ok) throw new Error('Falha ao carregar arquivo padrão');
        const blob = await response.blob();
        activeBase64 = await ExcelApi.blobToBase64(blob);
      }
      
      const s = await ExcelApi.inspectFile(activeBase64);
      setSchema(s);
    } catch (err) {
      console.error("Error inspecting file:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileUpload = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    setFileName(file.name);
    
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = (evt) => {
          const bstr = evt.target?.result as string;
          resolve(btoa(bstr));
        };
        reader.onerror = reject;
        reader.readAsBinaryString(file);
      });

      const base64 = await base64Promise;
      
      // Parallel execution for parsing and inspection
      const [data, s] = await Promise.all([
        ExcelApi.parseFile(base64),
        ExcelApi.inspectFile(base64)
      ]);

      setFaturamentoData(data);
      setSchema(s);
    } catch (error) {
      console.error("Error processing file:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFetchDefault = useCallback(async () => {
    if (faturamentoData) return; // Already loaded

    setLoading(true);
    setFileName('POWERBI.xlsx');
    try {
      const response = await fetch('/POWERBI.xlsx');
      const blob = await response.blob();
      const base64 = await ExcelApi.blobToBase64(blob);
      
      const [data, s] = await Promise.all([
        ExcelApi.parseFile(base64),
        ExcelApi.inspectFile(base64)
      ]);

      setFaturamentoData(data);
      setSchema(s);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [faturamentoData]);

  useEffect(() => {
    handleFetchDefault();
  }, [handleFetchDefault]);

  const filteredData = useMemo(() => {
    if (!faturamentoData) return [];
    return faturamentoData.filter(r => {
      if (filterAno !== 'Todos' && String(r.ano) !== filterAno) return false;
      if (filterMes !== 'Todos' && String(r.mes) !== filterMes) return false;
      if (filterOperadora !== 'Todos' && r.operadora !== filterOperadora) return false;
      return true;
    });
  }, [faturamentoData, filterAno, filterMes, filterOperadora]);

  const uniqueAnos = useMemo(() => {
    if (!faturamentoData) return [];
    return Array.from(new Set(faturamentoData.map(r => String(r.ano)))).sort();
  }, [faturamentoData]);

  const uniqueMeses = useMemo(() => {
    if (!faturamentoData) return [];
    return Array.from(new Set(faturamentoData.map(r => String(r.mes)))).sort((a, b) => Number(a) - Number(b));
  }, [faturamentoData]);

  const uniqueOperadoras = useMemo(() => {
    if (!faturamentoData) return [];
    return Array.from(new Set(faturamentoData.map(r => r.operadora))).sort();
  }, [faturamentoData]);

  const kpis = useMemo(() => {
    if (filteredData.length === 0) return { total: 0, custo: 0, resultado: 0, pacientes: 0, media: 0, custoMedio: 0 };
    const uniquePacientes = new Set(filteredData.map(r => r.pacienteId));
    const uniqueMonths = new Set(filteredData.map(r => `${r.ano}-${r.mes}`));
    const total = filteredData.reduce((acc, curr) => acc + curr.valorTotal, 0);
    const custo = filteredData.reduce((acc, curr) => acc + curr.custo, 0);
    const glosa = filteredData.reduce((acc, curr) => acc + curr.valorGlosado, 0);
    const numMonths = uniqueMonths.size || 1;
    const numPacientes = uniquePacientes.size || 1;

    return {
      total,
      custo,
      glosa,
      resultado: total - custo,
      pacientes: numPacientes,
      media: total / numMonths,
      custoMedio: custo / numPacientes
    } satisfies Record<string, number>;
  }, [filteredData]);

  // Using Strategy Pattern
  const monthlyAggregation = useMemo(() => {
    return new MonthlyAggregationStrategy().aggregate(filteredData);
  }, [filteredData]);

  const faixaEtariaAggregation = useMemo(() => {
    return new FaixaEtariaAggregationStrategy().aggregate(filteredData);
  }, [filteredData]);

  const categoryAggregation = useCallback((key: keyof Faturamento) => {
    return new CategoryAggregationStrategy(key).aggregate(filteredData);
  }, [filteredData]);

  const pieAggregation = useCallback((key: keyof Faturamento) => {
    const agg: Record<string, number> = {};
    filteredData.forEach(r => {
      const k = String(r[key]);
      agg[k] = (agg[k] || 0) + 1;
    });
    return Object.keys(agg).map(k => ({ 
      name: k, 
      value: agg[k] 
    } satisfies AggregationResult));
  }, [filteredData]);

  const atendimentoHorasAggregation = useMemo(() => {
    const agg: Record<string, number> = {};
    filteredData.forEach(r => {
      const k = r.pacoteHoras || 'S/I';
      agg[k] = (agg[k] || 0) + 1;
    });
    return Object.keys(agg).map(k => ({ 
      name: k, 
      count: agg[k] 
    } satisfies AggregationResult));
  }, [filteredData]);

  return {
    faturamentoData,
    setFaturamentoData,
    filterAno,
    setFilterAno,
    filterMes,
    setFilterMes,
    filterOperadora,
    setFilterOperadora,
    uniqueMeses,
    loading,
    fileName,
    handleFileUpload,
    handleFetchDefault,
    filteredData,
    uniqueAnos,
    uniqueOperadoras,
    kpis,
    monthlyAggregation,
    faixaEtariaAggregation,
    categoryAggregation,
    pieAggregation,
    atendimentoHorasAggregation,
    schema,
    setSchema,
    inspectCurrentFile
  };
};
