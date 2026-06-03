import React from 'react';
import './Checkbox.css';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  className = '',
  style,
  checked,
  onChange,
  disabled,
  ...props
}) => {
  return (
    <label className={`custom-checkbox-label ${className}`} style={style}>
      <input
        type="checkbox"
        className="custom-checkbox-input"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        {...props}
      />
      <span className="custom-checkbox-checkmark" />
      <span>{label}</span>
    </label>
  );
};
