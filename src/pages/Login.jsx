import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { verifyCredentials } from "../lib/auth";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || "/products";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    // محاكاة تأخير بسيط لتحسين الإحساس
    setTimeout(() => {
      const user = verifyCredentials(form.username, form.password);

      if (user) {
        login("static-token-" + Date.now(), user);
        toast.success(t("auth.welcomeBack"));
        navigate(from, { replace: true });
      } else {
        toast.error(t("auth.invalidCredentials"));
      }

      setLoading(false);
    }, 400);
  };

  const inputClass =
    "w-full bg-transparent border border-ink/20 focus:border-gold outline-none ps-10 pe-4 py-3 text-sm transition-colors";

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink relative p-4">
      <div className="absolute top-6 end-6">
        <LanguageSwitcher variant="dark" />
      </div>

      <div className="w-full max-w-md bg-cream p-8 sm:p-10 border-t-2 border-gold">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 border border-gold rotate-45 flex items-center justify-center">
              <span className="text-gold -rotate-45 text-sm">◆</span>
            </div>
            <div className="text-start leading-tight">
              <div className="font-serif text-xl tracking-widest text-gold">
                {t("brand.name")}
              </div>
              <div className="text-[10px] tracking-[0.3em] text-ink/50">
                {t("brand.subtitle")}
              </div>
            </div>
          </div>

          <h1 className="font-serif text-2xl mb-1">{t("auth.welcomeBack")}</h1>
          <p className="text-sm text-ink/60">{t("auth.loginSubtitle")}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/60 mb-2">
              {t("auth.username")}
            </label>
            <div className="relative">
              <User className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-ink/40" />
              <input
                type="text"
                name="username"
                required
                autoComplete="username"
                value={form.username}
                onChange={handleChange}
                placeholder={t("auth.usernamePlaceholder")}
                className={inputClass}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-ink/60 mb-2">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 -translate-y-1/2 start-3 w-4 h-4 text-ink/40" />
              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                value={form.password}
                onChange={handleChange}
                placeholder={t("auth.passwordPlaceholder")}
                className={inputClass}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink hover:bg-gold hover:text-ink text-white font-medium py-3 text-sm tracking-wider uppercase transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t("auth.signingIn")}
              </>
            ) : (
              t("auth.signIn")
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
