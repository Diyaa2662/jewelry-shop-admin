import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { categoryService } from "../../lib/services";

const emptyForm = { name_en: "", name_ar: "" };

export default function CategoryFormDialog({
  open,
  category,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!category;

  useEffect(() => {
    if (open) {
      if (category) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
          name_en: category.name_en || "",
          name_ar: category.name_ar || "",
        });
      } else {
        setForm(emptyForm);
      }
      setError("");
    }
  }, [open, category]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const hasEn = form.name_en.trim().length > 0;
    const hasAr = form.name_ar.trim().length > 0;

    if (!hasEn && !hasAr) {
      setError(t("categories.atLeastOneName"));
      return;
    }

    setSaving(true);
    try {
      const payload = {};
      if (hasEn) payload.name_en = form.name_en.trim();
      if (hasAr) payload.name_ar = form.name_ar.trim();

      if (isEdit) {
        await categoryService.update(category.id, payload);
        toast.success(t("categories.updated"));
      } else {
        await categoryService.create({ ...payload, status: true });
        toast.success(t("categories.created"));
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || t("categories.error"));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border border-ink/20 focus:border-gold outline-none px-4 py-3 text-sm transition-colors";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-cream w-full max-w-md border-t-2 border-gold">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
          <h2 className="font-serif text-lg">
            {isEdit ? t("categories.editTitle") : t("categories.addTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-ink/50 hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/60 mb-2">
              {t("categories.nameEn")}
            </label>
            <input
              type="text"
              name="name_en"
              value={form.name_en}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/60 mb-2">
              {t("categories.nameAr")}
            </label>
            <input
              type="text"
              name="name_ar"
              value={form.name_ar}
              onChange={handleChange}
              className={inputClass}
              dir="rtl"
            />
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 text-sm border border-ink/20 hover:bg-ink/5 transition-colors"
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 text-sm bg-ink hover:bg-gold hover:text-ink text-white transition-colors disabled:opacity-60 flex items-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {t("common.save")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
