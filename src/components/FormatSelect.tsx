import type { OutputFormat } from "@/lib/svgToReact";

interface FormatSelectProps {
  value: OutputFormat;
  onChange: (v: OutputFormat) => void;
}

export function FormatSelect({ value, onChange }: FormatSelectProps) {
  return (
    <div className="inline-flex h-8 items-center rounded-md border border-border bg-secondary p-0.5">
      {(["jsx", "tsx"] as OutputFormat[]).map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onChange(f)}
          className={`inline-flex h-7 items-center rounded px-3 text-xs font-medium uppercase transition-colors ${
            value === f
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
          aria-pressed={value === f}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
