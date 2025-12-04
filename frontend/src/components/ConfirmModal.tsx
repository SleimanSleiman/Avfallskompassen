import React from 'react';

export type ConfirmModalProps = {
  open: boolean;
  title?: string;
  message: string | React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export default function ConfirmModal({
  open,
  title = 'Bekräfta',
  message,
  confirmLabel = 'Bekräfta',
  cancelLabel = 'Avbryt',
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-5 shadow-xl">
          <h3 className="text-base font-semibold text-gray-900">
            {title}
          </h3>
          <div className="mt-2 text-sm text-gray-700">{message}</div>
          <div className="mt-4 flex justify-end gap-2">
            <button className="btn-secondary" onClick={onCancel} disabled={loading}>
              {cancelLabel}
            </button>
            <button
              data-testid="confirm-delete"
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center justify-center rounded-xl2 px-5 py-3 font-medium border border-red-200 text-red-700 bg-red-50 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Arbetar…' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


