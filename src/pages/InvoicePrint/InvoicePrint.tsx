import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInvoicesApi } from '../../hooks/useInvoicesApi';
import { useItemsApi } from '../../hooks/useItemsApi';
import { CircularProgress } from '@mui/material';
import { Print as PrintIcon, ArrowBack as BackIcon } from '@mui/icons-material';
import type { InvoiceDetails } from '../../types';
import './InvoicePrint.css';

export const InvoicePrint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { company, logoUrl } = useAuth();
  const currencySymbol = company?.currencySymbol || '₹';

  const { getInvoiceDetails, error: apiError } = useInvoicesApi();
  const { getLookupList } = useItemsApi();

  const [invoice, setInvoice] = useState<InvoiceDetails | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    if (id) {
      fetchInvoice(Number(id));
    }
  }, [id]);

  const fetchInvoice = async (invoiceID: number) => {
    setStatus('loading');
    setErrorMsg(null);
    try {
      const data = await getInvoiceDetails(invoiceID);
      
      const calculateLineAmount = (qty: number, rate: number, discount: number): number => {
        const q = isNaN(qty) ? 0 : qty;
        const r = isNaN(rate) ? 0 : rate;
        const d = isNaN(discount) ? 0 : discount;
        const rawTotal = q * r;
        const discounted = rawTotal - (rawTotal * (d / 100));
        return isNaN(discounted) ? 0 : Number(discounted.toFixed(2));
      };

      
      let hydratedLines = (data.lines || []).map((line: any) => {
        const qty = line.quantity || 0;
        const rate = line.rate || 0;
        const discount = line.discountPct || 0;
        const amount = line.amount !== undefined && line.amount !== null ? line.amount : calculateLineAmount(qty, rate, discount);
        return {
          ...line,
          quantity: qty,
          rate: rate,
          discountPct: discount,
          amount: amount,
          itemName: line.itemName || `Item #${line.itemID}`
        };
      });

      
      try {
        const itemsCatalog = await getLookupList();
        hydratedLines = hydratedLines.map((line: any) => {
          const match = itemsCatalog.find((cat: any) => Number(cat.itemID) === Number(line.itemID));
          return {
            ...line,
            itemName: match ? match.itemName : line.itemName
          };
        });
      } catch (itemErr) {
        console.error('Lookup items hydration failed:', itemErr);
      }

      setInvoice({ ...data, lines: hydratedLines });
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load invoice print details.');
      setStatus('error');
    }
  };

  
  useEffect(() => {
    if (invoice) {
      const timer = setTimeout(() => {
        window.print();
      }, 800); 
      return () => clearTimeout(timer);
    }
  }, [invoice]);

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${String(date.getDate()).padStart(2, '0')}-${months[date.getMonth()]}-${date.getFullYear()}`;
  };

  if (status === 'idle' || status === 'loading') {
    return (
      <div className="print-loader-container">
        <CircularProgress size={40} style={{ color: '#1a1a1a' }} />
        <span className="print-loader-text">Preparing document for print...</span>
      </div>
    );
  }

  if (status === 'error' || !invoice) {
    return (
      <div className="print-error-container">
        <span className="print-error-icon">⚠️</span>
        <span className="print-error-message">{errorMsg || apiError || 'Invoice not found.'}</span>
        <button className="btn-secondary" onClick={() => navigate('/invoices')}>
          Back to Invoices
        </button>
      </div>
    );
  }

  return (
    <div className="print-page-container">
      {}
      <div className="no-print print-controls-bar">
        <div className="print-controls-left">
          <button 
            onClick={() => navigate('/invoices')}
            className="print-back-btn"
          >
            <BackIcon fontSize="small" /> Back to Invoices
          </button>
          <span className="print-divider-line" />
          <span className="print-preview-mode-title">Print Preview Mode - Invoice #{invoice.invoiceNo}</span>
        </div>
        
        <button 
          onClick={() => window.print()}
          className="print-invoice-btn"
        >
          <PrintIcon fontSize="small" /> Print Invoice
        </button>
      </div>

      {}
      <div className="print-sheet-body">
        
        {}
        <div className="print-header-block">
          <div>
            {logoUrl && !logoError ? (
              <img 
                src={logoUrl} 
                alt="Company Logo" 
                onError={() => setLogoError(true)}
                className="print-company-logo"
              />
            ) : (
              <h2 className="print-company-fallback-title">
                {company?.companyName}
              </h2>
            )}
            
            <div className="print-company-details">
              <strong>{company?.companyName}</strong>
              <div className="print-company-address">
                {localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')!).email : ''}
              </div>
            </div>
          </div>

          <div className="print-invoice-id-panel">
            <h1 className="print-invoice-type">
              INVOICE
            </h1>
            <span className="print-invoice-number">
              # {invoice.invoiceNo}
            </span>

            <div className="print-invoice-meta">
              <div><strong>Date:</strong> {formatDateDisplay(invoice.invoiceDate)}</div>
              <div><strong>Currency:</strong> {currencySymbol} ({company?.currencySymbol === '₹' ? 'INR' : 'USD'})</div>
            </div>
          </div>
        </div>

        <hr className="print-sheet-divider" />

        {}
        <div className="print-billing-details-grid">
          <div>
            <span className="print-billing-label">
              Billed To
            </span>
            <div className="print-billing-info">
              <strong className="print-billing-name">{invoice.customerName}</strong>
              {invoice.address && <div className="print-billing-subtext">{invoice.address}</div>}
              {invoice.city && <div className="print-billing-city">{invoice.city}</div>}
            </div>
          </div>
          
          <div style={{ display: 'none' }}>
            {}
          </div>
        </div>

        {}
        <table className="print-table">
          <thead>
            <tr className="print-table-header-row">
              <th className="print-table-th" style={{ width: '40px' }}>#</th>
              <th className="print-table-th">Item & Description</th>
              <th className="print-table-th" style={{ textAlign: 'right', width: '60px' }}>Qty</th>
              <th className="print-table-th" style={{ textAlign: 'right', width: '100px' }}>Rate</th>
              <th className="print-table-th" style={{ textAlign: 'right', width: '90px' }}>Discount</th>
              <th className="print-table-th" style={{ textAlign: 'right', width: '120px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lines.map((line, index) => (
              <tr key={index} className="print-table-row">
                <td className="print-table-td" style={{ color: '#666666' }}>{line.rowNo}</td>
                <td className="print-table-td">
                  <strong className="print-table-td-name">{line.itemName}</strong>
                  {line.description && <span className="print-table-td-desc">{line.description}</span>}
                </td>
                <td className="print-table-td" style={{ textAlign: 'right' }}>{line.quantity}</td>
                <td className="print-table-td" style={{ textAlign: 'right' }}>
                  {currencySymbol}{line.rate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="print-table-td" style={{ textAlign: 'right', color: line.discountPct > 0 ? '#198754' : '#666666' }}>
                  {line.discountPct > 0 ? `${line.discountPct.toFixed(2)}%` : '-'}
                </td>
                <td className="print-table-td" style={{ textAlign: 'right', fontWeight: 600 }}>
                  {currencySymbol}{line.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {}
        <div className="print-summary-grid">
          {}
          <div>
            {invoice.notes && (
              <div className="print-notes-section">
                <span className="print-notes-label">
                  Terms & Notes
                </span>
                <p className="print-notes-p">
                  {invoice.notes}
                </p>
              </div>
            )}
            
            <div className="print-business-thanks">
              Thank you for your business!
            </div>
          </div>

          {}
          <div className="print-calculation-panel">
            <div className="print-calc-row">
              <span style={{ color: '#666666' }}>Sub Total</span>
              <strong>{currencySymbol}{invoice.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
            </div>

            {invoice.taxAmount > 0 && (
              <div className="print-calc-row">
                <span style={{ color: '#666666' }}>Tax ({invoice.taxPercentage.toFixed(1)}%)</span>
                <strong>{currencySymbol}{invoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
            )}

            <div className="print-calc-total-row">
              <strong>Total Billed</strong>
              <strong className="print-total-billed-value">
                {currencySymbol}{invoice.invoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
