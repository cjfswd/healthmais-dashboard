import * as React from 'react';
import { FaixaEtariaTable } from '@ui/components/dashboard/FaixaEtariaTable';
import { PieDataChart } from '@ui/components/dashboard/PieDataChart';
import type { AggregationResult } from '@domain/models/faturamento';
import type { MetricKey } from '@domain/models/metricKey';
import { DEFAULT_VISIBLE_METRICS } from '@domain/models/metricKey';

interface Props {
  data: AggregationResult[];
  currencyFormatter: (val: number) => string;
  period?: string;
  isFullYear?: boolean;
  visibleMetrics?: Set<MetricKey>;
}

export const FaixaEtariaSection: React.FC<Props> = ({ data, currencyFormatter, period, isFullYear, visibleMetrics = DEFAULT_VISIBLE_METRICS }) => {
  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="w-full">
        <PieDataChart
          data={data.map(v => ({
            name: v.description ? `${v.name} (${v.description})` : v.name,
            value: v.count || 0
          }))}
          title="Distribuição de Pacientes por Idade"
        />
      </div>
      <div className="w-full">
        <FaixaEtariaTable data={data} currencyFormatter={currencyFormatter} period={period} isFullYear={isFullYear} visibleMetrics={visibleMetrics} />
      </div>
    </div>
  );
};
