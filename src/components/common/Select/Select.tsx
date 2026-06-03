import React from 'react';
import './Select.css';

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
  isRequired?: boolean;
  options: SelectOption[];
  containerStyle?: React.CSSProperties;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  isRequired = false,
  options,
  id,
  className = '',
  style,
  containerStyle,
  disabled,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="custom-input-container" style={containerStyle}>
      {label && (
        <label className="custom-input-label" htmlFor={selectId}>
          {label}
          {isRequired && <span className="custom-input-required-asterisk">*</span>}
        </label>
      )}
      
      <div className="custom-input-wrapper">
        <select
          id={selectId}
          className={`custom-select-field ${error ? 'input-error' : ''} ${className}`}
          disabled={disabled}
          style={style}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      
      {error && <span className="custom-input-error">{error}</span>}
    </div>
  );
};
