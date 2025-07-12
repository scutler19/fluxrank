interface DeltaProps {
  delta: number | null
  className?: string
}

export default function Delta({ delta, className = '' }: DeltaProps) {
  if (delta === null || delta === undefined) {
    return (
      <span className={`text-brand-gray text-sm ${className}`}>
        —
      </span>
    )
  }

  const isPositive = delta > 0
  const isNegative = delta < 0

  const arrow = isPositive ? '↑' : isNegative ? '↓' : '→'
  const colorClass = isPositive 
    ? 'text-success' 
    : isNegative 
      ? 'text-error' 
      : 'text-brand-gray'

  return (
    <span className={`text-sm font-medium ${colorClass} ${className}`}>
      {arrow} {Math.abs(delta).toFixed(1)}
    </span>
  )
} 