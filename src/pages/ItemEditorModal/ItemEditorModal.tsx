import React, { useState, useEffect, useRef } from 'react';
import { useItemsApi } from '../../hooks/useItemsApi';
import { Close as CloseIcon, Error as ErrorIcon, Image as ImageIcon } from '@mui/icons-material';
import { CircularProgress, Modal } from '@mui/material';
import { useToast } from '../../context/ToastContext';
import './ItemEditorModal.css';

interface ItemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveSuccess: (itemID: number) => void;
  editItemID: number | null;
}

export const ItemEditorModal: React.FC<ItemEditorModalProps> = ({
  isOpen,
  onClose,
  onSaveSuccess,
  editItemID
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    getItemDetails,
    checkDuplicateName,
    saveItem,
    uploadPicture,
    getItemPicture
  } = useItemsApi();

  const [isSubmitting, setIsSubmitting] = useState(false);

  
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [salesRate, setSalesRate] = useState<number | ''>('');
  const [discountPct, setDiscountPct] = useState<number | ''>('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  
  const [updatedOn, setUpdatedOn] = useState<string | null>(null);

  
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  
  useEffect(() => {
    if (isOpen) {
      setErrorMsg(null);
      setTouched({});
      setLogoFile(null);
      setLogoPreview(null);
      setUpdatedOn(null);

      if (editItemID) {
        fetchItem(editItemID);
      } else {
        setItemName('');
        setDescription('');
        setSalesRate('');
        setDiscountPct('');
      }
    }
  }, [isOpen, editItemID]);

  const fetchItem = async (itemID: number) => {
    setIsLoadingDetails(true);
    try {
      const data = await getItemDetails(itemID);
      setItemName(data.itemName || '');
      setDescription(data.description || '');
      setSalesRate(data.salesRate !== undefined ? data.salesRate : '');
      setDiscountPct(data.discountPct !== undefined ? data.discountPct : '');
      setUpdatedOn(data.updatedOn || null);

      const picUrl = await getItemPicture(itemID);
      if (picUrl) {
        setLogoPreview(picUrl);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load item details.');
    } finally {
      setIsLoadingDetails(false);
    }
  };

  
  const validateItemName = (val: string) => {
    if (!val.trim()) return 'Item name is required.';
    if (val.length > 50) return 'Cannot accept more than 50 characters in Item Name.';
    return null;
  };

  const validateSalesRate = (val: number | '') => {
    if (val === '') return 'Sale rate is required.';
    if (Number(val) < 0) return 'Sale rate cannot be a negative amount.';
    return null;
  };

  const validateDiscountPct = (val: number | '') => {
    if (val === '') return null; 
    const num = Number(val);
    if (num < 0 || num > 100) return 'Discount must be between 0% and 100%.';
    return null;
  };

  const setFieldTouched = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const nameError = touched.itemName ? validateItemName(itemName) : null;
  const rateError = touched.salesRate ? validateSalesRate(salesRate) : null;
  const discountError = touched.discountPct ? validateDiscountPct(discountPct) : null;

  const isFormValid =
    !validateItemName(itemName) &&
    !validateSalesRate(salesRate) &&
    !validateDiscountPct(discountPct);

  
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Item image exceeds 5MB limit.');
      return;
    }

    if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
      setErrorMsg('Image format must be PNG or JPG.');
      return;
    }

    setErrorMsg(null);
    setLogoFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      itemName: true,
      salesRate: true,
      discountPct: true
    });

    if (!isFormValid) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const isEdit = !!editItemID;

      
      const isDuplicate = await checkDuplicateName(itemName.trim(), editItemID || 0);
      if (isDuplicate) {
        showToast('Duplicate item name not accepted.', 'warning');
        setIsSubmitting(false);
        return;
      }

      
      const saved = await saveItem({
        itemID: editItemID || undefined,
        itemName: itemName.trim(),
        description: description.trim(),
        salesRate: Number(salesRate),
        discountPct: Number(discountPct)
      }, isEdit, updatedOn);

      const savedID = editItemID || saved?.primaryKeyID || saved?.itemID || 0;

      
      if (logoFile && savedID > 0) {
        await uploadPicture(savedID, logoFile);
      }

      showToast(isEdit ? 'Item updated successfully.' : 'Item created successfully.', 'success');
      onSaveSuccess(savedID);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save item.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={() => !isSubmitting && onClose()}
      aria-labelledby="item-editor-title"
      className="item-modal-overlay"
    >
      <div className="item-modal-paper">
        {}
        <div className="item-modal-header">
          <h2 id="item-editor-title" className="item-modal-title">
            {editItemID ? 'Edit Item' : 'New Item'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="item-modal-close-btn"
          >
            <CloseIcon style={{ fontSize: '18px' }} />
          </button>
        </div>

        {}
        <div className="item-modal-divider" />

        {}
        {errorMsg && (
          <div className="item-modal-alert-error" role="alert">
            <ErrorIcon style={{ fontSize: '16px', marginTop: '1px', flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {isLoadingDetails ? (
          <div className="item-modal-loader-container">
            <CircularProgress size={32} style={{ color: '#262626' }} />
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} noValidate>

            {}
            <div className="item-modal-form-body">

              {}
              <div>
                <label className="item-modal-label">Item Picture</label>
                <div className="item-modal-pic-container">

                  {}
                  <div className="item-modal-pic-preview">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Item preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <ImageIcon style={{ fontSize: '24px', color: '#adb5bd', marginBottom: '4px' }} />
                        <span style={{ fontSize: '10px', color: '#adb5bd', fontWeight: 500 }}>Preview</span>
                      </>
                    )}
                  </div>

                  {}
                  <div className="item-modal-pic-input-wrapper">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoChange}
                      accept=".png,.jpg,.jpeg"
                      className="item-modal-pic-input"
                      disabled={isSubmitting}
                    />
                    <span className="item-modal-pic-hint">
                      PNG or JPG, max 5MB
                    </span>
                  </div>
                </div>
              </div>

              {}
              <div>
                <label className="item-modal-label">
                  Item Name<span style={{ color: '#262626' }}>*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter item name"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  onBlur={() => setFieldTouched('itemName')}
                  disabled={isSubmitting}
                  maxLength={50}
                  className={nameError ? 'item-modal-input item-modal-input-error' : 'item-modal-input'}
                />
                {nameError && (
                  <span className="item-modal-error-message">{nameError}</span>
                )}
              </div>

              {}
              <div className="item-modal-desc-wrapper">
                <label className="item-modal-label">Description</label>
                <textarea
                  placeholder="Enter item description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={500}
                  rows={4}
                  className="item-modal-input item-modal-desc-textarea"
                />
                <span className="item-modal-desc-counter">
                  {description.length}/500
                </span>
              </div>

              {}
              <div className="item-modal-row-grid">

                {}
                <div>
                  <label className="item-modal-label">
                    Sale Rate<span style={{ color: '#262626' }}>*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={salesRate}
                    onChange={(e) => setSalesRate(e.target.value === '' ? '' : Number(e.target.value))}
                    onBlur={() => setFieldTouched('salesRate')}
                    disabled={isSubmitting}
                    min={0}
                    step="0.01"
                    className={rateError ? 'item-modal-input item-modal-input-error' : 'item-modal-input'}
                    style={{ textAlign: 'right' }}
                  />
                  {rateError && (
                    <span className="item-modal-error-message">{rateError}</span>
                  )}
                </div>

                {}
                <div>
                  <label className="item-modal-label">Discount %</label>
                  <div className="item-modal-discount-wrapper">
                    <input
                      type="number"
                      placeholder="0"
                      value={discountPct}
                      onChange={(e) => setDiscountPct(e.target.value === '' ? '' : Number(e.target.value))}
                      onBlur={() => setFieldTouched('discountPct')}
                      disabled={isSubmitting}
                      min={0}
                      max={100}
                      step="0.01"
                      className={discountError ? 'item-modal-input item-modal-input-error' : 'item-modal-input'}
                      style={{ textAlign: 'right', paddingRight: '28px' }}
                    />
                    <span className="item-modal-discount-symbol">%</span>
                  </div>
                  {discountError && (
                    <span className="item-modal-error-message">{discountError}</span>
                  )}
                </div>

              </div>
            </div>

            {}
            <div className="item-modal-footer">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="item-modal-cancel-btn"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="item-modal-save-btn"
                style={{
                  backgroundColor: isSubmitting ? '#6c757d' : '#262626',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmitting && <CircularProgress size={12} style={{ color: '#ffffff' }} />}
                Save
              </button>
            </div>

          </form>
        )}
      </div>
    </Modal>
  );
};
