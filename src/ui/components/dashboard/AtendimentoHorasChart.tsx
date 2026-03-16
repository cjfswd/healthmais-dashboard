import * as React from 'react';
import { Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent } from '@ui/components/ui/card';
import { DashboardCardHeader } from '@ui/components/dashboard/DashboardCardHeader';
import type { AggregationResult } from '@domain/models/faturamento';

interface Props {
  data: AggregationResult[];
}

export const AtendimentoHorasChart: React.FC<Props> = ({ data }) => {
  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm">
      <DashboardCardHeader
        icon={Clock}
        title="Distribuição de Horas de Atendimento"
        description="Quantidade de procedimentos por faixa"
      />
      <CardContent className="h-[350px] px-4 pb-4 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
            <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.07)'}} />
            <Legend iconSize={10} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
            <Bar dataKey="count" name="Procedimentos" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
