import React from 'react';
import { Input } from '../common/Input/Input';

interface InvoiceHeaderFieldsProps {
  invoiceNo: string;
  setInvoiceNo: (val: string) => void;
  invoiceDate: string;
  setInvoiceDate: (val: string) => void;
  customerName: string;
  setCustomerName: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  city: string;
  setCity: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;
  customerTouched: boolean;
  setCustomerTouched: (val: boolean) => void;
  disabled?: boolean;
}

export const InvoiceHeaderFields: React.FC<InvoiceHeaderFieldsProps> = ({
  invoiceNo,
  setInvoiceNo,
  invoiceDate,
  setInvoiceDate,
  customerName,
  setCustomerName,
  address,
  setAddress,
  city,
  setCity,
  notes,
  setNotes,
  customerTouched,
  setCustomerTouched,
  disabled = false
}) => {
  const customerError = customerTouched && !customerName.trim() ? 'Customer Name is required.' : null;

  return (
    <div style={{ padding: '20px 24px' }}>
      <h2 style={{
        fontSize: '13px',
        fontWeight: 600,
        color: '#6c757d',
        marginBottom: '16px',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        margin: '0 0 16px 0'
      }}>
        Invoice Details
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <Input
              label="Invoice No"
              type="text"
              value={invoiceNo}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setInvoiceNo(val);
              }}
              disabled={disabled}
              placeholder="1001"
            />
            <span style={{ fontSize: '11px', color: '#adb5bd', marginTop: '4px', display: 'block' }}>
              Auto next available number
            </span>
          </div>

          <Input
            label="Invoice Date *"
            type="date"
            value={invoiceDate}
            onChange={(e) => setInvoiceDate(e.target.value)}
            disabled={disabled}
          />
        </div>

        {}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Customer Name *"
            type="text"
            value={customerName}
            onChange={(e) => {
              setCustomerName(e.target.value);
              if (customerTouched) setCustomerTouched(false);
            }}
            onBlur={() => setCustomerTouched(true)}
            error={customerError}
            disabled={disabled}
            placeholder="Enter customer name"
          />

          <Input
            label="City"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            disabled={disabled}
            placeholder="Enter city"
          />
        </div>

        {}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <Input
            label="Address"
            isTextArea
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={disabled}
            placeholder="Enter address"
          />

          <Input
            label="Notes"
            isTextArea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={disabled}
            placeholder="Additional notes"
          />
        </div>
      </div>
    </div>
  );
};
