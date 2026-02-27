import { ButtonHTMLAttributes, forwardRef } from 'react'

type ButtonVariant = 'primary' | 'outline' | 'gold' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  isLoading?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-forest text-white hover:bg-forest-light focus:ring-forest',
  outline: 'bg-transparent text-forest border border-forest hover:bg-forest-tint focus:ring-forest',
  gold: 'bg-transparent text-gold border border-gold/40 hover:bg-gold-tint hover:border-gold focus:ring-gold',
  danger: 'bg-score-double text-white hover:bg-red-700 focus:ring-red-500',
}

const baseStyles = `
  inline-flex items-center justify-center
  px-5 py-2.5
  rounded-[4px]
  text-xs font-body font-medium tracking-wider uppercase
  transition-all duration-200
  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-linen
  disabled:opacity-50 disabled:cursor-not-allowed
`

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', isLoading, className = '', children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
