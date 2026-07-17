import { AlertCircle } from "lucide-react";
import { CodeEditor } from "./CodeEditor";
import { useI18n } from "@/i18n";
import type { AppMessage } from "@/lib/svgValidator";

interface SvgInputPanelProps {
  value: string;
  error: AppMessage | null;
  onChange: (v: string) => void;
  onPaste: (v: string) => void;
}

export function SvgInputPanel({ value, error, onChange, onPaste }: SvgInputPanelProps) {
  const { t } = useI18n();

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-panel">
      <div className="flex h-10 items-center justify-between border-b border-border bg-panel-header px-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {t("input.title")}
        </span>
        <span className="text-[10px] text-muted-foreground">.svg</span>
      </div>
      {error && (
        <div
          role="alert"
          aria-live="polite"
          className="flex items-start gap-2 border-b border-destructive/40 bg-destructive/10 px-4 py-2 text-xs text-destructive-foreground"
        >
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-destructive" />
          <span className="text-destructive">{t(error.key, error.params)}</span>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        <CodeEditor
          value={value}
          onChange={onChange}
          onPaste={onPaste}
          language="xml"
          placeholder={t("input.placeholder")}
        />
      </div>
    </section>
  );
}
