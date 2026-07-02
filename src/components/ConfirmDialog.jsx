import Button from './Button';
import Modal from './Modal';

export default function ConfirmDialog({ open, title, message, onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirmer
        </Button>
      </div>
    </Modal>
  );
}
