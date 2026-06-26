import type { ChangeEvent, InputHTMLAttributes } from 'react';
import './input.css';

interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  label?: string;
  hint?: string;
  error?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  id?: string;
}

export function TextInput({
  value,
  defaultValue,
  placeholder,
  label,
  hint,
  error,
  onChange,
  id,
  disabled,
  className = '',
  ...props
}: TextInputProps) {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2, 9)}`;

  if (label || hint || error) {
    return (
      <div className="input-wrapper">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
          </label>
        )}
        <input
          id={inputId}
          type="text"
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          onChange={onChange}
          disabled={disabled}
          data-error={error ? 'true' : undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={`input-field ${className}`.trim()}
          {...props}
        />
        {error && (
          <span id={`${inputId}-error`} className="input-error-msg" role="alert">
            {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${inputId}-hint`} className="input-hint">
            {hint}
          </span>
        )}
      </div>
    );
  }

  return (
    <input
      id={inputId}
      type="text"
      value={value}
      defaultValue={defaultValue}
      placeholder={placeholder}
      onChange={onChange}
      disabled={disabled}
      data-error={error ? 'true' : undefined}
      className={`input-field ${className}`.trim()}
      {...props}
    />
  );
}
