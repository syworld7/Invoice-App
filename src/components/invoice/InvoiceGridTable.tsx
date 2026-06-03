import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IconButton, 
  Tooltip 
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Print as PrintIcon 
} from '@mui/icons-material';
import type { Invoice } from '../../types';

interface InvoiceGridTableProps {
  invoices: Invoice[];
  currencySymbol: string;
  onDeleteTrigger: (invoice: Invoice) => void;
  currentPage: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

export const InvoiceGridTable: React.FC<InvoiceGridTableProps> = ({
  invoices,
  currencySymbol,
  onDeleteTrigger,
  currentPage,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  sortField,
  sortDirection,
  onSort
}) => {
  const navigate = useNavigate();

  const totalPages = Math.ceil(invoices.length / rowsPerPage);
  const paginatedInvoices = invoices.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getSortIndicator = (field: string) => {
    if (sortField !== field) return '';
    return sortDirection === 'asc' ? ' ▲' : ' ▼';
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = d.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const formatInvoiceNo = (no: number | string) => {
    const str = String(no);
    if (str.startsWith('INV-')) return str;
    const padded = str.padStart(3, '0');
    return `INV-${padded}`;
  };

  return (
    <div style={{ padding: 0, overflow: 'hidden' }}>
      {invoices.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '240px', gap: '8px' }}>
          <span style={{ fontSize: '32px' }}>📄</span>
          <span style={{ fontSize: '14px', color: '#6c757d' }}>No matching invoices found in this period.</span>
        </div>
      ) : (
        <>
          {}
          <div className="desktop-table-container" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e9ecef', backgroundColor: '#ffffff' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 500, color: '#6c757d', cursor: 'pointer' }} onClick={() => onSort('invoiceNo')}>
                    Invoice No{getSortIndicator('invoiceNo')}
                  </th>
                  <th style={{ padding: '16px 20px', fontWeight: 500, color: '#6c757d', cursor: 'pointer' }} onClick={() => onSort('invoiceDate')}>
                    Date{getSortIndicator('invoiceDate')}
                  </th>
                  <th style={{ padding: '16px 20px', fontWeight: 500, color: '#6c757d', cursor: 'pointer' }} onClick={() => onSort('customerName')}>
                    Customer{getSortIndicator('customerName')}
                  </th>
                  <th style={{ padding: '16px 20px', fontWeight: 500, color: '#6c757d', cursor: 'pointer' }} onClick={() => onSort('itemsCount')}>
                    Items{getSortIndicator('itemsCount')}
                  </th>
                  <th style={{ padding: '16px 20px', fontWeight: 500, color: '#6c757d', cursor: 'pointer' }} onClick={() => onSort('subTotal')}>
                    Sub Total{getSortIndicator('subTotal')}
                  </th>
                  <th style={{ padding: '16px 20px', fontWeight: 500, color: '#6c757d', cursor: 'pointer' }} onClick={() => onSort('taxPercentage')}>
                    Tax %{getSortIndicator('taxPercentage')}
                  </th>
                  <th style={{ padding: '16px 20px', fontWeight: 500, color: '#6c757d', cursor: 'pointer' }} onClick={() => onSort('taxAmount')}>
                    Tax Amt{getSortIndicator('taxAmount')}
                  </th>
                  <th style={{ padding: '16px 20px', fontWeight: 500, color: '#6c757d', cursor: 'pointer' }} onClick={() => onSort('invoiceAmount')}>
                    Total{getSortIndicator('invoiceAmount')}
                  </th>
                  <th style={{ padding: '16px 20px', fontWeight: 500, color: '#6c757d', textAlign: 'center' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedInvoices.map((inv) => (
                  <tr key={inv.invoiceID} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    <td style={{ padding: '16px 20px', fontWeight: 600, color: '#262626' }}>
                      {formatInvoiceNo(inv.invoiceNo)}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#495057' }}>
                      {formatDate(inv.invoiceDate)}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#495057' }}>
                      {inv.customerName}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#495057' }}>
                      {inv.itemsCount || 0}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#495057', fontFamily: 'monospace' }}>
                      {currencySymbol}{inv.subTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#495057' }}>
                      {(inv.taxPercentage ?? 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#495057', fontFamily: 'monospace' }}>
                      {currencySymbol}{(inv.taxAmount ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#262626', fontFamily: 'monospace', fontWeight: 600 }}>
                      {currencySymbol}{inv.invoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        <Tooltip title="Edit Invoice" arrow>
                          <IconButton size="small" onClick={() => navigate(`/invoice/editor?invoiceID=${inv.invoiceID}`)} style={{ color: '#6c757d' }}>
                            <EditIcon style={{ fontSize: '18px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Print / PDF" arrow>
                          <IconButton size="small" onClick={() => navigate(`/invoice/print/${inv.invoiceID}`)} style={{ color: '#6c757d' }}>
                            <PrintIcon style={{ fontSize: '18px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete" arrow>
                          <IconButton size="small" onClick={() => onDeleteTrigger(inv)} style={{ color: '#6c757d' }}>
                            <DeleteIcon style={{ fontSize: '18px' }} />
                          </IconButton>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {}
          <div className="mobile-cards-container">
            {paginatedInvoices.map((inv) => (
              <div key={inv.invoiceID} style={{
                borderBottom: '1px solid #f1f3f5',
                padding: '16px',
                backgroundColor: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#262626' }}>
                    {formatInvoiceNo(inv.invoiceNo)}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6c757d' }}>
                    {formatDate(inv.invoiceDate)}
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                  <span style={{ color: '#495057' }}>{inv.customerName}</span>
                  <span style={{ color: '#6c757d' }}>{inv.itemsCount || 0} items</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#262626', fontFamily: 'monospace' }}>
                    {currencySymbol}{inv.invoiceAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>

                  <div style={{ display: 'flex', gap: '4px' }}>
                    <IconButton size="small" onClick={() => navigate(`/invoice/editor?invoiceID=${inv.invoiceID}`)} style={{ color: '#6c757d' }}>
                      <EditIcon style={{ fontSize: '16px' }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => navigate(`/invoice/print/${inv.invoiceID}`)} style={{ color: '#6c757d' }}>
                      <PrintIcon style={{ fontSize: '16px' }} />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDeleteTrigger(inv)} style={{ color: '#6c757d' }}>
                      <DeleteIcon style={{ fontSize: '16px' }} />
                    </IconButton>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderTop: '1px solid #e9ecef',
            backgroundColor: '#ffffff',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#6c757d' }}>
              <span>Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
                style={{
                  padding: '4px 24px 4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #d0d5dd',
                  outline: 'none',
                  backgroundColor: '#ffffff',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '13px', color: '#6c757d' }}>
                {(currentPage - 1) * rowsPerPage + 1}-{Math.min(currentPage * rowsPerPage, invoices.length)} of {invoices.length}
              </span>
              
              <div style={{ display: 'flex', gap: '4px' }}>
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentPage === 1 ? '#adb5bd' : '#262626',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    padding: '4px 8px',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  &lt;
                </button>
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: currentPage === totalPages ? '#adb5bd' : '#262626',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    padding: '4px 8px',
                    fontSize: '16px',
                    fontWeight: 600
                  }}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
