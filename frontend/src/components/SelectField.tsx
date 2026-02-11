import type { ChangeEventHandler } from "react";

interface SelectFieldProps {
  id: string;
  label: string;
  inputProps: {
    value?: string | number;
    name?: string;
    onChange?: ChangeEventHandler<HTMLSelectElement>;
    required?: boolean;
  };
  options: { val: string; label: string; key?: string }[];
  noChoiceText?: string;
  error?: string;
  testId?: string;
}

export default function SelectField({
  label,
  inputProps,
  error,
  id,
  noChoiceText,
  options,
  testId,
}: SelectFieldProps) {
  return (
    <div className="form-control w-full mb-3">
      <label className="label" htmlFor={id}>
        <span className="label-text">{label}</span>
      </label>
      <select
        {...inputProps}
        className={`select select-bordered w-full ${error ? "select-error" : ""}`}
        id={id}
        data-testid={testId}
      >
        {noChoiceText && <option value="">{noChoiceText}</option>}
        {options.map((o) => (
          <option key={o.key || o.val} value={o.val}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <span className="text-error text-sm mt-1">{error}</span>}
    </div>
  );
}
