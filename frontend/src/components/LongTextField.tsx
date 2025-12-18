import type { ChangeEventHandler } from "react";

interface LongTextFieldProps {
  id: string;
  label: string;
  inputProps: {
    value?: string | number;
    name?: string;
    onChange?: ChangeEventHandler<HTMLTextAreaElement>;
    placeholder?: string;
    required?: boolean;
  };
  error?: string;
  rows?: number;
}

export default function LongTextField({ label, inputProps, error, id, rows }: LongTextFieldProps) {
  return (
    <div className="form-control w-full mb-3">
      <label className="label" htmlFor={id}>
        <span className="label-text">{label}</span>
      </label>
      <textarea
        {...inputProps}
        id={id}
        rows={rows || 10}
        className={`textarea textarea-bordered w-full ${error ? "textarea-error" : ""}`}
      />
      {error && <span className="text-error text-sm mt-1">{error}</span>}
    </div>
  );
}
