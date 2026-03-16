import * as React from 'react';
import { Card, CardContent } from '@ui/components/ui/card';
import { cn } from '@lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from '@ui/components/ui/tooltip';
import { Info } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: number;
  type: 'currency' | 'number';
  currencyFormatter: (val: number) => string;
  tooltip?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ 
  label, 
  value, 
  type, 
  currencyFormatter,
  tooltip
}) => {
  const isNegative = label === 'Resultado Bruto' && value < 0;

  return (
    <Card className={cn(
      "shadow-sm border border-zinc-200 rounded-lg flex-1 min-w-[180px]",
      "bg-white"
    )}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{label}</p>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={10} className="text-zinc-300 hover:text-zinc-500 cursor-help transition-colors" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px] text-center text-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <h3 className={cn(
          "text-lg font-bold tracking-tight",
          isNegative ? 'text-red-700' : 'text-zinc-900'
        )}>
          {type === 'currency' ? currencyFormatter(value) : value.toLocaleString()}
        </h3>
      </CardContent>
    </Card>
  );
};
