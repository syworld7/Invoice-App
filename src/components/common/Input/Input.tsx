import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement> {
  label?: string;
  error?: string | null;
  isRequired?: boolean;
  isTextArea?: boolean;
  numeric?: boolean;
  containerStyle?: React.CSSProperties;
  rows?: number;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  isRequired = false,
  isTextArea = false,
  numeric = false,
  id,
  className = '',
  style,
  containerStyle,
  disabled,
  rows = 3,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="custom-input-container" style={containerStyle}>
      {label && (
        <label className="custom-input-label" htmlFor={inputId}>
          {label}
          {isRequired && <span className="custom-input-required-asterisk">*</span>}
        </label>
      )}
      
      <div className="custom-input-wrapper">
        {isTextArea ? (
          <textarea
            id={inputId}
            className={`custom-input-field ${error ? 'input-error' : ''} ${className}`}
            disabled={disabled}
            rows={rows}
            style={{ 
              resize: 'none', 
              height: 'auto',
              ...style 
            }}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            className={`custom-input-field ${numeric ? 'numeric-input' : ''} ${error ? 'input-error' : ''} ${className}`}
            disabled={disabled}
            style={style}
            {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
      </div>
      
      {error && <span className="custom-input-error">{error}</span>}
    </div>
  );
};
