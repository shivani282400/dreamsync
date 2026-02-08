import { ReactNode, useEffect } from "react";

export default function Modal({
  open,
  title,
  description,
  onConfirm,
  onCancel,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  children,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  children?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div className="relative w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 id="modal-title" className="text-lg text-white/90">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-white/60">{description}</p>
        )}
        {children}
        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-full text-xs text-white/60 border border-white/10 hover:bg-white/10"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-full text-xs text-black bg-accent hover:bg-accentSoft"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
