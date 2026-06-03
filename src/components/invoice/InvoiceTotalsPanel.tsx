import React from 'react';
import { Input } from '../common/Input/Input';

interface InvoiceTotalsPanelProps {
  subTotal: number;
  taxPercentage: number;
  taxAmount: number;
  invoiceAmount: number;
  currencySymbol: string;
  onTaxPctChange: (pct: number) => void;
  onTaxAmtChange: (amt: number) => void;
  disabled?: boolean;
}

export const InvoiceTotalsPanel: React.FC<InvoiceTotalsPanelProps> = ({
  subTotal,
  taxPercentage,
  taxAmount,
  invoiceAmount,
  currencySymbol,
  onTaxPctChange,
  onTaxAmtChange,
  disabled = false
}) => {
  const fmt = (n: number) => {
    const num = isNaN(n) ? 0 : n;
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const cleanSubTotal = isNaN(subTotal) ? 0 : subTotal;

  return (
    <div style={{ padding: '20px 24px' }}>
      <h2 style={{
        fontSize: '13px',
        fontWeight: 600,
        color: '#6c757d',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        margin: '0 0 16px 0'
      }}>
        Invoice Totals
      </h2>

      {}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>

        {}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid #f1f3f5',
          fontSize: '14px'
        }}>
          <span style={{ color: '#495057' }}>Sub Total</span>
          <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>
            {currencySymbol}{fmt(cleanSubTotal)}
          </span>
        </div>

        {}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          borderBottom: '1px solid #f1f3f5',
          gap: '12px'
        }}>
          <span style={{ color: '#495057', fontSize: '14px', flexShrink: 0 }}>Tax</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '90px' }}>
              <Input
                type="number"
                numeric
                value={isNaN(taxPercentage) || taxPercentage === 0 ? '' : taxPercentage}
                onChange={(e) => onTaxPctChange(e.target.value === '' ? 0 : Number(e.target.value))}
                disabled={disabled || cleanSubTotal === 0}
                placeholder="0.00 %"
                style={{ height: '32px', textAlign: 'right', fontSize: '13px' }}
              />
            </div>
            <div style={{ width: '100px' }}>
              <Input
                type="number"
                numeric
                value={isNaN(taxAmount) || taxAmount === 0 ? '' : taxAmount}
                onChange={(e) => onTaxAmtChange(e.target.value === '' ? 0 : Number(e.target.value))}
                disabled={disabled || cleanSubTotal === 0}
                placeholder="0.00"
                style={{ height: '32px', textAlign: 'right', fontSize: '13px' }}
              />
            </div>
          </div>
        </div>

        {}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 0 4px',
          fontSize: '15px'
        }}>
          <span style={{ fontWeight: 600, color: '#262626' }}>Invoice Amount</span>
          <span style={{ fontWeight: 700, fontSize: '20px', fontFamily: 'monospace', color: '#262626' }}>
            {currencySymbol}{fmt(invoiceAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
