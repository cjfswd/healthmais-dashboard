import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { CardHeader, CardTitle } from '@ui/components/ui/card';
import { Badge } from '@ui/components/ui/badge';
import { cn } from '@lib/utils';

interface Props {
  icon: LucideIcon;
  title: string;
  description?: string;
  period?: string;
  isFullYear?: boolean;
  className?: string;
}

export const DashboardCardHeader: React.FC<Props> = ({
  icon: Icon,
  title,
  description,
  period,
  isFullYear = false,
  className,
}) => (
  <CardHeader
    className={cn(
      'bg-zinc-50 border-b border-zinc-200 flex flex-row items-center justify-between gap-3',
      className,
    )}
  >
    <div className="flex items-center gap-2 min-w-0">
      <Icon size={15} className="shrink-0 text-zinc-400" />
      <div className="min-w-0">
        <CardTitle className="text-sm font-semibold text-zinc-900 leading-none">
          {title}
        </CardTitle>
        {description && (
          <p className="text-xs text-zinc-500 mt-0.5 leading-none">{description}</p>
        )}
      </div>
    </div>

    {period && (
      <Badge
        variant="secondary"
        className={cn(
          'text-[10px] font-semibold px-2 h-5 shrink-0',
          isFullYear
            ? 'bg-blue-50 text-blue-700 border border-blue-200'
            : 'bg-zinc-100 text-zinc-600 border border-zinc-200',
        )}
      >
        {period}
      </Badge>
    )}
  </CardHeader>
);
