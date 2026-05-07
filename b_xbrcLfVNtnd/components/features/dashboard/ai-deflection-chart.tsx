'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useAiDeflectionDataStore } from '@/stores/dashboard-store'
import { ChartContainer } from './chart-container'
import { ChartSkeleton } from './widget-skeleton'

export function AiDeflectionChart() {
  const { data, state } = useAiDeflectionDataStore()

  if (state === 'loading' || data.length === 0) {
    return <ChartSkeleton className="h-[320px]" />
  }

  return (
    <ChartContainer
      title="Deflexão IA"
      subtitle="Resoluções automáticas vs humanas"
    >
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            stackOffset="expand"
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#27272a" 
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 10 }}
              dy={10}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 10 }}
              dx={-10}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#18181b',
                border: '1px solid #27272a',
                borderRadius: '8px',
                fontSize: '11px',
                fontFamily: 'ui-monospace, monospace',
              }}
              labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
              itemStyle={{ color: '#e4e4e7', padding: '2px 0' }}
              formatter={(value: number, name: string) => {
                const labels: Record<string, string> = {
                  resolvedByAi: 'Resolvido por IA',
                  transferredToHuman: 'Transferido',
                  escalated: 'Escalado',
                }
                return [value, labels[name] || name]
              }}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              iconType="rect"
              iconSize={10}
              wrapperStyle={{ fontSize: '10px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  resolvedByAi: 'IA',
                  transferredToHuman: 'Humano',
                  escalated: 'Escalado',
                }
                return <span className="text-zinc-400">{labels[value] || value}</span>
              }}
            />
            <Area
              type="monotone"
              dataKey="resolvedByAi"
              stackId="1"
              stroke="#10b981"
              fill="#10b981"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="transferredToHuman"
              stackId="1"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.6}
            />
            <Area
              type="monotone"
              dataKey="escalated"
              stackId="1"
              stroke="#f59e0b"
              fill="#f59e0b"
              fillOpacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}
