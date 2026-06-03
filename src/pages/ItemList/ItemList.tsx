import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useItemsApi } from '../../hooks/useItemsApi';
import { MainLayout } from '../../components/MainLayout';
import { ItemEditorModal } from '../ItemEditorModal/ItemEditorModal';
import {
  Search as SearchIcon,
  Add as AddIcon,
  FileDownload as ExportIcon,
  ViewColumn as ColumnIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Error as ErrorIcon,
  Close as CloseIcon,
  Image as ImageIcon
} from '@mui/icons-material';
import {
  CircularProgress,
  IconButton,
  Tooltip,
  Menu,
  Checkbox as MuiCheckbox,
  FormControlLabel
} from '@mui/material';
import type { Item } from '../../types';
import { DeleteConfirmDialog } from '../../components/common/DeleteConfirm/DeleteConfirmDialog';
import { useToast } from '../../context/ToastContext';
import './ItemList.css';

export const ItemList: React.FC = () => {
  const { company } = useAuth();
  const { showToast } = useToast();
  const currencySymbol = company?.currencySymbol || '₹';
  const { loading, getItemsList, deleteItem } = useItemsApi();

  const [items, setItems] = useState<Item[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    picture: true,
    name: true,
    description: true,
    rate: true,
    discount: true,
    actions: true
  });
  const [columnMenuAnchor, setColumnMenuAnchor] = useState<null | HTMLElement>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedItemID, setSelectedItemID] = useState<number | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setError(null);
    try {
      const data = await getItemsList();
      setItems(data);
    } catch (err) {
      setError('Could not retrieve items catalog. Please check your network connection.');
    }
  };

  const filteredItems = items.filter(item => {
    const query = searchQuery.toLowerCase().trim();
    return (
      item.itemName.toLowerCase().includes(query) ||
      (item.description && item.description.toLowerCase().includes(query))
    );
  });

  const totalPages = Math.ceil(filteredItems.length / rowsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSort = (field: string) => {
    const isAsc = sortField === field && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortField(field);
    const sorted = [...items].sort((a: any, b: any) => {
      const valA = typeof a[field] === 'string' ? a[field].toLowerCase() : a[field];
      const valB = typeof b[field] === 'string' ? b[field].toLowerCase() : b[field];
      if (valA < valB) return isAsc ? 1 : -1;
      if (valA > valB) return isAsc ? -1 : 1;
      return 0;
    });
    setItems(sorted);
  };

  const SortIcon = ({ field }: { field: string }) => (
    <span
      className="item-list-th-sort-icon"
      style={{ color: sortField === field ? '#262626' : '#adb5bd' }}
    >
      {sortField === field ? (sortDirection === 'asc' ? '↑' : '↓') : '⇅'}
    </span>
  );

  const handleExportCSV = () => {
    if (filteredItems.length === 0) return;
    const headers = ['ItemID', 'ItemName', 'Description', 'SalesRate', 'DiscountPct'];
    const csvRows = [
      headers.join(','),
      ...filteredItems.map(item => [
        item.itemID,
        `"${item.itemName.replace(/"/g, '""')}"`,
        `"${(item.description || '').replace(/"/g, '""')}"`,
        item.salesRate.toFixed(2),
        item.discountPct.toFixed(2)
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Items_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenEditor = (id: number | null = null) => {
    setSelectedItemID(id);
    setEditorOpen(true);
  };

  const handleEditorSuccess = async () => {
    fetchCatalog();
  };

  const triggerDelete = (item: Item) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingItem) return;
    setIsDeleting(true);
    try {
      await deleteItem(deletingItem.itemID);
      setItems(prev => prev.filter(i => i.itemID !== deletingItem.itemID));
      setDeleteDialogOpen(false);
      setDeletingItem(null);
      showToast('Item deleted successfully.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete item.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleColumn = (col: string) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  return (
    <MainLayout>
      {}
      <div className="item-list-container">

        {}
        <div className="item-list-header">
          <h1 className="item-list-title">Items</h1>
          <p className="item-list-subtitle">Manage your product and service catalog.</p>
        </div>
        {}
        <div className="item-list-divider" />

        {}
        <div className="item-list-search-actions-row">
          {}
          <div className="item-list-search-wrapper">
            <SearchIcon className="item-list-search-icon" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="item-list-search-input"
            />
          </div>

          {}
          <div className="item-list-actions">

            {}
            <button
              onClick={() => handleOpenEditor(null)}
              className="item-list-add-btn"
            >
              <AddIcon style={{ fontSize: '16px' }} />
              + Add New Item
            </button>

            {}
            <button
              onClick={handleExportCSV}
              disabled={filteredItems.length === 0}
              className="item-list-export-btn"
            >
              <ExportIcon style={{ fontSize: '16px' }} />
              Export
            </button>

            {}
            <button
              id="column-chooser-btn"
              onClick={() => setColumnMenuAnchor(document.getElementById('column-chooser-btn'))}
              title="Manage columns"
              className="item-list-columns-btn"
            >
              <ColumnIcon style={{ fontSize: '18px' }} />
            </button>

          </div>
        </div>
        {}
        <div className="item-list-divider" />

        {}
        <Menu
          anchorEl={columnMenuAnchor}
          open={Boolean(columnMenuAnchor)}
          onClose={() => setColumnMenuAnchor(null)}
        >
          <div className="item-list-column-chooser-menu">
            <span className="item-list-column-chooser-title">Visible Columns</span>
            <FormControlLabel control={<MuiCheckbox checked={visibleColumns.picture} onChange={() => toggleColumn('picture')} size="small" />} label="Picture" />
            <FormControlLabel control={<MuiCheckbox checked={visibleColumns.name} onChange={() => toggleColumn('name')} size="small" disabled />} label="Item Name" disabled />
            <FormControlLabel control={<MuiCheckbox checked={visibleColumns.description} onChange={() => toggleColumn('description')} size="small" />} label="Description" />
            <FormControlLabel control={<MuiCheckbox checked={visibleColumns.rate} onChange={() => toggleColumn('rate')} size="small" />} label="Sale Rate" />
            <FormControlLabel control={<MuiCheckbox checked={visibleColumns.discount} onChange={() => toggleColumn('discount')} size="small" />} label="Discount %" />
          </div>
        </Menu>

        {}
        {error && (
          <div className="item-list-alert-error">
            <div className="item-list-error-info">
              <ErrorIcon fontSize="small" />
              <span>{error}</span>
            </div>
            <IconButton size="small" onClick={() => setError(null)} style={{ color: '#dc3545' }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </div>
        )}

        {loading ? (
          <div className="item-list-loader-container">
            <CircularProgress size={36} style={{ color: '#262626' }} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="item-list-empty-state">
            <span className="item-list-empty-icon">📦</span>
            <span className="item-list-empty-text">
              {searchQuery ? 'No items matched your search.' : 'Your product catalog is empty.'}
            </span>
            {!searchQuery && (
              <button
                onClick={() => handleOpenEditor(null)}
                className="item-list-empty-create-btn"
              >
                <AddIcon style={{ fontSize: '14px', marginRight: '6px' }} />
                Create Your First Item
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="item-list-table-wrapper">
              <table className="item-list-table">
                <thead>
                  <tr className="item-list-table-header-row">
                    {visibleColumns.picture && (
                      <th className="item-list-th" style={{ width: '80px' }}>Picture</th>
                    )}
                    {visibleColumns.name && (
                      <th className="item-list-th sortable" onClick={() => handleSort('itemName')}>
                        Item Name <SortIcon field="itemName" />
                      </th>
                    )}
                    {visibleColumns.description && (
                      <th className="item-list-th sortable" onClick={() => handleSort('description')}>
                        Description <SortIcon field="description" />
                      </th>
                    )}
                    {visibleColumns.rate && (
                      <th className="item-list-th sortable" style={{ textAlign: 'right', width: '140px' }} onClick={() => handleSort('salesRate')}>
                        Sale Rate <SortIcon field="salesRate" />
                      </th>
                    )}
                    {visibleColumns.discount && (
                      <th className="item-list-th sortable" style={{ textAlign: 'right', width: '130px' }} onClick={() => handleSort('discountPct')}>
                        Discount % <SortIcon field="discountPct" />
                      </th>
                    )}
                    {visibleColumns.actions && (
                      <th className="item-list-th" style={{ textAlign: 'right', width: '100px' }}>Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {paginatedItems.map((item) => (
                    <tr
                      key={item.itemID}
                      className="item-list-table-row"
                    >
                      {}
                      {visibleColumns.picture && (
                        <td className="item-list-td">
                          <div className="item-list-pic-cell-box">
                            {item.pictureUrl ? (
                              <img src={item.pictureUrl} alt={item.itemName} className="item-list-pic-img" />
                            ) : (
                              <ImageIcon className="item-list-pic-placeholder" />
                            )}
                          </div>
                        </td>
                      )}

                      {}
                      {visibleColumns.name && (
                        <td className="item-list-td" style={{ fontWeight: 400 }}>
                          {item.itemName}
                        </td>
                      )}

                      {}
                      {visibleColumns.description && (
                        <td className="item-list-td" style={{ color: '#6c757d', maxWidth: '300px' }}>
                          {item.description || (
                            <span style={{ color: '#ced4da', fontStyle: 'italic' }}>No description</span>
                          )}
                        </td>
                      )}

                      {}
                      {visibleColumns.rate && (
                        <td className="item-list-td" style={{ textAlign: 'right', fontWeight: 400 }}>
                          {currencySymbol}{item.salesRate.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      )}

                      {}
                      {visibleColumns.discount && (
                        <td className="item-list-td" style={{ textAlign: 'right' }}>
                          {item.discountPct.toFixed(2)}%
                        </td>
                      )}

                      {}
                      {visibleColumns.actions && (
                        <td className="item-list-td" style={{ textAlign: 'right' }}>
                          <div className="item-list-action-btns-cell">
                            <Tooltip title="Edit Item" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEditor(item.itemID)}
                                className="item-list-action-btn"
                              >
                                <EditIcon style={{ fontSize: '16px' }} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Item" arrow>
                              <IconButton
                                size="small"
                                onClick={() => triggerDelete(item)}
                                className="item-list-action-btn"
                              >
                                <DeleteIcon style={{ fontSize: '16px' }} />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {}
            <div className="item-list-pagination">
              {}
              <div className="item-list-pagination-rows-select">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  className="item-list-pagination-select-element"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>

              {}
              <div className="item-list-pagination-controls">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="item-list-pagination-arrow-btn"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pg = i + 1;
                  if (totalPages > 6 && Math.abs(currentPage - pg) > 1 && pg !== 1 && pg !== totalPages) {
                    if (pg === 2 || pg === totalPages - 1) {
                      return <span key={pg} style={{ padding: '0 4px', color: '#adb5bd', fontSize: '13px' }}>…</span>;
                    }
                    return null;
                  }
                  return (
                    <button
                      key={pg}
                      onClick={() => setCurrentPage(pg)}
                      className={`item-list-pagination-page-btn ${currentPage === pg ? 'active' : ''}`}
                    >
                      {pg}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="item-list-pagination-arrow-btn"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {}
      <ItemEditorModal
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        onSaveSuccess={handleEditorSuccess}
        editItemID={selectedItemID}
      />

      {}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Catalog Item?"
        isDeleting={isDeleting}
      />
    </MainLayout>
  );
};
