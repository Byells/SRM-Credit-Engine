import { SelectHTMLAttributes } from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  error?: string;
}

function Select({ label, options, error, className, ...props }: SelectProps) {
  const classes = [error ? "field-invalid" : "", className]
    .filter(Boolean)
    .join(" ");
  return (
    <label>
      {label}
      <select className={classes || undefined} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="field-error-message">{error}</span>}
    </label>
  );
}

export default Select;
