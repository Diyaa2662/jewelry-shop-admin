/* eslint-disable no-unused-vars */
import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Plus,
  Edit2,
  Trash2,
  Star,
  Flame,
  Sparkles,
  PackagePlus,
  ImageOff,
  Image as ImageIcon,
  AlertCircle,
  RotateCw,
} from "lucide-react";
import { toast } from "sonner";
import DataGrid, {
  Column,
  Paging,
  Pager,
  SearchPanel,
  HeaderFilter,
  Selection,
} from "devextreme-react/data-grid";
import { productService } from "../../lib/services";
import { useProducts } from "../../hooks/useProducts";
import ProductFormDialog from "./ProductFormDialog";
import ProductImagesManager from "./ProductImagesManager";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Toggle from "../../components/ui/Toggle";
import FlagToggle from "../../components/ui/FlagToggle";

export default function Products() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { products, loading, refetch, setProducts } = useProducts();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [imagesTarget, setImagesTarget] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const gridRef = useRef(null);

  // ===== Helpers =====
  const updateLocalProduct = (id, patch) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    );
  };

  const handleAdd = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const handleEdit = (row) => {
    setEditing(row);
    setFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productService.remove(deleteTarget.id);
      toast.success(t("products.deleted"));
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      toast.error(err.message || t("products.error"));
    } finally {
      setDeleteTarget(null);
    }
  };

  // ===== Toggle Handlers (Optimistic) =====
  const toggleField = async (row, field, value, serviceFn, toastKey) => {
    updateLocalProduct(row.id, { [field]: value });
    try {
      await serviceFn(row.id, value);
      toast.success(t(toastKey));
    } catch (err) {
      updateLocalProduct(row.id, { [field]: !value });
      toast.error(err.message || t("products.error"));
    }
  };

  const handleToggleStatus = (row, val) =>
    toggleField(
      row,
      "status",
      val,
      productService.updateStatus,
      "products.statusUpdated",
    );

  const handleToggleFeatured = (row, val) =>
    toggleField(
      row,
      "featured",
      val,
      productService.updateFeatured,
      "products.featuredUpdated",
    );

  const handleToggleMostSold = (row, val) =>
    toggleField(
      row,
      "most_sold",
      val,
      productService.updateMostSold,
      "products.mostSoldUpdated",
    );

  const handleToggleNewlyArrived = (row, val) =>
    toggleField(
      row,
      "newly_arrived",
      val,
      productService.updateNewlyArrived,
      "products.newlyArrivedUpdated",
    );

  // ===== Bulk Status =====
  const handleBulkStatus = async (status) => {
    if (!selectedIds.length) {
      toast.error(t("products.bulkNoSelection"));
      return;
    }
    try {
      await productService.bulkUpdateStatus(selectedIds, status);
      setProducts((prev) =>
        prev.map((p) => (selectedIds.includes(p.id) ? { ...p, status } : p)),
      );
      toast.success(t("products.bulkSuccess"));
      gridRef.current?.instance?.clearSelection();
      setSelectedIds([]);
    } catch (err) {
      toast.error(err.message || t("products.error"));
    }
  };

  const handleRetryEmbedding = async (imageId) => {
    try {
      await productService.retryEmbedding(imageId);
      toast.success("Embedding retry requested");
      refetch();
    } catch (err) {
      toast.error(err.message || t("products.error"));
    }
  };

  // ===== Cells =====
  const ImageCell = ({ data }) => {
    const first = data.images?.[0];
    if (!first) {
      return (
        <div className="w-12 h-12 bg-ink/5 flex items-center justify-center text-ink/30">
          <ImageOff className="w-4 h-4" />
        </div>
      );
    }
    const hasFailed = first.embedding_status === "failed";
    return (
      <div className="relative w-12 h-12 group">
        <img
          src={first.url}
          alt=""
          className="w-12 h-12 object-cover border border-ink/10"
        />
        {hasFailed && (
          <span
            className="absolute -top-1 -end-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center"
            title={t("products.embeddingFailed")}
          >
            <AlertCircle className="w-2.5 h-2.5 text-white" />
          </span>
        )}
        {data.images.length > 1 && (
          <span className="absolute bottom-0 end-0 bg-ink/80 text-white text-[9px] px-1.5 py-0.5">
            +{data.images.length - 1}
          </span>
        )}
      </div>
    );
  };

  const NameCell = ({ data }) => (
    <div className="leading-tight">
      <div className="font-medium text-ink text-sm">{data.name_en}</div>
      <div className="text-xs text-ink/50" dir="rtl">
        {data.name_ar}
      </div>
    </div>
  );

  const CategoryCell = ({ data }) => (
    <span className="text-sm">{data.category?.name_en || "—"}</span>
  );

  const MaterialCell = ({ data }) => (
    <span className="text-sm">{data.material?.name_en || "—"}</span>
  );

  const RatingCell = ({ data }) => (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-3 h-3 text-gold"
          fill={i < Math.round(data.rating) ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );

  const StatusCell = ({ data }) => (
    <Toggle
      checked={!!data.status}
      onChange={(val) => handleToggleStatus(data, val)}
    />
  );

  const FlagsCell = ({ data }) => (
    <div className="flex items-center gap-1.5">
      <FlagToggle
        checked={!!data.featured}
        onChange={(val) => handleToggleFeatured(data, val)}
        icon={Sparkles}
        title={t("products.featured")}
      />
      <FlagToggle
        checked={!!data.most_sold}
        onChange={(val) => handleToggleMostSold(data, val)}
        icon={Flame}
        title={t("products.mostSold")}
      />
      <FlagToggle
        checked={!!data.newly_arrived}
        onChange={(val) => handleToggleNewlyArrived(data, val)}
        icon={PackagePlus}
        title={t("products.newlyArrived")}
      />
    </div>
  );

  const ActionsCell = ({ data }) => (
    <div className="flex items-center gap-1">
      <button
        onClick={() => handleEdit(data)}
        className="p-1.5 text-ink/60 hover:text-gold transition-colors"
        title={t("common.edit")}
      >
        <Edit2 className="w-4 h-4" />
      </button>
      <button
        onClick={() => setImagesTarget(data)}
        className="p-1.5 text-ink/60 hover:text-gold transition-colors"
        title={t("products.manageImages")}
      >
        <ImageIcon className="w-4 h-4" />
      </button>
      <button
        onClick={() => setDeleteTarget(data)}
        className="p-1.5 text-ink/60 hover:text-red-600 transition-colors"
        title={t("common.delete")}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-3xl mb-1">{t("products.title")}</h1>
          <p className="text-sm text-ink/60">{t("brand.subtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFormOpen(true)}
            className="bg-ink hover:bg-gold hover:text-ink text-white text-sm tracking-wider uppercase px-5 py-2.5 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            {t("products.addNew")}
          </button>
        </div>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div className="bg-ink text-white px-4 py-3 mb-4 flex items-center justify-between gap-4">
          <span className="text-sm">
            {selectedIds.length} {t("common.selected") || "selected"}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatus(true)}
              className="text-xs px-3 py-1.5 bg-gold text-ink hover:bg-gold-light transition-colors"
            >
              {t("products.bulkActivate")}
            </button>
            <button
              onClick={() => handleBulkStatus(false)}
              className="text-xs px-3 py-1.5 border border-white/20 hover:bg-white/10 transition-colors"
            >
              {t("products.bulkDeactivate")}
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="bg-white border border-ink/10 p-2">
        <DataGrid
          ref={gridRef}
          dataSource={products}
          keyExpr="id"
          showBorders={false}
          showRowLines={true}
          rowAlternationEnabled={false}
          hoverStateEnabled={true}
          columnAutoWidth={true}
          loadPanel={{ enabled: loading }}
          noDataText={t("products.empty")}
          rtlEnabled={isAr}
          onSelectionChanged={(e) => {
            setSelectedIds(e.selectedRowKeys);
          }}
        >
          <Selection mode="multiple" showCheckBoxesMode="always" />
          <HeaderFilter visible={true} />
          <SearchPanel
            visible={true}
            width={240}
            placeholder={t("common.search")}
          />
          <Paging defaultPageSize={10} />
          <Pager
            visible={true}
            showPageSizeSelector={true}
            allowedPageSizes={[10, 20, 50]}
            showInfo={true}
            showNavigationButtons={true}
          />

          <Column
            dataField="images"
            caption={t("products.image")}
            width={80}
            alignment="center"
            cellRender={ImageCell}
            allowSorting={false}
            allowFiltering={false}
          />
          <Column
            dataField="name_en"
            caption={t("products.nameEn")}
            cellRender={NameCell}
            minWidth={180}
          />
          <Column
            dataField="category.name_en"
            caption={t("products.category")}
            cellRender={CategoryCell}
            width={130}
          />
          <Column
            dataField="material.name_en"
            caption={t("products.material")}
            cellRender={MaterialCell}
            width={110}
          />
          <Column
            dataField="weight"
            caption={t("products.weight")}
            width={90}
            alignment="center"
            cellRender={({ data }) => (
              <span className="text-sm">{data.weight.toFixed(2)}</span>
            )}
          />
          <Column
            dataField="price"
            caption={t("products.price")}
            width={100}
            alignment="center"
            cellRender={({ data }) => (
              <span className="text-sm font-medium text-gold">
                ${data.price}
              </span>
            )}
          />
          <Column
            dataField="rating"
            caption={t("products.rating")}
            width={110}
            alignment="center"
            cellRender={RatingCell}
          />
          <Column
            dataField="status"
            caption={t("products.status")}
            width={90}
            alignment="center"
            cellRender={StatusCell}
            allowFiltering={false}
            allowSorting={false}
          />
          <Column
            caption="Flags"
            width={130}
            alignment="center"
            cellRender={FlagsCell}
            allowFiltering={false}
            allowSorting={false}
          />
          <Column
            caption={t("common.actions")}
            width={130}
            alignment="center"
            cellRender={ActionsCell}
            allowFiltering={false}
            allowSorting={false}
          />
        </DataGrid>
      </div>

      {/* Dialogs */}
      <ProductFormDialog
        open={formOpen}
        product={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={refetch}
      />

      <ProductImagesManager
        open={!!imagesTarget}
        product={imagesTarget}
        onClose={() => setImagesTarget(null)}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("common.confirm")}
        message={t("products.deleteConfirm")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
