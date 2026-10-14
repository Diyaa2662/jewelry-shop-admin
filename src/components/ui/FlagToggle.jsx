import { cn } from "../../lib/utils";

export default function FlagToggle({ checked, onChange, icon: Icon, title }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      title={title}
      className={cn(
        "w-7 h-7 rounded-full flex items-center justify-center transition-all",
        checked
          ? "bg-gold text-ink"
          : "bg-ink/5 text-ink/30 hover:text-ink/60 hover:bg-ink/10",
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
    </button>
  );
}
