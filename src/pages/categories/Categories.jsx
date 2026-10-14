import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import DataGrid, {
  Column,
  Paging,
  Pager,
  SearchPanel,
  HeaderFilter,
} from "devextreme-react/data-grid";
import { categoryService } from "../../lib/services";
import { useCategories } from "../../hooks/useCategories";
import CategoryFormDialog from "./CategoryFormDialog";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Toggle from "../../components/ui/Toggle";

export default function Categories() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { categories, loading, refetch, setCategories } = useCategories();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

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
      await categoryService.remove(deleteTarget.id);
      toast.success(t("categories.deleted"));
      setCategories((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    } catch (err) {
      toast.error(err.message || t("categories.error"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = async (row, newStatus) => {
    setCategories((prev) =>
      prev.map((c) => (c.id === row.id ? { ...c, status: newStatus } : c)),
    );
    try {
      await categoryService.updateStatus(row.id, newStatus);
      toast.success(t("categories.statusUpdated"));
    } catch (err) {
      setCategories((prev) =>
        prev.map((c) => (c.id === row.id ? { ...c, status: !newStatus } : c)),
      );
      toast.error(err.message || t("categories.error"));
    }
  };

  // ===== Cells =====
  const NameEnCell = ({ data }) => (
    <span className="font-medium text-ink">{data.name_en}</span>
  );

  const NameArCell = ({ data }) => <span dir="rtl">{data.name_ar}</span>;

  const StatusCell = ({ data }) => (
    <Toggle
      checked={!!data.status}
      onChange={(val) => handleToggleStatus(data, val)}
    />
  );

  const ActionsCell = ({ data }) => (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleEdit(data)}
        className="p-1.5 text-ink/60 hover:text-gold transition-colors"
        title={t("common.edit")}
      >
        <Edit2 className="w-4 h-4" />
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl mb-1">{t("categories.title")}</h1>
          <p className="text-sm text-ink/60">{t("brand.subtitle")}</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-ink hover:bg-gold hover:text-ink text-white text-sm tracking-wider uppercase px-5 py-2.5 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("categories.addNew")}
        </button>
      </div>

      <div className="bg-white border border-ink/10 p-2">
        <DataGrid
          dataSource={categories}
          keyExpr="id"
          showBorders={false}
          showRowLines={true}
          rowAlternationEnabled={false}
          hoverStateEnabled={true}
          columnAutoWidth={true}
          loadPanel={{ enabled: loading }}
          noDataText={t("categories.empty")}
          rtlEnabled={isAr}
        >
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
            dataField="id"
            caption="ID"
            width={70}
            alignment="center"
            allowSearch={false}
          />
          <Column
            dataField="name_en"
            caption={t("categories.nameEn")}
            cellRender={NameEnCell}
          />
          <Column
            dataField="name_ar"
            caption={t("categories.nameAr")}
            cellRender={NameArCell}
          />
          <Column
            dataField="status"
            caption={t("categories.status")}
            width={120}
            alignment="center"
            cellRender={StatusCell}
            allowFiltering={false}
          />
          <Column
            caption={t("common.actions")}
            width={120}
            alignment="center"
            cellRender={ActionsCell}
            allowFiltering={false}
            allowSorting={false}
          />
        </DataGrid>
      </div>

      <CategoryFormDialog
        open={formOpen}
        category={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("common.confirm")}
        message={t("categories.deleteConfirm")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
