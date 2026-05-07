'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { useSlaDataStore } from '@/stores/dashboard-store'
import { ChartContainer } from './chart-container'
import { ChartSkeleton } from './widget-skeleton'

export function SlaPerformanceChart() {
  const { data, state } = useSlaDataStore()

  if (state === 'loading' || data.length === 0) {
    return <ChartSkeleton className="h-[320px]" />
  }

  return (
    <ChartContainer
      title="Performance SLA"
      subtitle="Tempo de resposta e resolução"
    >
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
              tickFormatter={(value) => `${value}s`}
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
                  responseTime: 'Tempo de Resposta',
                  resolutionTime: 'Tempo de Resolução',
                  slaCompliance: 'SLA Compliance',
                }
                const units: Record<string, string> = {
                  responseTime: 's',
                  resolutionTime: 'min',
                  slaCompliance: '%',
                }
                return [`${value}${units[name] || ''}`, labels[name] || name]
              }}
            />
            <Legend 
              verticalAlign="bottom"
              height={36}
              iconType="line"
              iconSize={10}
              wrapperStyle={{ fontSize: '10px' }}
              formatter={(value) => {
                const labels: Record<string, string> = {
                  responseTime: 'Tempo de Resposta',
                  resolutionTime: 'Tempo de Resolução',
                }
                return <span className="text-zinc-400">{labels[value] || value}</span>
              }}
            />
            <Line
              type="monotone"
              dataKey="responseTime"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#3b82f6' }}
            />
            <Line
              type="monotone"
              dataKey="resolutionTime"
              stroke="#22c55e"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#22c55e' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  )
}
