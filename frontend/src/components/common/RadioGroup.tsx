type RadioOption<TValue extends string | number | null> = {
  label: string;
  value: TValue;
};

type RadioGroupProps<TValue extends string | number | null> = {
  label: string;
  value: TValue;
  options: readonly RadioOption<TValue>[];
  onChange: (value: TValue) => void;
  helperText?: string;
  required?: boolean;
};

export function RadioGroup<TValue extends string | number | null>({
  label,
  value,
  options,
  onChange,
  helperText,
  required = false,
}: RadioGroupProps<TValue>) {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-800">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </legend>

      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((option) => {
          const optionKey = String(option.value);
          const isSelected = option.value === value;

          return (
            <button
              key={optionKey}
              type="button"
              onClick={() => onChange(option.value)}
              className={[
                "rounded-xl border px-3 py-2 text-sm font-medium transition",
                isSelected
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {helperText ? (
        <p className="mt-1 text-xs leading-5 text-slate-500">{helperText}</p>
      ) : null}
    </fieldset>
  );
}
