import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Menu as MenuIcon, 
  Close as CloseIcon, 
  Receipt as ReceiptIcon, 
  Storefront as StorefrontIcon,
  Logout as LogoutIcon,
  Business as BusinessIcon
} from '@mui/icons-material';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, company, logoUrl, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Invoices', path: '/invoices', icon: <ReceiptIcon fontSize="small" /> },
    { name: 'Items', path: '/items', icon: <StorefrontIcon fontSize="small" /> },
  ];

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', background: 'var(--bg-page)' }}>
      {}
      <aside className="no-print" style={{
        width: '260px',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        position: 'sticky',
        top: 0,
        height: '100vh',
        zIndex: 100
      }}>
        {}
        <div style={{
          padding: '24px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          {logoUrl && !logoError ? (
            <img 
              src={logoUrl} 
              alt="Company Logo" 
              onError={() => setLogoError(true)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '6px',
                objectFit: 'cover',
                backgroundColor: '#ffffff',
                border: '1px solid rgba(255,255,255,0.1)'
              }} 
            />
          ) : (
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: '18px'
            }}>
              {company?.companyName ? company.companyName.charAt(0).toUpperCase() : <BusinessIcon />}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#ffffff',
              margin: 0,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {company?.companyName || 'InvoiceApp'}
            </h2>
            <span style={{
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
              display: 'block'
            }}>
              Currency: {company?.currencySymbol || '$'}
            </span>
          </div>
        </div>

        {}
        <nav style={{ flex: 1, padding: '24px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '6px',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'all 0.15s ease'
              })}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          backgroundColor: 'rgba(0,0,0,0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{
                fontSize: '13px',
                fontWeight: 600,
                color: '#ffffff',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user ? `${user.firstName} ${user.lastName || ''}` : 'User Profile'}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'rgba(255,255,255,0.4)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.email}
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              title="Logout"
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ff6b6b'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.45)'}
            >
              <LogoutIcon fontSize="small" />
            </button>
          </div>
        </div>
      </aside>

      {}
      <div className="no-print" style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 200,
        borderBottom: '1px solid rgba(255,255,255,0.05)'
      }} id="mobile-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            {mobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
          <span style={{ fontWeight: 600, fontSize: '15px' }}>{company?.companyName || 'InvoiceApp'}</span>
        </div>
        <button 
          onClick={handleLogout}
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(255,255,255,0.7)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <LogoutIcon fontSize="small" />
        </button>
      </div>

      {}
      {mobileMenuOpen && (
        <div 
          className="no-print"
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            top: '60px',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 199
          }}
        />
      )}

      {}
      <div 
        className="no-print"
        style={{
          display: 'none',
          position: 'fixed',
          top: '60px',
          bottom: 0,
          left: 0,
          width: '260px',
          backgroundColor: '#1a1a1a',
          color: '#ffffff',
          zIndex: 200,
          transition: 'transform 0.25s ease',
          transform: mobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
          flexDirection: 'column'
        }}
        id="mobile-drawer"
      >
        <nav style={{ flex: 1, padding: '20px 12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '6px',
                color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)',
                backgroundColor: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: '14px'
              })}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
          <div style={{ fontSize: '13px', fontWeight: 600 }}>{user ? `${user.firstName} ${user.lastName || ''}` : ''}</div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>{user?.email}</div>
        </div>
      </div>

      {}
      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }} className="print-main-content">
        <div style={{ flex: 1, padding: '32px' }} className="print-padding-reset">
          {children}
        </div>
      </main>

      {}
      <style>{`
        .sidebar-link:hover {
          color: #ffffff !important;
          background-color: rgba(255, 255, 255, 0.04) !important;
        }
        @media (max-width: 768px) {
          aside {
            display: none !important;
          }
          #mobile-header {
            display: flex !important;
          }
          #mobile-drawer {
            display: flex !important;
          }
          .print-main-content {
            padding: 0 !important;
            padding-top: 60px !important;
          }
          .print-padding-reset {
            padding: 16px !important;
          }
        }
        @media print {
          aside, #mobile-header, #mobile-drawer, .no-print {
            display: none !important;
          }
          body, html, #root, .app-container {
            background-color: #ffffff !important;
            background: #ffffff !important;
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
          }
          .print-padding-reset {
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};
