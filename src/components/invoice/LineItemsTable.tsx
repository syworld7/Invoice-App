import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { 
  Add as AddIcon, 
  Delete as DeleteIcon, 
  ContentCopy as CopyIcon 
} from '@mui/icons-material';
import { Select } from '../common/Select/Select';
import { Input } from '../common/Input/Input';
import { Button } from '../common/Button/Button';
import type { InvoiceLine, LookupItem } from '../../types';

interface LineItemsTableProps {
  lines: InvoiceLine[];
  lookups: LookupItem[];
  currencySymbol: string;
  onLineChange: (index: number, fieldOrUpdates: any, val?: any) => void;
  onItemSelect: (index: number, selectedItemID: number | '') => void;
  onAddLine: () => void;
  onCopyLine: (index: number) => void;
  onDeleteLine: (index: number) => void;
  disabled?: boolean;
}

export const LineItemsTable: React.FC<LineItemsTableProps> = ({
  lines,
  lookups,
  currencySymbol,
  onLineChange,
  onItemSelect,
  onAddLine,
  onCopyLine,
  onDeleteLine,
  disabled = false
}) => {
  
  const lookupOptions = [
    { value: '', label: '-- Select Item --' },
    ...lookups.map(l => ({ value: l.itemID, label: l.itemName }))
  ];

  
  const handleItemSelect = (index: number, selectedItemID: number | '') => {
    onItemSelect(index, selectedItemID);
  };

  const formatAmount = (amount: number) => {
    const num = isNaN(amount) ? 0 : amount;
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div style={{ padding: '20px 24px' }}>
      {}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: 600, color: '#6c757d', margin: 0, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Line Items
        </h2>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={onAddLine}
            disabled={disabled}
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '6px 12px', fontSize: '12px', fontWeight: 500,
              border: '1px solid #d0d5dd', borderRadius: '4px',
              background: '#fff', color: '#262626', cursor: 'pointer',
              fontFamily: 'var(--font-sans)'
            }}
          >
            <AddIcon style={{ fontSize: '14px' }} /> Add Row
          </button>
        </div>
      </div>

      {lines.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100px', gap: '8px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>No items added yet.</span>
        </div>
      ) : (
        <>
          {}
          <div className="desktop-table-container">
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e9ecef' }}>
                  <th style={{ padding: '8px 8px', fontWeight: 600, color: '#6c757d', width: '40px' }}>S.No</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600, color: '#6c757d', width: '180px' }}>Item *</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600, color: '#6c757d' }}>Description</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600, color: '#6c757d', width: '80px', textAlign: 'right' }}>Qty *</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600, color: '#6c757d', width: '90px', textAlign: 'right' }}>Rate *</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600, color: '#6c757d', width: '80px', textAlign: 'right' }}>Disc %</th>
                  <th style={{ padding: '8px 8px', fontWeight: 600, color: '#6c757d', width: '100px', textAlign: 'right' }}>Amount</th>
                  <th style={{ padding: '8px 8px', width: '70px' }}></th>
                </tr>
              </thead>
              <tbody>
                {lines.map((line, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f3f5' }}>
                    {}
                    <td style={{ padding: '8px 8px', color: '#6c757d', fontSize: '13px' }}>{idx + 1}</td>

                    {}
                    <td style={{ padding: '4px 8px' }}>
                      <Select
                        options={lookupOptions}
                        value={line.itemID}
                        onChange={(e) => handleItemSelect(idx, e.target.value === '' ? '' : Number(e.target.value))}
                        disabled={disabled}
                        style={{ height: '32px', fontSize: '13px' }}
                      />
                    </td>

                    {}
                    <td style={{ padding: '4px 8px' }}>
                      <Input
                        type="text"
                        value={line.description}
                        onChange={(e) => onLineChange(idx, 'description', e.target.value)}
                        disabled={disabled || line.itemID !== ''}
                        placeholder="Description"
                        style={{ height: '32px', fontSize: '13px' }}
                      />
                    </td>

                    {}
                    <td style={{ padding: '4px 8px' }}>
                      <Input
                        type="number"
                        numeric
                        value={line.quantity === 0 ? '' : line.quantity}
                        onChange={(e) => onLineChange(idx, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))}
                        disabled={disabled}
                        placeholder="0.00"
                        style={{ height: '32px', fontSize: '13px', textAlign: 'right' }}
                      />
                    </td>

                    {}
                    <td style={{ padding: '4px 8px' }}>
                      <Input
                        type="number"
                        numeric
                        value={line.rate === 0 ? '' : line.rate}
                        onChange={(e) => onLineChange(idx, 'rate', e.target.value === '' ? 0 : Number(e.target.value))}
                        disabled={disabled || line.itemID !== ''}
                        placeholder="0.00"
                        style={{ height: '32px', fontSize: '13px', textAlign: 'right' }}
                      />
                    </td>

                    {}
                    <td style={{ padding: '4px 8px' }}>
                      <Input
                        type="number"
                        numeric
                        value={line.discountPct === 0 ? '' : line.discountPct}
                        onChange={(e) => onLineChange(idx, 'discountPct', e.target.value === '' ? 0 : Number(e.target.value))}
                        disabled={disabled || line.itemID !== ''}
                        placeholder="0.00"
                        style={{ height: '32px', fontSize: '13px', textAlign: 'right' }}
                      />
                    </td>

                    {}
                    <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 600, fontFamily: 'monospace', fontSize: '13px', color: '#262626' }}>
                      {currencySymbol}{formatAmount(line.amount)}
                    </td>

                    {}
                    <td style={{ padding: '4px 8px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: '2px', justifyContent: 'center' }}>
                        <Tooltip title="Copy Line">
                          <IconButton size="small" onClick={() => onCopyLine(idx)} disabled={disabled} style={{ color: '#6c757d' }}>
                            <CopyIcon style={{ fontSize: '16px' }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Line">
                          <IconButton size="small" onClick={() => onDeleteLine(idx)} disabled={disabled} style={{ color: 'var(--color-danger)' }}>
                            <DeleteIcon style={{ fontSize: '16px' }} />
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
          <div className="mobile-cards-container" style={{ padding: 0 }}>
            {lines.map((line, idx) => (
              <div key={idx} className="editor-lines-mobile-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--brand-primary)' }}>Line Item #{idx + 1}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <IconButton size="small" onClick={() => onCopyLine(idx)} disabled={disabled}>
                      <CopyIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => onDeleteLine(idx)} disabled={disabled} style={{ color: 'var(--color-danger)' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </div>
                </div>

                <Select
                  label="Catalog Item"
                  options={lookupOptions}
                  value={line.itemID}
                  onChange={(e) => handleItemSelect(idx, e.target.value === '' ? '' : Number(e.target.value))}
                  disabled={disabled}
                />

                <Input
                  label="Description"
                  type="text"
                  value={line.description}
                  onChange={(e) => onLineChange(idx, 'description', e.target.value)}
                  disabled={disabled || line.itemID !== ''}
                  placeholder="Details"
                />

                <div className="editor-lines-mobile-row">
                  <Input
                    label="Qty"
                    type="number"
                    numeric
                    value={line.quantity === 0 ? '' : line.quantity}
                    onChange={(e) => onLineChange(idx, 'quantity', e.target.value === '' ? 0 : Number(e.target.value))}
                    disabled={disabled}
                  />

                  <Input
                    label="Rate"
                    type="number"
                    numeric
                    value={line.rate === 0 ? '' : line.rate}
                    onChange={(e) => onLineChange(idx, 'rate', e.target.value === '' ? 0 : Number(e.target.value))}
                    disabled={disabled || line.itemID !== ''}
                  />
                </div>

                <div className="editor-lines-mobile-row" style={{ alignItems: 'flex-end' }}>
                  <Input
                    label="Discount %"
                    type="number"
                    numeric
                    value={line.discountPct === 0 ? '' : line.discountPct}
                    onChange={(e) => onLineChange(idx, 'discountPct', e.target.value === '' ? 0 : Number(e.target.value))}
                    disabled={disabled || line.itemID !== ''}
                  />
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'right', paddingBottom: '8px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Amount</span>
                    <strong style={{ fontSize: '15px', color: 'var(--brand-primary)', fontFamily: 'monospace' }}>
                      {currencySymbol}{formatAmount(line.amount)}
                    </strong>
                  </div>
                </div>
              </div>
            ))}

            <Button variant="secondary" onClick={onAddLine} disabled={disabled} style={{ width: '100%', marginTop: '8px' }}>
              <AddIcon fontSize="small" /> Add Line Item
            </Button>
          </div>
        </>
      )}
    </div>
  );
};
