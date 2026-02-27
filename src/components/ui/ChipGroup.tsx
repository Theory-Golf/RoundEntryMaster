interface ChipGroupProps<T extends string> {
  label?: string
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  error?: string
  disabled?: boolean
}

export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  disabled = false,
}: ChipGroupProps<T>) {
  return (
    <div className="w-full">
      {label && (
        <label className="block font-mono text-[10px] tracking-widest text-pewter uppercase mb-2">
          {label}
        </label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`
              px-4 py-2 rounded-full
              font-mono text-xs tracking-wide
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-forest/30
              disabled:opacity-50 disabled:cursor-not-allowed
              ${
                value === option.value
                  ? 'bg-forest text-white'
                  : 'bg-white border border-stone text-pewter hover:border-forest hover:text-forest'
              }
            `}
          >
            {option.label}
          </button>
        ))}
      </div>
      {error && (
        <p className="mt-1.5 font-mono text-xs text-score-double">{error}</p>
      )}
    </div>
  )
}
