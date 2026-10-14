import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  FolderTree,
} from "lucide-react";
import { toast } from "sonner";
import { featuredCategoryService } from "../../lib/services";
import { useFeaturedCategories } from "../../hooks/useFeaturedCategories";
import FeaturedCategoryFormDialog from "./FeaturedCategoryFormDialog";
import ConfirmDialog from "../../components/ui/ConfirmDialog";

export default function FeaturedCategories() {
  const { t } = useTranslation();
  const { items, loading, setItems, refetch } = useFeaturedCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (item) => {
    setEditing(item);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await featuredCategoryService.remove(deleteTarget.id);
      toast.success(t("featuredCategories.deleted"));
      setItems((prev) => prev.filter((x) => x.id !== deleteTarget.id));
    } catch (err) {
      toast.error(err.message || t("featuredCategories.error"));
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl mb-1">
            {t("featuredCategories.title")}
          </h1>
          <p className="text-sm text-ink/60">{t("brand.subtitle")}</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-ink hover:bg-gold hover:text-ink text-white text-sm tracking-wider uppercase px-5 py-2.5 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("featuredCategories.addNew")}
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="bg-white border border-ink/10 p-16 text-center text-ink/50 text-sm">
          {t("common.loading")}
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-ink/10 p-16 text-center">
          <FolderTree
            className="w-12 h-12 text-gold/40 mx-auto mb-4"
            strokeWidth={1}
          />
          <p className="text-ink/50 text-sm">{t("featuredCategories.empty")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative bg-white border border-ink/10 overflow-hidden"
            >
              {/* Image */}
              <div className="relative aspect-square bg-cream">
                {item.image?.url ? (
                  <img
                    src={item.image.url}
                    alt={item.category?.name_en || ""}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-ink/30">
                    <ImageIcon className="w-10 h-10" />
                  </div>
                )}

                {/* Overlay actions */}
                <div className="absolute top-3 end-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(item)}
                    className="w-9 h-9 bg-white/90 hover:bg-gold hover:text-ink text-ink flex items-center justify-center transition-colors"
                    title={t("common.edit")}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteTarget(item)}
                    className="w-9 h-9 bg-white/90 hover:bg-red-600 hover:text-white text-ink flex items-center justify-center transition-colors"
                    title={t("common.delete")}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="p-4 text-center">
                <div className="font-medium text-ink text-sm">
                  {item.category?.name_en}
                </div>
                <div className="text-xs text-ink/50 mt-1" dir="rtl">
                  {item.category?.name_ar}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <FeaturedCategoryFormDialog
        open={formOpen}
        item={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("common.confirm")}
        message={t("featuredCategories.deleteConfirm")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
