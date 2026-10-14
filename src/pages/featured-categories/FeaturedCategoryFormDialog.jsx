import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Loader2, X, Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { featuredCategoryService } from "../../lib/services";
import { useCategoriesLookup } from "../../hooks/useLookup";

export default function FeaturedCategoryFormDialog({
  open,
  item, // null = add mode, object = edit mode
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation();
  const { categories } = useCategoriesLookup();

  const isEdit = !!item;

  const [categoryId, setCategoryId] = useState("");
  const [file, setFile] = useState(null); // ملف جديد (اختياري)
  const [preview, setPreview] = useState(null); // preview للملف الجديد
  const [removeOldImage, setRemoveOldImage] = useState(false); // لحذف الصورة القديمة
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef(null);

  // ===== Init =====
  useEffect(() => {
    if (!open) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setError("");
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setRemoveOldImage(false);

    if (item) {
      setCategoryId(String(item.category_id ?? ""));
    } else {
      setCategoryId("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, item]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!open) return null;

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(f));
    setRemoveOldImage(false);
    if (error) setError("");
    e.target.value = "";
  };

  const handleRemoveNewFile = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!categoryId) {
      setError(t("featuredCategories.categoryRequired"));
      return;
    }

    if (!isEdit && !file) {
      setError(t("featuredCategories.imageRequired"));
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        // 1) تحديث الفئة
        await featuredCategoryService.update(item.id, parseInt(categoryId));

        // 2) إذا في صورة جديدة → لازم نحذف القديمة أول (شرط الباك)
        if (file) {
          if (item?.image?.url) {
            try {
              await featuredCategoryService.removeImage(item.id);
            } catch {
              // نتجاهل الخطأ لو ما كان في صورة فعلاً
            }
          }
          await featuredCategoryService.addImage(item.id, file);
        } else if (removeOldImage) {
          // 3) إذا طلب حذف الصورة فقط (بدون رفع بديل)
          await featuredCategoryService.removeImage(item.id);
        }

        toast.success(t("featuredCategories.updated"));
      } else {
        // إنشاء جديد
        await featuredCategoryService.create(categoryId, file);
        toast.success(t("featuredCategories.created"));
      }

      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.message || t("featuredCategories.error"));
    } finally {
      setSaving(false);
    }
  };

  // الصورة الحالية بالوضع Edit
  const existingImage = isEdit ? item?.image : null;
  const showExistingImage =
    isEdit && existingImage && !preview && !removeOldImage;
  const showNewPreview = !!preview;
  const showUploadBox = !showExistingImage && !showNewPreview;

  const inputClass =
    "w-full bg-transparent border border-ink/20 focus:border-gold outline-none px-4 py-3 text-sm transition-colors";
  const labelClass = "block text-xs uppercase tracking-wider text-ink/60 mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-cream w-full max-w-md border-t-2 border-gold">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink/10">
          <h2 className="font-serif text-lg">
            {isEdit
              ? t("featuredCategories.editTitle")
              : t("featuredCategories.addTitle")}
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
          {/* Category */}
          <div>
            <label className={labelClass}>
              {t("featuredCategories.category")}{" "}
              <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value);
                if (error) setError("");
              }}
              className={inputClass}
            >
              <option value="">{t("featuredCategories.selectCategory")}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_en} — {c.name_ar}
                </option>
              ))}
            </select>
          </div>

          {/* Image */}
          <div>
            <label className={labelClass}>
              {t("featuredCategories.image")}{" "}
              {!isEdit && <span className="text-red-500">*</span>}
            </label>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />

            {/* الصورة الحالية (Edit mode) */}
            {showExistingImage && (
              <div className="space-y-2">
                <div className="relative aspect-square max-w-[200px] border border-ink/10 group">
                  <img
                    src={existingImage.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-gold hover:text-gold-dark underline underline-offset-4"
                  >
                    {t("featuredCategories.changeImage")}
                  </button>
                  <span className="text-ink/20">|</span>
                  <button
                    type="button"
                    onClick={() => setRemoveOldImage(true)}
                    className="text-xs text-red-600 hover:text-red-700 underline underline-offset-4 flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    {t("featuredCategories.removeImage")}
                  </button>
                </div>
              </div>
            )}

            {/* معاينة ملف جديد */}
            {showNewPreview && (
              <div className="space-y-2">
                <div className="relative aspect-square max-w-[200px] border border-ink/10 group">
                  <img
                    src={preview}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveNewFile}
                    className="absolute top-2 end-2 w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-xs text-ink/50">
                  {t("featuredCategories.newImageReady")}
                </p>
              </div>
            )}

            {/* حالة الحذف القديم — بدون بديل */}
            {isEdit && removeOldImage && !preview && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700 flex items-center justify-between gap-3">
                <span>{t("featuredCategories.imageWillBeRemoved")}</span>
                <button
                  type="button"
                  onClick={() => setRemoveOldImage(false)}
                  className="text-red-700 hover:text-red-900 underline underline-offset-4"
                >
                  {t("common.cancel")}
                </button>
              </div>
            )}

            {/* صندوق الرفع */}
            {showUploadBox && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-ink/30 hover:border-gold py-6 flex flex-col items-center gap-2 transition-colors"
              >
                <Upload className="w-6 h-6 text-ink/40" />
                <span className="text-sm text-ink/60">
                  {t("featuredCategories.chooseImage")}
                </span>
              </button>
            )}
          </div>

          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2">
              {error}
            </div>
          )}

          {/* Actions */}
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
