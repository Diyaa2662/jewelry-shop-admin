import { useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Loader2,
  X,
  Upload,
  Trash2,
  RotateCw,
  AlertCircle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import { productService } from "../../lib/services";

export default function ProductImagesManager({
  open,
  product,
  onClose,
  onSuccess,
}) {
  const { t } = useTranslation();
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (open && product) {
      // ترتيب حسب sort_order
      const sorted = [...(product.images || [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setImages(sorted);
    }
  }, [open, product]);

  if (!open || !product) return null;

  const handleUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    e.target.value = "";

    setUploading(true);
    try {
      for (const file of files) {
        const res = await productService.addImage(product.id, file);
        // الرد: { data: {...} }
        const newImage = res?.data || res;
        if (newImage?.id) {
          setImages((prev) => [...prev, newImage]);
        }
      }
      toast.success(t("products.created"));
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || t("products.error"));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (img) => {
    setBusyId(img.id);
    try {
      await productService.removeImage(product.id, img.id);
      setImages((prev) => prev.filter((x) => x.id !== img.id));
      toast.success(t("common.delete"));
      onSuccess?.();
    } catch (err) {
      toast.error(err.message || t("products.error"));
    } finally {
      setBusyId(null);
    }
  };

  const handleRetry = async (img) => {
    setBusyId(img.id);
    try {
      await productService.retryEmbedding(img.id);
      toast.success("Retry requested");
      // نحدّث الحالة محلياً
      setImages((prev) =>
        prev.map((x) =>
          x.id === img.id
            ? { ...x, embedding_status: "ready", message: null }
            : x,
        ),
      );
    } catch (err) {
      toast.error(err.message || t("products.error"));
    } finally {
      setBusyId(null);
    }
  };

  const move = async (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= images.length) return;

    const next = [...images];
    [next[idx], next[target]] = [next[target], next[idx]];
    setImages(next);

    try {
      await productService.reorderImages(
        product.id,
        next.map((x) => x.id),
      );
    } catch (err) {
      toast.error(err.message || t("products.error"));
      // رجع الحالة الأصلية
      setImages(images);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-cream w-full max-w-2xl border-t-2 border-gold max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-cream flex items-center justify-between px-6 py-4 border-b border-ink/10 z-10">
          <div>
            <h2 className="font-serif text-lg">{t("products.manageImages")}</h2>
            <p className="text-xs text-ink/50 mt-0.5">{product.name_en}</p>
          </div>
          <button
            onClick={onClose}
            className="text-ink/50 hover:text-ink transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Upload */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full border border-dashed border-ink/30 hover:border-gold py-6 flex flex-col items-center gap-2 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="w-6 h-6 text-gold animate-spin" />
              ) : (
                <Upload className="w-6 h-6 text-ink/40" />
              )}
              <span className="text-sm text-ink/60">
                {t("products.chooseImages")}
              </span>
            </button>
          </div>

          {/* Images grid */}
          {images.length === 0 ? (
            <p className="text-center text-sm text-ink/40 py-8">
              {t("products.empty")}
            </p>
          ) : (
            <div className="space-y-3">
              {images.map((img, idx) => {
                const failed = img.embedding_status === "failed";
                return (
                  <div
                    key={img.id}
                    className="flex items-center gap-3 bg-white border border-ink/10 p-3"
                  >
                    {/* Image */}
                    <div className="relative w-20 h-20 shrink-0">
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      {failed && (
                        <span
                          className="absolute -top-1 -end-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center"
                          title={img.message || t("products.embeddingFailed")}
                        >
                          <AlertCircle className="w-3 h-3 text-white" />
                        </span>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">
                        {img.original_name || `Image #${img.id}`}
                      </p>
                      <p className="text-xs text-ink/50 mt-1">
                        {t("products.sort_order") || "Order"}: {idx + 1}
                        {failed && (
                          <span className="text-yellow-700 ms-2">
                            — {t("products.embeddingFailed")}
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => move(idx, -1)}
                        disabled={idx === 0 || busyId === img.id}
                        className="p-1.5 text-ink/60 hover:text-gold disabled:opacity-30 transition-colors"
                        title="Move up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => move(idx, 1)}
                        disabled={
                          idx === images.length - 1 || busyId === img.id
                        }
                        className="p-1.5 text-ink/60 hover:text-gold disabled:opacity-30 transition-colors"
                        title="Move down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      {failed && (
                        <button
                          onClick={() => handleRetry(img)}
                          disabled={busyId === img.id}
                          className="p-1.5 text-yellow-600 hover:text-yellow-700 disabled:opacity-30 transition-colors"
                          title={t("products.retryEmbedding")}
                        >
                          <RotateCw className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => handleDelete(img)}
                        disabled={busyId === img.id}
                        className="p-1.5 text-ink/60 hover:text-red-600 disabled:opacity-30 transition-colors"
                        title={t("common.delete")}
                      >
                        {busyId === img.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
