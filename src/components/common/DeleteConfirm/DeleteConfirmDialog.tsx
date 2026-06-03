import React from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  CircularProgress
} from '@mui/material';
import './DeleteConfirmDialog.css';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  isDeleting?: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  isDeleting = false
}) => {
  return (
    <Dialog
      open={open}
      onClose={() => !isDeleting && onClose()}
      aria-labelledby="delete-confirm-dialog-title"
    >
      <DialogTitle id="delete-confirm-dialog-title" className="delete-dialog-title">
        {title}
      </DialogTitle>
      <DialogContent>
        <p className="delete-dialog-content-text">
          Are you sure want to delete this, this action cannot be undone
        </p>
      </DialogContent>
      <DialogActions className="delete-dialog-actions">
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting}
          className="delete-btn-cancel"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={isDeleting}
          className="delete-btn-confirm"
        >
          {isDeleting ? <CircularProgress size={14} style={{ color: '#ffffff' }} /> : null}
          Confirm
        </button>
      </DialogActions>
    </Dialog>
  );
};
