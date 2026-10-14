import { useTranslation } from "react-i18next";
import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
}) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-cream border-t-2 border-gold p-6 max-w-md w-full">
        <div className="flex items-start gap-3 mb-5">
          <div className="w-10 h-10 shrink-0 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-lg mb-1">{title}</h3>
            <p className="text-sm text-ink/70">{message}</p>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-5 py-2 text-sm border border-ink/20 hover:bg-ink/5 transition-colors"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onConfirm}
            className="px-5 py-2 text-sm bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            {t("common.delete")}
          </button>
        </div>
      </div>
    </div>
  );
}
