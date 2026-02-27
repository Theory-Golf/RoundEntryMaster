import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  inputMode?: 'text' | 'numeric' | 'decimal'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', inputMode = 'text', value, ...props }, ref) => {
    // Check if value was explicitly provided (controlled) vs using register (uncontrolled)
    // For uncontrolled inputs with register, we should not pass value prop
    const hasValueProvided = value !== undefined
    
    // For controlled inputs: convert 0 to empty string for display
    const displayValue = hasValueProvided && (value === 0 || value === undefined) ? '' : value
    
    return (
      <div className="w-full">
        {label && (
          <label className="block font-mono text-[10px] tracking-widest text-pewter uppercase mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          inputMode={inputMode}
          {...(hasValueProvided && { value: displayValue })}
          className={`
            w-full px-4 py-3
            bg-white border rounded-[4px]
            font-body text-sm text-ink
            placeholder:text-pewter/60
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest
            disabled:bg-parchment disabled:cursor-not-allowed
            ${error ? 'border-score-double focus:ring-score-double/30 focus:border-score-double' : 'border-stone'}
            ${className}
          `}
          {...props}
        />
        {error && (
          <p className="mt-1.5 font-mono text-xs text-score-double">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
