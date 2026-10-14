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
import { materialService } from "../../lib/services";
import { useMaterials } from "../../hooks/useMaterials";
import MaterialFormDialog from "./MaterialFormDialog";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Toggle from "../../components/ui/Toggle";

export default function Materials() {
  const { t, i18n } = useTranslation();
  const isAr = i18n.language === "ar";
  const { materials, loading, refetch, setMaterials } = useMaterials();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ===== Handlers =====
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
      await materialService.remove(deleteTarget.id);
      toast.success(t("materials.deleted"));
      setMaterials((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    } catch (err) {
      toast.error(err.message || t("materials.error"));
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleToggleStatus = async (row, newStatus) => {
    // تحديث متفائل
    setMaterials((prev) =>
      prev.map((m) => (m.id === row.id ? { ...m, status: newStatus } : m)),
    );
    try {
      await materialService.updateStatus(row.id, newStatus);
      toast.success(t("materials.statusUpdated"));
    } catch (err) {
      // رجّع الحالة القديمة
      setMaterials((prev) =>
        prev.map((m) => (m.id === row.id ? { ...m, status: !newStatus } : m)),
      );
      toast.error(err.message || t("materials.error"));
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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl mb-1">{t("materials.title")}</h1>
          <p className="text-sm text-ink/60">{t("brand.subtitle")}</p>
        </div>
        <button
          onClick={handleAdd}
          className="bg-ink hover:bg-gold hover:text-ink text-white text-sm tracking-wider uppercase px-5 py-2.5 transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("materials.addNew")}
        </button>
      </div>

      {/* Grid */}
      <div className="bg-white border border-ink/10 p-2">
        <DataGrid
          dataSource={materials}
          keyExpr="id"
          showBorders={false}
          showRowLines={true}
          rowAlternationEnabled={false}
          hoverStateEnabled={true}
          columnAutoWidth={true}
          loadPanel={{ enabled: loading }}
          noDataText={t("materials.empty")}
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
            caption={t("materials.nameEn")}
            cellRender={NameEnCell}
          />
          <Column
            dataField="name_ar"
            caption={t("materials.nameAr")}
            cellRender={NameArCell}
          />
          <Column
            dataField="status"
            caption={t("materials.status")}
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

      {/* Dialogs */}
      <MaterialFormDialog
        open={formOpen}
        material={editing}
        onClose={() => setFormOpen(false)}
        onSuccess={refetch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t("common.confirm")}
        message={t("materials.deleteConfirm")}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
