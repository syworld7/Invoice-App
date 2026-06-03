import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useInvoicesApi } from '../../hooks/useInvoicesApi';
import { formatParamDate } from '../../services/api';
import { MainLayout } from '../../components/MainLayout';
import { MetricCard } from '../../components/invoice/MetricCard';
import { TrendChart } from '../../components/invoice/TrendChart';
import { TopProductsChart } from '../../components/invoice/TopProductsChart';
import { InvoiceGridTable } from '../../components/invoice/InvoiceGridTable';
import { 
  Search as SearchIcon, 
  Add as AddIcon, 
  FileDownload as ExportIcon, 
  Error as ErrorIcon,
  TrendingUp as TrendIcon,
  PieChart as PieIcon
} from '@mui/icons-material';
import { 
  CircularProgress
} from '@mui/material';
import type { Invoice, TrendItem, TopItem } from '../../types';
import { DeleteConfirmDialog } from '../../components/common/DeleteConfirm/DeleteConfirmDialog';
import { useToast } from '../../context/ToastContext';
import './InvoiceList.css';

export const InvoiceList: React.FC = () => {
  const { company } = useAuth();
  const { showToast } = useToast();
  const currencySymbol = company?.currencySymbol || '₹';
  const navigate = useNavigate();
  const { 
    loading: loadingList, 
    getInvoicesList, 
    deleteInvoice, 
    getMetrics, 
    getTopItems, 
    getTrend12m 
  } = useInvoicesApi();

  
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [error, setError] = useState<string | null>(null);

  
  const [searchQuery, setSearchQuery] = useState('');

  
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [filterType, setFilterType] = useState<'Today' | 'Week' | 'Month' | 'Year' | 'Custom'>(() => {
    const saved = sessionStorage.getItem('dashboard_filter_type');
    return (saved as 'Today' | 'Week' | 'Month' | 'Year' | 'Custom') || 'Month';
  });

  
  const getInitialDatesForFilter = (type: 'Today' | 'Week' | 'Month' | 'Year' | 'Custom') => {
    const today = new Date();
    let from = today;
    let to = today;

    if (type === 'Today') {
      from = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      to = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    } else if (type === 'Week') {
      const day = today.getDay();
      const diff = today.getDate() - day;
      from = new Date(today.getFullYear(), today.getMonth(), diff);
      to = new Date(today.getFullYear(), today.getMonth(), diff + 6);
    } else if (type === 'Month') {
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    } else if (type === 'Year') {
      from = new Date(today.getFullYear(), 0, 1);
      to = new Date(today.getFullYear(), 11, 31);
    } else {
      
      const savedFrom = sessionStorage.getItem('dashboard_custom_from');
      const savedTo = sessionStorage.getItem('dashboard_custom_to');
      if (savedFrom && savedTo) {
        return { from: new Date(savedFrom), to: new Date(savedTo) };
      }
      from = new Date(today.getFullYear(), today.getMonth(), 1);
      to = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    }
    return { from, to };
  };

  const [fromDateStr, setFromDateStr] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_filter_type') as 'Today' | 'Week' | 'Month' | 'Year' | 'Custom' || 'Month';
    const dates = getInitialDatesForFilter(saved);
    return formatParamDate(dates.from);
  });

  const [toDateStr, setToDateStr] = useState(() => {
    const saved = sessionStorage.getItem('dashboard_filter_type') as 'Today' | 'Week' | 'Month' | 'Year' | 'Custom' || 'Month';
    const dates = getInitialDatesForFilter(saved);
    return formatParamDate(dates.to);
  });

  
  const [stats, setStats] = useState({ count: 0, sum: 0 });
  const [trendData, setTrendData] = useState<TrendItem[]>([]);
  const [topItems, setTopItems] = useState<TopItem[]>([]);

  
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  
  useEffect(() => {
    if (filterType === 'Custom') return;
    const dates = getInitialDatesForFilter(filterType);
    setFromDateStr(formatParamDate(dates.from));
    setToDateStr(formatParamDate(dates.to));
  }, [filterType]);

  
  useEffect(() => {
    let active = true;

    const fetchInvoicesAndStats = async () => {
      setError(null);
      try {
        
        const data = await getInvoicesList(fromDateStr, toDateStr);
        if (!active) return;
        setInvoices(data);

        
        const met = await getMetrics(fromDateStr, toDateStr);
        if (!active) return;
        setStats({ count: met.invoiceCount, sum: met.totalAmount });

        
        const itemsData = await getTopItems(fromDateStr, toDateStr, 5);
        if (!active) return;
        setTopItems(itemsData);

        
        const trend = await getTrend12m();
        if (!active) return;
        setTrendData(trend);
      } catch (err) {
        if (active) {
          setError('Could not retrieve dashboard lists. Checking connection.');
        }
      }
    };

    fetchInvoicesAndStats();

    return () => {
      active = false;
    };
  }, [fromDateStr, toDateStr]);

  
  const filteredInvoices = invoices.filter(inv => {
    const query = searchQuery.toLowerCase().trim();
    return (
      (inv.invoiceNo ?? '').toString().toLowerCase().includes(query) ||
      (inv.customerName ?? '').toLowerCase().includes(query) ||
      (inv.invoiceAmount ?? '').toString().includes(query)
    );
  });

  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);

    const sorted = [...invoices].sort((a: any, b: any) => {
      const valA = typeof a[field] === 'string' ? a[field].toLowerCase() : a[field];
      const valB = typeof b[field] === 'string' ? b[field].toLowerCase() : b[field];

      if (valA < valB) return isAsc ? 1 : -1;
      if (valA > valB) return isAsc ? -1 : 1;
      return 0;
    });
    setInvoices(sorted);
  };

  
  const triggerDelete = (inv: Invoice) => {
    setDeletingInvoice(inv);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingInvoice) return;
    setIsDeleting(true);
    try {
      await deleteInvoice(deletingInvoice.invoiceID);
      setInvoices(prev => prev.filter(i => i.invoiceID !== deletingInvoice.invoiceID));
      setDeleteDialogOpen(false);
      setDeletingInvoice(null);
      showToast('Invoice deleted successfully.', 'success');
      
      const met = await getMetrics(fromDateStr, toDateStr);
      setStats({ count: met.invoiceCount, sum: met.totalAmount });
    } catch (err) {
      showToast('Failed to delete invoice.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  
  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) return;

    const headers = ['InvoiceNo', 'InvoiceDate', 'CustomerName', 'SubTotal', 'TaxAmount', 'BilledTotal'];
    const csvRows = [
      headers.join(','),
      ...filteredInvoices.map(inv => [
        inv.invoiceNo,
        inv.invoiceDate,
        `"${inv.customerName.replace(/"/g, '""')}"`,
        inv.subTotal.toFixed(2),
        inv.taxAmount.toFixed(2),
        inv.invoiceAmount.toFixed(2)
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Invoices_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainLayout>
      {}
      <div className="invoice-list-container">
        {}
        <div className="invoice-list-header">
          <h1 className="invoice-list-title">
            Invoices
          </h1>

          {}
          <div className="invoice-list-presets">
            {(['Today', 'Week', 'Month', 'Year', 'Custom'] as const).map((type) => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  sessionStorage.setItem('dashboard_filter_type', type);
                }}
                className={`invoice-list-preset-btn ${filterType === type ? 'active' : ''}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {}
        {error && (
          <div className="invoice-list-alert-error">
            <div className="invoice-list-error-info">
              <ErrorIcon fontSize="small" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError(null)} className="invoice-list-error-close">×</button>
          </div>
        )}

        {}
        <div className="invoice-list-widgets-section">
          <div className="dashboard-widgets-grid">
            <MetricCard
              title="Total Invoices"
              value={stats.count}
              subtitle="Number of Invoices"
              icon={<PieIcon fontSize="small" />}
              filterLabel={
                filterType === 'Today' ? 'Today' :
                filterType === 'Week' ? 'This Week' :
                filterType === 'Month' ? 'This Month' :
                filterType === 'Year' ? 'This Year' : 'Custom'
              }
            />
            <MetricCard
              title="Gross Revenue"
              value={`${currencySymbol}${stats.sum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subtitle="Total Invoice Amount"
              icon={<TrendIcon fontSize="small" />}
              filterLabel={
                filterType === 'Today' ? 'Today' :
                filterType === 'Week' ? 'This Week' :
                filterType === 'Month' ? 'This Month' :
                filterType === 'Year' ? 'This Year' : 'Custom'
              }
            />
            <TrendChart trendData={trendData} currencySymbol={currencySymbol} />
            <TopProductsChart topItems={topItems} currencySymbol={currencySymbol} />
          </div>

          {}
          {filterType === 'Custom' && (
            <div className="invoice-list-custom-range">
              <div>
                <label className="invoice-list-custom-label">From Date</label>
                <input
                  type="date"
                  className="custom-input-field invoice-list-custom-input"
                  value={fromDateStr}
                  onChange={(e) => {
                    setFromDateStr(e.target.value);
                    sessionStorage.setItem('dashboard_custom_from', e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
              <div>
                <label className="invoice-list-custom-label">To Date</label>
                <input
                  type="date"
                  className="custom-input-field invoice-list-custom-input"
                  value={toDateStr}
                  onChange={(e) => {
                    setToDateStr(e.target.value);
                    sessionStorage.setItem('dashboard_custom_to', e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {}
        <div className="invoice-list-search-actions">
          {}
          <div className="invoice-list-search-wrapper">
            <SearchIcon className="invoice-list-search-icon" />
            <input
              type="text"
              className="custom-input-field invoice-list-search-input"
              placeholder="Search Invoice No, Customer..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>

          {}
          <div className="invoice-list-actions">
            <button
              type="button"
              onClick={() => navigate('/invoice/editor')}
              className="invoice-list-new-btn"
            >
              <AddIcon style={{ fontSize: '16px' }} /> New Invoice
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              disabled={filteredInvoices.length === 0}
              className="invoice-list-export-btn"
            >
              <ExportIcon style={{ fontSize: '16px' }} /> Export
            </button>
          </div>
        </div>

        {}
        {loadingList ? (
          <div className="invoice-list-loader-container">
            <CircularProgress size={36} style={{ color: '#262626' }} />
          </div>
        ) : (
          <InvoiceGridTable
            invoices={filteredInvoices}
            currencySymbol={currencySymbol}
            onDeleteTrigger={triggerDelete}
            currentPage={currentPage}
            rowsPerPage={rowsPerPage}
            onPageChange={setCurrentPage}
            onRowsPerPageChange={setRowsPerPage}
            sortField={sortField}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        )}
      </div>

      {}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Invoice permanently?"
        isDeleting={isDeleting}
      />
    </MainLayout>
  );
};
