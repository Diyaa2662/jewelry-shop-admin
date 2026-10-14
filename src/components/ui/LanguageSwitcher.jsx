import { useTranslation } from "react-i18next";
import { Globe } from "lucide-react";

export default function LanguageSwitcher({ variant = "light" }) {
  const { i18n } = useTranslation();
  const isAr = i18n.language === "ar";

  const toggle = () => {
    i18n.changeLanguage(isAr ? "en" : "ar");
  };

  const styles =
    variant === "dark"
      ? "text-white/80 hover:text-gold"
      : "text-ink/70 hover:text-gold";

  return (
    <button
      onClick={toggle}
      aria-label="Switch language"
      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${styles}`}
    >
      <Globe className="w-4 h-4" />
      <span>{isAr ? "EN" : "AR"}</span>
    </button>
  );
}
