import React from 'react';
import { CircularProgress } from '@mui/material';

export const PageLoader: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#f8f9fa',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 9999
    }}>
      <CircularProgress size={40} style={{ color: '#262626', marginBottom: '16px' }} />
      <span style={{
        fontSize: '13px',
        fontWeight: 500,
        color: '#6c757d',
        fontFamily: 'var(--font-sans)',
        letterSpacing: '0.5px'
      }}>
        Loading invoice portal...
      </span>
    </div>
  );
};
