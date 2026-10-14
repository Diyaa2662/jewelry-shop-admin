import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Package, FolderTree, Gem, Star, X } from "lucide-react";
import { cn } from "../../lib/utils";

const navItems = [
  { to: "/products", icon: Package, labelKey: "nav.products" },
  { to: "/categories", icon: FolderTree, labelKey: "nav.categories" },
  {
    to: "/featured-categories",
    icon: Star,
    labelKey: "nav.featuredCategories",
  },
  { to: "/materials", icon: Gem, labelKey: "nav.materials" },
];

export default function Sidebar({ open, onClose }) {
  const { t } = useTranslation();

  return (
    <>
      {/* Overlay للموبايل */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          // Base
          "fixed lg:static inset-y-0 start-0 z-50 w-64 bg-ink text-white flex flex-col",
          "transition-transform duration-300",
          // Mobile: sliding
          open
            ? "translate-x-0"
            : "-translate-x-full rtl:translate-x-full lg:translate-x-0 lg:rtl:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between gap-2 px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 border border-gold rotate-45 flex items-center justify-center">
              <span className="text-gold -rotate-45 text-xs">◆</span>
            </div>
            <div className="leading-tight">
              <div className="font-serif text-base tracking-widest text-gold">
                {t("brand.name")}
              </div>
              <div className="text-[9px] tracking-[0.3em] text-white/50">
                {t("brand.subtitle")}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="lg:hidden text-white/60 hover:text-gold"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-6 px-3">
          <ul className="space-y-1">
            {navItems.map(({ to, icon: Icon, labelKey }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-4 py-3 text-sm rounded-sm transition-colors",
                      isActive
                        ? "bg-gold/10 text-gold border-s-2 border-gold"
                        : "text-white/70 hover:text-gold hover:bg-white/5 border-s-2 border-transparent",
                    )
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{t(labelKey)}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-6 py-4 border-t border-white/10 text-[10px] text-white/40">
          © {new Date().getFullYear()} {t("brand.name")}
        </div>
      </aside>
    </>
  );
}
