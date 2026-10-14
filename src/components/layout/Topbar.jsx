import { Menu, LogOut, User } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import LanguageSwitcher from "../ui/LanguageSwitcher";

export default function Topbar({ onMenuClick }) {
  const { t } = useTranslation();
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-ink/10 px-4 lg:px-6 py-4 flex items-center justify-between gap-4">
      {/* زر المنيو للموبايل */}
      <button
        onClick={onMenuClick}
        className="lg:hidden text-ink/70 hover:text-gold"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Language switcher */}
        <LanguageSwitcher />

        {/* Divider */}
        <div className="w-px h-5 bg-ink/10" />

        {/* User info */}
        <div className="flex items-center gap-2 text-sm">
          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center text-gold">
            <User className="w-4 h-4" />
          </div>
          <span className="hidden sm:block text-ink/70">
            {user?.name || user?.email || "Admin"}
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-xs text-ink/60 hover:text-red-600 transition-colors"
          aria-label={t("auth.logout")}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{t("auth.logout")}</span>
        </button>
      </div>
    </header>
  );
}
