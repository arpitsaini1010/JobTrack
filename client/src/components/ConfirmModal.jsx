import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to delete this item? This action cannot be undone.',
  confirmText = 'Delete',
  confirmVariant = 'danger',
  loading = false
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Body className="p-4 text-center">
        <div
          className="mx-auto mb-3 d-flex align-items-center justify-content-center"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: '#fee2e2',
            color: '#dc2626'
          }}
        >
          <AlertTriangle size={24} />
        </div>
        <h5 className="fw-bold mb-2 text-dark">{title}</h5>
        <p className="text-muted small mb-4">{message}</p>
        <div className="d-flex justify-content-center gap-2">
          <Button variant="light" size="sm" onClick={onHide} disabled={loading} className="px-3">
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            size="sm"
            onClick={onConfirm}
            disabled={loading}
            className="px-3"
          >
            {loading ? 'Processing...' : confirmText}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ConfirmModal;
