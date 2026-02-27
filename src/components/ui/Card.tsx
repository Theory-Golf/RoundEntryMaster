import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'hero' | 'stat'
  accentColor?: 'forest' | 'gold' | 'none'
}

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  accentColor = 'none'
}: CardProps) {
  const accentColors = {
    forest: 'border-l-[3px] border-l-forest',
    gold: 'border-l-[3px] border-l-gold',
    none: '',
  }

  const variants = {
    default: 'bg-white border border-stone shadow-stat',
    hero: 'bg-gradient-card border border-stone shadow-card',
    stat: 'bg-white border border-stone shadow-stat',
  }

  return (
    <div className={`rounded-stat ${variants[variant]} ${accentColors[accentColor]} ${className}`}>
      {children}
    </div>
  )
}

// Card Header component
interface CardHeaderProps {
  children: ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-5 py-4 border-b border-stone/50 ${className}`}>
      {children}
    </div>
  )
}

// Card Content component
interface CardContentProps {
  children: ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  )
}
