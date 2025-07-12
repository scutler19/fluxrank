interface DeltaProps {
  delta: number | null
  className?: string
}

export default function Delta({ delta, className = '' }: DeltaProps) {
  if (delta === null || delta === undefined) {
    return (
      <span className={`text-gray-500 dark:text-gray-400 text-sm ${className}`}>
        —
      </span>
    )
  }

  const isPositive = delta > 0
  const isNegative = delta < 0

  const arrow = isPositive ? '↑' : isNegative ? '↓' : '→'
  const colorClass = isPositive 
    ? 'text-green-600 dark:text-green-400' 
    : isNegative 
      ? 'text-red-600 dark:text-red-400' 
      : 'text-gray-500 dark:text-gray-400'

  return (
    <span className={`text-sm font-medium ${colorClass} ${className}`}>
      {arrow} {Math.abs(delta).toFixed(1)}
    </span>
  )
} 