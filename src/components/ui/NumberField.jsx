export default function NumberField({
  value,
  onChange,
  step = "1",
  min = "0",
  max,
  placeholder,
  className = "",
}) {
  return (
    <input
      type="number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      step={step}
      min={min}
      max={max}
      placeholder={placeholder}
      className={
        "w-full bg-transparent border border-ink/20 focus:border-gold outline-none px-4 py-3 text-sm transition-colors " +
        className
      }
    />
  );
}
