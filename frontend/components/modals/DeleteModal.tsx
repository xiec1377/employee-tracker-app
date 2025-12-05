import { X } from '@deemlol/next-icons';

interface DeleteModalProps {
  deletedEmployee: number | string;
  isDeleteModalOpen: boolean;
  setIsDeleteModalOpen: (open: boolean) => void;
  handleDelete: (id: number | string) => void;
}

export function DeleteModal({
  deletedEmployee,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
  handleDelete,
}: DeleteModalProps) {
  if (!isDeleteModalOpen) return null;

  

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md">
        {/* Close button */}
        <button
          onClick={() => setIsDeleteModalOpen(false)}
          className="absolute top-3 right-3 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
          aria-label="Close"
        >
          <X size={24} color="#FFFFFF" />
        </button>

        <h2 className="text-lg font-bold mb-4">
          Are you sure you want to delete?
        </h2>

        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="bg-gray-500 px-3 py-1 text-white rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              handleDelete(deletedEmployee);
              setIsDeleteModalOpen(false);
            }}
            className="bg-blue-500 px-3 py-1 text-white rounded"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
