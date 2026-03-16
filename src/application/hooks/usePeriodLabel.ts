import { useDashboard } from '@application/contexts/DashboardContext';

const MES_LABELS: Record<string, string> = {
  '1': 'Jan', '2': 'Fev',  '3': 'Mar',  '4': 'Abr',
  '5': 'Mai', '6': 'Jun',  '7': 'Jul',  '8': 'Ago',
  '9': 'Set', '10': 'Out', '11': 'Nov', '12': 'Dez',
};

interface PeriodLabel {
  /** Human-readable period, e.g. "Jan/2025" or "Ano 2025" or "Todos os Períodos" */
  label: string;
  /** True when viewing a full year (all months of a specific year) */
  isFullYear: boolean;
}

/**
 * Returns a formatted period label derived from the active dashboard filters.
 * Used to display the filter context inside card headers of detail tables.
 */
export function usePeriodLabel(): PeriodLabel {
  const { filterMes, filterAno } = useDashboard();

  if (filterAno === 'Todos' && filterMes === 'Todos') {
    return { label: 'Consolidado', isFullYear: false };
  }

  if (filterMes === 'Todos') {
    return { label: `Ano ${filterAno}`, isFullYear: true };
  }

  const mesLabel = MES_LABELS[filterMes] ?? filterMes;
  const yearSuffix = filterAno !== 'Todos' ? `/${filterAno}` : '';
  return { label: `${mesLabel}${yearSuffix}`, isFullYear: false };
}
