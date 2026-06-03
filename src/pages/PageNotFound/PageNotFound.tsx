import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button/Button';
import { ErrorOutlined as ErrorOutlineIcon } from '@mui/icons-material';
import './PageNotFound.css';

export const PageNotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <div className="notfound-content">
        {}
        <div className="notfound-icon-circle">
          <ErrorOutlineIcon style={{ fontSize: '36px' }} />
        </div>

        <div>
          <h1 className="notfound-title">404</h1>
          <h2 className="notfound-subtitle">Page Not Found</h2>
          <p className="notfound-description">
            The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
          </p>
        </div>

        <Button
          onClick={() => navigate('/invoices')}
          className="notfound-btn"
        >
          Go back to dashboard
        </Button>
      </div>
    </div>
  );
};
