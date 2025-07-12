import Image from 'next/image'

interface LogoProps {
  className?: string
  width?: number
  height?: number
}

export default function Logo({ className = '', width = 200, height = 44 }: LogoProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.svg"
        alt="FluxRank.io"
        width={width}
        height={height}
        className="h-auto"
        priority
      />
    </div>
  )
} 