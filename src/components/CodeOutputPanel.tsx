import { CodeEditor } from "./CodeEditor";
import { CopyButton } from "./CopyButton";
import { DownloadButton } from "./DownloadButton";
import { useI18n } from "@/i18n";
import type { OutputFormat } from "@/lib/svgToReact";

interface CodeOutputPanelProps {
  value: string;
  format: OutputFormat;
  componentName: string;
  nameRaw: string;
  onNameChange: (v: string) => void;
  hasError: boolean;
}

export function CodeOutputPanel({
  value,
  format,
  componentName,
  nameRaw,
  onNameChange,
  hasError,
}: CodeOutputPanelProps) {
  const { t } = useI18n();
  const displayValue = hasError ? "" : value;
  const showTransformHint =
    nameRaw.trim().length > 0 && nameRaw.trim() !== componentName;

  return (
    <section className="flex min-h-0 flex-1 flex-col bg-panel">
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-b border-border bg-panel-header px-4 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("output.title")}
          </span>
          <div className="flex items-center gap-1 font-mono text-xs">
            <label htmlFor="component-name" className="sr-only">
              {t("output.nameLabel")}
            </label>
            <input
              id="component-name"
              type="text"
              value={nameRaw}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder={componentName}
              spellCheck={false}
              autoComplete="off"
              className="h-7 w-40 rounded-md border border-border bg-secondary px-2 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              aria-describedby={showTransformHint ? "name-hint" : undefined}
            />
            <span className="text-muted-foreground">.{format}</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <CopyButton value={displayValue} disabled={!displayValue} />
          <DownloadButton
            value={displayValue}
            componentName={componentName}
            format={format}
            disabled={!displayValue}
          />
        </div>
      </div>
      {showTransformHint && (
        <div
          id="name-hint"
          className="border-b border-border bg-panel-header px-4 py-1 font-mono text-[10px] text-muted-foreground"
        >
          <span className="opacity-60">→</span>{" "}
          <span className="text-primary">{componentName}</span>
        </div>
      )}
      <div className="min-h-0 flex-1 overflow-hidden">
        {displayValue ? (
          <CodeEditor value={displayValue} language={format} readOnly />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
            {hasError ? t("output.fixError") : t("output.empty")}
          </div>
        )}
      </div>
    </section>
  );
}
