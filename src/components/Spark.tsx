'use client'

import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

interface SparkProps {
  data: Array<{ date: string; score: number }>
  width?: number
  height?: number
  color?: string
}

export default function Spark({ 
  data, 
  width = 100, 
  height = 30, 
  color = '#3b82f6' 
}: SparkProps) {
  if (!data || data.length === 0) {
    return (
      <div 
        className="bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
        style={{ width, height }}
      />
    )
  }

  return (
    <ResponsiveContainer width={width} height={height}>
      <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
        <Line
          type="monotone"
          dataKey="score"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 2, fill: color }}
        />
        <Tooltip
          content={({ active, payload }: { active?: boolean; payload?: Array<{ payload: { date: string }; value?: number }> }) => {
            if (active && payload && payload.length) {
              return (
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 shadow-lg text-xs">
                  <p className="font-medium">
                    {payload[0].payload.date}: {payload[0].value?.toFixed(2)}
                  </p>
                </div>
              )
            }
            return null
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
} 