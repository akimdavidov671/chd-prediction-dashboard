type SelectOption<TValue extends string | number | null> = {
  label: string;
  value: TValue;
};

type SelectInputProps<TValue extends string | number | null> = {
  label: string;
  value: TValue;
  options: readonly SelectOption<TValue>[];
  onChange: (value: TValue) => void;
  helperText?: string;
  required?: boolean;
};

export function SelectInput<TValue extends string | number | null>({
  label,
  value,
  options,
  onChange,
  helperText,
  required = false,
}: SelectInputProps<TValue>) {
  const valueToString = (optionValue: TValue) =>
    optionValue === null ? "__null__" : String(optionValue);

  const stringToValue = (stringValue: string): TValue => {
    const option = options.find((item) => valueToString(item.value) === stringValue);

    if (!option) {
      throw new Error(`Unknown select value: ${stringValue}`);
    }

    return option.value;
  };

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-800">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>

      <select
        value={valueToString(value)}
        onChange={(event) => onChange(stringToValue(event.target.value))}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      >
        {options.map((option) => (
          <option key={valueToString(option.value)} value={valueToString(option.value)}>
            {option.label}
          </option>
        ))}
      </select>

      {helperText ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
