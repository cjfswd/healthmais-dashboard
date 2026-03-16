/** Keys for the financial metrics that can be toggled on/off across charts and tables. */
export type MetricKey = 'Faturado' | 'Custo' | 'Bruto' | 'Líquido' | 'Glosa';

export const ALL_METRICS: readonly MetricKey[] = ['Faturado', 'Custo', 'Bruto', 'Líquido', 'Glosa'] as const;

export const METRIC_COLORS: Record<MetricKey, string> = {
  Faturado: '#2563eb',
  Custo: '#10b981',
  Bruto: '#7c3aed',
  'Líquido': '#0891b2',
  Glosa: '#ea580c',
} as const;

/** Default set with all metrics visible — used when `visibleMetrics` prop is omitted. */
export const DEFAULT_VISIBLE_METRICS: Set<MetricKey> = new Set(ALL_METRICS);
