import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useItemsApi } from '../../hooks/useItemsApi';
import { useInvoicesApi } from '../../hooks/useInvoicesApi';
import { MainLayout } from '../../components/MainLayout';
import { 
  InvoiceHeaderFields 
} from '../../components/invoice/InvoiceHeaderFields';
import { 
  LineItemsTable 
} from '../../components/invoice/LineItemsTable';
import { 
  InvoiceTotalsPanel 
} from '../../components/invoice/InvoiceTotalsPanel';
import { 
  Error as ErrorIcon 
} from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import type { InvoiceLine, LookupItem } from '../../types';
import { useToast } from '../../context/ToastContext';
import './InvoiceEditor.css';

export const InvoiceEditor: React.FC = () => {
  const { company } = useAuth();
  const { showToast } = useToast();
  const currencySymbol = company?.currencySymbol || '₹';
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editInvoiceID = searchParams.get('invoiceID');

  const { getLookupList, getItemDetails } = useItemsApi();
  const { 
    loading: loadingDetails, 
    getInvoiceDetails, 
    saveInvoice, 
    getInvoicesList 
  } = useInvoicesApi();

  const [itemsCatalog, setItemsCatalog] = useState<LookupItem[]>([]);
  const [invoiceNo, setInvoiceNo] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [notes, setNotes] = useState('');
  const [taxPercentage, setTaxPercentage] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [lines, setLines] = useState<InvoiceLine[]>([
    { rowNo: 1, itemID: '', description: '', quantity: 1, rate: 0, discountPct: 0, amount: 0 }
  ]);
  const [updatedOn, setUpdatedOn] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [customerTouched, setCustomerTouched] = useState(false);

  useEffect(() => {
    fetchLookupCatalog();
    if (editInvoiceID) {
      fetchInvoice(Number(editInvoiceID));
    } else {
      fetchNextInvoiceNo();
    }
  }, [editInvoiceID]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSaveInvoice();
      }
      if (e.altKey && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleAddLine();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lines, invoiceNo, invoiceDate, customerName, address, city, taxPercentage, taxAmount, updatedOn]);

  const fetchLookupCatalog = async () => {
    try {
      const data = await getLookupList();
      setItemsCatalog(data);
    } catch (err) {
      console.error('Failed to load lookup items:', err);
    }
  };

  const fetchNextInvoiceNo = async () => {
    try {
      const invoices = await getInvoicesList('1970-01-01', '2100-01-01');
      if (invoices.length > 0) {
        const maxNo = Math.max(...invoices.map((inv: any) => inv.invoiceNo || 0));
        setInvoiceNo((maxNo + 1).toString());
      } else {
        setInvoiceNo('1');
      }
    } catch (err) {
      setInvoiceNo('1');
    }
  };

  const calculateRowAmount = (qty: number, rate: number, discount: number): number => {
    const q = isNaN(qty) ? 0 : qty;
    const r = isNaN(rate) ? 0 : rate;
    const d = isNaN(discount) ? 0 : discount;
    const rawTotal = q * r;
    const discounted = rawTotal - (rawTotal * (d / 100));
    return isNaN(discounted) ? 0 : Number(discounted.toFixed(2));
  };

  const fetchInvoice = async (id: number) => {
    try {
      const data = await getInvoiceDetails(id);
      
      setInvoiceNo(data.invoiceNo ? data.invoiceNo.toString() : '');
      setInvoiceDate(data.invoiceDate ? data.invoiceDate.split('T')[0] : '');
      setCustomerName(data.customerName || '');
      setAddress(data.address || '');
      setCity(data.city || '');
      setNotes(data.notes || '');
      setTaxPercentage(data.taxPercentage !== undefined ? data.taxPercentage : 0);
      setTaxAmount(data.taxAmount !== undefined ? data.taxAmount : 0);
      setUpdatedOn(data.updatedOn || null);

      if (data.lines && data.lines.length > 0) {
        const formattedLines = data.lines.map((line: any) => {
          const qty = line.quantity || 0;
          const rate = line.rate || 0;
          const discount = line.discountPct || 0;
          return {
            rowNo: line.rowNo,
            itemID: line.itemID,
            description: line.description || '',
            quantity: qty,
            rate: rate,
            discountPct: discount,
            amount: calculateRowAmount(qty, rate, discount)
          };
        });
        setLines(formattedLines);
      } else {
        setLines([{ rowNo: 1, itemID: '', description: '', quantity: 1, rate: 0, discountPct: 0, amount: 0 }]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load invoice details.');
    }
  };

  const subTotal = Number((lines.reduce((acc, cur) => acc + (isNaN(cur.amount) ? 0 : cur.amount), 0) || 0).toFixed(2));
  const cleanTaxAmount = isNaN(taxAmount) ? 0 : taxAmount;
  const invoiceAmount = Number((subTotal + cleanTaxAmount).toFixed(2));

  const handleLineChange = (index: number, fieldOrUpdates: any, value?: any) => {
    setLines(prevLines => {
      const updated = [...prevLines];
      const target = { ...updated[index] };
      
      if (typeof fieldOrUpdates === 'string') {
        (target as any)[fieldOrUpdates] = value;
      } else {
        Object.assign(target, fieldOrUpdates);
      }

      target.amount = calculateRowAmount(
        Number(target.quantity),
        Number(target.rate),
        Number(target.discountPct)
      );
      
      updated[index] = target as InvoiceLine;
      return updated;
    });
  };

  const handleItemSelect = async (index: number, selectedItemID: number | '') => {
    if (selectedItemID === '') {
      handleLineChange(index, {
        itemID: '',
        description: '',
        rate: 0,
        discountPct: 0
      });
      return;
    }

    handleLineChange(index, { itemID: selectedItemID });

    try {
      const details = await getItemDetails(Number(selectedItemID));
      handleLineChange(index, {
        description: details.itemName || '',
        rate: details.salesRate || 0,
        discountPct: details.discountPct || 0
      });
    } catch (err) {
      console.error('Failed to fetch catalog item details:', err);
    }
  };

  const handleTaxPercentageChange = (pct: number) => {
    const p = isNaN(pct) ? 0 : pct;
    setTaxPercentage(p);
    if (subTotal > 0) {
      setTaxAmount(Number(((subTotal * p) / 100).toFixed(2)));
    } else {
      setTaxAmount(0);
    }
  };

  const handleTaxAmountChange = (amt: number) => {
    const a = isNaN(amt) ? 0 : amt;
    setTaxAmount(a);
    if (subTotal > 0) {
      setTaxPercentage(Number(((a * 100) / subTotal).toFixed(2)));
    } else {
      setTaxPercentage(0);
    }
  };

  useEffect(() => {
    if (subTotal > 0) {
      const p = isNaN(taxPercentage) ? 0 : taxPercentage;
      setTaxAmount(Number(((subTotal * p) / 100).toFixed(2)));
    } else {
      setTaxAmount(0);
      setTaxPercentage(0);
    }
  }, [subTotal]);

  const handleAddLine = () => {
    const nextRowNo = lines.length > 0 ? Math.max(...lines.map(l => l.rowNo)) + 1 : 1;
    setLines([
      ...lines,
      { rowNo: nextRowNo, itemID: '', description: '', quantity: 1, rate: 0, discountPct: 0, amount: 0 }
    ]);
  };

  const handleCopyLine = (index: number) => {
    const target = lines[index];
    const nextRowNo = lines.length > 0 ? Math.max(...lines.map(l => l.rowNo)) + 1 : 1;
    setLines([...lines, { ...target, rowNo: nextRowNo }]);
  };

  const handleDeleteLine = (index: number) => {
    if (lines.length === 1) {
      setLines([{ rowNo: 1, itemID: '', description: '', quantity: 1, rate: 0, discountPct: 0, amount: 0 }]);
      return;
    }
    setLines(prev => prev.filter((_, i) => i !== index).map((l, i) => ({ ...l, rowNo: i + 1 })));
  };

  const hasValidLineItems = lines.some(line => line.itemID !== '' && line.quantity > 0);
  const isFormValid = invoiceNo && customerName.trim() && invoiceDate && hasValidLineItems;

  const handleSaveInvoice = async () => {
    setCustomerTouched(true);

    if (!isFormValid) {
      if (!hasValidLineItems) {
        setErrorMsg('Please add at least one line item with a selected product and Quantity greater than 0.');
      } else {
        setErrorMsg('Please resolve all highlighted form warnings.');
      }
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const isEdit = !!editInvoiceID;

    const linesPayload = lines
      .filter(line => line.itemID !== '')
      .map(line => ({
        rowNo: line.rowNo,
        itemID: Number(line.itemID),
        description: line.description.trim(),
        quantity: Number(line.quantity),
        rate: Number(line.rate),
        discountPct: Number(line.discountPct)
      }));

    const invoicePayload = {
      invoiceNo: Number(invoiceNo),
      invoiceDate: invoiceDate,
      customerName: customerName.trim(),
      address: address.trim(),
      city: city.trim(),
      notes: notes.trim(),
      taxPercentage: Number(taxPercentage),
      taxAmount: Number(taxAmount),
      subTotal: Number(subTotal),
      invoiceAmount: Number(invoiceAmount),
      lines: linesPayload
    };

    try {
      await saveInvoice(
        isEdit ? { ...invoicePayload, invoiceID: Number(editInvoiceID) } : invoicePayload,
        isEdit,
        updatedOn
      );
      showToast(isEdit ? 'Invoice updated successfully.' : 'Invoice created successfully.', 'success');
      navigate('/invoices');
    } catch (err: any) {
      showToast(err.message || 'Failed to save invoice.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const pageTitle = editInvoiceID ? `Edit Invoice #${invoiceNo}` : 'New Invoice';

  return (
    <MainLayout>
      {errorMsg && (
        <div className="editor-alert-error" role="alert">
          <ErrorIcon fontSize="small" style={{ marginTop: '1px', flexShrink: 0 }} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loadingDetails ? (
        <div className="editor-loader-container">
          <CircularProgress size={40} style={{ color: '#262626' }} />
        </div>
      ) : (
        <div className="editor-main-container">
          <div className="editor-header-card">
            <div>
              <h1 className="editor-title">
                {pageTitle}
              </h1>
            </div>

            <div className="editor-header-actions">
              <button
                type="button"
                onClick={() => navigate('/invoices')}
                disabled={isSaving}
                className="editor-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveInvoice}
                disabled={isSaving || !isFormValid}
                className="editor-save-btn"
                style={{
                  background: isSaving || !isFormValid ? '#6c757d' : '#262626',
                  cursor: isSaving || !isFormValid ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? <CircularProgress size={14} style={{ color: '#ffffff' }} /> : null}
                Save
              </button>
            </div>
          </div>

          <div className="editor-details-card">
            <InvoiceHeaderFields
              invoiceNo={invoiceNo}
              setInvoiceNo={setInvoiceNo}
              invoiceDate={invoiceDate}
              setInvoiceDate={setInvoiceDate}
              customerName={customerName}
              setCustomerName={setCustomerName}
              address={address}
              setAddress={setAddress}
              city={city}
              setCity={setCity}
              notes={notes}
              setNotes={setNotes}
              customerTouched={customerTouched}
              setCustomerTouched={setCustomerTouched}
              disabled={isSaving}
            />
          </div>

          <div className="editor-lines-card">
            <LineItemsTable
              lines={lines}
              lookups={itemsCatalog}
              currencySymbol={currencySymbol}
              onLineChange={handleLineChange}
              onItemSelect={handleItemSelect}
              onAddLine={handleAddLine}
              onCopyLine={handleCopyLine}
              onDeleteLine={handleDeleteLine}
              disabled={isSaving}
            />
          </div>
          <div className="editor-totals-card">
            <InvoiceTotalsPanel
              subTotal={subTotal}
              taxPercentage={taxPercentage}
              taxAmount={taxAmount}
              invoiceAmount={invoiceAmount}
              currencySymbol={currencySymbol}
              onTaxPctChange={handleTaxPercentageChange}
              onTaxAmtChange={handleTaxAmountChange}
              disabled={isSaving}
            />
          </div>
        </div>
      )}
    </MainLayout>
  );
};
