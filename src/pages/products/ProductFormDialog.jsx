import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, X, Upload, Trash2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { productService } from "../../lib/services";
import { useCategoriesLookup, useMaterialsLookup } from "../../hooks/useLookup";

const emptyForm = {
  name_en: "",
  name_ar: "",
  weight: "",
  tax: "",
  rating: "5",
  category_id: "",
  material_id: "",
};

export default function ProductFormDialog({
  open,
  product,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation();
  const isEdit = !!product;

  const { categories } = useCategoriesLookup();
  const { materials } = useMaterialsLookup();

  const [form, setForm] = useState(emptyForm);
  const [newImages, setNewImages] = useState([]); // ملفات جديدة (للإضافة فقط)
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError("");
    setNewImages([]);

    if (product) {
      setForm({
        name_en: product.name_en || "",
        name_ar: product.name_ar || "",
        weight: String(product.weight ?? ""),
        tax: String(product.tax ?? ""),
        rating: String(product.rating ?? "5"),
        category_id: String(product.category_id ?? ""),
        material_id: String(product.material_id ?? ""),
      });
    } else {
      setForm(emptyForm);
    }
  }, [open, product]);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const handleFilesPicked = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setNewImages((prev) => [...prev, ...files]);
    // reset input حتى نقدر نرفع نفس الصورة مرة ثانية
    e.target.value = "";
  };

  const removeNewImage = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const hasEn = form.name_en.trim().length > 0;
    const hasAr = form.name_ar.trim().length > 0;
    if (!hasEn && !hasAr) {
      setError(t("products.atLeastOneName"));
      return;
    }
    if (
      !form.weight ||
      !form.tax ||
      !form.rating ||
      !form.category_id ||
      !form.material_id
    ) {
      setError(t("products.requiredFields"));
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        // PUT — JSON عادي (بدون صور)
        const payload = {};
        if (hasEn) payload.name_en = form.name_en.trim();
        if (hasAr) payload.name_ar = form.name_ar.trim();
        payload.weight = parseFloat(form.weight);
        payload.tax = parseFloat(form.tax);
        payload.rating = parseFloat(form.rating);
        payload.category_id = parseInt(form.category_id);
        payload.material_id = parseInt(form.material_id);

        await productService.update(product.id, payload);
        toast.success(t("products.updated"));
      } else {
        // POST — multipart/form-data
        const fd = new FormData();
        if (hasEn) fd.append("name_en", form.name_en.trim());
        if (hasAr) fd.append("name_ar", form.name_ar.trim());
        fd.append("weight", form.weight);
        fd.append("tax", form.tax);
        fd.append("rating", form.rating);
        fd.append("category_id", form.category_id);
        fd.append("material_id", form.material_id);

        // إضافة الصور (إن وجدت)
        newImages.forEach((file) => {
          fd.append("images[]", file, file.name);
        });

        await productService.create(fd);
        toast.success(t("products.created"));
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || t("products.error"));
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full bg-transparent border border-ink/20 focus:border-gold outline-none px-4 py-3 text-sm transition-colors";
  const labelClass = "block text-xs uppercase tracking-wider text-ink/60 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-cream w-full max-w-2xl border-t-2 border-gold max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-cream flex items-center justify-between px-6 py-4 border-b border-ink/10 z-10">
          <h2 className="font-serif text-lg">
            {isEdit ? t("products.editTitle") : t("products.addTitle")}
          </h2>
          <button
            onClick={onClose}
            className="text-ink/50 hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hint */}
        <div className="px-6 pt-4 text-xs text-ink/50 leading-relaxed">
          ✱ {t("products.atLeastOneNameHint")}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Names */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>{t("products.nameEn")}</label>
              <input
                type="text"
                name="name_en"
                value={form.name_en}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("products.nameAr")}</label>
              <input
                type="text"
                name="name_ar"
                value={form.name_ar}
                onChange={handleChange}
                className={inputClass}
                dir="rtl"
              />
            </div>
          </div>

          {/* Weight / Tax / Rating */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className={labelClass}>
                {t("products.weight")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="weight"
                step="0.01"
                min="0"
                value={form.weight}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("products.tax")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="tax"
                step="0.01"
                min="0"
                value={form.tax}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>
                {t("products.rating")} <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="rating"
                step="0.1"
                min="0"
                max="5"
                value={form.rating}
                onChange={handleChange}
                className={inputClass}
              />
            </div>
          </div>

          {/* Category / Material */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>
                {t("products.category")} <span className="text-red-500">*</span>
              </label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">{t("products.selectCategory")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name_en} — {c.name_ar}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>
                {t("products.material")} <span className="text-red-500">*</span>
              </label>
              <select
                name="material_id"
                value={form.material_id}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">{t("products.selectMaterial")}</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name_en} — {m.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Images — فقط عند الإضافة */}
          {!isEdit && (
            <div>
              <label className={labelClass}>{t("products.images")}</label>
              <p className="text-xs text-ink/50 mb-3">
                {t("products.imagesHint")}
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesPicked}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-ink/30 hover:border-gold py-6 flex flex-col items-center gap-2 transition-colors"
              >
                <Upload className="w-6 h-6 text-ink/40" />
                <span className="text-sm text-ink/60">
                  {t("products.chooseImages")}
                </span>
              </button>

              {/* Previews */}
              {newImages.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                  {newImages.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square border border-ink/10 group"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeNewImage(idx)}
                        className="absolute top-1 end-1 w-7 h-7 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        aria-label="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute bottom-0 start-0 end-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Edit mode hint */}
          {isEdit && (
            <div className="text-xs text-ink/50 bg-ink/5 border border-ink/10 px-4 py-3 flex items-start gap-2">
              <ImageIcon className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                {t("products.imagesHint")} — {product.images?.length || 0}{" "}
                {t("products.images").toLowerCase()}
              </span>
            </div>
          )}

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-cream py-3 -mx-6 px-6 border-t border-ink/10">
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
