import * as React from 'react';
import { PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent } from '@ui/components/ui/card';
import { DashboardCardHeader } from '@ui/components/dashboard/DashboardCardHeader';

interface DataPoint {
  name: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  title: string;
}

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];

const fmtCurrency = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v);

const renderLabel = ({ percent }: { percent: number }) =>
  percent > 0.03 ? `${(percent * 100).toFixed(1)}%` : '';

export const PieDataChart: React.FC<Props> = ({ data, title }) => {
  const total = data.reduce((a, d) => a + d.value, 0);

  return (
    <Card className="border border-zinc-200 rounded-lg shadow-sm">
      <DashboardCardHeader icon={PieChartIcon} title={title} />
      <CardContent className="h-[300px] pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={renderLabel}
              labelLine={false}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '6px',
                border: '1px solid #e4e4e7',
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                fontSize: '12px',
              }}
              formatter={(val: unknown) => fmtCurrency(Number(val))}
            />
            <Legend
              layout="vertical"
              align="right"
              verticalAlign="middle"
              content={(props) => {
                const { payload } = props;
                return (
                  <div className="grid grid-cols-[auto_1fr_auto] gap-x-3 gap-y-1.5 pl-6 pt-4">
                    {payload?.map((entry: any, index: number) => {
                      const item = data[index];
                      const pct = total > 0 ? ((item.value / total) * 100).toFixed(1) : '0';
                      return (
                        <React.Fragment key={`item-${index}`}>
                          <div className="flex items-center">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                          </div>
                          <span className="font-semibold text-[11px] leading-none flex items-center text-zinc-800">
                            {entry.value}
                          </span>
                          <span className="text-zinc-400 text-[10px] font-mono leading-none flex items-center tabular-nums">
                            {fmtCurrency(item.value)} ({pct}%)
                          </span>
                        </React.Fragment>
                      );
                    })}
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
