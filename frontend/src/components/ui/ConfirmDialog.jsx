import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({ open, title = 'Are you sure?', message, confirmText = 'Delete', loading, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose} width="max-w-sm">
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="danger" loading={loading} onClick={onConfirm}>{confirmText}</Button>
      </div>
    </Modal>
  );
}
