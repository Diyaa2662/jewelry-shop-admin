import { useTranslation } from "react-i18next";
import { Gem, Plus } from "lucide-react";

export default function Materials() {
  const { t } = useTranslation();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl mb-1">{t("materials.title")}</h1>
          <p className="text-sm text-ink/60">{t("brand.subtitle")}</p>
        </div>
        <button
          className="bg-ink hover:bg-gold hover:text-ink text-white text-sm tracking-wider uppercase px-5 py-2.5 transition-colors flex items-center gap-2"
          disabled
        >
          <Plus className="w-4 h-4" />
          {t("materials.addNew")}
        </button>
      </div>

      <div className="bg-white border border-ink/10 p-16 text-center">
        <Gem className="w-12 h-12 text-gold/40 mx-auto mb-4" strokeWidth={1} />
        <p className="text-ink/50 text-sm">{t("materials.empty")}</p>
        <p className="text-xs text-ink/40 mt-2">Coming soon</p>
      </div>
    </div>
  );
}
