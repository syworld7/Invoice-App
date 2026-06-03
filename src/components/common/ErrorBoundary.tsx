import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import type { FallbackProps } from 'react-error-boundary';

const ErrorFallback: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f8f9fa',
      padding: '24px',
      fontFamily: 'var(--font-sans)',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
        border: '1px solid #e9ecef',
        maxWidth: '500px',
        width: '100%'
      }}>
        <span style={{ fontSize: '48px', marginBottom: '16px', display: 'block' }}>⚠️</span>
        <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#262626', margin: '0 0 12px 0' }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '24px', lineHeight: '1.5' }}>
          An unexpected application error occurred.
        </p>
        <pre style={{
          backgroundColor: '#f1f3f5',
          padding: '12px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#e03131',
          overflowX: 'auto',
          textAlign: 'left',
          marginBottom: '24px',
          fontFamily: 'monospace'
        }}>
          {(error as any)?.message || String(error)}
        </pre>
        <button
          onClick={resetErrorBoundary}
          style={{
            backgroundColor: '#262626',
            color: '#ffffff',
            border: 'none',
            padding: '10px 24px',
            borderRadius: '4px',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'background-color 0.2s'
          }}
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ children }) => {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.href = '/';
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
};
