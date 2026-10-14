import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";
import { materialService } from "../../lib/services";

const emptyForm = { name_en: "", name_ar: "" };

export default function MaterialFormDialog({
  open,
  material,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation();
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!material;

  useEffect(() => {
    if (open) {
      if (material) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setForm({
          name_en: material.name_en || "",
          name_ar: material.name_ar || "",
        });
      } else {
        setForm(emptyForm);
      }
      setError("");
    }
  }, [open, material]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✋ التحقق: حقل واحد على الأقل
    const hasEn = form.name_en.trim().length > 0;
    const hasAr = form.name_ar.trim().length > 0;

    if (!hasEn && !hasAr) {
      setError(t("materials.atLeastOneName"));
      return;
    }

    setSaving(true);
    try {
      // نبعت فقط الحقول اللي فيها قيمة — الباك رح ينسخ القيمة للحقل الفاضي
      const payload = {};
      if (hasEn) payload.name_en = form.name_en.trim();
      if (hasAr) payload.name_ar = form.name_ar.trim();

      if (isEdit) {
        await materialService.update(material.id, payload);
        toast.success(t("materials.updated"));
      } else {
        await materialService.create({ ...payload, status: true });
        toast.success(t("materials.created"));
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || t("materials.error"));
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
          <h2 className="font-serif text-lg">
            {isEdit ? t("materials.editTitle") : t("materials.addTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-ink/50 hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/60 mb-2">
              {t("materials.nameEn")}
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
              {t("materials.nameAr")}
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
