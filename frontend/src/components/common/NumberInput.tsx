import { useEffect, useState } from "react";

type NumberInputProps = {
  label: string;
  value: number | "";
  onChange: (value: number | "") => void;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
};

export function NumberInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  placeholder,
  helperText,
  required = false,
}: NumberInputProps) {
  const [draftValue, setDraftValue] = useState(String(value));

  useEffect(() => {
    setDraftValue(String(value));
  }, [value]);

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-800">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </span>

      <input
        type="number"
        value={draftValue}
        min={min}
        max={max}
        step={step}
        required={required}
        placeholder={placeholder}
        onChange={(event) => {
          const rawValue = event.target.value;

          setDraftValue(rawValue);

          if (rawValue === "") {
            onChange("");
            return;
          }

          const parsedValue = Number(rawValue);

          if (Number.isFinite(parsedValue)) {
            onChange(parsedValue);
          }
        }}
        onBlur={() => {
          if (draftValue === "") {
            return;
          }

          const parsedValue = Number(draftValue);

          if (Number.isFinite(parsedValue)) {
            const normalizedValue = String(parsedValue);
            setDraftValue(normalizedValue);
            onChange(parsedValue);
          }
        }}
        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      />

      {helperText ? (
        <span className="mt-1 block text-xs leading-5 text-slate-500">
          {helperText}
        </span>
      ) : null}
    </label>
  );
}
