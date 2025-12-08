'use client';

import { X } from '@deemlol/next-icons';

type DeleteModalProps = {
  isOpen: boolean;
  title?: string;
  onClose: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function DeleteModal({
  isOpen,
  title = 'Are you sure you want to delete?',
  onClose,
  onConfirm,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
}: DeleteModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          aria-label="Close"
        >
          <X size={24} color="#FFFFFF" />
        </button>
        <h2 className="text-lg font-bold mb-4">{title}</h2>
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="bg-gray-500 px-3 py-1 text-white rounded"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-500 px-3 py-1 text-white rounded"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
