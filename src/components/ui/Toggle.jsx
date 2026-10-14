import { cn } from "../../lib/utils";

export default function Toggle({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        "relative inline-block w-11 h-6 rounded-full transition-colors",
        checked ? "bg-gold" : "bg-ink/20",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      role="switch"
      aria-checked={checked}
    >
      <span
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
        style={{
          insetInlineStart: checked ? "calc(100% - 1.375rem)" : "0.125rem",
        }}
      />
    </button>
  );
}
